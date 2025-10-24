// Tipo robusto para los filtros de búsqueda
type OfferFilterOptions = {
  ranges?: string[];
  city?: string;
  categories?: string[];
  search?: string;
  sortBy?: string;
  limit?: number;
  skip?: number;
};
import { Request, Response } from 'express';
import { getAllOffers, getOffersFiltered } from '../services/jobOfert.service';
import { isValidRange } from '../utils/nameRangeHelper';
import { isValidCity, getAllCities } from '../utils/cityHelper';
import { isValidCategory, getAllCategories } from '../utils/categoryHelper';
import { SortCriteria } from '../utils/queryParams.types';
import { getAllOffersPaginated, getOffersFilteredPaginated } from '../services/offer.service';

/**
 * GET /api/devmaster/offers
 * Soporta query params: range[], city, category[], search, sortBy
 */
/**
 * GET /api/devmaster/offers
 * Soporta query params: range[], city, category[], search, sortBy, page, limit
 */
export const getOffers = async (req: Request, res: Response) => {
  try {
    console.log('🎯 ENDPOINT /offers ACCEDIDO!'); // ← LOG PARA DEBUG
    console.log('📝 Query parameters:', req.query); // ← LOG PARA DEBUG
    
    const { range, city, category, search, sortBy, page, limit } = req.query;

    // Extraer paginación
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    
    console.log('🔢 Pagination:', { page: pageNumber, limit: limitNumber }); // ← LOG

    // Si no hay parámetros de filtro, usa la paginación simple
    if (!range && !city && !category && !search && !sortBy) {
      console.log('📊 Usando getAllOffersPaginated...'); // ← LOG
      const result = await getAllOffersPaginated(pageNumber, limitNumber);
      
      return res.status(200).json({
        success: true,
        total: result.total,
        count: result.offers.length,
        page: pageNumber,
        limit: limitNumber,
        data: result.offers,
      });
    }

    // Preparar opciones para el servicio (con filtros)
    const options: OfferFilterOptions = {};

    // Manejar ranges (puede ser string o array)
    if (range) {
      if (Array.isArray(range)) {
        options.ranges = range.map(String);
      } else if (typeof range === 'string') {
        options.ranges = [range];
      }
    }

    // Manejar city (single)
    if (city && typeof city === 'string') {
      options.city = city;
    }

    // Manejar categories (puede ser string o array)
    if (category) {
      if (Array.isArray(category)) {
        options.categories = category.map(String);
      } else if (typeof category === 'string') {
        options.categories = [category];
      }
    }

    // Manejar search
    if (search && typeof search === 'string' && search.trim()) {
      options.search = search.trim();
    }

    // Manejar sort
    if (sortBy && typeof sortBy === 'string') {
      const validSortValues = Object.values(SortCriteria) as string[];
      if (validSortValues.includes(sortBy.toLowerCase())) {
        options.sortBy = sortBy.toLowerCase();
      }
    }

    // PARA FILTROS: Necesitas una función que combine filtros + paginación
    console.log('🔍 Usando filtros con paginación...'); // ← LOG
    const result = await getOffersFilteredPaginated(
      { 
        nameRange: options.ranges?.[0], 
        city: options.city, 
        category: options.categories?.[0] 
      }, 
      pageNumber, 
      limitNumber
    );

    res.status(200).json({
      success: true,
      total: result.total,
      count: result.offers.length,
      page: pageNumber,
      limit: limitNumber,
      data: result.offers,
    });
  } catch (error) {
    console.log('❌ ERROR en getOffers:', error); // ← LOG DE ERROR
    res.status(500).json({
      success: false,
      message: 'Error al obtener las ofertas',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * DEPRECATED: Usar /api/devmaster/offers?range=A-C en su lugar
 */
export const filterOffersByFixerNameRange = async (req: Request, res: Response) => {
  try {
    const { range } = req.query;

    if (!range) {
      return res.status(400).json({
        success: false,
        error: 'Debes especificar un rango',
        validRanges: ['A-C', 'D-F', 'G-I', 'J-L', 'M-Ñ', 'O-Q', 'R-T', 'U-W', 'X-Z'],
      });
    }

    if (!isValidRange(range as string)) {
      return res.status(400).json({
        success: false,
        error: `Rango inválido: ${range}`,
        validRanges: ['A-C', 'D-F', 'G-I', 'J-L', 'M-Ñ', 'O-Q', 'R-T', 'U-W', 'X-Z'],
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al filtrar ofertas por rango',
      details: error,
    });
  }
};

/**
 * DEPRECATED: Usar /api/devmaster/offers?city=La%20Paz en su lugar
 */
export const filterOffersByCity = async (req: Request, res: Response) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        error: 'Debes especificar una ciudad',
        validCities: getAllCities(),
      });
    }

    if (!isValidCity(city as string)) {
      return res.status(400).json({
        success: false,
        error: `Ciudad inválida: ${city}`,
        validCities: getAllCities(),
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al filtrar ofertas por ciudad',
      details: error,
    });
  }
};

/**
 * DEPRECATED: Usar /api/devmaster/offers?category=Fontanero en su lugar
 */
export const filterOffersByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Debes especificar una categoría',
        validCategories: getAllCategories(),
      });
    }

    if (!isValidCategory(category as string)) {
      return res.status(400).json({
        success: false,
        error: `Categoría inválida: ${category}`,
        validCategories: getAllCategories(),
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al filtrar ofertas por categoría',
      details: error,
    });
  }
};

/**
 * DEPRECATED: Usar /api/devmaster/offers?range=A-C&city=La%20Paz&category=Fontanero
 */
export const filterOffers = async (req: Request, res: Response) => {
  try {
    const { range, city, category } = req.query;

    const filters: OfferFilterOptions = {};
    if (range) {
      if (Array.isArray(range)) {
        filters.ranges = range.map(String);
      } else if (typeof range === 'string') {
        filters.ranges = [range];
      }
    }
    if (city && typeof city === 'string') {
      filters.city = city;
    }
    if (category) {
      if (Array.isArray(category)) {
        filters.categories = category.map(String);
      } else if (typeof category === 'string') {
        filters.categories = [category];
      }
    }

    const result = await getOffersFiltered(filters);

    res.json({
      success: true,
      filters,
      count: result.count,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al filtrar ofertas',
      details: error,
    });
  }
};
