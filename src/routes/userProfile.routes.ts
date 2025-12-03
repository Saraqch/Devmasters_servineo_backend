import { Router } from 'express';
import {
  createUserProfile,
  getUserProfiles,
  updateBio,
  getUsersByRole,
  convertToFixer,
  getUserById    
} from '../controllers/userProfile.controller';

const router = Router();

// Crear perfil
router.post('/', createUserProfile);

// Obtener todos los perfiles
router.get('/', getUserProfiles);

// Obtener un usuario por ID (para Redux o perfil individual)
router.get('/user/:id', getUserById);   

// Editar bio
router.patch('/:id/bio', updateBio);

// Obtener usuarios por rol
router.get('/role/:role', getUsersByRole);

// Convertir a fixer
router.patch('/:id/convert-fixer', convertToFixer);

export default router;
