import { Schema, model, models, Document } from 'mongoose';

interface IPaymentIntent extends Document {
  bookingId?: string;
  providerId: string;
  amountExpected: number;
  currency: string;
  paymentReference: string;
  status: 'pending' | 'under_review' | 'confirmed' | 'rejected' | 'expired';
  deadlineAt?: Date;
  createdAt: Date;
  type: 'service' | 'wallet';
  method: 'qr' | 'transfer' | 'card';
}

const PaymentIntentSchema = new Schema<IPaymentIntent>({
  bookingId: {
    type: String,
    index: true,
    required: false,
  },
  providerId: { type: String, index: true, required: true },
  amountExpected: { type: Number, required: true },
  currency: { type: String, default: 'BOB' },
  paymentReference: { type: String, index: true, required: true },
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
  method: {
    type: String,
    enum: ['qr', 'transfer', 'card'],
    default: 'qr',
  },
});

// Validación condicional
PaymentIntentSchema.pre('save', function(next) {
  const paymentIntent = this as IPaymentIntent;
  
  if (paymentIntent.type === 'service' && !paymentIntent.bookingId) {
    return next(new Error('bookingId es requerido para pagos de tipo service'));
  }
  
  if (paymentIntent.type === 'service') {
    // Agregar lógica para hacer bookingId único solo para tipo service
  }
  
  next();
});

export type PaymentIntent = IPaymentIntent;
export default models.PaymentIntent || model<IPaymentIntent>('PaymentIntent', PaymentIntentSchema);