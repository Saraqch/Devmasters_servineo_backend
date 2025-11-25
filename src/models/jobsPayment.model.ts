import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: String,
  requesterId: String,
  fixerId: String,
  price: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  rating: Number,
  comment: String,
  type: String,
});

export const User = mongoose.models.User || mongoose.model("jobspays", jobSchema);
