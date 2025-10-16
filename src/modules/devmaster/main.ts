import { Router } from 'express';
import serviciosRoutes from './routes/servicios.routes';
import jobRoutes from './routes/offer.routes'

const devmasterRoutes = Router();

devmasterRoutes.use(serviciosRoutes);
devmasterRoutes.use('/offers', jobRoutes);

export default devmasterRoutes;
