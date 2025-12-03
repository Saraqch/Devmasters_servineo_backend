import { Request, Response } from 'express';
import { connectDB } from '../../config/db/mongoClient';
import { getJobSummary } from './service';

export async function getJobInfoHandler(req: Request, res: Response) {
  const { id } = req.params;
  const db = await connectDB();

  if (!db) return res.status(500).json({ message: 'Database not available' });
  if (!id) return res.status(400).json({ message: 'ID is required' });

  const { lat, lng } = req.body || {};

  try {
    const summary = await getJobSummary(
      db,
      id,
      lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
    );

    if (!summary) return res.status(404).json({ message: 'Job not found' });

    return res.status(200).json(summary);
  } catch (err) {
    console.error('getJobInfoHandler error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
