import { Schema, model, models } from 'mongoose';

const offerSchema = new Schema(
  {
    fixerName: { 
      type: String, 
      required: true,
      index: true 
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
      type: String, 
      required: true,
      enum: [
        'Albañil', 'Carpintero', 'Fontanero', 'Electricista',
        'Pintor', 'Soldador', 'Jardinero', 'Cerrajero',
        'Mecánico', 'Vidriero', 'Yesero', 'Fumigador',
        'Limpiador', 'Instalador', 'Montador', 'Decorador',
        'Pulidor', 'Techador'
      ],
      index: true
    },
    tags: [{ type: String }],
    price: { type: Number, required: true },
    city: { 
      type: String, 
      required: true,
      enum: [
        'Beni', 'Chuquisaca', 'Cochabamba', 'La Paz',
        'Oruro', 'Pando', 'Potosí', 'Santa Cruz', 'Tarija'
      ],
      index: true
    },
    contactPhone: { type: String, required: true },
  },
  { 
    timestamps: true,
    strict: false
  }
);

// Índices compuestos para mejorar rendimiento de filtros
offerSchema.index({ city: 1, category: 1 });
offerSchema.index({ fixerName: 1, city: 1 });

// Evitar recompilación del modelo
const OfferModel = models.Offer || model('Offer', offerSchema, 'offers');

export const Offer = OfferModel;
