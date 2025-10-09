import { Router } from 'express';
import { getJobs, getJob } from '../controller/job.controller';

const router = Router();

router.get('/jobs', getJobs); // GET all jobs
router.get('/jobs/:id', getJob); // GET job by ID

export default router;
