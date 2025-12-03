import { Router } from 'express';
import * as JobRatingDetailsController from './job-rating-details.controller';

const router = Router();

router.get('/job-rating-details/:fixerId/:jobId', JobRatingDetailsController.getJobRatingDetails);

export default router;
