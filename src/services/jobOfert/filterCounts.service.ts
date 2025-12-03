import { Offer } from '../../models/offer.model';
import { validateAndNormalizeCity } from '../../utils/cityHelper';
import { validateAndNormalizeCategory } from '../../utils/categoryHelper';
import { getRangeRegex } from '../../utils/nameRangeHelper';
import { PerformanceCount } from '../../utils/performanceCount';
import { FilterCountValidator } from '../../validators/filterCount.validator';

export type FilterCountsOptions = {
  search?: string;
  ranges?: string[];
  city?: string;
  categories?: string[];
  minRating?: number;
  maxRating?: number;
  signal?: AbortSignal;
};

export type FilterCounts = {
  ranges: Record<string, number>;
  cities: Record<string, number>;
  categories: Record<string, number>;
  ratings: Record<string, number>;
  total: number;
};

interface MongoQuery {
  $or?: Array<{
    title?: RegExp;
    description?: RegExp;
    fixerName?: RegExp;
    category?: RegExp;
    city?: RegExp;
    tags?: RegExp;
  }>;
  fixerName?: RegExp;
  city?: string | { $in: string[] } | RegExp;
  category?: string | { $in: string[] };
  tags?: string | string[] | { $in: string[] };
  rating?: {
    $gte?: number;
    $lte?: number;
  };
}

export class FilterCountsService {

  static async getCounts(options: FilterCountsOptions = {}): Promise<FilterCounts> {
    const startTime = Date.now();

    if (options.signal?.aborted) {
      throw new Error('Request was aborted before starting');
    }

    const baseQuery: MongoQuery = this.buildBaseQuery(options);

    const [rangeCounts, cityCounts, categoryCounts, ratingCounts, total] = await Promise.all([
      this.getRangeCounts(baseQuery, options),
      this.getCityCounts(baseQuery, options),
      this.getCategoryCounts(baseQuery, options),
      this.getRatingCounts(baseQuery, options),
      PerformanceCount.measure(
        'Total Count',
        baseQuery,
        () => {
          const query = Offer.countDocuments(baseQuery);
          
          if (options.signal) {
            options.signal.addEventListener('abort', () => {
              console.log('🚫 Total count request aborted');
            });
          }
          
          return query;
        }
      ),
    ]);

    const duration = Date.now() - startTime;
    
    if (options.signal?.aborted) {
      console.log('🚫 Request was aborted after completion');
      throw new Error('Request aborted');
    }
    
    console.log(`📊 Filter Counts completed in ${duration}ms`);

    const validation = FilterCountValidator.validateCounts(
      rangeCounts,
      cityCounts,
      categoryCounts,
      ratingCounts,
      total
    );

    if (!validation.isValid) {
      console.error('❌ Filter counts validation FAILED:', validation.errors);
      throw new Error(`Invalid filter counts: ${validation.errors.join(', ')}`);
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️  Filter counts validation warnings:', validation.warnings);
    }

    return {
      ranges: rangeCounts,
      cities: cityCounts,
      categories: categoryCounts,
      ratings: ratingCounts,
      total,
    };
  }

