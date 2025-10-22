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

  // Mapa de rangos a letras
  const rangeMap: Record<string, [string, string]> = {
    'A-C': ['A', 'C'],
    'D-F': ['D', 'F'],
    'G-I': ['G', 'I'],
    'J-L': ['J', 'L'],
    'M-Ñ': ['M', 'Ñ'],
    'O-Q': ['O', 'Q'],
    'R-T': ['R', 'T'],
    'U-W': ['U', 'W'],
    'X-Z': ['X', 'Z'],
  };

  const [start, end] = rangeMap[cleanRange] || [null, null];

  if (!start || !end) {
    console.warn(`❌ getRangeRegex: rango inválido = "${cleanRange}"`);
    console.warn(`   Valores válidos:`, Object.keys(rangeMap).join(', '));
    return null;
  }

  // Crear regex que coincida con cualquier letra en el rango
  // ej: A-C → /^[a-c]/i
  const pattern = `^[${start.toLowerCase()}-${end.toLowerCase()}]`;
  const regex = new RegExp(pattern, 'i');

  console.log(`✅ getRangeRegex: patrón = "${pattern}", regex = ${regex}`);

  return regex;
};

/**
 * Obtener todas las letras en un rango (para búsqueda en memory)
 */
export const getLettersInRange = (range: string): string[] => {
  const cleanRange = extractRangeLetters(range);

  const rangeMap: Record<string, [string, string]> = {
    'A-C': ['A', 'C'],
    'D-F': ['D', 'F'],
    'G-I': ['G', 'I'],
    'J-L': ['J', 'L'],
    'M-Ñ': ['M', 'Ñ'],
    'O-Q': ['O', 'Q'],
    'R-T': ['R', 'T'],
    'U-W': ['U', 'W'],
    'X-Z': ['X', 'Z'],
  };

  const [start, end] = rangeMap[cleanRange] || [null, null];

  if (!start || !end) {
    return [];
  }

  const letters: string[] = [];
  let current = start.charCodeAt(0);
  const endCode = end.charCodeAt(0);

  while (current <= endCode) {
    letters.push(String.fromCharCode(current).toUpperCase());
    letters.push(String.fromCharCode(current).toLowerCase());
    current++;
  }

  return letters;
};
