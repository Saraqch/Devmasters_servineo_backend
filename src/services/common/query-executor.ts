// services/common/query-executor.service.ts
export class QueryExecutor {
  static async execute<T>(
    model: any,
    query: any,
    sort: any,
    skip: number,
    limit: number,
  ): Promise<{ data: T[]; count: number }> {
    const [data, count] = await Promise.all([
      model.find(query).sort(sort).skip(skip).limit(limit).lean().exec(),
      model.countDocuments(query).exec(),
    ]);

    return { data, count };
  }

  static async findAll<T>(
    model: any,
    query: any = {},
    sort: any = { createdAt: -1 },
  ): Promise<T[]> {
    return await model.find(query).sort(sort).lean().exec();
  }

  static async count(model: any, query: any = {}): Promise<number> {
    return await model.countDocuments(query).exec();
  }
}
