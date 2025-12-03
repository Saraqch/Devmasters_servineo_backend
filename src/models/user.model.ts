import { Schema, model, models, Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  url_photo?: string;
  role: string;
  description?: string;

  authProviders?: Array<{
    provider: string;
    providerId: string;
    password: string;
  }>;

  telefono?: string;

  ubicacion?: {
    lat?: number;
    lng?: number;
    direccion?: string;
    departamento?: string;
    pais?: string;
  };

  ci?: string;
  servicios?: string[];

  vehiculo?: {
    hasVehiculo?: boolean;
    tipoVehiculo?: string;
  };
  fixerProfile?: string;
  acceptTerms?: boolean;

  metodoPago?: {
    hasEfectivo?: boolean;
    qr?: boolean;
    tarjetaCredito?: boolean;
  };

  workLocation?: {
    lat?: number;
    lng?: number;
    direccion?: string;
    departamento?: string;
    pais?: string;
  };
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    url_photo: { type: String },

    role: {
      type: String,
      enum: ["requester", "fixer", "visitor"],
      default: "requester",
    },

    authProviders: [
      {
        provider: { type: String, required: true },
        providerId: { type: String, required: true },
        password: { type: String, required: false },
      },
    ],

    telefono: { type: String },

    ubicacion: {
      lat: { type: Number },
      lng: { type: Number },
      direccion: { type: String },
      departamento: { type: String },
      pais: { type: String },
    },

    ci: { type: String },
    description: { type: String },

    servicios: [{ type: String }],

    vehiculo: {
      hasVehiculo: { type: Boolean },
      tipoVehiculo: { type: String },
    },

    acceptTerms: { type: Boolean, default: false },

    fixerProfile: { type: String, required: false },

    metodoPago: {
      hasEfectivo: { type: Boolean, default: false },
      qr: { type: Boolean, default: false },
      tarjetaCredito: { type: Boolean, default: false },
    },

    workLocation: {
      lat: { type: Number },
      lng: { type: Number },
      direccion: { type: String },
      departamento: { type: String },
      pais: { type: String },
    },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

export const User = models.User || model<IUser>("User", userSchema);