  private static async getRangeCounts(
    baseQuery: MongoQuery,
    options: FilterCountsOptions
  ): Promise<Record<string, number>> {
    const queryWithoutFixerFilter = { ...baseQuery };
    delete queryWithoutFixerFilter.fixerName;

    if (options.signal?.aborted) {
      throw new Error('Request aborted');
    }

    const ranges: Record<string, number> = {
      'De (A-C)': 0,
      'De (D-F)': 0,
      'De (G-I)': 0,
      'De (J-L)': 0,
      'De (M-Ñ)': 0,
      'De (O-Q)': 0,
      'De (R-T)': 0,
      'De (U-W)': 0,
      'De (X-Z)': 0,
    };

    const getRangeKey = (firstLetter: string): string => {
      const letter = firstLetter.toUpperCase();
      
      if (['A', 'B', 'C'].includes(letter)) return 'De (A-C)';
      if (['D', 'E', 'F'].includes(letter)) return 'De (D-F)';
      if (['G', 'H', 'I'].includes(letter)) return 'De (G-I)';
      if (['J', 'K', 'L'].includes(letter)) return 'De (J-L)';
      if (['M', 'N', 'Ñ'].includes(letter)) return 'De (M-Ñ)';
      if (['O', 'P', 'Q'].includes(letter)) return 'De (O-Q)';
      if (['R', 'S', 'T'].includes(letter)) return 'De (R-T)';
      if (['U', 'V', 'W'].includes(letter)) return 'De (U-W)';
      if (['X', 'Y', 'Z'].includes(letter)) return 'De (X-Z)';
      
      return 'De (X-Z)';
    };

    interface FixerResult {
      _id: string | null;
      count: number;
    }

    const fixers = await PerformanceCount.measure(
      'Range Counts Aggregation',
      queryWithoutFixerFilter,
      () => Offer.aggregate<FixerResult>([
        { $match: queryWithoutFixerFilter },
        {
          $group: {
            _id: '$fixerName',
            count: { $sum: 1 },
          },
        },
      ]).exec()
    );

    fixers.forEach((fixer) => {
      if (!fixer._id || typeof fixer._id !== 'string') {
        console.warn('⚠️ Skipping fixer with invalid _id:', fixer);
        return;
      }
      
      const trimmedId = fixer._id.trim();
      if (!trimmedId) {
        console.warn('⚠️ Skipping fixer with empty name');
        return;
      }
      
      const firstLetter = trimmedId.charAt(0);
      if (firstLetter) {
        const rangeKey = getRangeKey(firstLetter);
        ranges[rangeKey] += fixer.count;
      }
    });

    return ranges;
  }

  private static buildBaseQuery(options: FilterCountsOptions): MongoQuery {
    const query: MongoQuery = {};

    if (options.search) {
      // Use the same searchable fields as the main offers search to keep behavior consistent
      // (title, description, fixerName, category, city, tags)
      const searchRegex = new RegExp(options.search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { fixerName: searchRegex },
        { category: searchRegex },
        { city: searchRegex },
        { tags: searchRegex },
      ];
    }

    if (options.ranges && options.ranges.length > 0) {
      const regexes = options.ranges
        .map((r) => getRangeRegex(r))
        .filter(Boolean) as RegExp[];
      
      if (regexes.length > 0) {
        if (regexes.length === 1) {
          query.fixerName = regexes[0];
        } else {
          const allLetters = new Set<string>();
          regexes.forEach(regex => {
            const match = regex.source.match(/\[([^\]]+)\]/);
            if (match) {
              match[1].split('').forEach(letter => allLetters.add(letter));
            }
          });
          const combinedPattern = `^[${Array.from(allLetters).join('')}]`;
          query.fixerName = new RegExp(combinedPattern, 'i');
        }
      }
    }

    if (options.city) {
      const cities = options.city.split(',').map(c => c.trim()).filter(Boolean);
      if (cities.length === 1) {
        query.city = validateAndNormalizeCity(cities[0]);
      } else if (cities.length > 1) {
        const normalizedCities = cities
          .map(c => validateAndNormalizeCity(c))
          .filter(Boolean);
        if (normalizedCities.length > 0) {
          query.city = normalizedCities.length === 1 
            ? normalizedCities[0] 
            : { $in: normalizedCities };
        }
      }
    }

    if (options.categories && options.categories.length > 0) {
      const normalizedCategories = options.categories
        .map((c) => validateAndNormalizeCategory(c))
        .filter(Boolean) as string[];
      if (normalizedCategories.length > 0) {
        query.category = normalizedCategories.length === 1
          ? normalizedCategories[0]
          : { $in: normalizedCategories };
      }
    }

