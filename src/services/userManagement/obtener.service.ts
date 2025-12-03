import bcrypt from "bcrypt";
import { connectDB } from "../../config/db/mongoClient";
import { ObjectId } from "mongodb";

export const cambiarContrasenaService = async (userId: string, newPassword: string) => {
  const db = await connectDB();

  const usuario = await db.collection("users").findOne({ 
    _id: new ObjectId(userId) 
  });

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  // Cambiar contraseña directamente (sin verificaciones)
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { password: hashedNewPassword, updatedAt: new Date() } }
  );

  return {
    success: true,
    message: "Contraseña cambiada exitosamente",
    user: {
      id: userId,
      name: usuario.name,
      email: usuario.email
    },
    passwordInfo: {
      originalPassword: newPassword,           // ← La contraseña original
      newPasswordHash: hashedNewPassword,      // ← Hash completo
      hashLength: hashedNewPassword.length,    // ← Longitud del hash
      updatedAt: new Date()
    }
  };
};