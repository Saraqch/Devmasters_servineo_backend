// src/api/core/filter.builder.ts

type FilterValue = string | number | boolean | RegExp | string[] | number[] | undefined | null;
type FilterInput = Record<string, FilterValue>;

// Operadores de comparación de MongoDB
type MongoComparisonOperators = {
  $eq?: unknown;
  $ne?: unknown;
  $gt?: unknown;
  $gte?: unknown;
  $lt?: unknown;
  $lte?: unknown;
  $in?: unknown[];
  $nin?: unknown[];
};

type MongoQuery = Record<string, FilterValue | MongoComparisonOperators>;

export class FilterBuilder {
  static build(filters: FilterInput): MongoQuery {
    const query: MongoQuery = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        if (value.length > 0) {
          query[key] = { $in: value };
        }
      } else if (value instanceof RegExp) {
        query[key] = value;
      } else {
        query[key] = value;
      }
    });
    return query;
  }

  static combine(...queries: MongoQuery[]): MongoQuery {
    return queries.reduce((acc, query) => ({ ...acc, ...query }), {});
  }
}
