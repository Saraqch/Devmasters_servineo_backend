import { Request, Response } from 'express';
import { connectDB } from '../../config/db/mongoClient';
import * as jobRatingDetailsService from './job-rating-details.service';
import { ObjectId } from 'mongodb';

export async function getJobRatingDetails(req: Request, res: Response) {
  try {
    const { jobId, fixerId } = req.params;

    if (!jobId || !fixerId) {
      return res.status(400).json({ message: 'Missing jobId or fixerId' });
    }

    const db = await connectDB();
    const details = await jobRatingDetailsService.getJobRatingDetails(
      db,
      new ObjectId(jobId),
      new ObjectId(fixerId),
    );

    if (!details) {
      return res.status(404).json({ message: 'Job not found or does not belong to fixer' });
    }

    return res.status(200).json(details);
  } catch (error) {
    console.error('Error fetching job rating details:', error);
    return res.status(500).json({ message: 'Error fetching job rating details' });
  }
}
