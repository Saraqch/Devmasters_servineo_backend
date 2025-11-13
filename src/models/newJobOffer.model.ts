import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IJobOffer extends Document {
  _id: Types.ObjectId;
  fixerId: string;
  fixerName: string;
  description: string;
  services: string[];
  whatsapp: string;
  price: number;
  city: string;
  createdAt: Date;
  photos?: string[];
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

const JobOfferSchema = new Schema<IJobOffer>(
  {
    fixerId: { type: String, required: true },
    fixerName: { type: String, required: true },
    description: { type: String, required: true },
    services: [{ type: String, required: true }],
    whatsapp: { type: String, required: true },
    price: { type: Number, required: true },
    city: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    photos: [{ type: String }],
    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
    },
  },
  { collection: 'offers' }
);

export const JobOfferModel = mongoose.model<IJobOffer>('JobOffer', JobOfferSchema);