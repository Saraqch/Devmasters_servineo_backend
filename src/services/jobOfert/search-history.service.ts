// services/jobOfert/search-history.service.ts
import { SearchHistory } from '../../models/search-history.model';
import { normalizeForHistory } from '../../utils/search.normalizer';
import {
  validateAndCleanSearchTerm,
  filterSpecialCharacters,
} from '../../utils/searchTermValidator';

/**
 * Guarda una búsqueda en el historial
 * Evita duplicados y actualiza la posición si ya existe
 */
export async function saveSearchToHistory(
  searchTerm: string,
  sessionId?: string,
  userId?: string,
): Promise<any> {
  try {
    // Validar y limpiar el término
    const cleanedTerm = validateAndCleanSearchTerm(searchTerm);

    if (!cleanedTerm) {
      return null;
    }

    const filteredTerm = filterSpecialCharacters(cleanedTerm);

    if (!filteredTerm) {
      return null;
    }
    const normalizedTerm = normalizeForHistory(cleanedTerm);

    const identifier = userId || sessionId;
    if (!identifier) {
      throw new Error('Se requiere sessionId o userId');
    }

    // Buscar si ya existe el término (no archivado)
    const query = userId
      ? { userId, normalizedTerm, isArchived: false }
      : { sessionId, normalizedTerm, isArchived: false };

    const existing = await SearchHistory.findOne(query);

    if (existing) {
      existing.searchedAt = new Date();
      existing.searchTerm = cleanedTerm;
      return await existing.save();
    }

    // Crear nuevo registro
    const newSearch = new SearchHistory({
      sessionId: userId ? undefined : sessionId,
      userId,
      searchTerm: cleanedTerm,
      normalizedTerm,
      searchedAt: new Date(),
      isArchived: false,
    });

    return await newSearch.save();
  } catch (error) {
    console.error('Error saving search to history:', error);
    throw error;
  }
}

/**
 * Obtiene el historial de búsquedas de un usuario/sesión
 * Limitado a los últimos registros, ordenados por más reciente
 */
export async function getSearchHistory(
  sessionId?: string,
  userId?: string,
  limit: number = 5,
): Promise<any[]> {
  try {
    const identifier = userId || sessionId;
    if (!identifier) {
      return [];
    }

    const query = userId ? { userId, isArchived: false } : { sessionId, isArchived: false };

    const history = await SearchHistory.find(query)
      .sort({ searchedAt: -1 })
      .limit(limit)
      .select('searchTerm searchedAt isArchived')
      .lean();

    return history;
  } catch (error) {
    console.error('Error getting search history:', error);
    throw error;
  }
}

/**
 * Filtra el historial basado en el término de búsqueda
 * Si no hay término, devuelve todo el historial activo
 */
export async function filterSearchHistory(
  searchTerm: string,
  sessionId?: string,
  userId?: string,
  limit: number = 5,
): Promise<any[]> {
  try {
    const identifier = userId || sessionId;
    if (!identifier) {
      return [];
    }

    // Si no hay término de búsqueda, devolver todo el historial
    if (!searchTerm || !searchTerm.trim()) {
      return getSearchHistory(sessionId, userId, limit);
    }

    const normalizedInput = normalizeForHistory(searchTerm.trim());

    const query = userId ? { userId, isArchived: false } : { sessionId, isArchived: false };

    const history = await SearchHistory.find(query)
      .sort({ searchedAt: -1 })
      .select('searchTerm normalizedTerm searchedAt isArchived')
      .lean();

    const filtered = history.filter((item: any) => item.normalizedTerm.includes(normalizedInput));

    return filtered.slice(0, limit).map((item: any) => ({
      searchTerm: item.searchTerm,
      searchedAt: item.searchedAt,
    }));
  } catch (error) {
    console.error('Error filtering search history:', error);
    throw error;
  }
}

/**
 * Elimina (archiva) un ítem específico del historial
 * Automáticamente re-encola búsquedas antiguas si quedan menos de 5
 */
