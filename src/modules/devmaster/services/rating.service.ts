import { Review } from '../models/review.model';
import { Types } from 'mongoose';

/**
 * Interfaz para el promedio de calificación de un fixer
 */
export interface FixerRating {
  fixerId: string;
  averageRating: number;
  totalReviews: number;
}

/**
 * Obtiene los promedios de calificación para múltiples fixers
 */
export const getMultipleFixersRatings = async (
  fixerIds: string[],
): Promise<Map<string, FixerRating>> => {
  try {
    const objectIds = fixerIds.map((id) => new Types.ObjectId(id));

    // Agregación de MongoDB para promedios y conteo
    const ratingsAggregation = await Review.aggregate([
      { $match: { reviewedId: { $in: objectIds } } },
      {
        $group: {
          _id: '$reviewedId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const ratingsMap = new Map<string, FixerRating>();

    // Agregar fixers con calificación calculada
    ratingsAggregation.forEach((r) => {
      ratingsMap.set(r._id.toString(), {
        fixerId: r._id.toString(),
        averageRating: Math.round(r.averageRating * 100) / 100,
        totalReviews: r.totalReviews,
      });
    });

    // Agregar fixers sin calificación
    fixerIds.forEach((fixerId) => {
      if (!ratingsMap.has(fixerId)) {
        ratingsMap.set(fixerId, {
          fixerId,
          averageRating: 0,
          totalReviews: 0,
        });
      }
    });

    return ratingsMap;
  } catch (error) {
    console.error('Error obteniendo ratings de múltiples fixers:', error);

    // En caso de error, devolver todos con rating 0
    const emptyMap = new Map<string, FixerRating>();
    fixerIds.forEach((fixerId) => {
      emptyMap.set(fixerId, {
        fixerId,
        averageRating: 0,
        totalReviews: 0,
      });
    });
    return emptyMap;
  }
};
