// src/api/controllers/jobOfert.controller.ts
import { Request, Response } from 'express';
import { getAllOffers, getOffersFiltered } from '../services/job-offers.service';
import { SortCriteria } from '../../../shared/types/sort.types';
import { getTagsForOffers } from '../../resultsAdvSearch/tags.service';
import { saveSearchToHistory } from '../../search-history/services/search-history.service';
import { filterSearchHistory } from '../../search-history/services/search-history.service';
import { filterSuggestions } from '../../search-history/services/search-suggestions.service';

import { calculatePriceRanges } from '../services/price-range.service';

import {
  validatePageRange,
  normalizePageParam,
  calculatePaginationParams,
} from '../../../validators/pagination.validator';

interface FilterOptions {
  ranges?: string[];
  city?: string;
  categories?: string[];
  search?: string;
  searchMode?: 'exact';
  searchFields?: string[];
  tags?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  date?: string;
  rating?: number;
  limit?: number;
  skip?: number;
}

interface OfferWithDates {
  createdAt?: Date | string;
  publishedDateUTC?: string | null;
  publishedDateLaPaz?: string | null;
  [key: string]: unknown;
}

interface OffersResponse {
  success: boolean;
  count: number;
  total: number;
  currentPage: number;
  totalPages: number;
  data: OfferWithDates[];
  sessionId?: string;
  searchHistory?: unknown[];
  suggestions?: unknown[];
}

export const getOffers = async (req: Request, res: Response) => {
  try {
    const {
      range,
      city,
      category,
      search,
      sortBy,
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
      record,
    } = req.query;

    // ==================== ACCIÓN: GET PRICE RANGES ====================
    if (action === 'getPriceRanges') {
      const buckets = typeof req.query.buckets === 'string' ? parseInt(req.query.buckets, 10) : 4;
      const includeExtremes = req.query.includeExtremes !== 'false';

      try {
        // 🔥 Usar el nuevo servicio especializado
        const result = await calculatePriceRanges({
          buckets,
          includeExtremes,
        });

        return res.status(200).json({
          success: true,
          ...result,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error obteniendo rangos de precio',
          error: error instanceof Error ? error.message : String(error),
        });
      }
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
    const options: FilterOptions = {};
    if (range) options.ranges = Array.isArray(range) ? range.map(String) : [String(range)];
    if (city && typeof city === 'string') options.city = city;
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
    const response: OffersResponse = {
      success: true,
      count: result.count,
      total: result.count,
      currentPage: validation.currentPage,
      totalPages: validation.totalPages,
      data: result.data,
    };

    // ===== Añadir campos derivados de fecha =====
    const formatDateInTimezone = (d: Date | string, timeZone: string): string | null => {
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
      response.data = response.data.map(
        (item: OfferWithDates): OfferWithDates => ({
          ...item,
          publishedDateUTC: item.createdAt ? formatDateInTimezone(item.createdAt, 'UTC') : null,
          publishedDateLaPaz: item.createdAt
            ? formatDateInTimezone(item.createdAt, 'America/La_Paz')
            : null,
        }),
      );
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
