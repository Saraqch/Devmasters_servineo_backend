// src/modules/search-history/controllers/search-history.controller.ts
import { Request, Response } from 'express';
import {
  filterSearchHistory,
  deleteHistoryItem,
  reenqueueOldSearches,
  clearAllHistory,
  getSearchHistory,
} from '../services/search-history.service';
import { filterSuggestions } from '../services/search-suggestions.service';

/**
 * Controller unificado para todas las operaciones de historial de búsqueda
 * Maneja: getHistory, deleteHistory, reenqueue, clearAllHistory
 */
export const handleSearchHistory = async (req: Request, res: Response) => {
  try {
    const { action, sessionId, userId, searchTerm, search } = req.query;

    // Validar que action esté presente
    if (!action || typeof action !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Parámetro "action" es requerido',
      });
    }

    const sid = typeof sessionId === 'string' ? sessionId : undefined;
    const uid = typeof userId === 'string' ? userId : undefined;

    // Validar que exista sessionId o userId para operaciones que lo requieren
    if (
      !sid &&
      !uid &&
      ['deleteHistory', 'reenqueue', 'clearAllHistory', 'getHistory'].includes(action)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere sessionId o userId para esta acción',
      });
    }

    // ===== GET HISTORY =====
    if (action === 'getHistory') {
      const term = typeof search === 'string' ? search.trim() : '';
      const historyItems = await filterSearchHistory(term, sid, uid, 5);

      return res.status(200).json({
        success: true,
        action: 'getHistory',
        searchHistory: historyItems,
      });
    }

    // ===== DELETE HISTORY =====
    if (action === 'deleteHistory') {
      const term =
        typeof searchTerm === 'string' && searchTerm.trim()
          ? searchTerm.trim()
          : typeof search === 'string' && search.trim()
            ? search.trim()
            : undefined;

      if (!term) {
        return res.status(400).json({
          success: false,
          message: 'Parámetro searchTerm es requerido para deleteHistory',
        });
      }

      const deleted = await deleteHistoryItem(term, sid, uid);
      const updatedHistory = await getSearchHistory(sid, uid, 5);

      return res.status(200).json({
        success: true,
        action: 'deleteHistory',
        deleted,
        searchHistory: updatedHistory,
      });
    }

    // ===== REENQUEUE =====
    if (action === 'reenqueue') {
      const requeued = await reenqueueOldSearches(sid, uid);
      const updatedHistory = await getSearchHistory(sid, uid, 5);

      return res.status(200).json({
        success: true,
        action: 'reenqueue',
        requeued,
        searchHistory: updatedHistory,
      });
    }

    // ===== CLEAR ALL HISTORY =====
    if (action === 'clearAllHistory') {
      const cleared = await clearAllHistory(sid, uid);

      return res.status(200).json({
        success: true,
        action: 'clearAllHistory',
        cleared,
        searchHistory: [],
      });
    }

    // Acción no soportada
    return res.status(400).json({
      success: false,
      message: `Acción no soportada: ${action}`,
    });
  } catch (error) {
    console.error('Error en handleSearchHistory:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud de historial',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Controller para obtener sugerencias de búsqueda
 * Combina historial del usuario + sugerencias globales
 */
export const getSuggestions = async (req: Request, res: Response) => {
  try {
    const { search, sessionId, userId, limit } = req.query;

    if (!search || typeof search !== 'string' || !search.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Parámetro "search" es requerido',
      });
    }

    const sid = typeof sessionId === 'string' ? sessionId : undefined;
    const uid = typeof userId === 'string' ? userId : undefined;
    const searchLimit = typeof limit === 'string' && !isNaN(Number(limit)) ? Number(limit) : 5;

    const suggestions = await filterSuggestions(search.trim(), searchLimit, uid, sid);

    return res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error('Error en getSuggestions:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener sugerencias',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
