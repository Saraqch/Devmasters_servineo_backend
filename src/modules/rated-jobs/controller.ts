import { Request, Response } from 'express';
import { connectDB } from '../../config/db/mongoClient'; // importante: usa la ruta correcta
import { getSortConfig } from './sort.service';

export const getRatedJobs = async (req: Request, res: Response) => {
  try {
    const db = await connectDB();
    const jobsCollection = db.collection('jobs');

    // Obtener parámetros de ordenamiento
    const { sortBy } = req.query;
    const sortConfig = getSortConfig(sortBy as string);

    // Trae todos los jobs que tienen rating
    const ratedJobs = await jobsCollection
      .find({ rating: { $exists: true } })
      .sort(sortConfig)
      .toArray();

    // Filtrar solo los campos relevantes
    const data = ratedJobs.map((job) => ({
      id: job._id.toString(),
      title: job.title,
      dateISO: job.createdAt,
      rating: job.rating,
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching rated jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rated jobs',
    });
  }
};
