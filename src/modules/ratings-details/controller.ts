import { Request, Response } from 'express';
import { connectDB } from '../../config/db/mongoClient';
import { RatingDetailsService } from './service';

export class RatingDetailsController {
  static async getRatings(req: Request, res: Response) {
    try {
      const { fixerId } = req.params;
      const db = await connectDB();
      const service = new RatingDetailsService(db);
      const ratings = await service.getRatings(fixerId);
      res.json(ratings);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching fixer reviews' });
    }
  }
}
