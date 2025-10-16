// src/routes/servicios.routes.ts
import { Router } from 'express';
import { getServiciosByName } from '../controller/servicios.controller';

const router = Router();

router.get('/servicios', getServiciosByName);

export default router;
