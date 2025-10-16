// src/controller/servicios.controller.ts
import { Request, Response } from 'express';
import { Offer } from '../models/offer.model';
import { normalizeSearchText } from '../utils/search.normalizer';

export async function getServiciosByName(req: Request, res: Response) {
  let name = typeof req.query.name === 'string' ? req.query.name : '';
  const context = typeof req.query.context === 'string' ? req.query.context : '';

  if (name.length > 100) {
    return res.json({ total: 0, data: [] });
  }

  const allowedCharsRegex = /^[A-Za-z0-9_.\-, ÅåÜüáéíóúÁÉÍÓÚñÑ]*$/;
  if (!allowedCharsRegex.test(name)) {
    return res.json({ total: 0, data: [] });
  }

  name = normalizeSearchText(name);
  if (!name) {
    return res.json({ total: 0, data: [] });
  }

  console.log('Context:', context);

  // Filtro general
  const filter = {
    $or: [
      { fixerName: { $regex: name, $options: 'i' } },
      { title: { $regex: name, $options: 'i' } },
      { description: { $regex: name, $options: 'i' } },
      { category: { $regex: name, $options: 'i' } },
      { city: { $regex: name, $options: 'i' } },
      { tags: { $regex: name, $options: 'i' } },
    ],
  };

  try {
    const [data, total] = await Promise.all([
      Offer.find(filter).limit(50).lean(),
      Offer.countDocuments(filter),
    ]);
    return res.json({ total, data });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
//hola buenas noches
