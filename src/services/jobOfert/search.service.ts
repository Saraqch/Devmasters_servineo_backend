// services/jobOfert/search.service.ts
import { normalizeSearchText } from '../../utils/search.normalizer';
import { SearchService } from '../common/search.common';

const SEARCH_FIELDS = ['fixerName', 'title', 'description', 'category', 'city', 'tags'];

/**
 * Búsqueda básica (sin normalizador de acentos, etc.)
 */
export function searchOffersBasic(searchText?: string): any {
  return SearchService.build(searchText, SEARCH_FIELDS);
}

/**
 * Búsqueda de ofertas con detección automática de tokens
 * Mantiene la funcionalidad original completa
 */
export function searchOffers(searchText?: string): any {
  return SearchService.buildSmartSearch(searchText, SEARCH_FIELDS, normalizeSearchText);
}

/**
 * Búsqueda simple (sin tokens)
 */
export function searchOffersSimple(searchText?: string): any {
  return SearchService.buildWithNormalizer(searchText, SEARCH_FIELDS, normalizeSearchText);
}

/**
 * Búsqueda forzada por tokens
 */
export function searchOffersTokens(searchText?: string): any {
  return SearchService.buildTokenSearch(searchText, SEARCH_FIELDS, normalizeSearchText);
}

// Define la configuración de los campos y sus pesos (necesario para la firma del método)
const WEIGHTED_FIELDS_CONFIG = [
  { field: 'title', weight: 10 },
  { field: 'tags', weight: 8 },
  { field: 'description', weight: 5 },
  //{ field: 'category', weight: 4 },
  { field: 'fixerName', weight: 3 },
  //{ field: 'city', weight: 2 },
];

/**
 * Búsqueda con índice de texto ($text) de MongoDB
 * Permite aplicar ponderaciones al configurar el índice en la DB
 */
export function searchOffersWeighted(searchText?: string): any {
  // fields config removed from call because SearchService.buildWeightedSearch
  // no longer accepts it (implementation ignores weights and uses $text).
  return SearchService.buildWeightedSearch(searchText);
}

/**
 * Wrapper mínimo: búsqueda exacta (normalizada) sobre los campos recibidos.
 * Por compatibilidad con el service orquestador, acepta un array de campos.
 */
export function searchOffersExactFields(
  searchText?: string,
  fields: string[] = ['title', 'description'],
): any {
  return SearchService.buildWithNormalizer(searchText, fields, normalizeSearchText);
}

// ADD: búsqueda exacta en title + description (usa normalizador existente)
export function searchOffersTitleDescExact(searchText?: string): any {
  const fields = ['title', 'description'];
  return SearchService.buildWithNormalizer(searchText, fields, normalizeSearchText);
}

/**
 * Búsqueda 'smart' limitada a los campos especificados.
 */
export function searchOffersInFields(searchText?: string, fields: string[] = ['title']): any {
  return SearchService.buildSmartSearch(searchText, fields, normalizeSearchText);
}
