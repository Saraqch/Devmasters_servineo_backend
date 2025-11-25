import { Router } from 'express';
import { getOffers, getUniqueTags, getFilterCounts } from '../controllers/jobOfert.controller';

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
/**
 * GET /api/devmaster/tags
 *  * Endpoint que devuelve un array con todas las etiquetas únicas
 * de la colección de ofertas de trabajo.
 * Respuesta: ["pisos", "paredes", "instalación", ...]
 */
router.get('/tags', getUniqueTags); // <-- 2. Define la nueva ruta

router.get('/filter-counts', getFilterCounts);
export default router;
