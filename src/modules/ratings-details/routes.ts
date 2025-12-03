import { Router } from 'express';
import { RatingDetailsController } from './controller';

const router = Router();

router.get('/:fixerId', RatingDetailsController.getRatings);

export default router;
