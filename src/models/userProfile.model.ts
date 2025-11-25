import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'fixer' | 'requester';
    urlPhoto?: string;
  };
  profile: {
    ci: string;
    photoUrl?: string;
    location?: {
      lat: number;
      lng: number;
      address?: string;
    } | null;
    services: Array<{
      id: string;
      name: string;
      custom?: boolean;
    }>;
    selectedServiceIds: string[];
    paymentMethods: Array<{
      type: string;
      accountInfo?: string;
    }>;
    experiences: Array<{
      id: string;
      title: string;
      description: string;
      years: number;
      images?: Array<{
        id: string;
        url: string;
        name: string;
        size: number;
        type: string;
      }>;
    }>;
    vehicle: {
        type: {
            hasVehicle: { type: boolean },
            type?: string,
            details?: string,
        },
  required: false, 
},
    terms: {
      accepted: boolean;
      acceptedAt?: Date;
    };
    additionalInfo?: {
      bio?: string;
      languages?: string[];
      availability?: {
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
        sunday: boolean;
      };
      hourlyRate?: number;
    };
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
  };
}

const UserProfileSchema = new Schema<IUserProfile>({
  user: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String,  },
    role: { type: String, enum: ['fixer', 'requester'], required: true },
    urlPhoto: String,
  },
  profile: {
    ci: { type: String },
    photoUrl: String,
    location: {
      lat: Number,
      lng: Number,
      address: String,
    },
    services: [
      {
        id: String,
        name: String,
        custom: Boolean,
      },
    ],
    selectedServiceIds: [String],
    paymentMethods: [
      {
        type: String,
        accountInfo: String,
      },
    ],
    experiences: [
      {
        id: String,
        title: String,
        description: String,
        years: Number,
        images: [
          {
            id: String,
            url: String,
            name: String,
            size: Number,
            type: String,
          },
        ],
      },
    ],
    vehicle: {
      hasVehicle: { type: Boolean },
      type: String,
      details: String,
    },
    terms: {
      accepted: { type: Boolean },
      acceptedAt: Date,
    },
    additionalInfo: {
      bio: String,
      languages: [String],
      availability: {
        monday: Boolean,
        tuesday: Boolean,
        wednesday: Boolean,
        thursday: Boolean,
        friday: Boolean,
        saturday: Boolean,
        sunday: Boolean,
      },
      hourlyRate: Number,
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
});

export default mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);