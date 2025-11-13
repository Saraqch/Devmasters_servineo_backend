import { Types } from 'mongoose';
import { Job } from '../models/jobs.model';
import { Activity, ActivityDoc } from '../models/activities.model';

const FIXER_ID = '68e87a9cdae3b73d8040102f';
const ROLE = 'fixer';
const TYPE = 'daily_jobs_status';

function getBoliviaDate(date?: Date): Date {
  const now = date || new Date();
  const offset = -4;
  return new Date(now.getTime() + offset * 60 * 60 * 1000);
}

function formatDateDDMMAAAA(date: Date): string {
  const boliviaDate = getBoliviaDate(date);
  const day = String(boliviaDate.getUTCDate()).padStart(2, '0');
  const month = String(boliviaDate.getUTCMonth() + 1).padStart(2, '0');
  const year = boliviaDate.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

function getStartOfDayBolivia(date: Date): Date {
  const boliviaDate = getBoliviaDate(date);
  const startOfDay = new Date(boliviaDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  return startOfDay;
}

function getEndOfDayBolivia(date: Date): Date {
  const boliviaDate = getBoliviaDate(date);
  const year = boliviaDate.getUTCFullYear();
  const month = boliviaDate.getUTCMonth();
  const day = boliviaDate.getUTCDate();
  return new Date(Date.UTC(year, month, day, 27, 59, 59, 999));
}

async function countJobsByStatus(
  fixerId: string,
  startOfDay: Date,
  endOfDay: Date,
): Promise<{ completed: number; pending: number; inProgress: number }> {
  const fixerIdObj = new Types.ObjectId(fixerId);

  const jobs = await Job.find({
    fixerId: fixerIdObj,
    rating: { $exists: false },
    $or: [
      {
        updatedAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
      {
        $and: [
          { $or: [{ updatedAt: { $exists: false } }, { updatedAt: null }] },
          {
            createdAt: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
          },
        ],
      },
    ],
  }).lean();

  const completed = jobs.filter((job) => job.status === 'completed').length;
  const pending = jobs.filter((job) => job.status === 'pending').length;
  const inProgress = jobs.filter((job) => job.status === 'in_progress').length;

  return { completed, pending, inProgress };
}

async function findExistingDailyStatus(fixerId: string, date: Date): Promise<ActivityDoc | null> {
  const fixerIdObj = new Types.ObjectId(fixerId);
  const startOfDay = getStartOfDayBolivia(date);
  const endOfDay = getEndOfDayBolivia(date);

  const existing = await Activity.findOne({
    userId: fixerIdObj,
    type: TYPE,
    role: ROLE,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  })
    .lean()
    .exec();

  return existing ? (existing as unknown as ActivityDoc) : null;
}

export async function collectJobsStatus(): Promise<void> {
  try {
    const now = new Date();
    const boliviaNow = getBoliviaDate(now);
    const startOfDay = getStartOfDayBolivia(now);
    const endOfDay = getEndOfDayBolivia(now);

    const { completed, pending, inProgress } = await countJobsByStatus(
      FIXER_ID,
      startOfDay,
      endOfDay,
    );

    const total = completed + pending + inProgress;
    const collectionDate = formatDateDDMMAAAA(now);
    const timestamp = getBoliviaDate();

    const existingActivity = await findExistingDailyStatus(FIXER_ID, now);

    const metadata = {
      completed,
      pending,
      inProgress,
      total,
      collectionDate,
    };

    if (existingActivity) {
      await Activity.findByIdAndUpdate(
        existingActivity._id,
        {
          $set: {
            timestamp,
            metadata,
          },
        },
        { new: true },
      ).exec();
    } else {
      const fixerIdObj = new Types.ObjectId(FIXER_ID);
      const date = getStartOfDayBolivia(now);

      const newActivity = new Activity({
        userId: fixerIdObj,
        date,
        role: ROLE,
        type: TYPE,
        metadata,
        timestamp,
      });

      await newActivity.save();
    }
  } catch (error) {
    console.error('Error collecting jobs status:', error);
    throw error;
  }
}
