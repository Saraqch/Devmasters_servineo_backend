import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { generarToken } from "../../../utils/generadorToken";
import {
  getDiscordUser,
  findUserByDiscordId,
  createUserDiscord,
  linkDiscordToUser,
} from "../../../services/userManagement/discord.service";

export async function discordAuth(req: Request, res: Response) {
  const { code, state } = req.query;

  const FRONTEND_URL = process.env.FRONTEND_URL!;
  const NODE_ENV = process.env.NODE_ENV || "development";

  const redirect_uri =
    NODE_ENV === "production"
      ? `${process.env.BASE_URL}/auth/discord/callback`
      : "http://localhost:8000/auth/discord/callback";

  let mode = "login"; 
  let token: string | null = null;

  // Usa decodeURIComponent
  if (state) {
    try {
      const parsed = JSON.parse(decodeURIComponent(String(state)));
      mode = parsed.mode || "login";
      token = parsed.token || null;
      console.log("State parseado:", parsed);
    } catch (err: any) {
     // console.warn("⚠ No se pudo decodificar o parsear el state:", err.message);
    }
  }

  if (!code) {
    return res.status(400).send("No se recibió el código de autorización");
  }

  try {
    const tokenResp = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        code: String(code),
        grant_type: "authorization_code",
        redirect_uri,
      }),
    });

    const tokenData = await tokenResp.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) throw new Error("No se pudo obtener access token");

    const discordUser = await getDiscordUser(accessToken);
    if (!discordUser) throw new Error("No se pudo obtener información del usuario Discord");

    // VINCULACIÓN
    if (mode === "link" && token) {
      console.log("🔗 Modo vinculación detectado en Discord");

      let decoded: any;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!);
      } catch {
        throw new Error("Token inválido o expirado");
      }

      const user = await findUserByDiscordId(decoded.id);
      if (!user) throw new Error("Usuario no encontrado");

      const alreadyLinked = user.authProviders?.some((p: any) => p.provider === "discord");
      if (alreadyLinked) throw new Error("Ya tienes Discord vinculado");

      await linkDiscordToUser(user._id, discordUser);

      return res.send(`
        <script>
          window.opener.postMessage({
            type: 'DISCORD_LINK_SUCCESS',
            message: 'Cuenta Discord vinculada correctamente'
          }, '${FRONTEND_URL}');
          window.close();
        </script>
      `);
    }

    // LOGIN
    let dbUser = await findUserByDiscordId(discordUser.discordId);
    let isFirstTime = false;

    if (!dbUser) {
      dbUser = await createUserDiscord(discordUser);
      isFirstTime = true;
    }

    const sessionToken = generarToken(
      dbUser._id.toHexString(),
      dbUser.name,
      dbUser.email,
      dbUser.url_photo
    );

    return res.send(`
      <script>
        window.opener.postMessage({
          type: 'DISCORD_AUTH_SUCCESS',
          token: '${sessionToken}',
          isFirstTime: ${isFirstTime},
          user: ${JSON.stringify({
            id: dbUser._id.toHexString(),
            name: dbUser.name,
            email: dbUser.email,
            photo: dbUser.url_photo || null,
          })}
        }, '${FRONTEND_URL}');
        window.close();
      </script>
    `);
  } catch (err: any) {
    console.error("⚠ Error en Discord OAuth:", err.message);

    const isLinkError = String(state || "").includes("link");

    return res.send(`
      <script>
        window.opener.postMessage({
          type: '${isLinkError ? "DISCORD_LINK_ERROR" : "DISCORD_AUTH_ERROR"}',
          message: "${err.message || "Error al autenticar con Discord"}"
        }, '${FRONTEND_URL}');
        window.close();
      </script>
    `);
  }
}
