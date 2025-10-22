import { Schema, model } from 'mongoose';

const profileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    phone: { type: String },
    location: {
      direction: { type: String },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          validate: {
            validator: (arr: number[]) => arr.length === 2,
            message: 'Las coordenadas deben tener formato [longitud, latitud]',
          },
        },
      },
    },
    biography: { type: String },
    lastChange: { type: Date, default: Date.now },
    profilePhoto: { type: String },
  },
  { timestamps: true },
);

// Le decimos que use la colección "profiles"
export const Profile = model('Profile', profileSchema, 'profiles');
