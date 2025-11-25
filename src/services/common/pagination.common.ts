// services/common/pagination.common.ts
export class PaginationCommon {
  static getOptions(limit?: number, skip?: number) {
    return {
      limit: limit || 10,
      skip: skip || 0,
    };
  }

  static getPageOptions(page: number = 1, pageSize: number = 10) {
    return {
      limit: pageSize,
      skip: (page - 1) * pageSize,
    };
  }
}
