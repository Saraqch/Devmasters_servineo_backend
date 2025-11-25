import { Request, Response } from 'express';
import * as activityService from '../../services/activities.service';

export async function createActivityController(req: Request, res: Response) {
  try {
    const { userId, type, metadata, date, role } = req.body;

    if (!userId || !type || !role) {
      return res.status(400).json({ error: 'Missing required fields: userId, type, role' });
    }

    if (type === 'click' && !metadata?.jobId) {
      return res
        .status(400)
        .json({ error: 'Missing required field: metadata.jobId for click type' });
    }

    const result = await activityService.createActivity({
      userId,
      type,
      metadata: metadata || {},
      date,
      role,
    });

    const message = result.isUpdate ? 'Click count updated' : 'Activity created';

    res.status(200).json({
      message,
      activity: result.activity,
      isUpdate: result.isUpdate,
    });
  } catch (error) {
    console.log('Error creating Activity:', error);
    res.status(500).json({ error: 'Error creating Activity' });
  }
}

export async function getActivities(req: Request, res: Response) {
  try {
    const activities = await activityService.getActivities();
    res.status(200).json(activities);
  } catch (error) {
    console.log('Error getting Activities:', error);
    res.status(500).json({ error: 'Error getting Activities' });
  }
}
