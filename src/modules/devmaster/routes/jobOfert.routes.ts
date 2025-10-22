import { Router } from 'express';
import {
  getOffers,
} from '../controller/jobOfert.controller';

const router = Router();

/**
 * ============================================================
 * RUTAS PRINCIPALES (Recomendadas)
 * ============================================================
 */

/**
 * GET /api/devmaster/offers
 *
 * Endpoint unificado que soporta múltiples parámetros:
 * - ?range=De%20(A-C) o ?range=De%20(A-C)&range=De%20(D-F) (múltiples)
 * - ?city=Cochabamba (single)
 * - ?category=Electricista o ?category=Electricista&category=Fontanero (múltiples)
 * - ?search=texto (búsqueda flexible)
 * - ?sortBy=name_asc|name_desc|recent|oldest|rating|contact_asc|contact_desc
 *
 * Ejemplos:
 * /api/devmaster/offers
 * /api/devmaster/offers?search=electricista
 * /api/devmaster/offers?city=Cochabamba
 * /api/devmaster/offers?range=De%20(A-C)&category=Electricista
 * /api/devmaster/offers?search=prueba&sortBy=name_asc
 */
router.get('/offers', getOffers);

export default router;
