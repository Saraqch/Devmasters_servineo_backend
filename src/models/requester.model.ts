import { ObjectId } from "mongodb";

export interface IUser {
  _id?: ObjectId;
  name: string;
  email: string;
  url_photo?: string;
  role: "requester";
  authProviders?: Array<{
    provider: string;
    providerId: string;
    password?: string;
  }>;
  telefono?: string;
  ci?: string;
  servicios?: string[];
  vehiculo?: {
    hasVehiculo?: boolean;
    tipoVehiculo?: string;
  };
  experience?: {
    descripcion?: string;
  };
  ubicacion?: {
    lat?: number;
    lng?: number;
    direccion?: string;
    departamento?: string;
    pais?: string;
  };
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
