import { Router } from 'express';
import JobsRoutes from './jobs/jobs.routes';

const router = Router();

router.use('/fixers', JobsRoutes);

export default router;
