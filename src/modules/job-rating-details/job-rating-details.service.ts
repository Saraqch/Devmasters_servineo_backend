import { Db, ObjectId } from 'mongodb';
import { JobRatingDetails } from './job-rating-details.model';

export async function getJobRatingDetails(
  db: Db,
  jobId: ObjectId,
  fixerId: ObjectId,
): Promise<JobRatingDetails | null> {
  const collection = db.collection('jobs');

  if (!ObjectId.isValid(jobId)) {
    throw new Error('Invalid job ID');
  }

  const job = await collection.findOne<JobRatingDetails>({
    _id: jobId,
    fixerId,
    rating: { $exists: true },
    status: { $regex: /^Payed$/i },
  });

  if (!job) return null;

  return {
    _id: job._id.toString(),
    fixerId: job.fixerId.toString(),
    title: job.title,
    description: job.description,
    type: job.type,
    rating: job.rating,
    comment: job.comment,
    createdAt: job.createdAt,
  };
}
