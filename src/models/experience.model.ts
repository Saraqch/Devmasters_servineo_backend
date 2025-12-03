import { Schema, model, models, Document, Types } from 'mongoose';

export interface IExperience extends Document {
  fixerId: Types.ObjectId;
  jobTitle: string;
  jobType: string;
  organization?: string;
  isCurrent: boolean;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const experienceSchema = new Schema<IExperience>(
  {
    fixerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      required: true,
    },
    organization: {
      type: String,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'experiences',
  }
);

experienceSchema.index({ fixerId: 1 });

export const Experience = models.Experience || model<IExperience>('Experience', experienceSchema);
export default Experience;
