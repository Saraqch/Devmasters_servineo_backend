// src/modules/devmaster/types/ordering.types.ts

export type OrderField =
  | 'createdAt'
  | 'updatedAt'
  | 'title'
  | 'price'
  | 'status'
  | 'whatsappNumber';

export type OrderDirection = 'asc' | 'desc';

export interface OrderingParams {
  field: OrderField;
  direction: OrderDirection;
}

export const VALID_ORDER_FIELDS: OrderField[] = [
  'createdAt',
  'updatedAt',
  'title',
  'price',
  'status',
  'whatsappNumber',
];

export const VALID_ORDER_DIRECTIONS: OrderDirection[] = ['asc', 'desc'];

export const ORDER_OPTIONS = {
  // keys used as friendly aliases
  MOST_RECENT: { field: 'createdAt' as OrderField, direction: 'desc' as OrderDirection },
  OLDEST: { field: 'createdAt' as OrderField, direction: 'asc' as OrderDirection },
  RECENTLY_UPDATED: { field: 'updatedAt' as OrderField, direction: 'desc' as OrderDirection },
  OLDEST_UPDATED: { field: 'updatedAt' as OrderField, direction: 'asc' as OrderDirection },
  WHATSAPP_ASC: { field: 'whatsappNumber' as OrderField, direction: 'asc' as OrderDirection },
  WHATSAPP_DESC: { field: 'whatsappNumber' as OrderField, direction: 'desc' as OrderDirection },
  TITLE_A_Z: { field: 'title' as OrderField, direction: 'asc' as OrderDirection },
  TITLE_Z_A: { field: 'title' as OrderField, direction: 'desc' as OrderDirection },
  PRICE_LOW_HIGH: { field: 'price' as OrderField, direction: 'asc' as OrderDirection },
  PRICE_HIGH_LOW: { field: 'price' as OrderField, direction: 'desc' as OrderDirection },

  // keys matching the `value` strings returned by ordering.controller.ts
  'createdAt_desc': { field: 'createdAt' as OrderField, direction: 'desc' as OrderDirection },
  'createdAt_asc': { field: 'createdAt' as OrderField, direction: 'asc' as OrderDirection },
  'updatedAt_desc': { field: 'updatedAt' as OrderField, direction: 'desc' as OrderDirection },
  'updatedAt_asc': { field: 'updatedAt' as OrderField, direction: 'asc' as OrderDirection },
  'whatsappNumber_asc': { field: 'whatsappNumber' as OrderField, direction: 'asc' as OrderDirection },
  'whatsappNumber_desc': { field: 'whatsappNumber' as OrderField, direction: 'desc' as OrderDirection },
  'title_asc': { field: 'title' as OrderField, direction: 'asc' as OrderDirection },
  'title_desc': { field: 'title' as OrderField, direction: 'desc' as OrderDirection },
  'price_asc': { field: 'price' as OrderField, direction: 'asc' as OrderDirection },
  'price_desc': { field: 'price' as OrderField, direction: 'desc' as OrderDirection },
} as const;