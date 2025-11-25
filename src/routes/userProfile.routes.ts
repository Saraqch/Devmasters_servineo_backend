import { Router } from 'express';
import {
  createUserProfile,
  getUserProfiles,
  updateBio,
  getUsersByRole,
  convertToFixer,
  getUserProfileById 
} from '../controllers/userProfile.controller';

const router = Router();

router.post('/', createUserProfile);
router.get('/', getUserProfiles);

// Editar bio
router.patch('/:id/bio', updateBio);
router.get('/:id', getUserProfileById);
// Obtener usuarios por rol
router.get('/role/:role', getUsersByRole);

// Convertir a fixer (actualizar profile)
router.patch('/:id/convert-fixer', convertToFixer);

export default router;

