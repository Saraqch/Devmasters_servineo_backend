import { Router } from 'express';
import * as JobController from '../controllers/jobs.controller';

const router = Router();

router.post('/JobsReviews', JobController.createJobController);
router.get('/JobsReviews', JobController.getJobs);
router.get('/JobsReviews/:id', JobController.getJob);

export default router;
