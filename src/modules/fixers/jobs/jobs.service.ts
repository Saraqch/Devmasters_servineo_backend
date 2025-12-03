import { Db, ObjectId, type Filter } from 'mongodb';
import type { JobDoc, JobResponse } from './job.model';

export async function getJobsByFixerId(db: Db, fixerId: string): Promise<JobResponse[]> {
  const collection = db.collection<JobDoc>('jobs');

  let filter: Filter<JobDoc> = { fixerId } as unknown as Filter<JobDoc>;
  if (ObjectId.isValid(fixerId)) {
    filter = { $or: [{ fixerId }, { fixerId: new ObjectId(fixerId) }] } as Filter<JobDoc>;
  }

  const jobDocs = await collection.find(filter).sort({ createdAt: -1 }).toArray();

  return jobDocs.map((jobDoc) => ({
    _id: jobDoc._id.toString(),
    title: jobDoc.title,
    description: jobDoc.description,
    status: jobDoc.status,
    requesterId: jobDoc.requesterId,
    fixerId: typeof jobDoc.fixerId === 'string' ? jobDoc.fixerId : jobDoc.fixerId.toHexString(),
    price: jobDoc.price,
    createdAt:
      typeof jobDoc.createdAt === 'string'
        ? jobDoc.createdAt
        : new Date(jobDoc.createdAt).toISOString(),
    ...(jobDoc.rating !== undefined ? { rating: jobDoc.rating } : {}),
    ...(jobDoc.comment ? { comment: jobDoc.comment } : {}),
  }));
}
