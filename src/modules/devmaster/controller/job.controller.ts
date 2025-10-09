import { Request, Response } from 'express';
import { getAllJobs, getJobById } from '../services/job.service';

export const getJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await getAllJobs();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los trabajos', error });
  }
};

export const getJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await getJobById(id);
    if (!job) {
      return res.status(404).json({ message: 'Trabajo no encontrado' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el trabajo', error });
  }
};
