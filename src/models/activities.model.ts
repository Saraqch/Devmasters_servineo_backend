import { Schema, model, models, Types } from 'mongoose';

const activitySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    role: {
      type: String,
      enum: ['visitor', 'requester', 'fixer'],
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'login',
        'search',
        'click',
        'review',
        'session_start',
        'session_end',
        'daily_jobs_status',
      ],
      required: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    strict: false,
  },
);

activitySchema.index({ userId: 1, type: 1 });
activitySchema.index({ type: 1, 'metadata.jobId': 1 });
activitySchema.index({ userId: 1, type: 1, 'metadata.jobId': 1 });

const ActivityModel = models.Activity || model('Activity', activitySchema, 'activities');

export const Activity = ActivityModel;

export interface ActivityDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
  role: 'visitor' | 'requester' | 'fixer';
  type:
    | 'login'
    | 'search'
    | 'click'
    | 'review'
    | 'session_start'
    | 'session_end'
    | 'daily_jobs_status';
  metadata: {
    button?: string;
    searchTerm?: string;
    duration?: number;
    clickCount?: number;
    jobTitle?: string;
    jobId?: string | Types.ObjectId;
    [key: string]: any;
  };
  timestamp: Date;
}
