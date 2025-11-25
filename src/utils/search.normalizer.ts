export function normalizeSearchText(text: string): string {
  if (!text) {
    return '';
  }

  let normalizedText = text.trim().toLowerCase();

  normalizedText = normalizedText.replace(/\s+/g, ' ');

  normalizedText = normalizedText.replace(/[ÁáÀàÂâÄäÃãÅåĀāĂăǍǎȦȧ]/g, 'a');
  normalizedText = normalizedText.replace(/[ÉéÈèÊêËëĒēĔĕĚěĖė]/g, 'e');
  normalizedText = normalizedText.replace(/[ÍíÌìÎîÏïĨĩĪīĬĭǏǐ]/g, 'i');
  normalizedText = normalizedText.replace(/[ÓóÒòÔôÖöÕõŌōŎŏǑǒȮȯ]/g, 'o');
  normalizedText = normalizedText.replace(/[ÚúÙùÛûÜüŨũŮůŪūŬŭǓǔU̇u̇]/g, 'u');
  
  normalizedText = normalizedText.replace(/a/g, '[aáäà]');
  normalizedText = normalizedText.replace(/e/g, '[eéëè]');
  normalizedText = normalizedText.replace(/i/g, '[iíïì]');
  normalizedText = normalizedText.replace(/o/g, '[oóöò]');
  normalizedText = normalizedText.replace(/u/g, '[uúüù]');

  return normalizedText.normalize('NFC');
}

export function normalizeForHistory(text: string): string {
  if (!text) {
    return '';
  }

  let normalized = text.trim().toLowerCase();

  normalized = normalized.replace(/\s+/g, ' ');

  normalized = normalized.replace(/[ÁáÀàÂâÄäÃãÅåĀāĂăǍǎȦȧ]/g, 'a');
  normalized = normalized.replace(/[ÉéÈèÊêËëĒēĔĕĚěĖė]/g, 'e');
  normalized = normalized.replace(/[ÍíÌìÎîÏïĨĩĪīĬĭǏǐ]/g, 'i');
  normalized = normalized.replace(/[ÓóÒòÔôÖöÕõŌōŎŏǑǒȮȯ]/g, 'o');
  normalized = normalized.replace(/[ÚúÙùÛûÜüŨũŮůŪūŬŭǓǔ]/g, 'u');

  return normalized;
}

export function generatePluralVariations(text: string): string[] {
  if (!text) {
    return [];
  }

  const normalized = text.trim().toLowerCase();
  const variations = [normalized];

  if (normalized.endsWith('es') && normalized.length > 3) {
    variations.push(normalized.slice(0, -2));

    if (!variations.includes(normalized.slice(0, -1))) {
      variations.push(normalized.slice(0, -1));
    }
  }
   else if (normalized.endsWith('s') && normalized.length > 2) {
    variations.push(normalized.slice(0, -1));
  }
  
  else {
    variations.push(normalized + 's');

    const lastChar = normalized.charAt(normalized.length - 1);
    const consonants = 'bcdfghjklmnpqrstvwxyz';

    if (consonants.includes(lastChar)) {
      variations.push(normalized + 'es');
    }
  }

  return [...new Set(variations)];
}
