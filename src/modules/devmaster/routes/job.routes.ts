// import { Router } from 'express';
// import { getJobs, getJob } from '../controller/job.controller';

// const router = Router();

// router.get('/jobs', getJobs); // GET all jobs
// router.get('/jobs/:id', getJob); // GET job by ID

// export default router;
// src/routes/job.routes.ts

import { Router } from 'express';
import { getJob, getJobs } from '../controller/jobs.controller';

const router = Router();

router.get('/jobs', getJobs);       // Todos los jobs
router.get('/jobs/:id', getJob);    // Job por ID

export default router;
