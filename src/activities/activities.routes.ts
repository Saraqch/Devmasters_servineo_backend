import { Router } from 'express';
import * as ActivityController from './activities.controller';

const router = Router();

router.post('/ActivityReviews', ActivityController.createActivityController);
router.get('/ActivityReviews', ActivityController.getActivities);

export default router;
