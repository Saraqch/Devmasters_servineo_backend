// src/modules/devmaster/routes/sort.routes.ts
import { Router } from 'express';
import { getFixers } from '../controller/sort.controller';

const router = Router();

router.get('/fixers', getFixers);

export default router;
