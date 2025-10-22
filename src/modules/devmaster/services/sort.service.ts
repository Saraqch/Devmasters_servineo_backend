import { Offer } from '../models/offer.model';
import { SortCriteria, DEFAULT_SORT_CONFIG } from '../utils/queryParams.types';

function normalize(text?: string): string {
  return text
    ? text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    : '';
}

function normalizeNumber(num?: string | number | null): number {
  if (!num) return 0;
  const parsed = Number(String(num).replace(/\D/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

export const getAllOffers = async (options?: { sortBy?: SortCriteria }) => {
  const sortBy = options?.sortBy || DEFAULT_SORT_CONFIG.sortBy;

  const offers = await Offer.find().lean();

  const combinedOffers = offers.map((offer) => ({
    ...offer,
    fixerName: offer.fixerName || '',
    createdAt: offer.createdAt ? new Date(offer.createdAt) : new Date(0),
    contactPhone: offer.contactPhone || '',
    rating: offer.rating ?? 0,
  }));

  combinedOffers.sort((a, b) => {
    switch (sortBy) {
      case SortCriteria.DATE_RECENT:
        return b.createdAt.getTime() - a.createdAt.getTime();
      case SortCriteria.DATE_OLDEST:
        return a.createdAt.getTime() - b.createdAt.getTime();
      case SortCriteria.NAME_ASC:
        return normalize(a.fixerName).localeCompare(normalize(b.fixerName));
      case SortCriteria.NAME_DESC:
        return normalize(b.fixerName).localeCompare(normalize(a.fixerName));
      case SortCriteria.RATING:
        return b.rating - a.rating;
      case SortCriteria.CONTACT_ASC:
        return normalizeNumber(a.contactPhone) - normalizeNumber(b.contactPhone);
      case SortCriteria.CONTACT_DESC:
        return normalizeNumber(b.contactPhone) - normalizeNumber(a.contactPhone);
      default:
        return 0;
    }
  });

  return { total: combinedOffers.length, data: combinedOffers };
};
