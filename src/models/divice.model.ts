import mongoose, { Schema, Document } from 'mongoose';

export interface IDevice extends Document {
  userId: string;
  os: string;
  lastLogin: Date;
}

const DeviceSchema = new Schema<IDevice>({
  userId: { type: String, required: true },
  os: { type: String, required: true },
  lastLogin: { type: Date, default: Date.now },
});

export const Device = mongoose.model<IDevice>('Device', DeviceSchema);
