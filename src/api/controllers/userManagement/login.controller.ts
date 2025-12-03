import { Request, Response } from 'express';
import { connectDB } from '../../../config/db/mongoClient';
import bcrypt from 'bcryptjs';
import { generarToken } from '../../../utils/generadorToken';
import { verifyGoogleToken, findUserByEmail } from "../../../services/userManagement/google.service";

export const loginUsuario = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos (email o contraseña)',
    });
  }

  try {
    const db = await connectDB();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({
      'authProviders.provider': 'email',
      "authProviders.providerId": email
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado o sin método de correo vinculado',
      });
    }

    const emailProvider = user.authProviders.find(
      (p: any) => p.provider === "email" && p.providerId === email
    );

    if (!emailProvider || !emailProvider.password) {
      return res.status(400).json({
        success: false,
        message: 'El método de correo no tiene contraseña registrada',
      });
    }

    const passwordMatch = await bcrypt.compare(password, emailProvider.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña incorrecta',
      });
    }

    const userPicture = user.url_photo || null;

    const sessionToken = generarToken(
      user._id.toString(),
      user.name || 'Usuario',
      email,
      userPicture
    );

    return res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token: sessionToken,
      user: {
        id: user._id.toString(),
        name: user.name || 'Usuario',
        email,
        picture: userPicture,
      },
    });
  } catch (error) {
    console.error('Error al iniciar sesión con correo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

export const loginGoogle = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token no recibido",
    });
  }

  try {
    const googleUser = await verifyGoogleToken(token);

    if (!googleUser || !googleUser.email) {
      return res.status(400).json({
        success: false,
        message: "Token inválido",
      });
    }

    const dbUser = await findUserByEmail(googleUser.email);

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "Usuario no registrado. Por favor regístrate.",
      });
    }

    const sessionToken = generarToken(
      dbUser._id.toString(),
      dbUser.name,
      dbUser.email,
      dbUser.url_photo
    );

    return res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      token: sessionToken,
      user: {
        id: dbUser._id.toString(),
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.url_photo,
      },
    });

  } catch (error) {
    console.error("Error en loginGoogle:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};
