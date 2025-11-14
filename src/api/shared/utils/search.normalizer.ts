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
  normalizedText = normalizedText.replace(/[ÁáÀàÂâÄäÃãÅåĀāĂăǍǎȦȧ]/g, 'a');
  normalizedText = normalizedText.replace(/[ÉéÈèÊêËëĒēĔĕĚěĖė]/g, 'e');
  normalizedText = normalizedText.replace(/[ÍíÌìÎîÏïĨĩĪīĬĭǏǐ]/g, 'i');
  normalizedText = normalizedText.replace(/[ÓóÒòÔôÖöÕõŌōŎŏǑǒȮȯ]/g, 'o');
  normalizedText = normalizedText.replace(/[ÚúÙùÛûÜüŨũŮůŪūŬŭǓǔ]/g, 'u');
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

export function normalizeForHistory(text: string): string {
  if (!text) {
    return '';
  }

  // 1. Convertir a minúsculas y limpiar espacios
  let normalized = text.trim().toLowerCase();

  // 2. Reemplazar múltiples espacios por uno solo
  normalized = normalized.replace(/\s+/g, ' ');

  // 3. Eliminar acentos y diéresis usando NFD + filtrado
  // Normalizar a forma descompuesta (NFD) y luego eliminar los diacríticos
  normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Mantener la ñ como ñ (no convertir a n)
  // Si quieres convertir ñ → n, descomenta la siguiente línea:
  // normalized = normalized.replace(/ñ/g, 'n');

  return normalized.normalize('NFC');
}
