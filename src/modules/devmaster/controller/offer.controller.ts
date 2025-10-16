import { Request, Response } from 'express';
import { 
  getAllOffers, 
  getOfferById, 
  getOffersByFixerNameRange,
  getOffersByCity,
  getOffersByCategory,
  getOffersFiltered 
} from '../services/offer.service';
import { isValidRange } from '../utils/nameRangeHelper';
import { isValidCity, getAllCities } from '../utils/cityHelper';
import { isValidCategory, getAllCategories } from '../utils/categoryHelper';

/**
 * GET /api/devmaster/offers
 */
export const getOffers = async (req: Request, res: Response) => {
  try {
    const offers = await getAllOffers();
    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener las ofertas', 
      error 
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

    const offers = await getOffersByFixerNameRange(range as string);
    
    res.json({
      success: true,
      range,
      count: offers.length,
      data: offers
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

    const offers = await getOffersByCity(city as string);
    
    res.json({
      success: true,
      city,
      count: offers.length,
      data: offers
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

    const offers = await getOffersByCategory(category as string);
    
    res.json({
      success: true,
      category,
      count: offers.length,
      data: offers
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