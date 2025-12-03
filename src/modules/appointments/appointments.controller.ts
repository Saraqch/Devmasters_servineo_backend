import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { connectDB } from '../../config/db/mongoClient';
import * as appointmentsService from './appointments.service';

export async function getAppointmentsByFixerId(req: Request, res: Response) {
  try {
    const { fixerId } = req.params;

    if (!fixerId) {
      return res.status(400).json({ message: 'fixerId is required' });
    }

    if (!(ObjectId.isValid(fixerId) && new ObjectId(fixerId).toHexString() === fixerId)) {
      return res.status(422).json({ error: 'Invalid fixer ID format' });
    }

    const db = await connectDB();
    const appointments = await appointmentsService.getAppointmentsByFixerId(db, fixerId);

    return res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({ message: 'Error fetching appointments' });
  }
}
