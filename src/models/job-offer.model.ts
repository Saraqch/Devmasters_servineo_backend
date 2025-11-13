import { Schema, model, models } from 'mongoose';

// Schema para la vista job-offers
const jobOfferViewSchema = new Schema(
  {
    fixerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Albañilería',
        'Carpintería',
        'Fontanería',
        'Electricidad',
        'Pintura',
        'Soldadura',
        'Jardinería',
        'Cerrajería',
        'Mecánica',
        'Vidriería',
        'Yesería',
        'Fumigación',
        'Limpieza',
        'Instalación',
        'Montaje',
        'Decoración',
        'Pulido',
        'Techado',
      ],
      index: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    city: {
      type: String,
      required: true,
      enum: [
        'Beni',
        'Chuquisaca',
        'Cochabamba',
        'La Paz',
        'Oruro',
        'Pando',
        'Potosí',
        'Santa Cruz',
        'Tarija',
      ],
      index: true,
    },
    phone: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
  },
  {
    strict: false,
    collection: 'job-offers',
  },
);

jobOfferViewSchema.index({ city: 1, category: 1 });
jobOfferViewSchema.index({ fixerId: 1, city: 1 });
jobOfferViewSchema.index({ name: 1, city: 1 });
jobOfferViewSchema.index({ createdAt: -1 });

const JobOfferViewModel = models.JobOffer || model('JobOffer', jobOfferViewSchema, 'job-offers');

export const JobOffer = JobOfferViewModel;

export interface IJobOfferView {
  _id: string;
  fixerId: string;
  name: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  city: string;
  phone: string;
  createdAt: Date;
}
