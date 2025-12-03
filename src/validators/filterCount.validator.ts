// validators/filterCount.validator.ts

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sumBreakdown?: {
    fixersSum: number;
    citiesSum: number;
    categoriesSum: number;
    ratingsSum: number;
    total: number;
  };
}

export interface CountObject {
  [key: string]: number;
}

export class FilterCountValidator {
  /**
   * Valida que todos los conteos sean válidos (no negativos, no duplicados)
   * ⭐ AHORA INCLUYE VALIDACIÓN DE SUMA vs TOTAL
   */
  static validateCounts(
    fixers: CountObject,
    cities: CountObject,
    categories: CountObject,
    ratings: CountObject,
    total: number
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Validar que total no sea negativo
    if (total < 0) {
      errors.push(`Total count is negative: ${total}`);
    }

    // 2. Validar cada objeto de conteo
    this.validateCountObject('fixers', fixers, errors, warnings);
    this.validateCountObject('cities', cities, errors, warnings);
    this.validateCountObject('categories', categories, errors, warnings);
    this.validateCountObject('ratings', ratings, errors, warnings);

    // 3. Validar que no haya claves vacías
    this.validateEmptyKeys('fixers', fixers, errors);
    this.validateEmptyKeys('cities', cities, errors);
    this.validateEmptyKeys('categories', categories, errors);
    this.validateEmptyKeys('ratings', ratings, errors);

    // 4. ⭐ NUEVO: Validar que la suma coincida con el total (TASK PENDIENTE)
    const sumValidation = this.validateSumMatchesTotal(
      fixers,
      cities,
      categories,
      ratings,
      total
    );
    
    errors.push(...sumValidation.errors);
    warnings.push(...sumValidation.warnings);

    // 5. Advertencia si total es 0 pero hay conteos
    if (total === 0) {
      const hasAnyCounts = 
        Object.keys(fixers).length > 0 ||
        Object.keys(cities).length > 0 ||
        Object.keys(categories).length > 0 ||
        Object.keys(ratings).length > 0;
      
      if (hasAnyCounts) {
        warnings.push('Total is 0 but individual counts exist');
      }
    }

    // 6. Advertencia si hay valores inusualmente altos
    this.checkUnusuallyHighValues(fixers, 'fixers', warnings);
    this.checkUnusuallyHighValues(cities, 'cities', warnings);
    this.checkUnusuallyHighValues(categories, 'categories', warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sumBreakdown: sumValidation.breakdown,
    };
  }

  /**
   * ⭐ VALIDACIÓN PRINCIPAL DEL TASK PENDIENTE:
   * Verifica que la suma de conteos de cada filtro coincida con el total
   * 
   * IMPORTANTE: Cuando hay filtros activos, las sumas PUEDEN exceder el total
   * porque cada tipo de filtro se calcula sin su propio filtro pero con los demás.
   * 
   * Por ejemplo:
   * - Total con filtros: 45 ofertas
   * - Cities sin filtro de city: puede sumar más porque incluye todas las ciudades
   *   que cumplen con los OTROS filtros activos
   */
  private static validateSumMatchesTotal(
    fixers: CountObject,
    cities: CountObject,
    categories: CountObject,
    ratings: CountObject,
    total: number
  ): {
    errors: string[];
    warnings: string[];
    breakdown: {
      fixersSum: number;
      citiesSum: number;
      categoriesSum: number;
      ratingsSum: number;
      total: number;
    };
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Calcular la suma de cada tipo de filtro
    const fixersSum = this.sumCounts(fixers);
    const citiesSum = this.sumCounts(cities);
    const categoriesSum = this.sumCounts(categories);
    const ratingsSum = this.sumCounts(ratings);

    const breakdown = {
      fixersSum,
      citiesSum,
      categoriesSum,
      ratingsSum,
      total,
    };

    // ⭐ REGLA 1: Validar integridad de datos básica
    // Solo marcamos ERROR si hay inconsistencias graves que indiquen corrupción
    
    // Si el total es 0, ninguna suma debería tener valores
    if (total === 0 && (fixersSum > 0 || citiesSum > 0 || categoriesSum > 0 || ratingsSum > 0)) {
      errors.push(
        `Total is 0 but filter sums are not zero (fixers: ${fixersSum}, cities: ${citiesSum}, categories: ${categoriesSum}, ratings: ${ratingsSum})`
      );
    }

    // Si hay total pero todas las sumas son 0, hay un problema
    if (total > 0 && fixersSum === 0 && citiesSum === 0 && categoriesSum === 0 && ratingsSum === 0) {
      errors.push(
        `Total is ${total} but all filter counts are zero - data inconsistency detected`
      );
    }

    // ⚠️ WARNINGS: Alertar sobre discrepancias que pueden ser normales pero merecen atención
    
    // Si una suma excede significativamente el total, puede indicar:
    // 1. Filtros activos (normal)
    // 2. Datos duplicados (problema)
    // 3. Lógica de conteo incorrecta (problema)
    
    const SIGNIFICANT_EXCEEDANCE = 5.0; // 500% - solo para casos extremos
    
    if (total > 0) {
      if (fixersSum > total * SIGNIFICANT_EXCEEDANCE) {
        warnings.push(
          `Fixers sum (${fixersSum}) is ${(fixersSum/total).toFixed(1)}x the total (${total}) - verify data integrity`
        );
      } else if (fixersSum > total) {
        warnings.push(
          `Fixers sum (${fixersSum}) exceeds total (${total}) by ${((fixersSum/total - 1) * 100).toFixed(1)}%`
        );
      }

      if (citiesSum > total * SIGNIFICANT_EXCEEDANCE) {
        warnings.push(
          `Cities sum (${citiesSum}) is ${(citiesSum/total).toFixed(1)}x the total (${total}) - verify data integrity`
        );
      } else if (citiesSum > total) {
        warnings.push(
          `Cities sum (${citiesSum}) exceeds total (${total}) by ${((citiesSum/total - 1) * 100).toFixed(1)}%`
        );
      }

      if (categoriesSum > total * SIGNIFICANT_EXCEEDANCE) {
        warnings.push(
          `Categories sum (${categoriesSum}) is ${(categoriesSum/total).toFixed(1)}x the total (${total}) - verify data integrity`
        );
      } else if (categoriesSum > total) {
        warnings.push(
          `Categories sum (${categoriesSum}) exceeds total (${total}) by ${((categoriesSum/total - 1) * 100).toFixed(1)}%`
        );
      }

      if (ratingsSum > total * SIGNIFICANT_EXCEEDANCE) {
        warnings.push(
          `Ratings sum (${ratingsSum}) is ${(ratingsSum/total).toFixed(1)}x the total (${total}) - verify data integrity`
        );
      } else if (ratingsSum > total) {
        warnings.push(
          `Ratings sum (${ratingsSum}) exceeds total (${total}) by ${((ratingsSum/total - 1) * 100).toFixed(1)}%`
        );
      }
    }

    // ⭐ REGLA 2: Validar proporciones razonables cuando no hay filtros extremos
    // Si las sumas están MUY por debajo del total, puede indicar datos faltantes
    const MINIMUM_COVERAGE = 0.5; // 50%

    if (total > 10) { // Solo validar si hay suficientes datos
      if (fixersSum > 0 && fixersSum < total * MINIMUM_COVERAGE) {
        warnings.push(
          `Fixers sum (${fixersSum}) is only ${((fixersSum/total) * 100).toFixed(1)}% of total (${total}) - possible missing data`
        );
      }

      if (citiesSum > 0 && citiesSum < total * MINIMUM_COVERAGE) {
        warnings.push(
          `Cities sum (${citiesSum}) is only ${((citiesSum/total) * 100).toFixed(1)}% of total (${total}) - possible missing data`
        );
      }

      if (categoriesSum > 0 && categoriesSum < total * MINIMUM_COVERAGE) {
        warnings.push(
          `Categories sum (${categoriesSum}) is only ${((categoriesSum/total) * 100).toFixed(1)}% of total (${total}) - possible missing data`
        );
      }
    }

    return { errors, warnings, breakdown };
  }

