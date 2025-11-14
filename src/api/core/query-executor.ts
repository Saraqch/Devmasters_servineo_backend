// src/api/core/query-executor.ts
import { Model, FilterQuery, QueryOptions } from 'mongoose';

type MongoSort = QueryOptions['sort'];

export class QueryExecutor {
  static async execute<T>(
    model: Model<T>,
    query: FilterQuery<T>,
    sort: MongoSort,
    skip: number,
    limit: number,
  ): Promise<{ data: T[]; count: number }> {
    const [data, count] = await Promise.all([
      model.find(query).sort(sort).skip(skip).limit(limit).lean().exec(),
      model.countDocuments(query).exec(),
    ]);

    return { data: data as T[], count };
  }

  static async findAll<T>(
    model: Model<T>,
    query: FilterQuery<T> = {} as FilterQuery<T>,
    sort: MongoSort = { createdAt: -1 },
  ): Promise<T[]> {
    return (await model.find(query).sort(sort).lean().exec()) as T[];
  }

  static async count<T>(
    model: Model<T>,
    query: FilterQuery<T> = {} as FilterQuery<T>,
  ): Promise<number> {
    return await model.countDocuments(query).exec();
  }
}
