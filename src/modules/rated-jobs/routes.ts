import { Router } from 'express';
import { getRatedJobs } from './controller';

const router = Router();

// Endpoint: GET /api/rated-jobs
router.get('/', getRatedJobs);

export default router;
