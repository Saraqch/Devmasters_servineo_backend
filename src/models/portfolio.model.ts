import { Schema, model, models, Document, Types } from 'mongoose';

export interface IPortfolio extends Document {
  fixerId: Types.ObjectId;
  type: 'image' | 'youtube' | 'video';   // 👈 ahora incluye 'video'
  url?: string;
  youtubeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const portfolioSchema = new Schema<IPortfolio>(
  {
    fixerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'youtube', 'video'], // 👈 agregamos 'video' al enum
      required: true,
    },
    url: {
      type: String,
    },
    youtubeUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

portfolioSchema.index({ fixerId: 1 });

export const Portfolio = models.Portfolio || model<IPortfolio>('Portfolio', portfolioSchema);
export default Portfolio;
