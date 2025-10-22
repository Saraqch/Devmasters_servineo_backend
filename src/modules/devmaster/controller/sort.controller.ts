// src/modules/devmaster/controller/sort.controller.ts
import { Request, Response } from 'express';
import { getAllOffers } from '../services/sort.service';
import { SortCriteria, DEFAULT_SORT_CONFIG } from '../utils/queryParams.types';
import { createErrorResponse, logError } from '../utils/errorHandler';

/**
 * Obtener lista de fixers con ordenamiento
 */
export const getFixers = async (req: Request, res: Response) => {
  try {
    const sortByQuery = ((req.query.sortBy as string) || String(DEFAULT_SORT_CONFIG.sortBy)).toLowerCase();

    // Validar que sortBy sea un valor permitido (enum values son strings)
    const validSortValues = Object.values(SortCriteria) as string[];
    const sortBy = validSortValues.includes(sortByQuery)
      ? (sortByQuery as SortCriteria)
      : DEFAULT_SORT_CONFIG.sortBy;

    const result = await getAllOffers({ sortBy });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    logError(error, 'getFixers');
    return res.status(500).json(createErrorResponse(error, 'Error al obtener fixers'));
  }
};