export async function deleteHistoryItem(
  searchTerm: string,
  sessionId?: string,
  userId?: string,
): Promise<boolean> {
  try {
    const identifier = userId || sessionId;
    if (!identifier) {
      return false;
    }

    if (!searchTerm || !searchTerm.trim()) {
      return false;
    }

    const normalizedTerm = normalizeForHistory(searchTerm.trim());

    const query = userId
      ? { userId, normalizedTerm, isArchived: false }
      : { sessionId, normalizedTerm, isArchived: false };

    // Debug query removed to reduce log noise

    const found = await SearchHistory.findOne(query);

    if (!found) {
      // Intentar buscar sin normalizar (por si hay discrepancia)
      const queryOriginal = userId
        ? { userId, searchTerm: searchTerm.trim(), isArchived: false }
        : { sessionId, searchTerm: searchTerm.trim(), isArchived: false };

      const foundOriginal = await SearchHistory.findOne(queryOriginal);

      if (foundOriginal) {
        foundOriginal.isArchived = true;
        foundOriginal.isDeletedManually = true;
        await foundOriginal.save();
        // Pasar el término normalizado para excluirlo del re-enqueue
        await reenqueueOldSearches(sessionId, userId, foundOriginal.normalizedTerm);
        return true;
      }

      return false;
    }

    // Marcar como archivado
    found.isArchived = true;
    found.isDeletedManually = true;
    await found.save();

    // Re-encolar búsquedas antiguas EXCLUYENDO el que acabamos de archivar
    await reenqueueOldSearches(sessionId, userId, normalizedTerm);

    return true;
  } catch (error) {
    console.error('Error deleting history item:', error);
    throw error;
  }
}

export async function reenqueueOldSearches(
  sessionId?: string,
  userId?: string,
  excludeNormalizedTerm?: string,
): Promise<any[]> {
  try {
    const identifier = userId || sessionId;
    if (!identifier) {
      return [];
    }

    const activeQuery = userId
      ? { userId, isArchived: true, isDeletedManually: { $ne: true } }
      : { sessionId, isArchived: true, isDeletedManually: { $ne: true } };

    const activeCount = await SearchHistory.countDocuments(activeQuery);

    if (activeCount === 0) {
      return [];
    }

    if (activeCount < 5) {
      const needed = 5 - activeCount;

      // 🔒 Aquí nos aseguramos de buscar solo dentro de la MISMA sesión o usuario
      const archivedQuery: any = userId
        ? { userId, isArchived: true }
        : { sessionId, isArchived: true };

      // ⚠️ Evita traer cosas viejas de otras sesiones sin relación
      if (excludeNormalizedTerm) {
        archivedQuery.normalizedTerm = { $ne: excludeNormalizedTerm };
      }

      // 🔥 NUEVA SEGURIDAD: No recuperar nada si no hay históricos en esta sesión
      const archivedCount = await SearchHistory.countDocuments(archivedQuery);
      if (archivedCount === 0) {
        return [];
      }

      const toRecover = await SearchHistory.find(archivedQuery)
        .sort({ searchedAt: -1 })
        .limit(needed);

      // Removed debug log

      const recovered = [];
      for (const item of toRecover) {
        item.isArchived = false;
        await item.save();
        recovered.push({
          searchTerm: item.searchTerm,
          searchedAt: item.searchedAt,
        });
      }
      return recovered;
    }

    return [];
  } catch (error) {
    console.error('Error reenqueuing old searches:', error);
    throw error;
  }
}

/**
 * Archiva TODO el historial de un usuario/sesión
 * No elimina de la BD, solo marca como archivado
 */
export async function clearAllHistory(sessionId?: string, userId?: string): Promise<number> {
  try {
    const identifier = userId || sessionId;
    if (!identifier) {
      return 0;
    }

    const query = userId ? { userId, isArchived: false } : { sessionId, isArchived: false };

    const result = await SearchHistory.updateMany(query, {
      $set: { isArchived: true, isDeletedManually: true },
    });

    // Removed debug log for modified count
    return result.modifiedCount;
  } catch (error) {
    console.error('Error clearing all history:', error);
    throw error;
  }
}
