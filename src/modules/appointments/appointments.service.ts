import { Db, ObjectId } from 'mongodb';

export interface Appointment {
  _id: ObjectId;
  id_fixer: string;
  id_requester: string;
  selected_date: { $date: string };
  current_requester_name: string;
  appointment_type: string;
  appointment_description: string;
  link_id: string;
  current_requester_phone: string;
  starting_time: { $date: string };
  finishing_time: { $date: string };
  schedule_state: string;
  display_name_location: string;
  lat: string | null;
  lon: string | null;
  cancelled_fixer: boolean;
  reprogram_reason: string;
  createdAt: { $date: string };
  updatedAt: { $date: string };
  __v: number;
}

export async function getAppointmentsByFixerId(db: Db, fixerId: string) {
  return db
    .collection<Appointment>('appointments')
    .find({
      id_fixer: fixerId,
      schedule_state: 'booked',
    })
    .sort({ starting_time: 1 })
    .toArray();
}
