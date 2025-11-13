import { Types } from 'mongoose';
import { Activity, ActivityDoc } from '../models/activities.model';

function getAdjustedDate(date?: Date): Date {
  const now = date || new Date();
  const offset = -4;
  return new Date(now.getTime() + offset * 60 * 60 * 1000);
}

async function findExistingClick(
  userId: Types.ObjectId | string,
  jobId: string | Types.ObjectId,
): Promise<ActivityDoc | null> {
  const userIdObj = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
  const jobIdString = typeof jobId === 'string' ? jobId : jobId.toString();

  const existingClick = await Activity.findOne({
    userId: userIdObj,
    type: 'click',
    $expr: {
      $eq: [{ $toString: '$metadata.jobId' }, jobIdString],
    },
  })
    .lean()
    .exec();

  return existingClick ? (existingClick as unknown as ActivityDoc) : null;
}

async function updateClickCount(
  activityId: Types.ObjectId,
  existingMetadata: any,
  newMetadata: any,
): Promise<ActivityDoc> {
  const currentClickCount = existingMetadata?.clickCount || 0;
  const newClickCount = currentClickCount + 1;
  const newTimestamp = getAdjustedDate();

  const updatedMetadata = {
    ...existingMetadata,
    ...newMetadata,
    jobId: existingMetadata.jobId || newMetadata.jobId,
    clickCount: newClickCount,
  };

  if (updatedMetadata.jobId && typeof updatedMetadata.jobId !== 'string') {
    updatedMetadata.jobId = updatedMetadata.jobId.toString();
  }

  const updatedActivity = await Activity.findByIdAndUpdate(
    activityId,
    {
      $set: {
        timestamp: newTimestamp,
        metadata: updatedMetadata,
      },
    },
    { new: true, lean: true },
  ).exec();

  if (!updatedActivity) {
    throw new Error('Failed to update activity');
  }

  return updatedActivity as unknown as ActivityDoc;
}

async function createNewActivity(activityData: {
  userId: Types.ObjectId | string;
  date?: Date;
  role: 'visitor' | 'requester' | 'fixer';
  type: 'login' | 'search' | 'click' | 'review' | 'session_start' | 'session_end';
  metadata: any;
}): Promise<ActivityDoc> {
  const userIdObj =
    typeof activityData.userId === 'string'
      ? new Types.ObjectId(activityData.userId)
      : activityData.userId;

  const timestamp = getAdjustedDate();
  const date = activityData.date ? getAdjustedDate(new Date(activityData.date)) : getAdjustedDate();

  const normalizedMetadata = { ...activityData.metadata };
  if (normalizedMetadata.jobId) {
    normalizedMetadata.jobId =
      typeof normalizedMetadata.jobId === 'string'
        ? normalizedMetadata.jobId
        : normalizedMetadata.jobId.toString();
  }

  const newActivity = new Activity({
    userId: userIdObj,
    date,
    role: activityData.role,
    type: activityData.type,
    metadata: {
      ...normalizedMetadata,
      clickCount:
        activityData.type === 'click' && normalizedMetadata.jobId
          ? 1
          : normalizedMetadata.clickCount || 0,
    },
    timestamp,
  });

  const savedActivity = await newActivity.save();
  return savedActivity.toObject() as ActivityDoc;
}

export async function createActivity(activityData: {
  userId: Types.ObjectId | string;
  date?: Date;
  role: 'visitor' | 'requester' | 'fixer';
  type: 'login' | 'search' | 'click' | 'review' | 'session_start' | 'session_end';
  metadata: any;
}): Promise<{ activity: ActivityDoc; isUpdate: boolean }> {
  if (activityData.type === 'click' && activityData.metadata?.jobId) {
    const userIdObj =
      typeof activityData.userId === 'string'
        ? new Types.ObjectId(activityData.userId)
        : activityData.userId;

    const jobId =
      typeof activityData.metadata.jobId === 'string'
        ? activityData.metadata.jobId
        : activityData.metadata.jobId.toString();

    const existingClick = await findExistingClick(userIdObj, jobId);

    if (existingClick) {
      const updatedActivity = await updateClickCount(
        existingClick._id,
        existingClick.metadata,
        activityData.metadata,
      );

      return {
        activity: updatedActivity,
        isUpdate: true,
      };
    }
  }

  const newActivity = await createNewActivity(activityData);

  return {
    activity: newActivity,
    isUpdate: false,
  };
}

export async function getActivities(): Promise<ActivityDoc[]> {
  const activities = await Activity.find({}).lean().exec();
  return activities as unknown as ActivityDoc[];
}
