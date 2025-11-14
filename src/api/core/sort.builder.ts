// src/api/core/sort.builder.ts

type MongoSortOrder = 1 | -1;
type MongoSortConfig = Record<string, MongoSortOrder>;

export class SortBuilder {
  static build(sortConfig: Record<string, 1 | -1>): MongoSortConfig {
    return Object.keys(sortConfig).length > 0 ? sortConfig : { createdAt: -1 };
  }

  static byField(field: string, order: 'asc' | 'desc' = 'asc'): MongoSortConfig {
    return { [field]: order === 'asc' ? 1 : -1 };
  }

  static byMultipleFields(
    fields: Array<{ field: string; order: 'asc' | 'desc' }>,
  ): MongoSortConfig {
    const sort: MongoSortConfig = {};
    fields.forEach(({ field, order }) => {
      sort[field] = order === 'asc' ? 1 : -1;
    });
    return sort;
  }
}
