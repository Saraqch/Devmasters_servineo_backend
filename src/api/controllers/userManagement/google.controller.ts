import { Request, Response, NextFunction } from "express";
import { verifyGoogleToken, findUserByEmail, createUser } from "../../../services/userManagement/google.service";
import { generarToken } from "../../../utils/generadorToken";
import jwt from "jsonwebtoken";
import { IUser } from "../../../models/user.model";
import { Types } from "mongoose";

export async function googleAuth(req: Request, res: Response) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ status: "error", message: "Token no recibido" });
  }

  try {
    const googleUser = await verifyGoogleToken(token);
    if (!googleUser || !googleUser.email) {
      return res.status(400).json({ status: "error", message: "Token inválido" });
    }

    // Forzamos el tipo para que TS reconozca _id
    let dbUser = await findUserByEmail(googleUser.email) as (IUser & { _id: Types.ObjectId }) | null;
    const exists = dbUser !== null;

    if (!exists) {
      dbUser = await createUser(googleUser) as IUser & { _id: Types.ObjectId };
    }

    if (!dbUser) {
      return res.status(500).json({
        status: "error",
        message: "No se pudo obtener o crear el usuario",
      });
    }

    const sessionToken = generarToken(
      dbUser._id.toString(),
      dbUser.name,
      dbUser.email
    );

    return res.json({
      status: exists ? "exists" : "firstTime",
      firstTime: !exists,
      user: {
        _id: dbUser._id.toString(),
        email: dbUser.email,
        name: dbUser.name,
        picture: dbUser.url_photo,
      },
      token: sessionToken,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Error al autenticar con Google" });
  }
}

// Middleware para verificar JWT
export function verifyJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];
  const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}
