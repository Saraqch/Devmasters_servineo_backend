/*export function normalizeSearchText(text: string): string {
  if (!text) {
    return '';
  }

  // Convertir a minúsculas y eliminar espacios al inicio/final
  const trimmedAndLower = text.trim().toLowerCase();

  // Reemplazar múltiples espacios por uno solo
  const singleSpaced = trimmedAndLower.replace(/\s+/g, ' ');

  // Normalizar para separar caracteres base de diacríticos (ej. á -> a + ´)
  // y luego eliminar los diacríticos, excepto para la ñ.
  // La ñ (U+00F1) se descompone en n (U+006E) y tilde (U+0303).
  // La expresión regular /[^\u006E\u0303]/g asegura que no se elimine la tilde de la n.
  const normalized = singleSpaced.normalize('NFD').replace(/[\u0300-\u0302\u0304-\u036f]/g, '');

  return normalized;
}*/
export function normalizeSearchText(text: string): string {
  if (!text) {
    return '';
  }

  // 1. Limpieza inicial: Recortar espacios y convertir a minúsculas
  let normalizedText = text.trim().toLowerCase();

  // 2. Reemplazar múltiples espacios por uno solo
  normalizedText = normalizedText.replace(/\s+/g, ' ');

  // --- PASO CRUCIAL 1: QUITAR TILDES Y DIÉRESIS DE LA ENTRADA ---
  // Usamos reemplazos explícitos para asegurar que 'ó' se convierta en 'o', 'ü' en 'u', etc.
  normalizedText = normalizedText.replace(/[ÅåáÁàÀâÂ]/g, 'a');
  normalizedText = normalizedText.replace(/[éÉèÈêÊ]/g, 'e');
  normalizedText = normalizedText.replace(/[íÍìÌîÎ]/g, 'i');
  normalizedText = normalizedText.replace(/[óÓòÒôÔ]/g, 'o');
  normalizedText = normalizedText.replace(/[úÚùÙûÛüÜ]/g, 'u');
  // Si necesitas manejar la ñ, puedes añadir:
  // normalizedText = normalizedText.replace(/ñ/g, 'n');

  // 3. CREAR EL PATRÓN DE BÚSQUEDA FLEXIBLE
  // Ahora que la entrada está limpia ('reparacion'), creamos el patrón que buscará las tildes.
  normalizedText = normalizedText.replace(/a/g, '[aáäà]');
  normalizedText = normalizedText.replace(/e/g, '[eéëè]');
  normalizedText = normalizedText.replace(/i/g, '[iíïì]');
  normalizedText = normalizedText.replace(/o/g, '[oóöò]');
  normalizedText = normalizedText.replace(/u/g, '[uúüù]');

  // 4. Se asegura de recomponer la cadena si es necesario
  return normalizedText.normalize('NFC');
}
