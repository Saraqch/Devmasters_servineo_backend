import { Router } from 'express';
import {
  getAllJobs,
  getJobsByFixer,
  createJob,
  updateJob,
  deleteJob
} from '../controllers/job.controller';

const router = Router();

router.get('/', getAllJobs);
router.get('/fixer/:fixerId', getJobsByFixer); 
router.post('/', createJob);
router.patch('/:jobId', updateJob);
router.delete('/:jobId', deleteJob);

export default router;