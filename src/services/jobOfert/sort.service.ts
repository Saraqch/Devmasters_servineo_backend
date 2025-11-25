// services/jobOfert/sort.service.ts
import { SortCriteria, DEFAULT_SORT_CONFIG } from '../../types/sort.types';
import { SortService } from '../common/sort.common';

export function sortOffers(sortBy?: string | SortCriteria): any {
  const criteria = sortBy || DEFAULT_SORT_CONFIG.sortBy;

  const sortConfig: Record<string, 1 | -1> = {};

  switch (criteria) {
    case SortCriteria.DATE_RECENT:
      sortConfig.createdAt = -1;
      break;
    case SortCriteria.DATE_OLDEST:
      sortConfig.createdAt = 1;
      break;
    case SortCriteria.NAME_ASC:
      sortConfig.fixerName = 1;
      break;
    case SortCriteria.NAME_DESC:
      sortConfig.fixerName = -1;
      break;
    case SortCriteria.RATING:
      sortConfig.rating = -1;
      break;
    case SortCriteria.CONTACT_ASC:
      sortConfig.contactPhone = 1;
      break;
    case SortCriteria.CONTACT_DESC:
      sortConfig.contactPhone = -1;
      break;
  }

  return SortService.build(sortConfig);
}
