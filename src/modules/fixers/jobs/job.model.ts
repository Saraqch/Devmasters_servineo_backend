import { ObjectId } from 'mongodb';

export interface JobDoc {
  _id: ObjectId;
  title: string;
  description: string;
  status: string;
  requesterId: string;
  fixerId: string | ObjectId;
  price: number;
  createdAt: Date | string;
  rating?: number;
  comment?: string;
}

export type JobResponse = {
  _id: string;
  title: string;
  description: string;
  status: string;
  requesterId: string;
  fixerId: string;
  price: number;
  createdAt: string;
  rating?: number;
  comment?: string;
};
