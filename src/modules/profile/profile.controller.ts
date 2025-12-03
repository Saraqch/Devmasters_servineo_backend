import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getProfileData as getProfileDataService } from './profile.service';
export async function getProfileData(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Missing user ID' });
  }
  if (!(ObjectId.isValid(id) && new ObjectId(id).toHexString() === id)) {
    return res.status(422).json({ error: 'Invalid user ID format' });
  }
  try {
    const user = await getProfileDataService(id);
    return res.status(200).json(user);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    } else {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
