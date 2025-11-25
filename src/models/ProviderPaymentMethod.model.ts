import { Schema, model, models, InferSchemaType } from 'mongoose';

const ProviderPaymentMethodSchema = new Schema(
  {
    providerId: { type: String, index: true, required: true },
    method: { 
      type: String, 
      enum: ['qr', 'transfer', 'card'], 
      required: true, 
      default: 'qr' 
    },
    qrImageUrl: { type: String, required: false }, // enlace al QR (Drive u otro)
    accountDisplay: { type: String, required: true }, // “Banco · Titular · **”
    accountNumber: { type: String, required: false }, // numero de cuenta (jhoel)
    active: { type: Boolean, default: true },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  {
    collection: 'providerpaymentmethods', // o "providerPaymentMethods" si así aparece en Compass
  },
);

export type ProviderPaymentMethod = InferSchemaType<typeof ProviderPaymentMethodSchema>;
export default models.ProviderPaymentMethod ||
  model('ProviderPaymentMethod', ProviderPaymentMethodSchema);