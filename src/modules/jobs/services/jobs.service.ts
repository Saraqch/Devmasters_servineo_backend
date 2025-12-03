import { ObjectId } from 'mongodb';
import { connectDB } from '../../../config/db/mongoClient';
import { calculateDistance } from '../utils/distance-util';

export const changeJobStatus = async (jobId: string, newStatus: string) => {
  const db = await connectDB();
  const result = await db
    .collection('jobs')
    .updateOne({ _id: new ObjectId(jobId) }, { $set: { status: newStatus } });

  if (result.matchedCount === 0) {
    throw new Error('Job not found');
  }

  return result;
};

export const completeJobWithValidation = async (
  jobId: string,
  location: { lat: number; lng: number },
) => {
  const db = await connectDB();
  const job = await db.collection('jobs').findOne({ _id: new ObjectId(jobId) });

  if (!job) {
    throw new Error('Job not found');
  }

  const scheduledStart = new Date(job.scheduledStart);
  const scheduledEnd = new Date(job.scheduledEnd);
  const now = new Date();

  if (now < scheduledStart || now > scheduledEnd) {
    throw new Error('Job cannot be completed outside the scheduled time.');
  }

  const distance = calculateDistance(
    job.location.lat,
    job.location.lng,
    location.lat,
    location.lng,
  );

  if (distance > 100) {
    throw new Error('You are too far from the job location to complete it.');
  }

  const updateResult = await db
    .collection('jobs')
    .updateOne({ _id: new ObjectId(jobId) }, { $set: { status: 'completed', completedAt: now } });

  if (updateResult.modifiedCount === 0) {
    throw new Error('Failed to mark job as completed.');
  }

  return { success: true, jobId, completedAt: now };
};
