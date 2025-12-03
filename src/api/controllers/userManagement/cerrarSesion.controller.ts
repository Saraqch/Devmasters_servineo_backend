import { Request, Response } from "express";
import { logoutAllService } from "../../../services/userManagement/cerrarSesiones.service";

export const logoutAllController = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Token no proporcionado" });
    }

    const result = await logoutAllService(token);
    res.json(result);
  } catch (error: any) {
    console.error("Error cerrando sesiones:", error);
    res.status(500).json({ success: false, message: error.message || "Error del servidor" });
  }
};