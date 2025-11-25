// services/common/filter.common.ts
export class FilterCommon {
  static build(filters: Record<string, any>): any {
    const query: any = {};

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

  static combine(...queries: any[]): any {
    return queries.reduce((acc, query) => ({ ...acc, ...query }), {});
  }
}
