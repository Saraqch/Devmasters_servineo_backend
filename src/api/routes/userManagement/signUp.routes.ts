import { Router } from "express";
import { googleAuth, verifyJWT } from "../../controllers/userManagement/google.controller";
import { manualRegister } from '../../controllers/userManagement/registrarDatos.controller';
import { githubAuth } from "../../controllers/userManagement/github.controller";
import { discordAuth } from "../../controllers/userManagement/discord.controller";
import { registrarUbicacion } from "../../controllers/userManagement/ubicacion.controller";

const router = Router();

//google
router.post("/auth", googleAuth);
router.get("/verify", verifyJWT, (req, res) => {
  return res.json({ valid: true, user: (req as any).user });
});

//datosPersonales
router.post('/manual', manualRegister);

//github
router.get("/github/callback", githubAuth);

router.get("/github", (req, res) => {
    const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
    const redirect_uri = `${process.env.BASE_URL}/auth/github/callback`;
    const scope = "user:email";
    const { state } = req.query;
    const githubAuthUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${CLIENT_ID}` +
    `&redirect_uri=${redirect_uri}` +
    `&scope=${scope}` +
    (state ? `&state=${encodeURIComponent(String(state))}` : "");

    res.redirect(githubAuthUrl);
});

//discord
router.get("/discord/callback", discordAuth);

router.get("/discord", (req, res) => {
    const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
    const BASE_URL = process.env.BASE_URL!; 
    const redirect_uri = `${BASE_URL}/auth/discord/callback`;
    const scope = "identify email";
    const state = req.query.state;
    const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    redirect_uri
    )}&response_type=code&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state as string)}`;
    res.redirect(discordUrl);
});

//registrar ubicacion
router.post("/ubicacion", verifyJWT, registrarUbicacion);

export default router;