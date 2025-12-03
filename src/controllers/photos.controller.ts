// src/api/controllers/photos.controller.ts  (nuevo archivo recomendado)
import { Request, Response } from 'express';
import {
  setProfilePhotoUrl,
  getProfilePhotoUrl,
} from '../adapter/firestore/profilePhoto.repository';
import {
  addJobOfferPhoto,
  getJobOfferPhotos,
  deleteJobOfferPhoto,
} from '../adapter/firestore/jobOfferPhotos.repository';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req: any, file: any, cb: any) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, png, webp)'));
    }
  },
});

// === FOTO DE PERFIL (solo guarda la URL) ===
export const updateProfilePhoto = async (req: Request, res: Response) => {
  try {
    const { userId, photoUrl } = req.body;

    if (!userId || !photoUrl) {
      return res.status(400).json({ error: 'userId y photoUrl son requeridos' });
    }

    await setProfilePhotoUrl(userId, photoUrl);
    res.json({ success: true, message: 'Foto de perfil actualizada', photoUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyProfilePhoto = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query; // o req.body, como prefieras

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId es requerido' });
    }

    const photoUrl = await getProfilePhotoUrl(userId);
    res.json({ photoUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// === FOTOS DE OFERTA DE TRABAJO (hasta 5) ===
export const uploadJobOfferPhoto = [
  upload.single('photo'),
  async (req: Request, res: Response) => {
    try {
      if (!(req as any).file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
      }

      // userId viene en el form-data o en query
      const userId = (req.body.userId || req.query.userId) as string;

      if (!userId) {
        return res.status(400).json({ error: 'userId es requerido (en form-data o query)' });
      }

      const photoUrl = await addJobOfferPhoto(userId, (req as any).file);
      res.json({ success: true, photoUrl });
    } catch (error: any) {
      if (error.message.includes('Máximo 5')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  },
];

export const getMyJobOfferPhotos = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId es requerido' });
    }

    const photos = await getJobOfferPhotos(userId);
    res.json({ photos });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const removeJobOfferPhoto = async (req: Request, res: Response) => {
  try {
    const { userId, photoId, fileName } = req.body;

    if (!userId || !photoId || !fileName) {
      return res.status(400).json({ error: 'userId, photoId y fileName son requeridos' });
    }

    await deleteJobOfferPhoto(userId, photoId, fileName);
    res.json({ success: true, message: 'Foto eliminada' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};