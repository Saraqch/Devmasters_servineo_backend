import { Schema, model } from 'mongoose';

const jobSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    requesterId: { type: Schema.Types.ObjectId, required: true },
    fixerId: { type: Schema.Types.ObjectId, default: null },
    price: { type: Number, required: true },
  },
  { timestamps: true },
);

// Le decimos que use la colección "jobs"
export const Job = model('Job', jobSchema, 'jobs');
