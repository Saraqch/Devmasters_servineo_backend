import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { bucket } from '../config/firebase.config';

export const upgradeToFixer = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const {
      ci,
      servicios,
      vehiculo,
      metodoPago,
      acceptTerms,
    } = req.body;

    // 1. Validar que el usuario exista
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // 2. Manejar la subida de la imagen (fixerProfile)
    let fixerProfileUrl = user.fixerProfile; // Mantener la anterior si no se sube nueva

    if ((req as any).file) {
      const file = (req as any).file;
      const fileName = `fixer-profiles/${Date.now()}-${Math.round(Math.random() * 1000)}-${file.originalname}`;
      const fileUpload = bucket.file(fileName);

      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      await new Promise<void>((resolve, reject) => {
        blobStream.on('error', (error: any) => reject(error));
        blobStream.on('finish', async () => {
          await fileUpload.makePublic();
          fixerProfileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          resolve();
        });
        blobStream.end((req as any).file?.buffer);
      });
    }

    // 3. Actualizar datos del usuario
    // Parsear objetos si vienen como strings (común en multipart/form-data)
    let parsedVehiculo = vehiculo;
    let parsedMetodoPago = metodoPago;
    let parsedServicios = servicios;

    try {
      if (typeof vehiculo === 'string') parsedVehiculo = JSON.parse(vehiculo);
      if (typeof metodoPago === 'string') parsedMetodoPago = JSON.parse(metodoPago);
      if (typeof servicios === 'string') parsedServicios = JSON.parse(servicios);
    } catch (e) {
      console.warn('Error parseando JSON del body:', e);
    }

    user.role = 'fixer';
    user.ci = ci;
    user.servicios = parsedServicios;
    user.vehiculo = parsedVehiculo;
    user.metodoPago = parsedMetodoPago;
    user.acceptTerms = acceptTerms === 'true' || acceptTerms === true;
    if (fixerProfileUrl) user.fixerProfile = fixerProfileUrl;

    await user.save();

    res.status(200).json({
      message: 'Usuario actualizado a Fixer exitosamente',
      user,
    });
  } catch (error) {
    console.error('Error upgrading user:', error);
    res.status(500).json({ message: 'Error actualizando usuario', error });
  }
};
