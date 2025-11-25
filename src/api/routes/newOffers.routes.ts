import { Router } from 'express';
import {
  crearOfertaTrabajo,
  obtenerTodasLasOfertas,
  obtenerOfertasPorFixer,
  actualizarOferta,
  eliminarOferta
} from '../controllers/newJobOffers.controller';

const router = Router();

// GET todas las ofertas
router.get('/', async (req, res) => {
  try {
    const ofertas = await obtenerTodasLasOfertas();
    res.status(200).json(ofertas);
  } catch (error: any) {
    console.error('Error al obtener ofertas:', error);
    res.status(500).json({ error: error.message || 'Error interno' });
  }
});

// GET ofertas por fixer
router.get('/fixer/:fixerId', async (req, res) => {
  try {
    const { fixerId } = req.params;
    const ofertas = await obtenerOfertasPorFixer(fixerId);
    res.status(200).json(ofertas);
  } catch (error: any) {
    console.error('Error al obtener ofertas del fixer:', error);
    res.status(500).json({ error: error.message || 'Error interno' });
  }
});

// POST crear nueva oferta
router.post('/', async (req, res) => {
  try {
    const { description, city, services, price, fixerId, fixerName, whatsapp, photos, location, title } = req.body;

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
      title,
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

// PUT actualizar oferta
router.put('/:offerId', async (req, res) => {
  try {
    const { offerId } = req.params;
    const updateData = req.body;

    const result = await actualizarOferta(offerId, updateData);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error al actualizar oferta:', error);
    res.status(500).json({ error: error.message || 'Error interno' });
  }
});

// DELETE eliminar oferta
router.delete('/:offerId', async (req, res) => {
  try {
    const { offerId } = req.params;

    await eliminarOferta(offerId);
    res.status(200).json({ message: 'Oferta eliminada exitosamente' });
  } catch (error: any) {
    console.error('Error al eliminar oferta:', error);
    res.status(500).json({ error: error.message || 'Error interno' });
  }
});

export default router;