  /**
   * Suma todos los valores de un objeto de conteos
   */
  private static sumCounts(counts: CountObject): number {
    return Object.values(counts).reduce((sum, count) => sum + count, 0);
  }

  /**
   * Valida un objeto de conteo individual
   */
  private static validateCountObject(
    name: string,
    counts: CountObject,
    errors: string[],
    warnings: string[]
  ): void {
    const keys = Object.keys(counts);
    const seenKeys = new Set<string>();

    for (const key of keys) {
      const value = counts[key];

      // Verificar conteos negativos
      if (value < 0) {
        errors.push(`${name}.${key} has negative count: ${value}`);
      }

      // Verificar que sea un número válido
      if (!Number.isFinite(value)) {
        errors.push(`${name}.${key} has invalid count: ${value}`);
      }

      // Verificar duplicados (case-insensitive para detectar posibles errores)
      const keyLower = key.toLowerCase();
      if (seenKeys.has(keyLower)) {
        warnings.push(`${name} has potential duplicate key: "${key}"`);
      }
      seenKeys.add(keyLower);

      // Advertencia para conteos de 0
      if (value === 0) {
        warnings.push(`${name}.${key} has zero count`);
      }
    }
  }

  /**
   * Valida que no haya claves vacías o inválidas
   */
  private static validateEmptyKeys(
    name: string,
    counts: CountObject,
    errors: string[]
  ): void {
    for (const key of Object.keys(counts)) {
      if (!key || key.trim() === '') {
        errors.push(`${name} contains empty or whitespace-only key`);
      }
    }
  }

  /**
   * Detecta valores inusualmente altos que podrían indicar un error
   */
  private static checkUnusuallyHighValues(
    counts: CountObject,
    name: string,
    warnings: string[]
  ): void {
    const values = Object.values(counts);
    if (values.length === 0) return;

    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    // Si el máximo es más de 100 veces el promedio, podría ser un error
    if (max > avg * 100 && avg > 0) {
      warnings.push(
        `${name} has unusually high value (${max}) compared to average (${avg.toFixed(2)})`
      );
    }
  }

  /**
   * Valida la consistencia de los datos (método auxiliar para uso futuro)
   */
  static validateConsistency(
    fixers: CountObject,
    cities: CountObject,
    categories: CountObject,
    total: number
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // La suma de conteos individuales puede ser diferente al total
    // debido a agregaciones, pero podemos advertir sobre grandes discrepancias
    const fixerSum = Object.values(fixers).reduce((a, b) => a + b, 0);
    
    if (fixerSum > 0 && total > 0) {
      const ratio = fixerSum / total;
      
      // Si la suma de fixers es muy diferente al total, advertir
      if (ratio > 1.5 || ratio < 0.5) {
        warnings.push(
          `Fixer count sum (${fixerSum}) differs significantly from total (${total}). Ratio: ${ratio.toFixed(2)}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}