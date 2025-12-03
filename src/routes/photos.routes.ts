// src/api/routes/photos.routes.ts
import { Router } from 'express';
import {
  updateProfilePhoto,
  getMyProfilePhoto,
  uploadJobOfferPhoto,
  getMyJobOfferPhotos,
  removeJobOfferPhoto,
} from '../controllers/photos.controller'; // ahora todo junto o separado, como prefieras

const router = Router();

// Foto de perfil (solo URL)
router.post('/profile-photo', updateProfilePhoto);
router.get('/profile-photo', getMyProfilePhoto);

// Fotos de oferta de trabajo (subida real de archivos)
router.post('/job-offer-photos', uploadJobOfferPhoto);
router.get('/job-offer-photos', getMyJobOfferPhotos);
router.delete('/job-offer-photos', removeJobOfferPhoto);

export default router;