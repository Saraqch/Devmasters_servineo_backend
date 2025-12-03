import { Schema, model, models, Document, Types } from 'mongoose';

export interface ICertification extends Document {
  fixerId: Types.ObjectId;
  name: string;
  institution: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const certificationSchema = new Schema<ICertification>(
  {
    fixerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    institution: {
      type: String,
      required: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
    },
    credentialId: {
      type: String,
    },
    credentialUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'certifications',
  }
);

certificationSchema.index({ fixerId: 1 });

export const Certification = models.Certification || model<ICertification>('Certification', certificationSchema);
export default Certification;
