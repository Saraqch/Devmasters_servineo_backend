/**
 * Categorías de trabajo disponibles
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

export type Category = (typeof CATEGORIES)[number];

/**
 * Obtiene todas las categorías disponibles
 */
export const getAllCategories = (): Category[] => {
  return [...CATEGORIES];
};

/**
 * Valida si una categoría es válida
 */
export const isValidCategory = (category: string): boolean => {
  return CATEGORIES.includes(category as Category);
};

/**
 * Normaliza el nombre de la categoría (capitaliza correctamente)
 */
export const normalizeCategory = (category: string): Category | null => {
  const normalized = category.trim();

  if (isValidCategory(normalized)) {
    return normalized as Category;
  }

  // Buscar coincidencia insensible a mayúsculas/minúsculas
  const found = CATEGORIES.find((cat) => cat.toLowerCase() === normalized.toLowerCase());

  return found || null;
};

/**
 * Obtiene la categoría normalizada o lanza error si es inválida
 */
export const validateAndNormalizeCategory = (category: string): Category => {
  const normalized = normalizeCategory(category);

  if (!normalized) {
    throw new Error(
      `Categoría inválida: ${category}. Categorías válidas: ${CATEGORIES.join(', ')}`,
    );
  }

  return normalized;
};
