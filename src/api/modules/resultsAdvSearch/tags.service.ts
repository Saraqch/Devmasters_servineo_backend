import { PipelineStage, FilterQuery } from 'mongoose';
import { JobOffer } from '../../models/job-offer.model';

type TagOpts = {
  search?: string;
  categories?: string[];
  inspectLimit?: number;
  topLimit?: number;
};

interface IJobOffer {
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  createdAt?: Date;
  [key: string]: unknown;
}

interface TagAggregationResult {
  tag: string;
  count: number;
}

function buildTagsPipeline(opts: TagOpts): PipelineStage[] {
  const { search, categories, inspectLimit = 10, topLimit = 20 } = opts;
  const pipeline: PipelineStage[] = [];

  const hasSearch = typeof search === 'string' && search.trim().length > 0;
  const hasCategories = Array.isArray(categories) && categories.length > 0;

  // Case A: there is a search text or category filter -> aggregate over matching documents
  if (hasSearch || hasCategories) {
    const match: FilterQuery<IJobOffer> = {};
    if (hasSearch) {
      // Use regex on several fields so we don't depend on a text index
      const s = String(search).trim();
      const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      match.$or = [{ title: regex }, { description: regex }, { tags: regex }];
    }
    if (hasCategories) match.category = { $in: categories };

    pipeline.push({ $match: match });
    pipeline.push({ $project: { tags: 1 } });
    pipeline.push({ $unwind: { path: '$tags', preserveNullAndEmptyArrays: false } });
    pipeline.push({ $group: { _id: '$tags', count: { $sum: 1 } } });
    pipeline.push({ $sort: { count: -1 } });
    pipeline.push({ $limit: topLimit });
    pipeline.push({ $project: { tag: '$_id', _id: 0, count: 1 } });

    return pipeline;
  }

  // Case B: no search nor category -> inspect the most recent offers that have tags (exactly inspectLimit)
  // 1) select offers that have at least one tag
  pipeline.push({ $match: { tags: { $elemMatch: { $exists: true } } } });
  // 2) sort by newest and take the first `inspectLimit` offers
  pipeline.push({ $sort: { createdAt: -1 } });
  pipeline.push({ $limit: inspectLimit });
  // 3) from those offers, extract tags and aggregate frequencies
  pipeline.push({ $project: { tags: 1 } });
  pipeline.push({ $unwind: { path: '$tags', preserveNullAndEmptyArrays: false } });
  pipeline.push({ $group: { _id: '$tags', count: { $sum: 1 } } });
  pipeline.push({ $sort: { count: -1 } });
  pipeline.push({ $limit: topLimit });
  pipeline.push({ $project: { tag: '$_id', _id: 0, count: 1 } });

  return pipeline;
}

export async function getTagsForOffers(search?: string, categories?: string[], limit = 10) {
  const pipeline = buildTagsPipeline({
    search,
    categories,
    inspectLimit: limit,
    topLimit: limit,
  });

  const agg = await JobOffer.aggregate<TagAggregationResult>(pipeline).exec();
  // Si no se encontraron etiquetas para la búsqueda/categoría solicitada,
  // devolvemos el conjunto por defecto (últimas ofertas con tags) en lugar de []
  const hasFilter =
    (typeof search === 'string' && search.trim().length > 0) ||
    (Array.isArray(categories) && categories.length > 0);

  if (hasFilter && Array.isArray(agg) && agg.length === 0) {
    // fallback: ejecutar la pipeline por defecto (sin search ni categories)
    const fallbackPipeline = buildTagsPipeline({ inspectLimit: limit, topLimit: limit });
    const fallbackAgg = await JobOffer.aggregate<TagAggregationResult>(fallbackPipeline).exec();
    return fallbackAgg.map((r) => (r && r.tag ? String(r.tag) : '')).filter(Boolean);
  }

  return agg.map((r) => (r && r.tag ? String(r.tag) : '')).filter(Boolean);
}
