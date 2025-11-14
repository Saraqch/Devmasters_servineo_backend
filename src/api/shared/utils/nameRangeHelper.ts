/**
 * Validar si un rango es válido
 */
export const isValidRange = (range: string): boolean => {
  const validRanges = ['A-C', 'D-F', 'G-I', 'J-L', 'M-Ñ', 'O-Q', 'R-T', 'U-W', 'X-Z'];
  const cleanRange = extractRangeLetters(range);
  return validRanges.includes(cleanRange);
};

/**
 * Extraer solo las letras del rango (ej: "De (A-C)" → "A-C")
 */
export const extractRangeLetters = (range: string): string => {
  // Elimina "De (" y ")"
  return range
    .replace(/^De\s*\(\s*/, '')
    .replace(/\s*\)$/, '')
    .trim();
};

/**
 * Obtener regex para filtrar por rango de nombre
 * Retorna una regex que coincide con nombres que empiezan con letras en el rango
 */
export const getRangeRegex = (range: string): RegExp | null => {
  console.log(`🔤 getRangeRegex: entrada = "${range}"`);

  // Limpiar el rango
  const cleanRange = extractRangeLetters(range);
  console.log(`🔤 getRangeRegex: rango limpio = "${cleanRange}"`);

  // Mapa de rangos a letras EXPLÍCITAS (sin usar rangos problemáticos)
  const rangeMap: Record<string, string[]> = {
    'A-C': ['a', 'b', 'c', 'A', 'B', 'C'],
    'D-F': ['d', 'e', 'f', 'D', 'E', 'F'],
    'G-I': ['g', 'h', 'i', 'G', 'H', 'I'],
    'J-L': ['j', 'k', 'l', 'J', 'K', 'L'],
    'M-Ñ': ['m', 'n', 'ñ', 'M', 'N', 'Ñ'], // ✅ EXPLÍCITO
    'O-Q': ['o', 'p', 'q', 'O', 'P', 'Q'],
    'R-T': ['r', 's', 't', 'R', 'S', 'T'],
    'U-W': ['u', 'v', 'w', 'U', 'V', 'W'],
    'X-Z': ['x', 'y', 'z', 'X', 'Y', 'Z'],
  };

  const letters = rangeMap[cleanRange];

  if (!letters) {
    console.warn(`❌ getRangeRegex: rango inválido = "${cleanRange}"`);
    console.warn(`   Valores válidos:`, Object.keys(rangeMap).join(', '));
    return null;
  }

  // Crear regex con las letras explícitas
  const pattern = `^[${letters.join('')}]`;
  const regex = new RegExp(pattern, 'i');

  console.log(`✅ getRangeRegex: patrón = "${pattern}", regex = ${regex}`);

  return regex;
};

/**
 * Obtener todas las letras en un rango (para búsqueda en memory)
 */
export const getLettersInRange = (range: string): string[] => {
  const cleanRange = extractRangeLetters(range);

  // Mapa explícito de letras por rango
  const rangeMap: Record<string, string[]> = {
    'A-C': ['A', 'B', 'C', 'a', 'b', 'c'],
    'D-F': ['D', 'E', 'F', 'd', 'e', 'f'],
    'G-I': ['G', 'H', 'I', 'g', 'h', 'i'],
    'J-L': ['J', 'K', 'L', 'j', 'k', 'l'],
    'M-Ñ': ['M', 'N', 'Ñ', 'm', 'n', 'ñ'], // ✅ EXPLÍCITO
    'O-Q': ['O', 'P', 'Q', 'o', 'p', 'q'],
    'R-T': ['R', 'S', 'T', 'r', 's', 't'],
    'U-W': ['U', 'V', 'W', 'u', 'v', 'w'],
    'X-Z': ['X', 'Y', 'Z', 'x', 'y', 'z'],
  };

  return rangeMap[cleanRange] || [];
};
