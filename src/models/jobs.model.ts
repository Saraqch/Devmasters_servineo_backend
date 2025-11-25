import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  requesterId: mongoose.Types.ObjectId;
  fixerId?: mongoose.Types.ObjectId;
  price: number;
  createdAt: Date;
  updatedAt?: Date;
}

const JobSchema: Schema = new Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    fixerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    price: {
      type: Number,
    },
  },
  {
    timestamps: true,
    strict: false,
  },
);

JobSchema.index({ requesterId: 1, createdAt: -1 });
JobSchema.index({ fixerId: 1, status: 1 });
JobSchema.index({ status: 1 });
JobSchema.index({ createdAt: -1 });

JobSchema.methods.toJSON = function () {
  const job = this.toObject();
  return job;
};

export const Job = mongoose.model<IJob>('Job', JobSchema);
export default Job;
