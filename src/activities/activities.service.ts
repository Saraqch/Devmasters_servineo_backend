import { Types } from 'mongoose';
import { Activity, ActivityDoc } from './activities.model';

function getAdjustedDate(date?: Date): Date {
  const now = date || new Date();
  const offset = -4;
  return new Date(now.getTime() + offset * 60 * 60 * 1000);
}

async function findExistingClick(
  userId: Types.ObjectId | string,
  jobTitle: string,
): Promise<ActivityDoc | null> {
  const userIdObj = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

  const exactMatch = await Activity.findOne({
    userId: userIdObj,
    type: 'click',
    'metadata.jobTitle': jobTitle,
  })
    .lean()
    .exec();

  if (exactMatch) {
    return exactMatch as unknown as ActivityDoc;
  }

  const flexibleMatch = await Activity.findOne({
    userId: userIdObj,
    type: 'click',
    'metadata.jobTitle': { $regex: new RegExp(`^${jobTitle}$`, 'i') },
  })
    .lean()
    .exec();

  return flexibleMatch ? (flexibleMatch as unknown as ActivityDoc) : null;
}

async function updateClickCount(
  activityId: Types.ObjectId,
  existingMetadata: any,
  newMetadata: any,
  date?: Date,
): Promise<ActivityDoc> {
  const currentClickCount = existingMetadata?.clickCount || 0;
  const newClickCount = currentClickCount + 1;
  const newTimestamp = getAdjustedDate();
  const newDate = date ? getAdjustedDate(new Date(date)) : getAdjustedDate();

  const updatedActivity = await Activity.findByIdAndUpdate(
    activityId,
    {
      $set: {
        timestamp: newTimestamp,
        date: newDate,
        metadata: {
          ...existingMetadata,
          ...newMetadata,
          clickCount: newClickCount,
        },
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

  const newActivity = new Activity({
    userId: userIdObj,
    date,
    role: activityData.role,
    type: activityData.type,
    metadata: {
      ...activityData.metadata,
      clickCount:
        activityData.type === 'click' && activityData.metadata?.jobTitle
          ? 1
          : activityData.metadata?.clickCount || 0,
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
  if (activityData.type === 'click' && activityData.metadata?.jobTitle) {
    const userIdObj =
      typeof activityData.userId === 'string'
        ? new Types.ObjectId(activityData.userId)
        : activityData.userId;

    const existingClick = await findExistingClick(userIdObj, activityData.metadata.jobTitle);

    if (existingClick) {
      const updatedActivity = await updateClickCount(
        existingClick._id,
        existingClick.metadata,
        activityData.metadata,
        activityData.date,
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
