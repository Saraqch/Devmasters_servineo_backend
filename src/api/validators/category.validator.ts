// src/validators/category.validator.ts
import {
  CATEGORIES,
  Category,
  CATEGORY_ALIASES,
  CATEGORY_GROUPS,
} from '../shared/constants/categories.constants';

/**
 * Validaciones y normalización para categorías de trabajo
 */

/**
 * Obtiene todas las categorías disponibles
 */
export const getAllCategories = (): Category[] => {
  return [...CATEGORIES];
};

export const isValidCategory = (category: string): boolean => {
  return CATEGORIES.includes(category as Category);
};

export const normalizeCategory = (category: string): Category | null => {
  const trimmed = category.trim();

  // Si ya es válida, retornarla
  if (isValidCategory(trimmed)) {
    return trimmed as Category;
  }

  // Buscar coincidencia case-insensitive
  const found = CATEGORIES.find((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (found) {
    return found;
  }

  // Buscar en aliases
  const lowerTrimmed = trimmed.toLowerCase();
  if (lowerTrimmed in CATEGORY_ALIASES) {
    return CATEGORY_ALIASES[lowerTrimmed];
  }

  return null;
};

export const validateAndNormalizeCategory = (category: string): Category => {
  const normalized = normalizeCategory(category);

  if (!normalized) {
    throw new Error(
      `Categoría inválida: ${category}. Categorías válidas: ${CATEGORIES.join(', ')}`,
    );
  }

  return normalized;
};

export const validateMultipleCategories = (
  categories: string[],
): {
  valid: Category[];
  invalid: string[];
} => {
  const valid: Category[] = [];
  const invalid: string[] = [];

  for (const category of categories) {
    const normalized = normalizeCategory(category);
    if (normalized) {
      valid.push(normalized);
    } else {
      invalid.push(category);
    }
  }

  return { valid, invalid };
};

export const suggestCategories = (partial: string): Category[] => {
  if (!partial.trim()) return [];

  const lower = partial.toLowerCase();
  return CATEGORIES.filter((category) => category.toLowerCase().includes(lower));
};

export const getRelatedCategories = (category: Category): Category[] => {
  for (const categories of Object.values(CATEGORY_GROUPS)) {
    const group = categories as readonly Category[];
    if (group.includes(category)) {
      return group.filter((c) => c !== category) as Category[];
    }
  }

  return [];
};
