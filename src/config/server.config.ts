// src/config/server.config.ts
import express from 'express';
import cors from 'cors';
import AppRoutes from './server.routes';

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// Si necesitás permitir varios orígenes en el futuro, podés convertir origin en función.
// Por ahora, usamos el valor de env (dev o prod)
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(AppRoutes);

// En desarrollo se puede mantener una ruta raíz para debug
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => res.send('Servidor Express (dev) listo'));
}

export default app;
