import { Request, Response } from 'express';
import { Job } from '../models/job.model';

// Obtener todas las ofertas de trabajo
export const getAllJobs = async (_req: Request, res: Response) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener ofertas de trabajo de un fixer específico
export const getJobsByFixer = async (req: Request<{ fixerId: string }>, res: Response) => {
  try {
    const { fixerId } = req.params;
    const jobs = await Job.find({ fixerId });
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Crear una oferta de trabajo (solo fixer)
export const createJob = async (req: Request, res: Response) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Editar una oferta de trabajo (solo fixer dueño)
export const updateJob = async (req: Request<{ jobId: string }, {}, any>, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findOneAndUpdate(
      { _id: jobId, fixerId: req.body.fixerId },
      req.body,
      { new: true }
    );
    if (!job) return res.status(404).json({ error: 'Job not found or not authorized' });
    res.json(job);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar una oferta de trabajo (solo fixer dueño)
export const deleteJob = async (req: Request<{ jobId: string }, {}, any>, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findOneAndDelete({ _id: jobId, fixerId: req.body.fixerId });
    if (!job) return res.status(404).json({ error: 'Job not found or not authorized' });
    res.json({ message: 'Job deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};