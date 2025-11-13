import express from 'express';
import cors from 'cors';
import HealthRoutes from './api/routes/health.routes';
import jobOfertRoutes from './api/routes/jobOfert.routes';
import newoffersRoutes from './api/routes/newOffers.routes';
import fixerRoutes from './api/routes/fixer.routes';
import activityRoutes from './api/routes/activities.routes';
import jobsRoutes from './api/routes/jobs.routes';

import searchRoutes from './api/routes/search.routes';
const app = express();

app.use(
  cors({
    origin: [
      'https://devmasters-servineo-frontend-zk3q.vercel.app',
      'http://localhost:8080',
      'http://localhost:8081',
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', HealthRoutes);
app.use('/api/devmaster', jobOfertRoutes);
app.use('/api/newOffers', newoffersRoutes);
app.use('/api/fixers', fixerRoutes);
app.use('/api', activityRoutes);
app.use('/api', jobsRoutes);
app.use('/api', searchRoutes);

app.use((req, res) => {
  console.log('Not found:', req.method, req.originalUrl);
  res.status(404).send({
    message: 'route not found',
  });
});

export default app;
