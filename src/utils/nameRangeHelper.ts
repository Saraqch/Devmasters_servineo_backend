export const isValidRange = (range: string): boolean => {
  const validRanges = [
    'A-C', 'D-F', 'G-I', 'J-L', 'M-Ñ', 'O-Q', 'R-T', 'U-W', 'X-Z',
    'De (A-C)', 'De (D-F)', 'De (G-I)', 'De (J-L)', 'De (M-Ñ)', 
    'De (O-Q)', 'De (R-T)', 'De (U-W)', 'De (X-Z)'
  ];
  const cleanRange = extractRangeLetters(range);
  return validRanges.includes(cleanRange) || validRanges.includes(range);
};

export const extractRangeLetters = (range: string): string => {
  return range
    .replace(/^De\s*\(\s*/, '')
    .replace(/\s*\)$/, '')
    .trim();
};

export const getRangeRegex = (range: string): RegExp | null => {
  const cleanRange = extractRangeLetters(range);

  const rangeMap: Record<string, string[]> = {
    'A-C': ['a', 'b', 'c', 'A', 'B', 'C'],
    'D-F': ['d', 'e', 'f', 'D', 'E', 'F'],
    'G-I': ['g', 'h', 'i', 'G', 'H', 'I'],
    'J-L': ['j', 'k', 'l', 'J', 'K', 'L'],
    'M-Ñ': ['m', 'n', 'ñ', 'M', 'N', 'Ñ'],
    'O-Q': ['o', 'p', 'q', 'O', 'P', 'Q'],
    'R-T': ['r', 's', 't', 'R', 'S', 'T'],
    'U-W': ['u', 'v', 'w', 'U', 'V', 'W'],
    'X-Z': ['x', 'y', 'z', 'X', 'Y', 'Z'],
  };

  const letters = rangeMap[cleanRange];

  if (!letters) {
    return null;
  }

  const pattern = `^[${letters.join('')}]`;
  const regex = new RegExp(pattern, 'i');

  return regex;
};

export const getLettersInRange = (range: string): string[] => {
  const cleanRange = extractRangeLetters(range);

  const rangeMap: Record<string, string[]> = {
    'A-C': ['A', 'B', 'C', 'a', 'b', 'c'],
    'D-F': ['D', 'E', 'F', 'd', 'e', 'f'],
    'G-I': ['G', 'H', 'I', 'g', 'h', 'i'],
    'J-L': ['J', 'K', 'L', 'j', 'k', 'l'],
    'M-Ñ': ['M', 'N', 'Ñ', 'm', 'n', 'ñ'],
    'O-Q': ['O', 'P', 'Q', 'o', 'p', 'q'],
    'R-T': ['R', 'S', 'T', 'r', 's', 't'],
    'U-W': ['U', 'V', 'W', 'u', 'v', 'w'],
    'X-Z': ['X', 'Y', 'Z', 'x', 'y', 'z'],
  };

  return rangeMap[cleanRange] || [];
};