import { Router } from 'express';

const router = Router();

// endpoint de prueba para servicios
router.get('/services', (req, res) => {
  res.json([
    { name: 'Carpintería', description: 'Servicio de carpintería general' },
    { name: 'Plomería', description: 'Reparaciones de plomería' },
  ]);
});

export default router;
