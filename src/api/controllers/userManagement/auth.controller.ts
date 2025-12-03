// src/modules/auth/auth.controller.ts
import { Request, Response } from 'express';
import { connectDB } from '../../../config/db/mongoClient';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from "google-auth-library";
// Login con base de datos real
export const loginUsuario = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validar campos
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Faltan datos' });
  }

  try {
    const db = await connectDB();
    const usersCollection = db.collection('users');

    // Buscar usuario por email
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Comparar contraseñas
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

    // Login correcto
    return res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      usuario: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        language: user.language,
      },
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const loginGoogle = async (req: Request, res: Response) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ success: false, message: "No se recibió el token de Google" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: "No se pudo verificar el correo" });
    }

    const db = await connectDB();
    const usersCollection = db.collection("users");

    // Buscar si el usuario ya está en la base de datos
    const user = await usersCollection.findOne({ email: payload.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado. Regístrese primero.",
      });
    }

    // Si el usuario existe
    return res.json({
      success: true,
      message: "Inicio de sesión exitoso con Google",
      usuario: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        language: user.language,
      },
    });
  } catch (error) {
    console.error("Error en login con Google:", error);
    return res.status(500).json({ success: false, message: "Error al verificar el token de Google" });
  }
};