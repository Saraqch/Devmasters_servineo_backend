// services/jobOfert/filter.service.ts
import { getRangeRegex } from '../../utils/nameRangeHelper';
import { validateAndNormalizeCity } from '../../utils/cityHelper';
import { validateAndNormalizeCategory } from '../../utils/categoryHelper';
import { FilterCommon } from '../common/filter.common';

export type FilterOptions = {
  ranges?: string[];
  city?: string;
  cities?: string[];
  categories?: string[];
  // AÑADIR NUEVOS CAMPOS:
  tags?: string[] | string; // Permitir array o string separado por comas
  minPrice?: string;
  maxPrice?: string;
};

export function filterOffers(options?: FilterOptions): any {
  if (!options) return {};

  const filters: any = {};

  if (options.ranges && options.ranges.length > 0) {
    const regexes = options.ranges.map((r) => getRangeRegex(r)).filter(Boolean);
    if (regexes.length > 0) {
      filters.fixerName = { $in: regexes };
    }
  }

  // Procesar ciudades: pueden venir como single city o como array cities
  if (options.cities && options.cities.length > 0) {
    // Multiples ciudades: usar $in con logica OR
    const normalizedCities = options.cities
      .map((c) => validateAndNormalizeCity(c))
      .filter(Boolean);
    if (normalizedCities.length > 0) {
      filters.city = { $in: normalizedCities };
    }
  } else if (options.city) {
    // Ciudad unica (compatibilidad con codigo antiguo)
    filters.city = validateAndNormalizeCity(options.city);
  }

  if (options.categories && options.categories.length > 0) {
    const normalizedCategories = options.categories
      .map((c) => validateAndNormalizeCategory(c))
      .filter(Boolean);
    if (normalizedCategories.length > 0) {
      filters.category = { $in: normalizedCategories };
    }
  }
  // --- LÓGICA DE ETIQUETAS (TAGS) ---
  const tags = options.tags;
  if (tags) {
    let tagsArray: string[] = [];
    if (Array.isArray(tags)) {
      tagsArray = tags.filter((t) => t && t.trim()).map((t) => t.trim().toLowerCase());
    } else if (typeof tags === 'string') {
      tagsArray = tags
        .split(',')
        .filter((t) => t && t.trim())
        .map((t) => t.trim().toLowerCase());
    }

    if (tagsArray.length > 0) {
      filters.tags = { $in: tagsArray };
    }
  }
  // -------------------------------------

  // --- LÓGICA DE PRECIO (RANGO) ---
  const { minPrice, maxPrice } = options;
  const priceFilter: any = {};

  if (minPrice && !isNaN(parseFloat(minPrice))) {
    priceFilter.$gte = parseFloat(minPrice);
  }

  if (maxPrice && !isNaN(parseFloat(maxPrice))) {
    priceFilter.$lte = parseFloat(maxPrice);
  }

  if (Object.keys(priceFilter).length > 0) {
    filters.price = priceFilter;
  }
  // -------------------------------
  return FilterCommon.build(filters);
}
