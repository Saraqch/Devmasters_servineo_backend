// utils/searchTermValidator.ts

/**
 * Valida que un término de búsqueda contenga al menos un carácter alfanumérico
 * Rechaza términos que sean solo caracteres especiales
 *
 * @param searchTerm - Término a validar
 * @returns true si el término es válido, false en caso contrario
 */
export function isValidSearchTerm(searchTerm: string): boolean {
  if (!searchTerm || !searchTerm.trim()) {
    return false;
  }

  // Debe contener al menos un carácter alfanumérico (letras o números)
  const hasAlphanumeric = /[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/.test(searchTerm);

  return hasAlphanumeric;
}

/**
 * Valida y limpia un término de búsqueda
 * Retorna null si el término no es válido
 *
 * @param searchTerm - Término a validar y limpiar
 * @returns El término limpio o null si no es válido
 */
export function validateAndCleanSearchTerm(searchTerm: string): string | null {
  if (!searchTerm) {
    return null;
  }

  const trimmed = searchTerm.trim();

  if (!isValidSearchTerm(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * Verifica si un término contiene solo caracteres especiales
 * Excluye términos como: "!!!", "@#$", "***", etc.
 *
 * @param searchTerm - Término a verificar
 * @returns true si solo contiene caracteres especiales
 */
export function isOnlySpecialCharacters(searchTerm: string): boolean {
  if (!searchTerm || !searchTerm.trim()) {
    return true;
  }

  // Si no tiene ningún alfanumérico, es solo especiales
  return !/[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/.test(searchTerm);
}

/**
 * Filtra caracteres especiales puros de un término de búsqueda
 * Permite caracteres alfanuméricos y caracteres con acentos/diéresis
 *
 * @param searchTerm - Término a filtrar
 * @returns El término sin caracteres especiales puros o null si queda vacío
 */
export function filterSpecialCharacters(searchTerm: string): string | null {
  if (!searchTerm) {
    return null;
  }

  // Remover caracteres especiales pero mantener letras con acentos, números y espacios
  const filtered = searchTerm.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/g, '').trim();

  if (!filtered || filtered.length === 0) {
    return null;
  }

  return filtered;
}
