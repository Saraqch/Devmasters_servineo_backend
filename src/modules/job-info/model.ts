import { ObjectId } from 'mongodb';

export interface JobDoc {
  _id: ObjectId;
  title: string;
  description?: string;
  status?: string;
  createdAt?: Date;
}

export interface JobSummary {
  _id: string;
  title: string;
  description: string;
  createdAt: Date;
  Ubicacion: string;
  UbicacionOriginal?: string;
  status: string;
}
