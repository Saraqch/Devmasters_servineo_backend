import mongoose from "mongoose";

// Usuario con rol, foto, idioma, etc.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, default: "" },
    url_photo: { type: String, default: "" },
    role: { type: String, enum: ["requester", "fixer"], required: true },
    language: { type: String, default: "es" },
    stripeCustomerId: { type: String, default: "" },
  },
  { timestamps: true } // crea automáticamente createdAt y updatedAt
);

// ⚙️ Usa exactamente la colección 'userpay'
export const User = mongoose.models.User || mongoose.model("User", userSchema, "users");

