
import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  userId: String,
  stripePaymentMethodId: String,
  brand: String,
  last4: String,
  expMonth: Number,
  expYear: Number,
  isDefault: Boolean,
  cardholderName: String,
});

export const Card = mongoose.models.Card || mongoose.model("cards", cardSchema);