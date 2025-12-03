import { Request, Response } from 'express';
import { updateUserPhoto } from '../../../services/userManagement/fotoPerfil.service';

export async function actualizarFotoPerfil(req: Request, res: Response) {
  try {
    const { usuarioId, fotoPerfil } = req.body;

    if (!usuarioId || !fotoPerfil) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos: usuarioId o fotoPerfil.',
      });
    }

    const result = await updateUserPhoto(usuarioId, fotoPerfil);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Foto de perfil actualizada correctamente.',
    });
  } catch (error) {
    console.error('Error al actualizar la foto de perfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar la foto.',
    });
  }
}