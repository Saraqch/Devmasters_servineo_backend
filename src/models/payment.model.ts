import mongoose, { Schema, Types } from "mongoose";
import crypto from "crypto";

const paymentSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fixerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
  amount: { type: Number, required: true }, // en centavos
  currency: { type: String, default: 'BOB' },
  status: { type: String, default: 'pending' },
  paymentIntentId: { type: String },
}, { timestamps: true });


export type PaymentMethod = "qr" | "card" | "cash";
export type PaymentStatus  = "paid" | "pending" | "failed";

interface Amount {
  subTotal: number;
  service_fee: number;
  discount: number;
  total: number;
  currency: "BOB" | "USD" | string;
}

export interface PaymentDoc extends mongoose.Document {
  jobId: Types.ObjectId;
  payerId: Types.ObjectId;
  fixerId: Types.ObjectId;
  paymentMethods: PaymentMethod;
  status: PaymentStatus;
  paymentDate: Date;
  commissionRate: number;
  amount: Amount;

  code: string;
  codeExpiresAt?: Date;
  failedAttempts?: number;
  lockUntil?: Date;

  createdAt: Date;
  updatedAt: Date;

  // --- CAMPOS DE FACTURA AÑADIDOS ---
  companyName?: string;
  taxId?: string;
  requesterName?: string;
  jobType?: string;
  jobDescription?: string;
  transactionId?: string;
  commission?: number; // Monto de la comisión
  iva?: number; // Monto del IVA
}

const AmountSchema = new Schema<Amount>(
  {
    subTotal:   { type: Number, required: true, min: 0 },
    service_fee:{ type: Number, required: true, min: 0 },
    discount:   { type: Number, required: true, min: 0, default: 0 },
    total:      {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function(this: any, v: number) {
          const expected = Number(this.subTotal) + Number(this.service_fee) - Number(this.discount ?? 0);
          return Math.abs(v - expected) < 0.0001;
        },
        message: "amount.total debe ser subTotal + service_fee - discount",
      },
    },
    currency:   { type: String, required: true, default: "BOB" },
  },
  { _id: false }
);

const PaymentSchema = new Schema<PaymentDoc>(
  {
    jobId:           { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    payerId:         { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fixerId:         { type: Schema.Types.ObjectId, ref: "User", required: true },
    paymentMethods:  { type: String, enum: ["qr", "card", "cash"], required: true },
    status:          { type: String, enum: ["paid", "pending", "failed"], required: true, index: true },
    paymentDate:     { type: Date, required: true, default: () => new Date(), index: true },
    commissionRate:  { type: Number, required: true, min: 0, max: 1 },

    amount:          { type: AmountSchema, required: true },

    code:            { type: String, required: true, unique: true, uppercase: true },
    codeExpiresAt:   { type: Date },

    failedAttempts:  { type: Number, default: 0 },
    lockUntil:       { type: Date },

    // --- CAMPOS DE FACTURA AÑADIDOS AL ESQUEMA ---
    companyName: { type: String, required: false },
    taxId: { type: String, required: false },
    requesterName: { type: String, required: false },
    jobType: { type: String, required: false },
    jobDescription: { type: String, required: false },
    transactionId: { type: String, required: false },
    commission: { type: Number, required: false }, // Monto
    iva: { type: Number, required: false }, // Monto
  },
  { timestamps: true, versionKey: false }
);

// --- helpers ---
function generateAlphanumericCode(length: number = 8): string {
  const chars = "BCDFGHJKLMNPQRSTVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    code += chars[randomIndex];
  }
  return code;
}

async function assignUniqueCode(doc: mongoose.Document & { code?: string }) {
  if (doc.code) return;
  const Model = doc.constructor as mongoose.Model<PaymentDoc>;
  for (let i = 0; i < 10; i++) {
    const candidate = generateAlphanumericCode();
    const exists = await Model.findOne({ code: candidate }).lean();
    if (!exists) {
      doc.set("code", candidate);
      return;
    }
  }
  doc.set("code", generateAlphanumericCode(10));
}

// --- criterios 1 y 3 ---
PaymentSchema.pre("validate", async function (next) {
  const doc = this as PaymentDoc;

  await assignUniqueCode(doc as any);

  if (!doc.codeExpiresAt) {
    doc.codeExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // +48h
  }

  if (doc.paymentMethods === "cash") {
    const total = doc.amount?.total ?? 0;
    if (total < 10 || total >= 5000) {
      return next(new Error("Pago en efectivo sólo entre 10 y 5000 Bs."));
    }
  }

  next();
});

// Índices recomendados
PaymentSchema.index({ code: 1 }, { unique: true });
PaymentSchema.index({ payerId: 1, paymentDate: -1 });
PaymentSchema.index({ jobId: 1, status: 1 });

export const Payment =
  mongoose.models.Payment || mongoose.model<PaymentDoc>("Payment", PaymentSchema);

export default Payment;
