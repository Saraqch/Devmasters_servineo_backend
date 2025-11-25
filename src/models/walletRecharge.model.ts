import mongoose from "mongoose";

// Usuario con rol, foto, idioma, etc.
const walletRechargeSchema  = new mongoose.Schema(
  {
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", required: true },
    amount: { type: Number, required: true },
    
  },
  { timestamps: true } // crea automáticamente createdAt y updatedAt
);

// ⚙️ Usa exactamente la colección 'recharge'
export const Recharge = mongoose.models.Recharge || mongoose.model("recharge", walletRechargeSchema , "recharge");
