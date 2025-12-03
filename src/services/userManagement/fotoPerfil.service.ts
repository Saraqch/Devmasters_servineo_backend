import clientPromise from '../../config/db/mongodb';
import { ObjectId } from 'mongodb';

export async function updateUserPhoto(usuarioId: string, fotoPerfil: string): Promise<boolean> {
  const mongoClient = await clientPromise;
  const db = mongoClient.db('ServineoBD');
  const collection = db.collection('users');

  const result = await collection.updateOne(
    { _id: new ObjectId(usuarioId) },
    {
      $set: {
        url_photo: fotoPerfil,
      },
    },
  );

  return result.matchedCount > 0;
}
