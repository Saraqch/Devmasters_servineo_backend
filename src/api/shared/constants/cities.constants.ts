// src/shared/constants/cities.constants.ts

/**
 * Ciudades/Departamentos de Bolivia disponibles en el sistema
 *
 * Estas son las divisiones administrativas de primer nivel de Bolivia.
 * Se utilizan para filtrado y categorización de ofertas de trabajo.
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

/**
 * Tipo derivado de las ciudades disponibles
 * Uso: City es 'Beni' | 'Chuquisaca' | 'Cochabamba' | ...
 */
export type City = (typeof CITIES)[number];

/**
 * Mapa de códigos ISO de departamentos (para futuro uso)
 * Referencia: https://es.wikipedia.org/wiki/ISO_3166-2:BO
 */
export const CITY_ISO_CODES: Record<City, string> = {
  Beni: 'BO-B',
  Chuquisaca: 'BO-H',
  Cochabamba: 'BO-C',
  'La Paz': 'BO-L',
  Oruro: 'BO-O',
  Pando: 'BO-N',
  Potosí: 'BO-P',
  'Santa Cruz': 'BO-S',
  Tarija: 'BO-T',
};

/**
 * Alias comunes de ciudades (para normalización)
 */
export const CITY_ALIASES: Record<string, City> = {
  lapaz: 'La Paz',
  santacruz: 'Santa Cruz',
  scz: 'Santa Cruz',
  cbba: 'Cochabamba',
  lpz: 'La Paz',
};

/**
 * Número total de ciudades disponibles
 */
export const CITIES_COUNT = CITIES.length;
