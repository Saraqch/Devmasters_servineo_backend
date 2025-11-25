import { Schema, model, models } from 'mongoose';

const jobSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    requesterId: { type: String, required: true }, // ← Cambié a String (los datos usan string, no ObjectId)
    fixerId: { type: String, default: null }, // ← Cambié a String
    price: { type: Number, required: true },

    // Campos para filtros
    fixerName: {
      type: String,
      index: true,
    },

    department: {
      type: String,
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

    jobType: {
      type: String,
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
  },
  {
    timestamps: true,
    strict: false,
  },
);

jobSchema.index({ department: 1, jobType: 1 });
jobSchema.index({ fixerName: 1, department: 1 });

// Evitar recompilación del modelo
const JobModel = models.Job || model('Job', jobSchema, 'filter');

export const Job = JobModel;
