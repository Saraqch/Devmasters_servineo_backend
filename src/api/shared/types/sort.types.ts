export enum SortCriteria {
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  DATE_RECENT = 'recent',
  DATE_OLDEST = 'oldest',
  RATING = 'rating',
  CONTACT_ASC = 'contact_asc',
  CONTACT_DESC = 'contact_desc',
}

export interface SortQueryParams {
  sortBy?: string;
}

export const DEFAULT_SORT_CONFIG = {
  sortBy: SortCriteria.DATE_RECENT,
} as const;
