import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IWallet extends Document {
  users_id: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'suspended';
  minimumBalance: number;
  lowBalanceThreshold: number;
  lastLowBalanceNotification?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    users_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'BOB',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    minimumBalance: {
      type: Number,
      default: 0,
    },
    lowBalanceThreshold: {
      type: Number,
      default: 50,
    },
    lastLowBalanceNotification: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true, // Crea createdAt y updatedAt automáticamente
  }
);

// Usa la colección 'wallets'
export const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', walletSchema, 'wallets');