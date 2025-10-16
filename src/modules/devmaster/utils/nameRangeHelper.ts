/**
 * Rangos alfabéticos para filtrar nombres de fixers
 */
export const NAME_RANGES = {
  'A-C': /^[A-Ca-cÁÁáÉéÍíÓóÚúÑñ]/,
  'D-F': /^[D-Fd-fÉéÍíÓóÚúÑñ]/,
  'G-I': /^[G-Ig-iÍíÓóÚúÑñ]/,
  'J-L': /^[J-Lj-lÍíÓóÚúÑñ]/,
  'M-Ñ': /^[M-Ñm-ñÓóÚú]/,
  'O-Q': /^[O-Qo-qÓóÚú]/,
  'R-T': /^[R-Tr-tÚú]/,
  'U-W': /^[U-Wu-wÚú]/,
  'X-Z': /^[X-Zx-z]/,
};

/**
 * Obtiene el regex para un rango específico
 */
export const getRangeRegex = (range: string): RegExp | null => {
  const normalizedRange = range.toUpperCase().replace(/\s/g, '');
  return NAME_RANGES[normalizedRange as keyof typeof NAME_RANGES] || null;
};

/**
 * Valida si un rango es válido
 */
export const isValidRange = (range: string): boolean => {
  const normalizedRange = range.toUpperCase().replace(/\s/g, '');
  return normalizedRange in NAME_RANGES;
};

/**
 * Obtiene todos los rangos disponibles
 */
export const getAllRanges = (): string[] => {
  return Object.keys(NAME_RANGES);
};