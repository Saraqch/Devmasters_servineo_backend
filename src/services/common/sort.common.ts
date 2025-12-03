// services/common/sort.common.ts
export class SortService {
  static build(sortConfig: Record<string, 1 | -1>): any {
    return Object.keys(sortConfig).length > 0 ? sortConfig : { createdAt: -1 };
  }

  static byField(field: string, order: 'asc' | 'desc' = 'asc'): any {
    return { [field]: order === 'asc' ? 1 : -1 };
  }

  static byMultipleFields(fields: Array<{ field: string; order: 'asc' | 'desc' }>): any {
    const sort: any = {};
    fields.forEach(({ field, order }) => {
      sort[field] = order === 'asc' ? 1 : -1;
    });
    return sort;
  }
}
