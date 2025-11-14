// src/modules/job-offers/services/offer-filter.service.ts
import { getRangeRegex } from '../../../shared/utils/nameRangeHelper';
import { validateAndNormalizeCity } from '../../../validators/city.validator';
import { validateAndNormalizeCategory } from '../../../validators/category.validator';
import { FilterBuilder } from '../../../core/filter.builder';

/**
 * Opciones de filtrado para ofertas de trabajo
 * Soporta filtros básicos y avanzados
 */
export interface OfferFilterOptions {
  ranges?: string[];
  city?: string;
  categories?: string[];
  tags?: string[] | string;
  minPrice?: string;
  maxPrice?: string;
}

export function buildOfferFilters(options?: OfferFilterOptions): Record<string, unknown> {
  if (!options) return {};

  const filters: Record<string, string | string[]> = {};
  const manualFilters: Record<string, unknown> = {};

  // ==================== FILTROS BÁSICOS ====================

  // Filtro por rangos de nombre (A-C, D-F, etc.)
  // Los RegExp[] no son compatibles con FilterBuilder, se manejan manualmente
  if (options.ranges && options.ranges.length > 0) {
    const regexes = options.ranges.map((r) => getRangeRegex(r)).filter(Boolean) as RegExp[];

    if (regexes.length > 0) {
      manualFilters.name = { $in: regexes };
    }
  }

  // Filtro por ciudad
  if (options.city) {
    filters.city = validateAndNormalizeCity(options.city);
  }

  // Filtro por categorías
  if (options.categories && options.categories.length > 0) {
    const normalizedCategories = options.categories
      .map((c) => validateAndNormalizeCategory(c))
      .filter(Boolean) as string[];

    if (normalizedCategories.length > 0) {
      filters.category = normalizedCategories;
    }
  }

  // ==================== FILTROS AVANZADOS ====================

  // Filtro por etiquetas (tags)
  const tags = options.tags;
  if (tags) {
    let tagsArray: string[] = [];

    if (Array.isArray(tags)) {
      // Si es un array, procesar cada elemento
      tagsArray = tags.filter((t) => t && t.trim()).map((t) => t.trim().toLowerCase());
    } else if (typeof tags === 'string') {
      // Si es un string, dividir por comas
      tagsArray = tags
        .split(',')
        .filter((t) => t && t.trim())
        .map((t) => t.trim().toLowerCase());
    }

    if (tagsArray.length > 0) {
      filters.tags = tagsArray;
    }
  }

  // Filtro por rango de precios
  const { minPrice, maxPrice } = options;

  if ((minPrice && !isNaN(parseFloat(minPrice))) || (maxPrice && !isNaN(parseFloat(maxPrice)))) {
    const priceFilter: Record<string, number> = {};

    if (minPrice && !isNaN(parseFloat(minPrice))) {
      priceFilter.$gte = parseFloat(minPrice);
    }

    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      priceFilter.$lte = parseFloat(maxPrice);
    }

    manualFilters.price = priceFilter;
  }

  // Construir filtros base con FilterBuilder y combinar con filtros manuales
  const baseFilters = FilterBuilder.build(filters);

  return { ...baseFilters, ...manualFilters };
}

/**
 * Verifica si las opciones incluyen filtros avanzados
 * Útil para logging o métricas
 */
export function hasAdvancedFilters(options?: OfferFilterOptions): boolean {
  if (!options) return false;
  return !!(options.tags || options.minPrice || options.maxPrice);
}

/**
 * Verifica si las opciones incluyen algún filtro
 */
export function hasAnyFilters(options?: OfferFilterOptions): boolean {
  if (!options) return false;

  return !!(
    options.ranges?.length ||
    options.city ||
    options.categories?.length ||
    options.tags ||
    options.minPrice ||
    options.maxPrice
  );
}

/**
 * Valida las opciones de filtrado y retorna errores si hay
 */
export function validateFilterOptions(options?: OfferFilterOptions): string[] {
  const errors: string[] = [];

  if (!options) return errors;

  // Validar precio mínimo
  if (options.minPrice && isNaN(parseFloat(options.minPrice))) {
    errors.push(`minPrice inválido: ${options.minPrice}`);
  }

  // Validar precio máximo
  if (options.maxPrice && isNaN(parseFloat(options.maxPrice))) {
    errors.push(`maxPrice inválido: ${options.maxPrice}`);
  }

  // Validar que minPrice <= maxPrice
  if (options.minPrice && options.maxPrice) {
    const min = parseFloat(options.minPrice);
    const max = parseFloat(options.maxPrice);

    if (!isNaN(min) && !isNaN(max) && min > max) {
      errors.push(`minPrice (${min}) no puede ser mayor que maxPrice (${max})`);
    }
  }

  return errors;
}
