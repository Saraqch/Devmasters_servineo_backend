// services/jobOfert.service.ts
import { Offer } from '../models/offer.model';
import {
  searchOffers,
  searchOffersExactFields,
  searchOffersInFields,
} from './jobOfert/search.service';
import { sortOffers } from './jobOfert/sort.service';
import { FilterCommon } from './common/filter.common';
import { PaginationCommon } from './common/pagination.common';
import { QueryExecutor } from './common/query-executor';
import { SortCriteria } from '../types/sort.types';
import { filterOffers as standardFilterOffers } from './jobOfert/filter.service';
import { filterOffers as advancedFilterOffers } from './jobOfert/advancedFilter.service';

export type OfferFilterOptions = {
  ranges?: string[];
  city?: string;
  cities?: string[];
  categories?: string[];
  search?: string;
  sortBy?: string | SortCriteria;
  limit?: number;
  skip?: number;
  tags?: string[] | string;
  minPrice?: string;
  maxPrice?: string;
  // Optional specific date filter in format YYYY-MM-DD
  date?: string;

  // Optional rating filter (integer 1..5)
  rating?: number;

  searchMode?: 'exact' | 'smart';
  searchFields?: string[];
};

// ============================================
// MEJORA AGREGADA: Caché para rangos de precios
// ============================================
let priceRangesCache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 60 * 60 * 1000; // 1 hora en milisegundos

export const getAllOffers = async () => {
  return await QueryExecutor.findAll(Offer);
};

// MODIFICAR getOffersFiltered
export const getOffersFiltered = async (options?: OfferFilterOptions) => {
  // Si no hay opciones, devolver el resultado sin filtros
  if (!options) {
    return await QueryExecutor.execute(Offer, {}, null, 0, 10);
  }

  // 1. LÓGICA DE DECISIÓN: Determinar si es Búsqueda Avanzada
  const isAdvancedSearch = options.tags || options.minPrice || options.maxPrice;

  let filterQuery: any;

  if (isAdvancedSearch) {
    // Opción A: Es avanzada (usa la lógica de Price y Tags)
    filterQuery = advancedFilterOffers(options);
  } else {
    // Opción B: Es estándar (usa solo la lógica de City, Fixer, Category)
    filterQuery = standardFilterOffers(options);
  }

  // 2. LÓGICA DE BÚSQUEDA POR TEXTO (SEARCH) - ¡UNIFICADA Y CORREGIDA!
  let searchQuery: any = {};

  if (options.search) {
    if (options.searchMode === 'exact') {
      // Lógica para búsqueda exacta (normalizada) cuando se pide exact
      const fields =
        options.searchFields && options.searchFields.length > 0
          ? options.searchFields
          : ['title', 'description'];
      searchQuery = searchOffersExactFields(options.search, fields);
    } else if (options.searchFields && options.searchFields.length > 0) {
      // Si el caller indicó campos concretos (por ejemplo title-only),
      // usamos la variante smart limitada a esos campos.
      searchQuery = searchOffersInFields(options.search, options.searchFields);
    } else {
      // Comportamiento por defecto (smart search sobre todos los campos)
      searchQuery = searchOffers(options.search);
    }
  }

  // 3. COMBINAR TODOS LOS FILTROS
  // Combina la Query de Filtros (filterQuery) y la Query de Búsqueda por Texto (searchQuery)
  // Si se proporciona un filtro de fecha (YYYY-MM-DD), añadir rango createdAt [00:00:00,23:59:59.999]
  if (options && options.date) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(options.date);
    if (m) {
      const y = m[1];
      const mo = m[2];
      const d = m[3];
      // Construir inicio del día UTC y el inicio del día siguiente (exclusivo)
      // Esto evita problemas por millis y es una práctica robusta: [startUTC, nextStartUTC)
      const start = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), 0, 0, 0, 0));
      const nextStart = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d) + 1, 0, 0, 0, 0));

      // Añadir al filterQuery existente usando $lt en lugar de $lte para el límite superior
      filterQuery = FilterCommon.combine(filterQuery, {
        createdAt: { $gte: start, $lt: nextStart },
      });
    }
  }

  // 3.2. Lógica para filtro de CALIFICACIÓN (CORREGIDA)
  if (options && typeof options.rating === 'number' && !isNaN(options.rating)) {
    const star = options.rating;

    // Si es un número entero (viene del filtro de estrellas básico)
    if (Number.isInteger(star) && star >= 1 && star <= 5) {
      // Lógica del filtro BÁSICO (Rango [N.0, (N+1).0))
      const minRating = star;
      const maxRatingExclusive = star + 1;

      filterQuery = FilterCommon.combine(filterQuery, {
        rating: { $gte: minRating, $lt: maxRatingExclusive },
      });
    }
    // Si es un decimal (viene de la búsqueda avanzada o un filtro exacto)
    else if (star >= 1.0 && star <= 5.9) {
      // Lógica del filtro AVANZADO (Comparación exacta)
      filterQuery = FilterCommon.combine(filterQuery, { rating: star });
    }
  }

  const finalQuery = FilterCommon.combine(filterQuery, searchQuery);

  // 4. APLICAR ORDENAMIENTO Y PAGINACIÓN
  const sort = sortOffers(options?.sortBy);
  const { limit, skip } = PaginationCommon.getOptions(options?.limit, options?.skip);

  // 5. EJECUTAR LA CONSULTA FINAL
  return await QueryExecutor.execute(Offer, finalQuery, sort, skip, limit);
};

