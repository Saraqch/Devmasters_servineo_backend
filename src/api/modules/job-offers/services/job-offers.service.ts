// src/modules/job-offers/services/jobOfert.service.ts
import { FilterQuery } from 'mongoose';
import { JobOffer } from '../../../models/job-offer.model';
import { searchOffers, searchOffersExactFields, searchOffersInFields } from './search.service';
import { sortOffers } from './sort.service';
import { FilterBuilder } from '../../../core/filter.builder';
import { PaginationBuilder } from '../../../core/pagination.builder';
import { QueryExecutor } from '../../../core/query-executor';
import { SortCriteria } from '../../../shared/types/sort.types';
import { buildOfferFilters, OfferFilterOptions as FilterOpts } from './offer-filter.service';

export { getPriceRanges, calculatePriceRanges } from './price-range.service';

// Tipo para el documento de JobOffer (ajusta según tu modelo)
interface IJobOffer {
  _id: string;
  title: string;
  description: string;
  createdAt: Date;
  rating?: number;
  [key: string]: unknown;
}

export type OfferFilterOptions = FilterOpts & {
  // Opciones de búsqueda
  search?: string;
  searchMode?: 'exact' | 'smart';
  searchFields?: string[];

  // Opciones de ordenamiento
  sortBy?: string | SortCriteria;

  // Opciones de paginación
  limit?: number;
  skip?: number;

  // Filtros adicionales específicos
  date?: string;
  rating?: number;
};

export const getAllOffers = async () => {
  return await QueryExecutor.findAll<IJobOffer>(JobOffer);
};

/**
 * Obtiene ofertas con filtros, búsqueda, ordenamiento y paginación
 * Usa servicios modulares para cada responsabilidad
 */
export const getOffersFiltered = async (options?: OfferFilterOptions) => {
  if (!options) {
    return await QueryExecutor.execute<IJobOffer>(JobOffer, {}, null, 0, 10);
  }

  let filterQuery: FilterQuery<IJobOffer> = buildOfferFilters(options);
  let searchQuery: FilterQuery<IJobOffer> = {};

  if (options.search) {
    if (options.searchMode === 'exact') {
      const fields =
        options.searchFields && options.searchFields.length > 0
          ? options.searchFields
          : ['title', 'description'];
      searchQuery = searchOffersExactFields(options.search, fields);
    } else if (options.searchFields && options.searchFields.length > 0) {
      searchQuery = searchOffersInFields(options.search, options.searchFields);
    } else {
      searchQuery = searchOffers(options.search);
    }
  }

  // Filtro por fecha (YYYY-MM-DD)
  if (options.date) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(options.date);
    if (m) {
      const y = m[1];
      const mo = m[2];
      const d = m[3];

      const start = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), 0, 0, 0, 0));
      const nextStart = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d) + 1, 0, 0, 0, 0));

      filterQuery = FilterBuilder.combine(filterQuery, {
        createdAt: { $gte: start, $lt: nextStart },
      });
    }
  }

  // Filtro por rating (1-5)
  if (typeof options.rating === 'number' && !isNaN(options.rating)) {
    const n = Math.floor(options.rating);
    if (n >= 1 && n <= 5) {
      filterQuery = FilterBuilder.combine(filterQuery, {
        rating: { $gte: n, $lt: n + 1 },
      });
    }
  }

  const finalQuery = FilterBuilder.combine(filterQuery, searchQuery);
  const sort = sortOffers(options?.sortBy);
  const { limit, skip } = PaginationBuilder.getOptions(options?.limit, options?.skip);

  return await QueryExecutor.execute<IJobOffer>(JobOffer, finalQuery, sort, skip, limit);
};
