import { Request, Response } from 'express';
import { connectDB } from '../../config/db/mongoClient';
import * as jobRequestService from './job-request.service';
import { ObjectId } from 'mongodb';

export async function getAllJobRequests(req: Request, res: Response) {
  try {
    const db = await connectDB();
    const jobs = await jobRequestService.getAllJobRequests(db);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching job requests:', error);
    res.status(500).json({ message: 'Error fetching job requests' });
  }
}

export async function getLocationById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const db = await connectDB();
    const userLocation = await jobRequestService.getLocationById(db, id);
    res.json(userLocation);
  } catch (error) {
    console.error('Error fetching user location:', error);
    return res.status(500).json({ message: 'Error fetching user location' });
  }
}

export async function createJobRequest(req: Request, res: Response) {
  try {
    const jobRequestData = req.body;
    const { requesterId } = jobRequestData;

    if (!requesterId) {
      return res.status(400).json({ message: 'requesterId is required' });
    }

    if (
      !(ObjectId.isValid(requesterId) && new ObjectId(requesterId).toHexString() === requesterId)
    ) {
      return res.status(422).json({ error: 'Invalid requester ID format' });
    }

    const db = await connectDB();
    const newJobRequest = await jobRequestService.createJobRequest(
      db,
      jobRequestData,
      requesterId,
    );

    res.status(201).json(newJobRequest);
  } catch (error) {
    console.error('Error creating job request:', error);
    res.status(500).json({ message: 'Error creating job request' });
  }
}
