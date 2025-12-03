import { Router } from 'express';
import { getCompletedJobsController } from './jobs.controller';
import { changeToPendingPaymentController } from './controllers/jobs.controller';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Jobs endpoint is working' });
});
router.patch('/:jobId', changeToPendingPaymentController);
router.get('/completed', getCompletedJobsController);

export default router;
