import { Router } from 'express';
import * as JobController from '../controllers/jobs.controller';

const router = Router();

router.post('/JobsReviews', JobController.createJobController);
router.get('/JobsReviews', JobController.getJobs);
router.get('/JobsReviews/:id', JobController.getJob);
router.put('/JobsReviews/:id', JobController.updateJob);
router.delete('/JobsReviews/:id', JobController.deleteJob);

// Nuevo endpoint: trabajos (servicios) con sus fixers asociados
// Esta ruta será la que consuma el frontend para "Fixers por trabajo"
router.get('/jobs/with-fixers', JobController.getJobsWithFixers);

export default router;
