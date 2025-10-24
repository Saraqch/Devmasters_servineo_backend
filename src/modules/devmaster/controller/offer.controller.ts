import { Request, Response } from 'express';
import { 
  getAllOffers, 
  getOfferById, 
  getOffersByFixerNameRange,
  getOffersByCity,
  getOffersByCategory,
  getOffersFiltered, 
  getAllOffersPaginated,
  getOffersFilteredPaginated
} from '../services/offer.service';
import { isValidRange } from '../utils/nameRangeHelper';
import { isValidCity, getAllCities } from '../utils/cityHelper';
import { isValidCategory, getAllCategories } from '../utils/categoryHelper';
import { OfferFilterOptions } from '../services/jobOfert.service';
import { SortCriteria } from '../utils/queryParams.types';

/**
 * GET /api/devmaster/offers
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
 * GET /api/devmaster/offers/:id
 */
export const getOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const offer = await getOfferById(id);
    
    if (!offer) {
      return res.status(404).json({ 
        success: false,
        message: 'Oferta no encontrada' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: offer
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener la oferta', 
      error 
    });
  }
};

/**
 * GET /api/devmaster/offers/filterByFixerNameRange?range=A-C
 */
export const filterOffersByFixerNameRange = async (req: Request, res: Response) => {
  try {
    const { range } = req.query;
   const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    if (!range) {
      return res.status(400).json({
        success: false,
        error: "Debes especificar un rango",
        validRanges: ['A-C', 'D-F', 'G-I', 'J-L', 'M-Ñ', 'O-Q', 'R-T', 'U-W', 'X-Z']
      });
    }

    if (!isValidRange(range as string)) {
      return res.status(400).json({
        success: false,
        error: `Rango inválido: ${range}`,
        validRanges: ['A-C', 'D-F', 'G-I', 'J-L', 'M-Ñ', 'O-Q', 'R-T', 'U-W', 'X-Z']
      });
    }

     const result = await getOffersFilteredPaginated({ nameRange: range as string }, page, limit);

    res.json({
      success: true,
      range,
      total: result.total,
      count: result.offers.length,
      page,
      limit,
      data: result.offers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al filtrar ofertas por rango",
      details: error,
    });
  }
};

/**
 * GET /api/devmaster/offers/filterByCity?city=La Paz
 */
export const filterOffersByCity = async (req: Request, res: Response) => {
  try {
    const { city } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    if (!city) {
      return res.status(400).json({
        success: false,
        error: "Debes especificar una ciudad",
        validCities: getAllCities()
      });
    }

    if (!isValidCity(city as string)) {
      return res.status(400).json({
        success: false,
        error: `Ciudad inválida: ${city}`,
        validCities: getAllCities()
      });
    }

    const result = await getOffersFilteredPaginated({ city: city as string }, page, limit);

    res.json({
      success: true,
      city,
      total: result.total,
      count: result.offers.length,
      page,
      limit,
      data: result.offers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al filtrar ofertas por ciudad",
      details: error,
    });
  }
};

/**
 * GET /api/devmaster/offers/filterByCategory?category=Fontanero
 */
export const filterOffersByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
      const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!category) {
      return res.status(400).json({
        success: false,
        error: "Debes especificar una categoría",
        validCategories: getAllCategories()
      });
    }

    if (!isValidCategory(category as string)) {
      return res.status(400).json({
        success: false,
        error: `Categoría inválida: ${category}`,
        validCategories: getAllCategories()
      });
    }

    const result = await getOffersFilteredPaginated({ category: category as string }, page, limit);

    res.json({
      success: true,
      category,
      total: result.total,
      count: result.offers.length,
      page,
      limit,
      data: result.offers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al filtrar ofertas por categoría",
      details: error,
    });
  }
};

/**
 * GET /api/devmaster/offers/filter?range=A-C&city=La Paz&category=Fontanero
 */
export const filterOffers = async (req: Request, res: Response) => {
  try {
    const { range, city, category } = req.query;

    const filters: any = {};
    if (range) filters.nameRange = range as string;
    if (city) filters.city = city as string;
    if (category) filters.category = category as string;

    const offers = await getOffersFiltered(filters);
    
    res.json({
      success: true,
      filters,
      count: offers.length,
      data: offers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al filtrar ofertas",
      details: error,
    });
  }
};

export const filterOffersPaginated = async (req: Request, res: Response) => {
  try {
    const { range, city, category } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filters: any = {};
    if (range) filters.nameRange = range as string;
    if (city) filters.city = city as string;
    if (category) filters.category = category as string;

    // 👇 Usa la versión paginada en lugar de la simple
    const result = await getOffersFilteredPaginated(filters, page, limit);
    
    res.json({
      success: true,
      filters,
      total: result.total,
      count: result.offers.length,
      page,
      limit,
      data: result.offers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al filtrar ofertas",
      details: error,
    });
  }
};