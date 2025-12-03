import { Db, ObjectId } from 'mongodb';

export interface JobRequest {
  _id?: ObjectId;
  title: string;
  description: string;
  location?: {
    type: 'Point';
    coordinates: [string, string];
  };
  startTime?: string;
  endTime?: string;
  price: number;
  requesterId: ObjectId;
  fixerId: ObjectId;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'paid';
  createdAt: Date;
  rating?: number;
  comment?: string;
  type?: string;
  appointmentId?: ObjectId;
  offerId?: ObjectId;
}

interface UserLocationData {
  _id: ObjectId;
  ubicacion?: {
    lat: number;
    lng: number;
    direccion?: string;
    departamento?: string;
    pais?: string;
  };
}

export async function getAllJobRequests(db: Db) {
  return db.collection<JobRequest>('jobs').find().toArray();
}

export async function getLocationById(db: Db, id: string): Promise<{ lat: string; lng: string }> {
  try {
    const user = await db
      .collection<UserLocationData>('users')
      .findOne({ _id: new ObjectId(id) }, { projection: { ubicacion: 1 } });

    if (!user || !user.ubicacion) {
      console.warn('Usuario no tiene ubicación, usando valores por defecto');
      return {
        lat: '-16.5000',
        lng: '-68.1500',
      };
    }

    return {
      lat: user.ubicacion.lat?.toString() || '-16.5000',
      lng: user.ubicacion.lng?.toString() || '-68.1500',
    };
  } catch (error) {
    console.error('Error in getLocationById service:', error);
    return {
      lat: '-16.5000',
      lng: '-68.1500',
    };
  }
}

export async function createJobRequest(
  db: Db,
  jobRequest: Omit<JobRequest, '_id' | 'requesterId' | 'fixerId' | 'status' | 'createdAt'> & {
    fixerId: string;
    price: string | number;
    appointmentId?: string;
    offerId?: string;
  },
  requesterId: string,
) {
  const jobRequestToInsert: JobRequest = {
    title: jobRequest.title,
    description: jobRequest.description,
    location: jobRequest.location,
    startTime: jobRequest.startTime,
    endTime: jobRequest.endTime,
    price: Number(jobRequest.price),
    requesterId: new ObjectId(requesterId),
    fixerId: new ObjectId(jobRequest.fixerId),
    status: 'pending',
    createdAt: new Date(),
    appointmentId: jobRequest.appointmentId ? new ObjectId(jobRequest.appointmentId) : undefined,
    offerId: jobRequest.offerId ? new ObjectId(jobRequest.offerId) : undefined,
  };

  const result = await db.collection<JobRequest>('jobs').insertOne(jobRequestToInsert);
  return { ...jobRequestToInsert, _id: result.insertedId };
}
