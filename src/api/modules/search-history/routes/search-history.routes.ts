// src/modules/search-history/routes/search-history.routes.ts
import { Router } from 'express';
import { handleSearchHistory, getSuggestions } from '../controllers/search-history.controller';

const router = Router();

/**
 * GET /api/devmaster/search-history
 *
 * Maneja todas las operaciones de historial mediante el parámetro "action":
 *
 * - ?action=getHistory&search=texto&sessionId=xxx
 *   Obtiene el historial filtrado por término de búsqueda
 *
 * - ?action=deleteHistory&searchTerm=texto&sessionId=xxx
 *   Elimina un ítem específico del historial
 *
 * - ?action=reenqueue&sessionId=xxx
 *   Re-encola búsquedas antiguas cuando el historial tiene < 5 items
 *
 * - ?action=clearAllHistory&sessionId=xxx
 *   Limpia todo el historial del usuario/sesión
 *
 * Requiere: sessionId o userId (al menos uno)
 */
router.get('/search-history', handleSearchHistory);

/**
 * GET /api/devmaster/suggestions
 *
 * Obtiene sugerencias de búsqueda inteligentes basadas en:
 * - Historial personal del usuario
 * - Historial global de búsquedas
 * - Frecuencia y recencia
 *
 * Query params:
 * - search: término de búsqueda (requerido)
 * - sessionId: ID de sesión (opcional)
 * - userId: ID de usuario (opcional)
 * - limit: número máximo de sugerencias (default: 5)
 *
 * Ejemplo:
 * /api/devmaster/suggestions?search=elec&sessionId=xxx&limit=10
 */
router.get('/suggestions', getSuggestions);

export default router;
