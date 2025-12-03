import { Request, Response } from 'express';
import { getCompletedJobs } from './jobs.service';

export async function getCompletedJobsController(req: Request, res: Response) {
  try {
    const jobs = await getCompletedJobs();
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching completed jobs:', error);
    res.status(500).json({ message: 'Error fetching completed jobs' });
  }
}
