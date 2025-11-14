// src/validators/city.validator.ts
import { CITIES, City, CITY_ALIASES } from '../shared/constants/cities.constants';

/**
 * Validaciones y normalización para ciudades
 */

/**
 * Obtiene todas las ciudades disponibles
 */
export const getAllCities = (): City[] => {
  return [...CITIES];
};

export const isValidCity = (city: string): boolean => {
  return CITIES.includes(city as City);
};

export const normalizeCity = (city: string): City | null => {
  const trimmed = city.trim();

  // Si ya es válida, retornarla
  if (isValidCity(trimmed)) {
    return trimmed as City;
  }

  // Buscar coincidencia case-insensitive
  const found = CITIES.find((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (found) {
    return found;
  }

  // Buscar en aliases
  const lowerTrimmed = trimmed.toLowerCase();
  if (lowerTrimmed in CITY_ALIASES) {
    return CITY_ALIASES[lowerTrimmed];
  }

  return null;
};

export const validateAndNormalizeCity = (city: string): City => {
  const normalized = normalizeCity(city);

  if (!normalized) {
    throw new Error(`Ciudad inválida: ${city}. Ciudades válidas: ${CITIES.join(', ')}`);
  }

  return normalized;
};

export const validateMultipleCities = (
  cities: string[],
): {
  valid: City[];
  invalid: string[];
} => {
  const valid: City[] = [];
  const invalid: string[] = [];

  for (const city of cities) {
    const normalized = normalizeCity(city);
    if (normalized) {
      valid.push(normalized);
    } else {
      invalid.push(city);
    }
  }

  return { valid, invalid };
};

export const suggestCities = (partial: string): City[] => {
  if (!partial.trim()) return [];

  const lower = partial.toLowerCase();
  return CITIES.filter((city) => city.toLowerCase().includes(lower));
};
