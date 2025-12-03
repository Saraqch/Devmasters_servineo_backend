import { Router } from 'express';
import {
  getCommentsByFixer,
  getPositiveCommentsByFixer,
  getNegativeCommentsByFixer,
} from './comment.controller';

const router = Router();

// GET /api/comments/:fixerId
router.get('/:fixerId', getCommentsByFixer);
router.get('/:fixerId/positive', getPositiveCommentsByFixer);
router.get('/:fixerId/negative', getNegativeCommentsByFixer);

export default router;
