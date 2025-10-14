// src/models/job.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  titulo?: string;
  detalle?: string;
  descripcion?: string;
  nombre?: string;
  ubicacion?: string;
  contacto?: string;
}

const JobSchema: Schema = new Schema(
  {
    titulo: { type: String },
    detalle: { type: String },
    descripcion: { type: String },
    nombre: { type: String },
    ubicacion: { type: String },
    contacto: { type: String },
  },
  { timestamps: true }
);

export const Job = mongoose.model<IJob>('Job', JobSchema);
