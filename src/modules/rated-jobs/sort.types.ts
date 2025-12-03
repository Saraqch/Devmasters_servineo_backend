export enum SortCriteria {
  DATE_RECENT = 'recent',
  DATE_OLDEST = 'oldest',
  RATING_ASC = 'rating_asc',
  RATING_DESC = 'rating_desc',
}

export const DEFAULT_SORT_CONFIG = SortCriteria.DATE_RECENT;
