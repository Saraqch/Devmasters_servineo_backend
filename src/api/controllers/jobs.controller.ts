import { Request, Response } from 'express';
import { Job } from '../../models/jobs.model';

export async function createJobController(req: Request, res: Response) {
  try {
    const job = await Job.create(req.body);
    res.status(200).json(job);
  } catch (error) {
    console.log('Error to create Job:', error);
    res.status(500).json({ error: 'Error creating Job' });
  }
}

export async function getJobs(req: Request, res: Response) {
  try {
    const jobs = await Job.find({});
    res.status(200).json(jobs);
  } catch (error) {
    console.log('Error to get Jobs:', error);
    res.status(500).json({ error: 'Error getting Jobs' });
  }
}

export async function getJob(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error) {
    console.log('Error to get Job:', error);
    res.status(500).json({ error: 'Error getting Job' });
  }
}

export async function updateJob(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const job = await Job.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json(job);
  } catch (error) {
    console.log('Error to update Job:', error);
    res.status(500).json({ error: 'Error updating Job' });
  }
}

export async function deleteJob(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({ message: 'Job deleted successfully', job });
  } catch (error) {
    console.log('Error to delete Job:', error);
    res.status(500).json({ error: 'Error deleting Job' });
  }
}