    if (options.minRating !== undefined || options.maxRating !== undefined) {
      const ratingQuery: { $gte?: number; $lte?: number } = {};
      if (options.minRating !== undefined) {
        ratingQuery.$gte = options.minRating;
      }
      if (options.maxRating !== undefined) {
        ratingQuery.$lte = options.maxRating;
      }
      query.rating = ratingQuery;
    }

    return query;
  }

  private static async getCityCounts(
    baseQuery: MongoQuery,
    options: FilterCountsOptions
  ): Promise<Record<string, number>> {
    const queryWithoutCityFilter = { ...baseQuery };
    delete queryWithoutCityFilter.city;

    if (options.signal?.aborted) {
      throw new Error('Request aborted');
    }

    interface AggregationResult {
      _id: string;
      count: number;
    }

    const counts = await PerformanceCount.measure(
      'City Counts Aggregation',
      queryWithoutCityFilter,
      () => {
        const aggregation = Offer.aggregate<AggregationResult>([
          { $match: queryWithoutCityFilter },
          {
            $group: {
              _id: '$city',
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);

        const hasComplexQuery = queryWithoutCityFilter.$or || queryWithoutCityFilter.fixerName;
        
        if (!hasComplexQuery) {
          if (queryWithoutCityFilter.category) {
            aggregation.hint('city_1_category_1');
          } else {
            aggregation.hint('city_1');
          }
        }

        return aggregation.exec();
      }
    );

    console.log('🏙️ City counts from DB:', counts);

    return counts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);
  }

  private static async getCategoryCounts(
    baseQuery: MongoQuery,
    options: FilterCountsOptions
  ): Promise<Record<string, number>> {
    const queryWithoutCategoryFilter = { ...baseQuery };
    delete queryWithoutCategoryFilter.category;

    if (options.signal?.aborted) {
      throw new Error('Request aborted');
    }

    interface AggregationResult {
      _id: string;
      count: number;
    }

    const counts = await PerformanceCount.measure(
      'Category Counts Aggregation',
      queryWithoutCategoryFilter,
      () => {
        const aggregation = Offer.aggregate<AggregationResult>([
          { $match: queryWithoutCategoryFilter },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1, _id: 1 } },
        ]);

        const hasComplexQuery = queryWithoutCategoryFilter.$or || queryWithoutCategoryFilter.fixerName;
        
        if (!hasComplexQuery) {
          if (queryWithoutCategoryFilter.city) {
            aggregation.hint('city_1_category_1');
          } else {
            aggregation.hint('category_1');
          }
        }

        return aggregation.exec();
      }
    );

    console.log('📊 Category counts from DB:', counts);

    return counts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);
  }

  private static async getRatingCounts(
    baseQuery: MongoQuery,
    options: FilterCountsOptions
  ): Promise<Record<string, number>> {
    const queryWithoutRatingFilter = { ...baseQuery };
    delete queryWithoutRatingFilter.rating;

    if (options.signal?.aborted) {
      throw new Error('Request aborted');
    }

    interface BucketResult {
      _id: number | string;
      count: number;
    }

    const counts = await PerformanceCount.measure(
      'Rating Counts Aggregation',
      queryWithoutRatingFilter,
      () => Offer.aggregate<BucketResult>([
        { $match: queryWithoutRatingFilter },
        {
          $bucket: {
            groupBy: '$rating',
            boundaries: [1.0, 2.0, 3.0, 4.0, 5.0, 6.0],
            default: 'other',
            output: {
              count: { $sum: 1 },
            },
          },
        },
      ]).exec()
    );

    const ratingRanges: Record<string, number> = {};
    counts.forEach((item) => {
      if (item._id !== 'other' && typeof item._id === 'number') {
        const start = item._id;
        const end = start + 1;
        const key = `${start}-${end}`;
        ratingRanges[key] = item.count;
      }
    });

    return ratingRanges;
  }
}