import { Router } from 'express';
//import serviciosRoutes from './routes/servicios.routes';
//import jobRoutes from './routes/offer.routes'
//import sortRoutes from './routes/sort.routes'
import jobOfertRoutes from './routes/jobOfert.routes';

const devmasterRoutes = Router();

//devmasterRoutes.use(serviciosRoutes);
//devmasterRoutes.use('/offers', jobRoutes);
//devmasterRoutes.use(sortRoutes);
devmasterRoutes.use(jobOfertRoutes);

export default devmasterRoutes;
