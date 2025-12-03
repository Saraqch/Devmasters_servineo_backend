import { Router } from 'express';
import * as controller from './requested-jobs.controller';

const router = Router();

router.get('/', controller.getAllJobs);
router.get('/:id', controller.getJobById);
router.post('/', controller.createJob);

export default router;
