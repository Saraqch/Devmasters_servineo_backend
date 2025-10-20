import { Schema, model, models, Document, Model } from 'mongoose';

export interface IOffer extends Document {
  fixerName: string;
  title: string;
  description: string;
  category: string;
  tags?: string[];
  price: number;
  city: string;
  contactPhone: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    fixerName: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Albañil',
        'Carpintero',
        'Fontanero',
        'Electricista',
        'Pintor',
        'Soldador',
        'Jardinero',
        'Cerrajero',
        'Mecánico',
        'Vidriero',
        'Yesero',
        'Fumigador',
        'Limpiador',
        'Instalador',
        'Montador',
        'Decorador',
        'Pulidor',
        'Techador',
      ],
      index: true,
    },
    tags: [{ type: String }],
    price: { type: Number, required: true },
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
    contactPhone: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true, strict: false },
);

offerSchema.index({ city: 1, category: 1 });
offerSchema.index({ fixerName: 1, city: 1 });

export const Offer: Model<IOffer> = models.Offer || model<IOffer>('Offer', offerSchema, 'offers');
