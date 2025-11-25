import { Schema, model, models, Document, Types } from 'mongoose';

export interface IExperience {
  id: string;
  title: string;
  years: number;
  description?: string;
}

export interface IFixerProfile {
  ci: string;
  location?: { lat: number; lng: number };
  services: string[];
  payments: ('cash' | 'qr' | 'card')[];
  accountInfo?: string;
  experiences: IExperience[];
  hasVehicle: boolean;
  vehicleType?: string;
  photoUrl?: string;
  descripcion?: string;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: 'requester' | 'fixer' | 'visitor';
  language: 'es' | 'en';
  fixerProfile?: IFixerProfile;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ['requester', 'fixer', 'visitor'],
      default: 'requester',
    },
    language: {
      type: String,
      enum: ['es', 'en'],
      default: 'es',
    },
    fixerProfile: {
      ci: { type: String },
      location: {
        lat: { type: Number },
        lng: { type: Number },
      },
      services: [{ type: String }],
      payments: [{ type: String, enum: ['cash', 'qr', 'card'] }],
      accountInfo: { type: String },
      experiences: [
        {
          id: { type: String },
          title: { type: String },
          years: { type: Number },
          description: { type: String },
        },
      ],
      hasVehicle: { type: Boolean },
      vehicleType: { type: String },
      photoUrl: { type: String },
      descripcion: { type: String },
    },
  },
  { collection: 'users', timestamps: true }
);

export const User = models.User || model<IUser>('User', userSchema);