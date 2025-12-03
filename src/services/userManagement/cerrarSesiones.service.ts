import { connectDB } from "../../config/db/mongoClient";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "servineosecretkey";

interface TokenPayload extends JwtPayload {
  id: string;
}

export const logoutAllService = async (token: string) => {
  const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
  const db = await connectDB();

  const usuario = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) });
  if (!usuario) throw new Error("Usuario no encontrado");

  const result = await db.collection("users").updateOne(
    { _id: new ObjectId(decoded.id) },
    { $set: { devices: [], updatedAt: new Date() } }
  );

  if (result.matchedCount === 0) throw new Error("Usuario no encontrado");

  return {
    success: true,
    message: "Se cerraron todas las sesiones activas",
  };
};