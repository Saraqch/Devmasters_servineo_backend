import { Request, Response } from 'express';
import { connectDB } from '../../config/db/mongoClient';
import * as jobService from './requested-jobs.service';

export async function getAllJobs(req: Request, res: Response) {
  try {
    const db = await connectDB();
    const jobs = await jobService.getAllJobs(db);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
}

export async function getJobById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const db = await connectDB();
    const job = await jobService.getJobById(db, id);

    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Error fetching job' });
  }
}

export async function createJob(req: Request, res: Response) {
  try {
    const jobData = req.body;
    const db = await connectDB();
    const newJob = await jobService.createJob(db, jobData);
    res.status(201).json(newJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Error creating job' });
  }
}
