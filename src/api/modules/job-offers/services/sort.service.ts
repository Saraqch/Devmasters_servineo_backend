// services/jobOfert/sort.service.ts
import { SortCriteria, DEFAULT_SORT_CONFIG } from '../../../shared/types/sort.types';
import { SortBuilder } from '../../../core/sort.builder';

type MongoSortConfig = Record<string, 1 | -1>;

export function sortOffers(sortBy?: string | SortCriteria): MongoSortConfig {
  const criteria = sortBy || DEFAULT_SORT_CONFIG.sortBy;

  const sortConfig: MongoSortConfig = {};

  switch (criteria) {
    case SortCriteria.DATE_RECENT:
      sortConfig.createdAt = -1;
      break;
    case SortCriteria.DATE_OLDEST:
      sortConfig.createdAt = 1;
      break;
    case SortCriteria.NAME_ASC:
      sortConfig.name = 1;
      break;
    case SortCriteria.NAME_DESC:
      sortConfig.name = -1;
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

  return SortBuilder.build(sortConfig);
}
