import { Router } from 'express';
import HealthRoutes from '../modules/health/health.routes';
import devmasterRoutes from '../modules/devmaster/main';

const router = Router();

router.use('/api', HealthRoutes);
router.use('/api/devmaster', devmasterRoutes);

router.use((req, res) => {
  console.log('Not found:', req.method, req.originalUrl);
  res.status(404).send({
    message: 'route not found',
  });
});

export default router;
