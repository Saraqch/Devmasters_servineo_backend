// services/jobOfert/search.service.ts
import { normalizeSearchText } from '../../../shared/utils/search.normalizer';
import { SearchBuilder } from '../../../core/search.builder';

// Importar el tipo desde search.builder
type MongoSearchQuery =
  | Record<string, never>
  | { $or: Record<string, RegExp>[] }
  | { $or: { $and: Record<string, RegExp>[] }[] }
  | { $text: { $search: string } };

const SEARCH_FIELDS = ['name', 'title', 'description', 'category', 'city'];

/**
 * Búsqueda básica (sin normalizador de acentos, etc.)
 */
export function searchOffersBasic(searchText?: string): MongoSearchQuery {
  return SearchBuilder.build(searchText, SEARCH_FIELDS);
}

/**
 * Búsqueda de ofertas con detección automática de tokens
 * Mantiene la funcionalidad original completa
 */
export function searchOffers(searchText?: string): MongoSearchQuery {
  return SearchBuilder.buildSmartSearch(searchText, SEARCH_FIELDS, normalizeSearchText);
}

/**
 * Búsqueda simple (sin tokens)
 */
export function searchOffersSimple(searchText?: string): MongoSearchQuery {
  return SearchBuilder.buildWithNormalizer(searchText, SEARCH_FIELDS, normalizeSearchText);
}

/**
 * Búsqueda forzada por tokens
 */
export function searchOffersTokens(searchText?: string): MongoSearchQuery {
  return SearchBuilder.buildTokenSearch(searchText, SEARCH_FIELDS, normalizeSearchText);
}

/**
 * Búsqueda con índice de texto ($text) de MongoDB
 * Permite aplicar ponderaciones al configurar el índice en la DB
 */
export function searchOffersWeighted(searchText?: string): MongoSearchQuery {
  // fields config removed from call because SearchService.buildWeightedSearch
  // no longer accepts it (implementation ignores weights and uses $text).
  return SearchBuilder.buildWeightedSearch(searchText);
}

/**
 * Wrapper mínimo: búsqueda exacta (normalizada) sobre los campos recibidos.
 * Por compatibilidad con el service orquestador, acepta un array de campos.
 */
export function searchOffersExactFields(
  searchText?: string,
  fields: string[] = ['title', 'description'],
): MongoSearchQuery {
  return SearchBuilder.buildWithNormalizer(searchText, fields, normalizeSearchText);
}

// ADD: búsqueda exacta en title + description (usa normalizador existente)
export function searchOffersTitleDescExact(searchText?: string): MongoSearchQuery {
  const fields = ['title', 'description'];
  return SearchBuilder.buildWithNormalizer(searchText, fields, normalizeSearchText);
}

/**
 * Búsqueda 'smart' limitada a los campos especificados.
 */
export function searchOffersInFields(
  searchText?: string,
  fields: string[] = ['title'],
): MongoSearchQuery {
  return SearchBuilder.buildSmartSearch(searchText, fields, normalizeSearchText);
}
