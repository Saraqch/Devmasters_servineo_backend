import { Schema, model, models, Document, Types } from 'mongoose';

export interface IJobOffer extends Document {
  fixerId: Types.ObjectId;
  fixerName: string;
  fixerWhatsapp: string;
  title: string;
  description: string;
  city: string;
  price: number;
  categories: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const jobOfferSchema = new Schema<IJobOffer>(
  {
    fixerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fixerName: {
      type: String,
      required: true,
    },
    fixerWhatsapp: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    categories: [
      {
        type: String,
      },
    ],
    // TODO: Migrar almacenamiento de imágenes a Google Drive en el futuro. Actualmente usa Firebase.
    images: {
      type: [String],
      validate: {
        validator: function (v: string[]) {
          return v.length >= 1 && v.length <= 5;
        },
        message: 'Debe subir entre 1 y 5 imágenes.',
      },
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'jobs',
  }
);

jobOfferSchema.index({ fixerId: 1 });
jobOfferSchema.index({ city: 1 });
jobOfferSchema.index({ categories: 1 });

export const JobOffer = models.JobOffer || model<IJobOffer>('JobOffer', jobOfferSchema);
export default JobOffer;
