// src/models/job.model.ts

import mongoose, { Schema, Document, model, models } from 'mongoose';

// 1. Interfaz de TypeScript (opcional pero recomendado)
// Define la forma de un documento 'Job' para que TypeScript sepa qué propiedades existen.
export interface IJob extends Document {
  title: string;
  description: string;
  status: 'Pendiente' | 'Aceptado' | 'EnProgreso' | 'Completado' | 'Pagado' | 'Cancelado' | 'Sin Pagar';
  requesterId: mongoose.Schema.Types.ObjectId;
  fixerId: mongoose.Schema.Types.ObjectId;
  price: number;
  rating?: number; // El '?' indica que es opcional
  comment?: string; // Opcional
  type: string;
  // createdAt y updatedAt son añadidos por 'timestamps: true'
  createdAt: Date;
  updatedAt: Date;
}

// 2. El Esquema (Schema) de Mongoose
// Define la estructura de la colección en MongoDB.
const jobSchema = new Schema<IJob>(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      required: false, // Asumiendo que puede estar vacío
      trim: true 
    },
    status: {
      type: String,
      required: true,
      // Usar un 'enum' es una buena práctica para validar que 'status' 
      // solo puede ser uno de estos valores.
      enum: ['Pendiente', 'Aceptado', 'EnProgreso', 'Completado', 'Pagado', 'Cancelado', 'Sin Pagar'],
      default: 'Pendiente',
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile', // Referencia a tu colección 'profiles' (visto en tu screenshot)
      required: true,
    },
    fixerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile', // Referencia a tu colección 'profiles'
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0, // Es bueno tener un valor por defecto
    },
    rating: {
      type: Number,
      required: false,
    },
    comment: {
      type: String,
      required: false,
      trim: true
    },
    type: {
      type: String,
      required: true,
    },
  },
  {
    // 3. Opciones del Esquema
    // 'timestamps: true' añade automáticamente los campos 'createdAt' y 'updatedAt'
    timestamps: true,
  }
);

// 4. Creación del Modelo
// 'models.Job' previene que Mongoose compile el modelo múltiples veces 
// (un problema común en Next.js con hot-reloading).
const Job = models.Job || model<IJob>('Job', jobSchema);

export default Job;