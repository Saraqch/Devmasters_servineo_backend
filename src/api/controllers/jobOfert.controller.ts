import { Request, Response } from 'express';
import { getAllOffers, getOffersFiltered, getPriceRanges } from '../../services/jobOfert.service';
import { SortCriteria } from '../../types/sort.types';
import { getTagsForOffers } from '../../services/resultsAdvSearch/tags.service';
import { FilterCountsService } from '../../services/jobOfert/filterCounts.service';

import {
  saveSearchToHistory,
  filterSearchHistory,
  deleteHistoryItem,
  reenqueueOldSearches,
  clearAllHistory,
  getSearchHistory,
} from '../../services/jobOfert/search-history.service';
import { filterSuggestions } from '../../services/jobOfert/search-suggestions.service';
import {
  validatePageRange,
  normalizePageParam,
  calculatePaginationParams,
} from '../../validators/pagination.validator';

export const getOffers = async (req: Request, res: Response) => {
  try {
    const {
      range,
      city,
      category,
      search,
      sortBy,
      // alias 'sort' is accepted from frontend in some places — normalize below
      sort,
      limit,
      skip,
      page,
      tags,
      minPrice,
      maxPrice,
      action,
      sessionId,
      userId,
      searchTerm,
      record,
    } = req.query;

    // ==================== ACCIÓN: GET PRICE RANGES ====================
    if (action === 'getPriceRanges') {
      const buckets = typeof req.query.buckets === 'string' ? parseInt(req.query.buckets, 10) : 4;
      const includeExtremes = req.query.includeExtremes !== 'false';
      try {
        const result = await getPriceRanges(buckets, includeExtremes);
        return res.status(200).json({ success: true, ...result });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error obteniendo rangos de precio',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // ==================== ACCIONES DE HISTORIAL ====================
    if (action && typeof action === 'string') {
      const act = action.toString();

      const sid = typeof sessionId === 'string' ? sessionId : undefined;
      const uid = typeof userId === 'string' ? userId : undefined;

      if (
        !sid &&
        !uid &&
        ['deleteHistory', 'reenqueue', 'clearAllHistory', 'getHistory'].includes(act)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Para la acción requerida debe enviarse sessionId o userId',
        });
      }

      // ===== DELETE HISTORY =====
      if (act === 'deleteHistory') {
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
      if (act === 'reenqueue') {
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
      if (act === 'clearAllHistory') {
        const cleared = await clearAllHistory(sid, uid);

        return res.status(200).json({
          success: true,
          action: 'clearAllHistory',
          cleared,
          searchHistory: [],
        });
      }

      // ===== GET HISTORY =====
      if (act === 'getHistory') {
        const term = typeof search === 'string' ? search.trim() : '';
        const historyItems = await filterSearchHistory(term, sid, uid, 5);
        return res.status(200).json({
          success: true,
          action: 'getHistory',
          searchHistory: historyItems,
        });
      }

      return res.status(400).json({
        success: false,
        message: `Acción no soportada: ${act}`,
      });
    }

    // ==================== BÚSQUEDA DE OFERTAS ====================

    // Si no hay query params relevantes, retornar todas
    if (
      !range &&
      !city &&
      !category &&
      !search &&
      !sortBy &&
      !sort &&
      !limit &&
      !skip &&
      !page &&
      !tags &&
      !minPrice &&
      !maxPrice &&
      !req.query.date &&
      !req.query.rating
    ) {
      const offers = await getAllOffers();
      return res.status(200).json({
        success: true,
        count: offers.length,
        total: offers.length,
        data: offers,
      });
    }

    // Preparar opciones para getOffersFiltered
    const options: any = {};
    if (range) options.ranges = Array.isArray(range) ? range.map(String) : [String(range)];
    // Procesar ciudades: pueden venir como string separado por comas o como array
    if (city) {
      if (typeof city === 'string') {
        // Dividir por comas si es un string
        options.cities = city.split(',').map((c: string) => c.trim()).filter((c: string) => c.length > 0);
      } else if (Array.isArray(city)) {
        options.cities = city.map(String).filter((c: string) => c.length > 0);
      }
    }
    if (category)
      options.categories = Array.isArray(category) ? category.map(String) : [String(category)];
    if (search && typeof search === 'string') options.search = search.trim();
    if (req.query.exact === 'true' || req.query.exact === '1') {
      options.searchMode = 'exact';
      options.searchFields = ['title', 'description'];
    }
    if (req.query.titleOnly === 'true' || req.query.titleOnly === '1') {
      options.searchFields = ['title'];
    }
    if (tags) options.tags = Array.isArray(tags) ? tags.map(String) : String(tags);
    if (minPrice && typeof minPrice === 'string') options.minPrice = minPrice;
    if (maxPrice && typeof maxPrice === 'string') options.maxPrice = maxPrice;

    const sortCandidate =
      (typeof sortBy === 'string' && sortBy) || (typeof sort === 'string' && sort);
    if (sortCandidate && typeof sortCandidate === 'string') {
      const validSorts = Object.values(SortCriteria).map((v) => v.toLowerCase());
      if (validSorts.includes(sortCandidate.toLowerCase()))
        options.sortBy = sortCandidate.toLowerCase();
    }

    if (req.query.date && typeof req.query.date === 'string') {
      const dateStr = req.query.date.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) options.date = dateStr;
    }

    if (req.query.rating) {
      const r = Number(req.query.rating);
      if (!isNaN(r) && Number.isInteger(r) && r >= 1 && r <= 5) options.rating = r;
    }

    const itemsPerPage = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
    const currentPage = normalizePageParam(page);

    // Calcular skip y limit de forma consistente
    const paginationParams = calculatePaginationParams(currentPage, itemsPerPage);
    options.limit = paginationParams.limit;
    options.skip = paginationParams.skip;

    // Llamar al service unificado
    const result = await getOffersFiltered(options);

    // Validar página fuera de rango
    const validation = validatePageRange(currentPage, result.count, itemsPerPage);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errorMessage,
        totalPages: validation.totalPages,
        currentPage: validation.currentPage,
        total: result.count,
      });
    }

    // Combinar funcionalidades de ambos equipos:
    const response: any = {
      success: true,
      count: result.count,
      total: result.count,
      currentPage: validation.currentPage,
      totalPages: validation.totalPages,
      data: result.data,
    };

    // ===== Añadir campos derivados de fecha =====
    const formatDateInTimezone = (d: any, timeZone: string) => {
      try {
        const date = new Date(d);
        return new Intl.DateTimeFormat('es-ES', {
          timeZone,
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(date);
      } catch {
        return null;
      }
    };
    if (Array.isArray(response.data)) {
      response.data = response.data.map((item: any) => ({
        ...item,
        publishedDateUTC: item.createdAt ? formatDateInTimezone(item.createdAt, 'UTC') : null,
        publishedDateLaPaz: item.createdAt
          ? formatDateInTimezone(item.createdAt, 'America/La_Paz')
          : null,
      }));
    }

    // ===== Guardar búsqueda en historial y obtener sugerencias =====
    if (search && typeof search === 'string' && search.trim()) {
      const recordFlag = typeof record === 'string' ? record : undefined;
      let sid = typeof sessionId === 'string' ? sessionId : undefined;
      const uid = typeof userId === 'string' ? userId : undefined;
      const searchTermTrimmed = search.trim();

      if (recordFlag !== 'false') {
        if (!sid && !uid) sid = `anon-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        response.sessionId = sid;

        saveSearchToHistory(searchTermTrimmed, sid, uid).catch(console.error);

        try {
          const searchHistory = await filterSearchHistory(searchTermTrimmed, sid, uid, 5);
          if (searchHistory.length > 0) response.searchHistory = searchHistory;
        } catch (error) {
          console.error('Error filtering search history:', error);
        }
      }

      try {
        const suggestions = await filterSuggestions(searchTermTrimmed, 5, uid, sid);
        if (suggestions && suggestions.length > 0) response.suggestions = suggestions;
      } catch (error) {
        console.error('Error filtering suggestions:', error);
      }
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error en getOffers:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las ofertas',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getUniqueTags = async (req: Request, res: Response) => {
  try {
    const { search, category, limit } = req.query;
    const categories =
      typeof category === 'string' && category.length ? category.split(',') : undefined;
    const tags = await getTagsForOffers(
      typeof search === 'string' ? search : undefined,
      categories,
      typeof limit === 'string' && !isNaN(Number(limit)) ? Number(limit) : 10,
    );

    return res.status(200).json({ success: true, tags });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las etiquetas únicas',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getFilterCounts = async (req: Request, res: Response) => {
  // ⬅️ NUEVO: Crear AbortController
  const abortController = new AbortController();
  
  // ⬅️ NUEVO: Detectar cuando el cliente cancela
  req.on('close', () => {
    if (!res.headersSent) {
      console.log('🚫 Client closed connection - aborting filter counts query');
      abortController.abort();
    }
  });

  try {
    const {
      range,
      city,
      category,
      search,
      minRating,
      maxRating,
    } = req.query;

    // Parsear rangos (mismo formato que getOffers)
    const parsedRanges = range 
      ? (Array.isArray(range) ? range.map(String) : [String(range)])
      : undefined;
    
    // Parsear categorías (mismo formato que getOffers)
    const parsedCategories = category
      ? (Array.isArray(category) ? category.map(String) : [String(category)])
      : undefined;

    // Parsear ciudad
    const parsedCity = city && typeof city === 'string' ? city : undefined;

    // Parsear búsqueda
    const parsedSearch = search && typeof search === 'string' ? search.trim() : undefined;

    // Parsear ratings
    const parsedMinRating = minRating && typeof minRating === 'string' 
      ? parseFloat(minRating) 
      : undefined;
    
    const parsedMaxRating = maxRating && typeof maxRating === 'string' 
      ? parseFloat(maxRating) 
      : undefined;

    // Validar ratings si existen
    if (parsedMinRating !== undefined && (isNaN(parsedMinRating) || parsedMinRating < 1.0 || parsedMinRating > 5.9)) {
      return res.status(400).json({
        success: false,
        message: 'minRating debe estar entre 1.0 y 5.9',
      });
    }

    if (parsedMaxRating !== undefined && (isNaN(parsedMaxRating) || parsedMaxRating < 1.0 || parsedMaxRating > 5.9)) {
      return res.status(400).json({
        success: false,
        message: 'maxRating debe estar entre 1.0 y 5.9',
      });
    }

    // ⬅️ MODIFICADO: Agregar signal
    const counts = await FilterCountsService.getCounts({
      search: parsedSearch,
      ranges: parsedRanges,
      city: parsedCity,
      categories: parsedCategories,
      minRating: parsedMinRating,
      maxRating: parsedMaxRating,
      signal: abortController.signal, // ⬅️ NUEVO
    });

    return res.status(200).json({
      success: true,
      data: counts,
    });
  } catch (error) {
    // ⬅️ NUEVO: Manejo especial para abort
    if (error instanceof Error && error.message.includes('abort')) {
      if (!res.headersSent) {
        return res.status(499).json({
          success: false,
          message: 'Request was cancelled',
        });
      }
      return;
    }

    console.error('Error en getFilterCounts:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener conteos de filtros',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};