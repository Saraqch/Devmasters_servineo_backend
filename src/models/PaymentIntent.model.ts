import { Schema, model, models, InferSchemaType } from 'mongoose';

const PaymentIntentSchema = new Schema({
  //bookingId: { type: String, index: true, required: true, unique: true },
  bookingId: {
    type: String,
    index: true,
    required: function (this: PaymentIntentDoc) {
      return this.type === 'service';
    },
    unique: function (this: PaymentIntentDoc) {
      return this.type === 'service';
    },
  },

  providerId: { type: String, index: true, required: true },
  amountExpected: { type: Number, required: true },
  currency: { type: String, default: 'BOB' },
  paymentReference: { type: String, index: true, required: true }, // p.ej. SV-8F3K1
  status: {
    type: String,
    enum: ['pending', 'under_review', 'confirmed', 'rejected', 'expired'],
    default: 'pending',
  },
  deadlineAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: ['service', 'wallet'],
    default: 'service',
  },

  // Aquí agregas el nuevo campo 'method' para distinguir si la recarga se iso mediante QR o transferencia
  method: {
    type: String,
    enum: ['qr', 'transfer', 'card'],
    default: 'qr',
  },
  //
});

interface PaymentIntentDoc {
  type: 'service' | 'wallet';
  bookingId?: string;
  method?: 'qr' | 'transfer' | 'card'; 
}

export type PaymentIntent = InferSchemaType<typeof PaymentIntentSchema>;
export default models.PaymentIntent || model('PaymentIntent', PaymentIntentSchema);