/**
 * codigo solucionado para obtener rangos de precios dinámicos
 * Calcula rangos de precio dinámicos basados en el mínimo y máximo de la colección `offers`.
 * Devuelve un array de rangos con labels y valores { min, max } donde null indica -inf/+inf.
 * Por defecto crea 4 buckets internos y añade opciones "Menos de" y "Más de" (por lo que se devuelven 6 items si includeExtremes=true).
 */
export const getPriceRanges = async (buckets = 4, includeExtremes = true) => {
  // ============================================
  // MEJORA AGREGADA: Verificar caché primero
  // ============================================
  const now = Date.now();
  if (priceRangesCache && (now - priceRangesCache.timestamp) < CACHE_DURATION) {
    return priceRangesCache.data;
  }

  // Agregación para obtener min y max
  const agg = await Offer.aggregate([
    {
      $group: {
        _id: null,
        min: { $min: '$price' },
        max: { $max: '$price' },
      },
    },
  ]);

  if (!agg || agg.length === 0) {
    const result = { min: null, max: null, ranges: [] };
    // MEJORA: Guardar en caché
    priceRangesCache = { data: result, timestamp: now };
    return result;
  }

  const min = agg[0].min as number;
  const max = agg[0].max as number;

  if (min == null || max == null) {
    const result = { min: null, max: null, ranges: [] };
    // MEJORA: Guardar en caché
    priceRangesCache = { data: result, timestamp: now };
    return result;
  }

  if (min === max) {
    // Un solo valor: devolver rangos sencillos alrededor
    const one = Math.floor(min);
    const result = {
      min: one,
      max: one,
      ranges: [{ label: `= $${one}`, min: one, max: one }],
    };
    // MEJORA: Guardar en caché
    priceRangesCache = { data: result, timestamp: now };
    return result;
  }

  // calcular step y límites (algoritmo más estable):
  // 1) stepRaw = span / buckets
  // 2) base = 10^floor(log10(stepRaw))
  // 3) step = ceil(stepRaw / base) * base  (redondear hacia arriba al múltiplo de base)
  // 4) lower = floor(min / step) * step  (redondear el límite inferior hacia abajo)
  // 5) boundaries = [lower, lower+step, ..., lower + step * buckets]
  // 6) ajustar último boundary para que >= max
  const span = max - min;
  const stepRaw = span / buckets;

  const roundBase = (n: number) => {
    if (n <= 1) return 1;
    const exp = Math.floor(Math.log10(n));
    return Math.pow(10, Math.max(0, exp));
  };

  const base = roundBase(stepRaw);
  const step = Math.max(1, Math.ceil(stepRaw / base) * base);

  const boundaries: number[] = [];
  let lower = Math.floor(min / step) * step;
  // If lower is negative and prices are positive, clamp to 0
  if (lower < 0 && min >= 0) lower = 0;

  for (let i = 0; i <= buckets; i++) {
    boundaries.push(lower + step * i);
  }

  // Ensure last boundary covers max
  while (boundaries[boundaries.length - 1] < max) {
    boundaries.push(boundaries[boundaries.length - 1] + step);
  }

  const ranges: Array<{ label: string; min: number | null; max: number | null }> = [];

  if (includeExtremes) {
    // Menos de first upper
    const firstUpper = boundaries[1] ?? boundaries[boundaries.length - 1];
    ranges.push({ label: `Menos de $${firstUpper}`, min: null, max: firstUpper });

    // mid boundaries: omit the very low (boundaries[0]) and the last padded boundary
    const mid = boundaries.slice(1, Math.max(2, boundaries.length - 1));
    if (mid.length >= 2) {
      for (let i = 0; i < mid.length - 1; i++) {
        const a = mid[i];
        const b = mid[i + 1];
        ranges.push({ label: `$${a} - $${b}`, min: a, max: b });
      }
      const lastMin = mid[mid.length - 1];
      ranges.push({ label: `Más de $${lastMin}`, min: lastMin, max: null });
    } else {
      // Fallback: si no hay suficientes boundaries intermedias, usar firstUpper como límite inferior
      ranges.push({ label: `Más de $${firstUpper}`, min: firstUpper, max: null });
    }
  } else {
    // Sin extremos: devolver todos los pares de boundaries
    for (let i = 0; i < boundaries.length - 1; i++) {
      const a = boundaries[i];
      const b = boundaries[i + 1];
      ranges.push({ label: `$${a} - $${b}`, min: a, max: b });
    }
  }

  const result = { min, max, ranges };
  // MEJORA: Guardar en caché
  priceRangesCache = { data: result, timestamp: now };
  return result;
};

// ============================================
// MEJORA AGREGADA: Función para limpiar caché manualmente
// ============================================
export const clearPriceRangesCache = () => {
  priceRangesCache = null;
};
