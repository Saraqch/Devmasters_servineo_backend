// src/modules/job-offers/services/price-range.service.ts
import { JobOffer } from '../../../models/job-offer.model';

/**
 * Interfaz para un rango de precios
 */
export interface PriceRange {
  label: string;
  min: number | null; // null = sin límite inferior
  max: number | null; // null = sin límite superior
}

/**
 * Resultado del cálculo de rangos de precio
 */
export interface PriceRangeResult {
  min: number | null;
  max: number | null;
  ranges: PriceRange[];
}

/**
 * Opciones para calcular rangos de precio
 */
export interface PriceRangeOptions {
  buckets?: number; // Número de rangos internos (default: 4)
  includeExtremes?: boolean; // Incluir "Menos de" y "Más de" (default: true)
  roundTo?: number; // Redondear a múltiplo de este número (opcional)
}

export async function calculatePriceRanges(
  options: PriceRangeOptions = {},
): Promise<PriceRangeResult> {
  const { buckets = 4, includeExtremes = true } = options;

  // Validar opciones
  if (buckets < 1 || buckets > 20) {
    throw new Error('El número de buckets debe estar entre 1 y 20');
  }

  // Obtener min y max de la colección
  const stats = await getPriceStatistics();

  if (!stats.min || !stats.max) {
    return { min: null, max: null, ranges: [] };
  }

  const { min, max } = stats;

  // Caso especial: un solo valor
  if (min === max) {
    return createSingleValueRange(min);
  }

  // Calcular boundaries
  const boundaries = calculateBoundaries(min, max, buckets);

  // Generar rangos
  const ranges = generateRanges(boundaries, includeExtremes);

  return { min, max, ranges };
}

/**
 * Obtiene estadísticas de precios (min, max, avg) de la colección
 */
export async function getPriceStatistics(): Promise<{
  min: number | null;
  max: number | null;
  avg: number | null;
  count: number;
}> {
  const agg = await JobOffer.aggregate([
    {
      $group: {
        _id: null,
        min: { $min: '$price' },
        max: { $max: '$price' },
        avg: { $avg: '$price' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (!agg || agg.length === 0) {
    return { min: null, max: null, avg: null, count: 0 };
  }

  return {
    min: agg[0].min,
    max: agg[0].max,
    avg: agg[0].avg,
    count: agg[0].count,
  };
}

/**
 * Valida si un rango de precio es válido
 */
export function validatePriceRange(
  min?: number | null,
  max?: number | null,
): {
  isValid: boolean;
  error?: string;
} {
  // Ambos null es válido (sin filtro)
  if (min === null && max === null) {
    return { isValid: true };
  }

  // Validar tipos
  if (min !== null && (typeof min !== 'number' || isNaN(min))) {
    return { isValid: false, error: 'Precio mínimo inválido' };
  }

  if (max !== null && (typeof max !== 'number' || isNaN(max))) {
    return { isValid: false, error: 'Precio máximo inválido' };
  }

  // Validar que sean positivos
  if (min !== null && min < 0) {
    return { isValid: false, error: 'Precio mínimo no puede ser negativo' };
  }

  if (max !== null && max < 0) {
    return { isValid: false, error: 'Precio máximo no puede ser negativo' };
  }

  // Validar que min <= max
  if (min !== null && max !== null && min > max) {
    return { isValid: false, error: 'Precio mínimo no puede ser mayor que precio máximo' };
  }

  return { isValid: true };
}

/**
 * Formatea un precio para mostrar (con símbolo de moneda)
 */
export function formatPrice(price: number | null): string {
  if (price === null) return '-';
  return `$${price.toLocaleString('es-BO')}`;
}

/**
 * Busca en qué rango cae un precio dado
 */
export function findRangeForPrice(price: number, ranges: PriceRange[]): PriceRange | null {
  for (const range of ranges) {
    const matchesMin = range.min === null || price >= range.min;
    const matchesMax = range.max === null || price <= range.max;

    if (matchesMin && matchesMax) {
      return range;
    }
  }

  return null;
}

// ==================== FUNCIONES AUXILIARES PRIVADAS ====================

/**
 * Crea un resultado para cuando solo hay un valor único
 */
function createSingleValueRange(value: number): PriceRangeResult {
  const rounded = Math.floor(value);
  return {
    min: rounded,
    max: rounded,
    ranges: [{ label: `= $${rounded}`, min: rounded, max: rounded }],
  };
}

/**
 * Calcula los boundaries (límites) para los rangos
 */
function calculateBoundaries(min: number, max: number, buckets: number): number[] {
  const span = max - min;
  const stepRaw = span / buckets;

  // Calcular base para redondeo inteligente
  const roundBase = (n: number): number => {
    if (n <= 1) return 1;
    const exp = Math.floor(Math.log10(n));
    return Math.pow(10, Math.max(0, exp));
  };

  const base = roundBase(stepRaw);
  const step = Math.max(1, Math.ceil(stepRaw / base) * base);

  const boundaries: number[] = [];
  let lower = Math.floor(min / step) * step;

  // Si lower es negativo pero min es positivo, empezar en 0
  if (lower < 0 && min >= 0) {
    lower = 0;
  }

  // Generar boundaries
  for (let i = 0; i <= buckets; i++) {
    boundaries.push(lower + step * i);
  }

  // Asegurar que el último boundary cubra el máximo
  while (boundaries[boundaries.length - 1] < max) {
    boundaries.push(boundaries[boundaries.length - 1] + step);
  }

  return boundaries;
}

/**
 * Genera los rangos a partir de los boundaries
 */
function generateRanges(boundaries: number[], includeExtremes: boolean): PriceRange[] {
  const ranges: PriceRange[] = [];

  if (includeExtremes) {
    // Rango "Menos de"
    const firstUpper = boundaries[1] ?? boundaries[boundaries.length - 1];
    ranges.push({
      label: `Menos de $${firstUpper}`,
      min: null,
      max: firstUpper,
    });

    // Rangos intermedios
    const mid = boundaries.slice(1, Math.max(2, boundaries.length - 1));

    if (mid.length >= 2) {
      for (let i = 0; i < mid.length - 1; i++) {
        const a = mid[i];
        const b = mid[i + 1];
        ranges.push({
          label: `$${a} - $${b}`,
          min: a,
          max: b,
        });
      }

      // Rango "Más de"
      const lastMin = mid[mid.length - 1];
      ranges.push({
        label: `Más de $${lastMin}`,
        min: lastMin,
        max: null,
      });
    } else {
      // Fallback si no hay suficientes boundaries
      ranges.push({
        label: `Más de $${firstUpper}`,
        min: firstUpper,
        max: null,
      });
    }
  } else {
    // Sin extremos: todos los pares de boundaries
    for (let i = 0; i < boundaries.length - 1; i++) {
      const a = boundaries[i];
      const b = boundaries[i + 1];
      ranges.push({
        label: `$${a} - $${b}`,
        min: a,
        max: b,
      });
    }
  }

  return ranges;
}

export async function getPriceRanges(
  buckets: number = 4,
  includeExtremes: boolean = true,
): Promise<PriceRangeResult> {
  return calculatePriceRanges({ buckets, includeExtremes });
}
