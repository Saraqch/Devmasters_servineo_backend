import { Request, Response } from 'express';
import { Job } from '../../models/jobs.model';
import { User } from '../../models/user.model';

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

// Nuevo: obtener lista de trabajos (servicios) con sus fixers asociados
// No devuelve ofertas, sino personas (fixers) agrupadas por servicio
export async function getJobsWithFixers(_req: Request, res: Response) {
  try {
    // 1. Obtener todos los usuarios que son fixers y tienen fixerProfile
    const fixers = await User.find({ role: 'fixer', fixerProfile: { $exists: true } }).lean();

    // 2. Construir conjunto de servicios distintos
    const serviceSet = new Set<string>();
    for (const fixer of fixers) {
      const services = (fixer as any).fixerProfile?.services as string[] | undefined;
      if (Array.isArray(services)) {
        for (const service of services) {
          if (service) {
            serviceSet.add(service);
          }
        }
      }
    }

    // 3. Para cada servicio, obtener los fixers que lo ofrecen
    const jobsWithFixers = Array.from(serviceSet).map((service) => {
      const fixersForService = fixers
        .filter((fixer) => (fixer as any).fixerProfile?.services?.includes(service))
        .map((fixer) => ({
          id: (fixer as any)._id.toString(),
          name: fixer.name,
          city: '', // se puede rellenar más adelante si agregas ciudad al modelo
          rating: 0, // placeholder hasta tener sistema de reseñas
          avatar: (fixer as any).fixerProfile?.photoUrl || undefined,
        }));

      return {
        jobType: service,
        fixers: fixersForService,
      };
    });

    return res.status(200).json({
      success: true,
      data: jobsWithFixers,
    });
  } catch (error: any) {
    console.log('Error to get JobsWithFixers:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error getting Jobs with Fixers',
    });
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
