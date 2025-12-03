import { Db, ObjectId } from 'mongodb';
import { FixerAverage } from './rating.model';

export async function getFixerAverageRating(db: Db, fixerId: ObjectId): Promise<FixerAverage> {
  const collection = db.collection('jobs');

  const pipeline = [
    {
      $match: {
        fixerId,
        rating: { $exists: true },
        status: { $regex: /^Pagado$/i },
      },
    },
    {
      $group: {
        _id: '$fixerId',
        total: { $sum: 1 },
        weightedSum: { $sum: '$rating' },
      },
    },
    {
      $project: {
        fixerId: '$_id',
        total: 1,
        average: {
          $round: [{ $divide: ['$weightedSum', '$total'] }, 1],
        },
        _id: 0,
      },
    },
  ];
  const results = await collection.aggregate<FixerAverage>(pipeline).toArray();
  return results[0];
}
