import { Db, ObjectId } from 'mongodb';

export async function getRatingsByFixer(db: Db, fixerId: string) {
  if (!fixerId) throw new Error('fixerId no proporcionado');
  const cleaned = fixerId.trim();

  const col = db.collection('jobs');
  const maybeObjId = ObjectId.isValid(cleaned) ? new ObjectId(cleaned) : null;

  const results = await col
    .find({
      rating: { $ne: null },
      $or: maybeObjId ? [{ fixerId: cleaned }, { fixerId: maybeObjId }] : [{ fixerId: cleaned }],
    })
    .toArray();

  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
