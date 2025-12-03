import { Request, Response } from "express";
import { cambiarContrasenaService } from "../../../services/userManagement/obtener.service";

export const cambiarContrasena = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!id) {
    return res.status(400).json({ 
      success: false,
      message: "ID de usuario requerido" 
    });
  }

  if (!newPassword) {
    return res.status(400).json({ 
      success: false,
      message: "Nueva contraseña requerida" 
    });
  }

  try {
    const result = await cambiarContrasenaService(id, newPassword);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ 
      success: false,
      message: error.message || "Error al cambiar contraseña"
    });
  }
};