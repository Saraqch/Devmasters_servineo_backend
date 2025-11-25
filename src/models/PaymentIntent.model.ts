import { Schema, model, models, InferSchemaType } from 'mongoose';

const PaymentIntentSchema = new Schema({
  bookingId: {
    type: String,
    index: true,
    sparse: true,
    validate: {
      validator: function(this: PaymentIntentDoc, value: string | undefined) {
        // If type is 'service', bookingId is required
        if (this.type === 'service') {
          return value !== undefined && value !== '';
        }
        return true;
      },
      message: 'bookingId is required for service type',
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