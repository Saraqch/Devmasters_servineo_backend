import { Router } from 'express';
import { actualizarFotoPerfil } from '../../controllers/userManagement/fotoPefil.controller';

const router = Router();

// PUT porque estamos actualizando un dato existente
router.put('/usuarios/foto', actualizarFotoPerfil);

export default router;
