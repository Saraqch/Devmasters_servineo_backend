import express from 'express';
import { postDescriptionFixer } from '../controllers/user.controller';

const router = express.Router();

// POST /api/user/:id/description - Actualizar descripción de un fixer
router.post('/:id/description', postDescriptionFixer);

export default router;
