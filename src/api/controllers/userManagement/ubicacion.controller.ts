import { Request, Response } from "express";
import { guardarUbicacionUsuario } from "../../../services/userManagement/ubicacion.service";

export const registrarUbicacion = async (req: Request, res: Response) => {
  const { lat, lng, direccion, departamento, pais } = req.body;
  const user = (req as any).user;

  if (lat === undefined || lng === undefined)
    return res.status(400).json({ error: "Faltan coordenadas" });

  if (!user || !user.email)
    return res.status(401).json({ error: "Usuario no autorizado" });

  try {
    await guardarUbicacionUsuario(user.email, lat, lng, direccion, departamento, pais);
    res.json({ message: "Ubicación registrada correctamente", lat, lng, direccion, departamento, pais });
  } catch (error) {
    console.error("Error guardando ubicación:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};