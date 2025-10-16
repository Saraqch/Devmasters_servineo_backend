import { Offer } from '../models/offer.model';
import { getRangeRegex } from '../utils/nameRangeHelper';
import { validateAndNormalizeCity } from '../utils/cityHelper';
import { validateAndNormalizeCategory } from '../utils/categoryHelper';

export const getAllOffers = async () => {
  return await Offer.find()
    .sort({ createdAt: -1 })
    .lean()
    .exec();
};

export const getOfferById = async (id: string) => {
  return await Offer.findById(id)
    .lean()
    .exec();
};

/**
 * Filtrar ofertas por rango de nombre de fixer
 */
export const getOffersByFixerNameRange = async (range: string) => {
  const regex = getRangeRegex(range);
  
  if (!regex) {
    throw new Error(`Rango inválido: ${range}`);
  }
  
  return await Offer.find({
    fixerName: regex
  })
    .sort({ fixerName: 1 })
    .lean()
    .exec();
};

/**
 * Filtrar ofertas por ciudad
 */
export const getOffersByCity = async (city: string) => {
  const normalizedCity = validateAndNormalizeCity(city);
  
  return await Offer.find({
    city: normalizedCity
  })
    .sort({ createdAt: -1 })
    .lean()
    .exec();
};

/**
 * Filtrar ofertas por categoría
 */
export const getOffersByCategory = async (category: string) => {
  const normalizedCategory = validateAndNormalizeCategory(category);
  
  return await Offer.find({
    category: normalizedCategory
  })
    .sort({ createdAt: -1 })
    .lean()
    .exec();
};

/**
 * Filtrar ofertas con múltiples criterios
 */
export const getOffersFiltered = async (filters: {
  nameRange?: string;
  city?: string;
  category?: string;
}) => {
  const query: any = {};
  
  if (filters.nameRange) {
    const regex = getRangeRegex(filters.nameRange);
    if (regex) {
      query.fixerName = regex;
    }
  }
  
  if (filters.city) {
    const normalizedCity = validateAndNormalizeCity(filters.city);
    query.city = normalizedCity;
  }
  
  if (filters.category) {
    const normalizedCategory = validateAndNormalizeCategory(filters.category);
    query.category = normalizedCategory;
  }
  
  return await Offer.find(query)
    .sort({ fixerName: 1, createdAt: -1 })
    .lean()
    .exec();
};