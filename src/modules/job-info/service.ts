import { Db, ObjectId } from 'mongodb';
import { JobSummary } from './model';

export async function getJobSummary(
  db: Db,
  id: string,
  coords?: { lat: number; lng: number },
): Promise<JobSummary | null> {
  if (!ObjectId.isValid(id)) return null;
  const _id = new ObjectId(id);

  const job = await db
    .collection('jobs')
    .findOne({ _id }, { projection: { title: 1, description: 1, createdAt: 1, status: 1 } });
  if (!job) return null;

  const appointment = await db
    .collection('appointments')
    .findOne({ job_id: _id }, { projection: { lat: 1, lon: 1 } });

  const UbicacionOriginal =
    appointment && appointment.lat && appointment.lon
      ? `${appointment.lat}, ${appointment.lon}`
      : undefined;

  return {
    _id: job._id.toHexString(),
    title: job.title,
    description: job.description || '',
    createdAt: job.createdAt!,
    Ubicacion: coords ? `${coords.lat}, ${coords.lng}` : 'Desconocida',
    UbicacionOriginal: UbicacionOriginal || 'Desconocida',
    status: job.status || 'Desconocido',
  };
}
