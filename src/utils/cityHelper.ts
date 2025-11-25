/**
 * Ciudades/Departamentos de Bolivia
 */
export const CITIES = [
  'Beni',
  'Chuquisaca',
  'Cochabamba',
  'La Paz',
  'Oruro',
  'Pando',
  'Potosí',
  'Santa Cruz',
  'Tarija',
] as const;

export type City = (typeof CITIES)[number];

/**
 * Obtiene todas las ciudades disponibles
 */
export const getAllCities = (): City[] => {
  return [...CITIES];
};

/**
 * Valida si una ciudad es válida
 */
export const isValidCity = (city: string): boolean => {
  return CITIES.includes(city as City);
};

/**
 * Normaliza el nombre de la ciudad (capitaliza correctamente)
 */
export const normalizeCity = (city: string): City | null => {
  const normalized = city.trim();

  if (isValidCity(normalized)) {
    return normalized as City;
  }

  // Buscar coincidencia insensible a mayúsculas/minúsculas
  const found = CITIES.find((c) => c.toLowerCase() === normalized.toLowerCase());

  return found || null;
};

/**
 * Obtiene la ciudad normalizada o lanza error si es inválida
 */
export const validateAndNormalizeCity = (city: string): City => {
  const normalized = normalizeCity(city);

  if (!normalized) {
    throw new Error(`Ciudad inválida: ${city}. Ciudades válidas: ${CITIES.join(', ')}`);
  }

  return normalized;
};
