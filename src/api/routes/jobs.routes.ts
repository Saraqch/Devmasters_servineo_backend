import { Router } from 'express';
import * as JobController from '../controllers/jobs.controller';

const router = Router();

router.post('/JobsReviews', JobController.createJobController);
router.get('/JobsReviews', JobController.getJobs);
router.get('/JobsReviews/:id', JobController.getJob);
router.put('/JobsReviews/:id', JobController.updateJob);
router.delete('/JobsReviews/:id', JobController.deleteJob);

export default router;
