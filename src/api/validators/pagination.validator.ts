// validators/pagination.validator.ts

import type { ParsedQs } from 'qs';

export interface PaginationValidationResult {
  isValid: boolean;
  currentPage: number;
  totalPages: number;
  errorMessage?: string;
}

/**
 * Valida si la página solicitada está dentro del rango válido
 */
export function validatePageRange(
  currentPage: number,
  totalItems: number,
  itemsPerPage: number,
): PaginationValidationResult {
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / itemsPerPage) : 0;

  // Si no hay items, cualquier página es válida (retornará array vacío)
  if (totalItems === 0) {
    return {
      isValid: true,
      currentPage: 1,
      totalPages: 0,
    };
  }

  // Validar que la página esté en rango válido
  if (currentPage < 1 || currentPage > totalPages) {
    return {
      isValid: false,
      currentPage,
      totalPages,
      errorMessage: `Página ${currentPage} fuera de rango. Total de páginas disponibles: ${totalPages}`,
    };
  }

  return {
    isValid: true,
    currentPage,
    totalPages,
  };
}

/**
 * Calcula el total de páginas
 */
export function calculateTotalPages(totalItems: number, itemsPerPage: number): number {
  return totalItems > 0 ? Math.ceil(totalItems / itemsPerPage) : 0;
}

/**
 * Valida y normaliza el número de página desde query params
 */
export function normalizePageParam(
  pageParam: string | ParsedQs | (string | ParsedQs)[] | undefined,
  defaultPage: number = 1,
): number {
  // Si es un array, tomar el primer elemento
  if (Array.isArray(pageParam)) {
    const firstValue = pageParam[0];
    // Si el primer elemento es un objeto ParsedQs, usar el defaultPage
    if (typeof firstValue === 'object') {
      return defaultPage;
    }
    const page = Number(firstValue);
    return !isNaN(page) && page > 0 ? page : defaultPage;
  }

  // Si es un objeto ParsedQs (query params anidados), usar el defaultPage
  if (typeof pageParam === 'object') {
    return defaultPage;
  }

  // Si es string o number
  const page = Number(pageParam);
  return !isNaN(page) && page > 0 ? page : defaultPage;
}

export interface PaginationConsistencyResult {
  isConsistent: boolean;
  expectedCount: number;
  actualCount: number;
  adjustedPage?: number;
  message?: string;
}

export function validatePaginationConsistency(
  expectedCount: number,
  actualCount: number,
  currentPage: number,
  totalItems: number,
  itemsPerPage: number,
): PaginationConsistencyResult {
  // Calcular si estamos en la última página
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const isLastPage = currentPage === totalPages;

  // En la última página, es normal tener menos items que el límite
  if (isLastPage) {
    const expectedInLastPage = totalItems % itemsPerPage || itemsPerPage;

    if (actualCount === expectedInLastPage) {
      return {
        isConsistent: true,
        expectedCount: expectedInLastPage,
        actualCount,
      };
    }
  }

  // En páginas intermedias, debe coincidir con el límite
  if (actualCount !== expectedCount && !isLastPage) {
    // Posible inconsistencia por cambios concurrentes
    return {
      isConsistent: false,
      expectedCount,
      actualCount,
      message: `Inconsistencia detectada: se esperaban ${expectedCount} items pero se recibieron ${actualCount}`,
    };
  }

  return {
    isConsistent: true,
    expectedCount,
    actualCount,
  };
}

export function calculatePaginationParams(
  page: number,
  limit: number,
): { skip: number; limit: number } {
  const normalizedPage = page > 0 ? page : 1;
  const normalizedLimit = limit > 0 ? limit : 10;

  return {
    skip: (normalizedPage - 1) * normalizedLimit,
    limit: normalizedLimit,
  };
}
