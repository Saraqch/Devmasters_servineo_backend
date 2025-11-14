// utils/searchTermValidator.ts

export function isValidSearchTerm(searchTerm: string): boolean {
  if (!searchTerm || !searchTerm.trim()) {
    return false;
  }

  // Debe contener al menos un carácter alfanumérico (letras o números)
  const hasAlphanumeric = /[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/.test(searchTerm);

  return hasAlphanumeric;
}

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

export function isOnlySpecialCharacters(searchTerm: string): boolean {
  if (!searchTerm || !searchTerm.trim()) {
    return true;
  }

  // Si no tiene ningún alfanumérico, es solo especiales
  return !/[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/.test(searchTerm);
}

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
