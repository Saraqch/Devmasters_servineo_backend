import { Router } from 'express';
import { getMapLocations, getTrackingMetrics, getFixerStats } from '../controllers/tracking-appointments.controller';

const router = Router();
router.get('/map-locations', getMapLocations);
router.get('/metrics', getTrackingMetrics);
router.get('/fixer-stats', getFixerStats);

export default router;