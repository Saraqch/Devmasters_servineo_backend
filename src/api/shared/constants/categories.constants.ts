// src/shared/constants/categories.constants.ts

/**
 * Categorías de trabajo disponibles en el sistema
 *
 * Representa los diferentes oficios y profesiones técnicas
 * disponibles para ofertas de servicios.
 */
export const CATEGORIES = [
  'Albañil',
  'Carpintero',
  'Fontanero',
  'Electricista',
  'Pintor',
  'Soldador',
  'Jardinero',
  'Cerrajero',
  'Mecánico',
  'Vidriero',
  'Yesero',
  'Fumigador',
  'Limpiador',
  'Instalador',
  'Montador',
  'Decorador',
  'Pulidor',
  'Techador',
] as const;

/**
 * Tipo derivado de las categorías disponibles
 * Uso: Category es 'Albañil' | 'Carpintero' | 'Fontanero' | ...
 */
export type Category = (typeof CATEGORIES)[number];

/**
 * Categorías agrupadas por tipo de trabajo
 * Útil para filtros avanzados o sugerencias
 */
export const CATEGORY_GROUPS: Record<string, readonly Category[]> = {
  construccion: ['Albañil', 'Yesero', 'Techador'] as const,
  madera: ['Carpintero', 'Montador'] as const,
  instalaciones: ['Fontanero', 'Electricista', 'Instalador'] as const,
  acabados: ['Pintor', 'Pulidor', 'Decorador'] as const,
  metal: ['Soldador', 'Cerrajero'] as const,
  mantenimiento: ['Mecánico', 'Limpiador', 'Fumigador'] as const,
  exterior: ['Jardinero', 'Vidriero'] as const,
} as const;

/**
 * Alias comunes de categorías (para normalización)
 */
export const CATEGORY_ALIASES: Record<string, Category> = {
  albanil: 'Albañil',
  plomero: 'Fontanero',
  gasfitero: 'Fontanero',
  electrico: 'Electricista',
  electric: 'Electricista',
  jardineria: 'Jardinero',
  limpieza: 'Limpiador',
  mecanica: 'Mecánico',
  vidrio: 'Vidriero',
};

/**
 * Iconos sugeridos para cada categoría (para UI)
 */
export const CATEGORY_ICONS: Record<Category, string> = {
  Albañil: '🧱',
  Carpintero: '🪚',
  Fontanero: '🔧',
  Electricista: '⚡',
  Pintor: '🎨',
  Soldador: '🔥',
  Jardinero: '🌱',
  Cerrajero: '🔐',
  Mecánico: '⚙️',
  Vidriero: '🪟',
  Yesero: '🏗️',
  Fumigador: '🦟',
  Limpiador: '🧹',
  Instalador: '🔌',
  Montador: '🪛',
  Decorador: '🖼️',
  Pulidor: '✨',
  Techador: '🏠',
};

/**
 * Número total de categorías disponibles
 */
export const CATEGORIES_COUNT = CATEGORIES.length;

/**
 * Obtiene el grupo de una categoría
 */
export function getCategoryGroup(category: Category): string | null {
  for (const [group, categories] of Object.entries(CATEGORY_GROUPS)) {
    if ((categories as readonly Category[]).includes(category)) {
      return group;
    }
  }
  return null;
}
