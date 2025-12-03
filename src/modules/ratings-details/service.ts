import { Db } from 'mongodb';
import * as Model from './model';

export class RatingDetailsService {
  constructor(private db: Db) {}

  async getRatings(fixerId: string) {
    const ratings = await Model.getRatingsByFixer(this.db, fixerId);
    return ratings;
  }
}
