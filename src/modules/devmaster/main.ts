import { Router } from 'express';
import serviceRoutes from './routes/service.routes';
import jobRoutes from './routes/job.routes';

const devmasterRoutes = Router();

devmasterRoutes.use(serviceRoutes);
devmasterRoutes.use(jobRoutes);

export default devmasterRoutes;
