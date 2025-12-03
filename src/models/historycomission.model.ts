import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IComision extends Document {
  wallets_id: mongoose.Types.ObjectId;
  payments_id: mongoose.Types.ObjectId;
  fixer_id: mongoose.Types.ObjectId;
  comision: number;
  monto_servicio: number;
  tipo_servicio: string;
  estado: "completada" | "fallida"; // Solo 2 estados simples
  motivo_fallo?: string; // Solo si falla
  fecha_completada?: Date; // Solo si se completa
  createdAt: Date;
}

const comisionSchema = new Schema<IComision>(
  {
    wallets_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: [true, 'El ID de la wallet es obligatorio'],
    },
    payments_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payments",
      required: [true, 'El ID del payments es obligatorio'],
    },
    fixer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, 'El ID del fixer es obligatorio'],
    },
    comision: {
      type: Number,
      required: [true, 'El monto de comisión es obligatorio'],
      min: [0, 'La comisión no puede ser negativa'],
    },
    monto_servicio: {
      type: Number,
      required: [true, 'El monto del servicio es obligatorio'],
      min: [0, 'El monto del servicio no puede ser negativo'],
    },
    tipo_servicio: {
      type: String,
      required: [true, 'El tipo de servicio es obligatorio'],
    },
    estado: {
      type: String,
      enum: ["completada", "fallida"], // Solo 2 opciones
      required: true,
    },
    motivo_fallo: {
      type: String,
      required: false,
      maxlength: 500,
    },
    fecha_completada: {
      type: Date,
      required: false,
    },
  },
  { 
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false 
  }
);

export const Comision = models.Comision || model<IComision>("Comision", comisionSchema);