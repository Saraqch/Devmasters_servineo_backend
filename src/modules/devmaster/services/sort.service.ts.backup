import { User } from '../modules/user.model';
import { SortCriteria, DEFAULT_SORT_CONFIG } from '../utils/queryParams.types';
import { getMultipleFixersRatings } from './rating.service';

function normalize(text: string): string {
  return text
    ? text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    : '';
}

export const getAllFixers = async (options?: { sortBy?: SortCriteria }) => {
  const sortBy = options?.sortBy || DEFAULT_SORT_CONFIG.sortBy;
  const fixers = await User.find({ role: 'fixer' }).select('name createdAt').lean();

  // Obtener perfiles
  const userIds = fixers.map((f) => f._id);

  const ratingsMap = await getMultipleFixersRatings(userIds.map((id) => id.toString()));

  // Combinar datos
  const combinedFixers = fixers.map((fixer) => {
    const rating = ratingsMap.get(fixer._id.toString());

    return {
      _id: fixer._id,
      name: fixer.name,
      createdAt: fixer.createdAt,
      rating: rating?.averageRating || 0,
      totalReviews: rating?.totalReviews || 0,
    };
  });

  combinedFixers.sort((a, b) => {
    switch (sortBy) {
      case SortCriteria.DATE_RECENT:
        return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
      case SortCriteria.NAME_ASC:
        return normalize(a.name).localeCompare(normalize(b.name));
      case SortCriteria.NAME_DESC:
        return normalize(b.name).localeCompare(normalize(a.name));
      case SortCriteria.RATING:
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return { data: combinedFixers };
};
