import { Request, Response } from 'express';
import { FixerService } from "../../services/common/FixerService";
import { EnableFixerInput } from "../../types/EnableFixerInput";
import { Offer } from "../../models/offer.model"; // ← AÑADIDO

const fixerService = new FixerService();

export async function enableFixer(req: Request, res: Response) {
  try {
    const data: EnableFixerInput = req.body;

    if (!data.userId) {
      return res.status(400).json({ error: 'userId es obligatorio' });
    }

    const result = await fixerService.enableFixer(data);

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error habilitando fixer:', error);
    res.status(500).json({ error: error.message || 'Error interno' });
  }
}

export const getMyOffers = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(400).json({ error: 'userId es obligatorio' });
    }

    // Contar total
    const total = await Offer.countDocuments({ fixerId: userId });

    // Obtener ofertas con paginación
    const offers = await Offer.find({ fixerId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      count: offers.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: offers,
    });
  } catch (error: any) {
    console.error('Error obteniendo mis ofertas:', error);
    res.status(500).json({ error: error.message || 'Error interno' });
  }
};