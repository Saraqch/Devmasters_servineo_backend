import { Router } from 'express';
import * as ProfileController from './rating.controller';

const router = Router();

router.get('/average/:fixerId', ProfileController.getFixerAverage);

export default router;
