// src/modules/controlC/HU4/auth/forgot.controller.ts
import { Request, Response } from "express";
import crypto from "crypto";
import clientPromise from "../../../config/db/mongodb";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";
const FRONTEND_URL = process.env.FRONTEND_URL;
const FROM_EMAIL = process.env.FROM_EMAIL || "no-reply@servineo.example";

// Paleta Servineo
const BRAND = {
  name: "Servineo",
  primary: "#2B31E0",       // botón / acento
  gradientFrom: "#2B31E0",  // header izquierda
  gradientTo: "#1AA7ED",    // header derecha
  border: "#759AE0",        // bordes suaves
  text: "#0F172A",          // texto principal
  muted: "#475569",         // texto secundario
  bg: "#FFFFFF",            // fondo
};

// SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: !!(process.env.SMTP_SECURE === "true"),
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

function generateTokenHex(len = 32) {
  return crypto.randomBytes(len).toString("hex");
}

/** Email HTML seguro y compatible (tablas + inline CSS) */
function buildMagicEmailHTML(params: {
  displayName: string;
  magicLink: string;
}) {
  const { displayName, magicLink } = params;
  const year = new Date().getFullYear();
  const preheader =
    "Tu enlace de acceso sin contraseña. Válido por 5 minutos. Si generas otro, este quedará inválido.";

  return `
<!doctype html>
<html lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Servineo – Acceso sin contraseña</title>
  <style>
    .preheader { display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden; mso-hide:all; }
    @media only screen and (max-width: 600px) {
      .container { width:100% !important; padding:0 16px !important; }
      .card { padding:20px !important; border-radius:16px !important; }
      .h1 { font-size:20px !important; }
      .lead { font-size:14px !important; }
      .btn { padding:12px 16px !important; font-size:16px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#FFFFFF;">
  <span class="preheader">${preheader}</span>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FFFFFF;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px; max-width:600px; margin:0 auto; padding:24px;">

          <!-- Header gradiente con marca -->
          <tr>
            <td style="border-radius:20px; overflow:hidden; background:#2B31E0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(90deg, #2B31E0, #1AA7ED);">
                <tr>
                  <td style="padding:24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td>
                          <!-- Marca -->
                          <div style="font-family:Roboto, Arial, sans-serif; color:#FFFFFF; font-weight:800; font-size:18px; letter-spacing:1.2px;">
                            SERVINEO
                          </div>
                          <div style="color:rgba(255,255,255,0.95); font-family:Roboto, Arial, sans-serif; font-size:14px; margin-top:4px;">
                            Acceso sin contraseña
                          </div>
                        </td>
                        <td width="24"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="height:16px; line-height:16px; font-size:0;">&nbsp;</td></tr>

          <!-- Tarjeta principal -->
          <tr>
            <td class="card" style="background:#FFFFFF; border:1px solid #759AE0; border-radius:20px; padding:28px;">
              <div class="h1" style="font-family:Roboto, Arial, sans-serif; color:#0F172A; font-weight:700; font-size:22px; margin:0 0 8px;">
                Hola ${displayName},
              </div>
              <div class="lead" style="font-family:Roboto, Arial, sans-serif; color:#0F172A; font-size:16px; line-height:1.6; margin:0 0 18px;">
                Te enviamos un enlace para ingresar a tu cuenta de <strong>Servineo</strong> sin contraseña.
                <br>Por seguridad, este enlace es válido por <strong>5 minutos</strong>.
              </div>

              <!-- Botón -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0;">
                <tr>
                  <td>
                    <a href="${magicLink}" class="btn"
                      style="
                        background:#2B31E0;
                        color:#FFFFFF;
                        text-decoration:none;
                        font-family:Roboto, Arial, sans-serif;
                        font-weight:700;
                        font-size:17px;
                        padding:14px 22px;
                        border-radius:10px;
                        display:inline-block;
                      " target="_blank">
                      Ingresar a Servineo
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Enlace fallback -->
              <div style="font-family:Roboto, Arial, sans-serif; color:#475569; font-size:13px; line-height:1.6; margin-top:6px;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
                <br>
                <a href="${magicLink}" style="color:#2B31E0; text-decoration:underline; word-break:break-all;" target="_blank">
                  ${magicLink}
                </a>
              </div>

              <!-- Separador -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0;">
                <tr>
                  <td style="border-top:1px solid #759AE0; height:1px; line-height:1px; font-size:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Avisos -->
              <div style="font-family:Roboto, Arial, sans-serif; color:#475569; font-size:12px; line-height:1.7;">
                Importante: si generas un nuevo enlace, los anteriores quedan invalidados y ya no funcionarán.
                <br>¿No solicitaste este acceso? Ignora este mensaje y tu cuenta permanecerá segura.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align:center; padding:18px 8px; font-family:Roboto, Arial, sans-serif; font-size:12px; color:#475569;">
              © ${year} Servineo. Este es un correo automático, por favor no lo respondas.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/** Texto plano (fallback) sin repetir el correo */
function buildMagicEmailText(params: {
  displayName: string;
  magicLink: string;
}) {
  const { displayName, magicLink } = params;
  return `Hola ${displayName},

Te enviamos un enlace para ingresar a tu cuenta de Servineo sin usar contraseña.
El enlace es válido por 5 minutos.

Enlace: ${magicLink}

Importante: si generas un nuevo enlace, los anteriores quedan invalidados.

Si tú no solicitaste este acceso, ignora este mensaje.
— Equipo Servineo`;
}


/**
 * POST /api/controlC/auth/forgot-password
 * - Valida email
 * - Rate limit 1/min
 * - Invalida enlaces previos
 * - Crea nuevo (5 min)
 * - Envía correo (HTML + text) compatible
 */
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, message: "Correo requerido" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Correo inválido" });
    }

    const client = await clientPromise;
    const db = client.db("ServineoBD");
    const usersCol = db.collection("users");

    const user = await usersCol.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Correo no registrado" });
    }

    const magicCol = db.collection("magic_links");

    // Rate-limit 1/min
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recent = await magicCol.findOne({
      email,
      used: { $ne: true },
      createdAt: { $gte: oneMinuteAgo },
    });
    if (recent) {
      return res.status(429).json({
        success: false,
        message: "Ya existe una solicitud en curso. Intenta nuevamente en 1 minuto.",
      });
    }

    // Invalidar enlaces anteriores no usados
    const now = new Date();
    await magicCol.updateMany(
      { email, used: { $ne: true } },
      { $set: { used: true, invalidatedBy: "resend", invalidatedAt: now } }
    );

    // Crear nuevo token (5 min)
    const token = generateTokenHex(32);
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    await magicCol.insertOne({ token, email, createdAt: now, expiresAt, used: false });

    // Armar correo
    const magicLink = `${FRONTEND_URL}/login/forgotpass/verify?token=${encodeURIComponent(token)}`;
    const displayName =
      (user as any).name && typeof (user as any).name === "string" ? (user as any).name : "usuario";

    const subject = "Servineo — Acceso sin contraseña (válido 5 minutos)";
    const text = buildMagicEmailText({ displayName, magicLink });
    const html = buildMagicEmailHTML({ displayName, magicLink });

    const mailOptions = {
      from: `Servineo <${FROM_EMAIL}>`,
      to: email,
      subject,
      text,
      html,
      headers: {
        "X-Entity-Ref-ID": crypto.randomBytes(8).toString("hex"),
        "X-Priority": "3", // normal
      },
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error enviando correo magic link:", err);
      } else {
        console.log("Magic link enviado:", info?.messageId);
      }
    });

    return res.json({ success: true, message: "Enlace enviado", email: user.email });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ success: false, message: "Error interno" });
  }
}

/**
 * GET /api/controlC/auth/magic-login?token=...
 * - valida token
 * - acepta SOLO el más reciente
 * - marca used=true
 * - genera JWT
 */
export async function magicLogin(req: Request, res: Response) {
  try {
    const token = String(req.query.token || "");
    if (!token) {
      return res.status(400).json({ success: false, message: "Token requerido" });
    }

    const client = await clientPromise;
    const db = client.db("ServineoBD");
    const magicCol = db.collection("magic_links");
    const usersCol = db.collection("users");

    const record = await magicCol.findOne({ token });
    if (!record) {
      return res.status(404).json({ success: false, message: "Enlace inválido" });
    }

    const now = new Date();

    if (record.used === true && record.invalidatedBy === "resend") {
      return res.status(400).json({
        success: false,
        message: "Este enlace fue reemplazado por uno más reciente. Revisa tu correo y usa el último enlace recibido.",
      });
    }

    if (record.expiresAt && record.expiresAt < now) {
      return res.status(410).json({ success: false, message: "El enlace ha expirado" });
    }

    if (record.used === true) {
      return res.status(400).json({ success: false, message: "El enlace ya fue utilizado" });
    }

    const latest = await magicCol.find({ email: record.email }).sort({ createdAt: -1 }).limit(1).next();
    if (latest && latest.token !== record.token) {
      return res.status(400).json({
        success: false,
        message: "Este enlace fue reemplazado por uno más reciente. Revisa tu correo y usa el último enlace recibido.",
      });
    }

    const user = await usersCol.findOne({ email: record.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    await magicCol.updateOne({ token }, { $set: { used: true, usedAt: new Date() } });

    const sessionToken = jwt.sign(
      { id: user._id.toString(), email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token: sessionToken,
      user: { email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("magicLogin error:", err);
    return res.status(500).json({ success: false, message: "Error interno" });
  }
}