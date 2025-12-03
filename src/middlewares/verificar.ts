import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function verifyClientJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];
  const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);

    // 🔹 Normalizamos el usuario
    (req as any).user = {
      ...decoded,
      _id: decoded.id || decoded._id,
      id: decoded.id || decoded._id,
      email: decoded.email,
      nombre: decoded.nombre,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}
