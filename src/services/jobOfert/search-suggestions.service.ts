// src/services/jobOfert/search-suggestions.service.ts
import { SearchHistory } from '../../models/search-history.model';
import { Offer } from '../../models/offer.model';
import { normalizeForHistory } from '../../utils/search.normalizer';

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Filtra sugerencias basadas en búsquedas populares de TODOS los usuarios
 * Solo muestra términos completos y profesionales (mínimo 3 caracteres)
 */
export async function filterSuggestions(
  searchTerm: string,
  limit: number = 5,
  userId?: string,
  sessionId?: string,
): Promise<any[]> {
  try {
    const minLength = 2;

    if (!searchTerm || !searchTerm.trim() || searchTerm.trim().length < minLength) {
      return [];
    }

    const normalizedInput = normalizeForHistory(searchTerm.trim());
    const regex = `^${escapeRegex(normalizedInput)}`;

    // Weights (tunable)
    const ALPHA = 1.0; // frequency
    const BETA = 0.9; // recency
    const GAMMA = 1.5; // personal boost

    const pipeline: any[] = [
      // Include archived searches as well so suggestions can use full history
      { $match: { normalizedTerm: { $regex: regex, $options: 'i' } } },
      {
        $group: {
          _id: '$normalizedTerm',
          searchTerm: { $first: '$searchTerm' },
          count: { $sum: 1 },
          lastSearched: { $max: '$searchedAt' },
          users: { $addToSet: '$userId' },
          sessions: { $addToSet: '$sessionId' },
        },
      },
      {
        $addFields: {
          freqScore: { $ln: [{ $add: ['$count', 1] }] },
          recencyScore: {
            $let: {
              vars: { diffMillis: { $subtract: ['$$NOW', '$lastSearched'] } },
              in: {
                $divide: [1, { $add: [{ $divide: ['$$diffMillis', 1000 * 60 * 60 * 24] }, 1] }],
              },
            },
          },
          personalMatch: {
            $cond: [
              {
                $or: [
                  userId ? { $in: [userId, '$users'] } : false,
                  sessionId ? { $in: [sessionId, '$sessions'] } : false,
                ],
              },
              1,
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: [ALPHA, '$freqScore'] },
              { $multiply: [BETA, '$recencyScore'] },
              { $multiply: [GAMMA, '$personalMatch'] },
            ],
          },
        },
      },
      { $sort: { score: -1, count: -1 } },
      {
        $project: {
          _id: 0,
          term: '$searchTerm',
          count: 1,
          score: 1,
        },
      },
      { $limit: limit },
    ];

    const results = await SearchHistory.aggregate(pipeline);

    // Basic sanitization
    const historySuggestions = results.filter((s: any) => s.term && s.term.length >= minLength);

    // --- Catalog suggestions (categories + tags) ---
    // We'll query the offers collection to find categories and tags that start with the prefix
    const catalogLimit = Math.max(limit, 8);

    // categories
    const categoryAgg = [
      { $match: { category: { $regex: regex, $options: 'i' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, term: '$_id', count: 1 } },
      { $limit: catalogLimit },
    ];

    // tags (unwind)
    const tagsAgg = [
      { $unwind: '$tags' },
      { $match: { tags: { $regex: regex, $options: 'i' } } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $project: { _id: 0, term: '$_id', count: 1 } },
      { $limit: catalogLimit },
    ];

    const [catResults, tagResults] = await Promise.all([
      Offer.aggregate(categoryAgg),
      Offer.aggregate(tagsAgg),
    ]);

    const catalogRaw = [...(catResults || []), ...(tagResults || [])];

    // Compute a simple catalog score (log-based) and normalize
    const CATALOG_WEIGHT = 1.2;
    const catalogSuggestions = catalogRaw.map((c: any) => ({
      term: c.term,
      count: c.count || 0,
      score: Math.log(1 + (c.count || 0)) * CATALOG_WEIGHT,
      source: 'catalog',
    }));

    // Merge history and catalog suggestions, deduplicate by normalized term (case-insensitive)
    const mergedMap = new Map<string, any>();

    function keyFor(t: string) {
      return t.trim().toLowerCase();
    }

    // add catalog first (lower priority than personal/history generally)
    for (const s of catalogSuggestions) {
      const k = keyFor(s.term);
      if (!mergedMap.has(k)) mergedMap.set(k, s);
    }

    // merge/boost with history suggestions
    for (const h of historySuggestions) {
      const k = keyFor(h.term);
      if (mergedMap.has(k)) {
        // combine scores (favor history)
        const existing = mergedMap.get(k);
        existing.score = (existing.score || 0) + (h.score || 0) * 1.3;
        existing.count = Math.max(existing.count || 0, h.count || 0);
        existing.source = `${existing.source || 'catalog'},history`;
        mergedMap.set(k, existing);
      } else {
        mergedMap.set(k, { term: h.term, count: h.count, score: h.score, source: 'history' });
      }
    }

    // Convert to array and sort by score desc then count
    const merged = Array.from(mergedMap.values())
      .filter((s: any) => s.term && s.term.length >= minLength)
      .sort((a: any, b: any) => {
        if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
        return (b.count || 0) - (a.count || 0);
      })
      .slice(0, limit);

    return merged;
  } catch (error) {
    console.error('Error filtering suggestions:', error);
    throw error;
  }
}

/**
 * Obtiene las sugerencias más populares (top searches)
 */
export async function getTopSuggestions(limit: number = 10): Promise<any[]> {
  try {
    const minLength = 3;

    const topSearches = await SearchHistory.aggregate([
      // Include archived searches so top suggestions reflect full historical popularity
      { $match: {} },
      {
        $group: {
          _id: '$normalizedTerm',
          searchTerm: { $first: '$searchTerm' },
          count: { $sum: 1 },
          lastSearched: { $max: '$searchedAt' },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          term: '$searchTerm',
          count: 1,
        },
      },
    ]);

    // Convertir a array y filtrar
    const results = Array.from(topSearches);
    const filtered = results.filter((s: any) => s.term && s.term.length >= minLength);

    return filtered.slice(0, limit).map((s: any) => ({
      term: s.term,
      count: s.count,
    }));
  } catch (error) {
    console.error('Error getting top suggestions:', error);
    throw error;
  }
}
