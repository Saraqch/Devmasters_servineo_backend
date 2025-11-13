import { Router } from 'express';
import { crearOfertaTrabajo } from '../controllers/newJobOffers.controller';

const router = Router();

router.post('/', async (req, res) => { // POST http://localhost:8000/api/newOffers
  try {
    const { description, city, services, price, fixerId, fixerName, whatsapp, photos, location } = req.body;

    if (!fixerId || !fixerName || !whatsapp) {
      return res.status(400).json({ error: 'fixerId, fixerName y whatsapp son obligatorios' });
    }

    const result = await crearOfertaTrabajo({
      fixerId,
      fixerName,
      description,
      city,
      services,
      price,
      whatsapp,
      photos: photos || [],
      location,
    });

    res.status(201).json({
      id: result.insertedId,
      message: 'Oferta creada exitosamente',
    });
  } catch (error: any) {
    console.error('Error al crear oferta:', error);
    res.status(500).json({ error: error.message || 'Error interno' });
  }
});

export default router;