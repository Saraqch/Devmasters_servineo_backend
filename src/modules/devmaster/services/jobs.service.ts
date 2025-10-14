// src/services/job.service.ts

import { IJob, Job } from "../model/job.model";


export const getAllJobs = async (): Promise<IJob[]> => {
  return await Job.find(); // Trae todos los jobs
};

export const getJobById = async (id: string): Promise<IJob | null> => {
  return await Job.findById(id); // Trae un job por ID
};
