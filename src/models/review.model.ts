import { Schema, model, models } from 'mongoose';

const reviewSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, required: true, ref: 'Job' },
    reviewerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    reviewedId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Evitar recompilación del modelo
export const Review = models.Review || model('Review', reviewSchema, 'reviews');
