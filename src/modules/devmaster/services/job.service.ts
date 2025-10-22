import { Job } from '../models/job.model';

// Obtener todos los trabajos
export const getAllJobs = async () => {
  return await Job.find();
};

// (Opcional) Obtener un trabajo por ID
export const getJobById = async (id: string) => {
  return await Job.findById(id);
};
