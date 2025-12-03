// src/adapter/firestore/jobOfferPhotos.repository.ts
import { db, bucket } from '../../config/firebase.config';
const COLLECTION = 'ofertadetrabajo';

export const addJobOfferPhoto = async (
  userId: string,
  file: any // ahora sí lo reconoce
): Promise<string> => {
  // Contar fotos existentes
  const snapshot = await db
    .collection(COLLECTION)
    .doc(userId)
    .collection('photos')
    .get();

  if (snapshot.size >= 5) {
    throw new Error('Máximo 5 fotos permitidas por usuario');
  }

  // Subir archivo
  const fileName = `${userId}/${Date.now()}_${file.originalname}`;
  const fileUpload = bucket.file(`job-offers/${fileName}`);

  await fileUpload.save(file.buffer, {
    metadata: { contentType: file.mimetype },
  });

  await fileUpload.makePublic();
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/job-offers/${fileName}`;

  // Guardar referencia
  await db
    .collection(COLLECTION)
    .doc(userId)
    .collection('photos')
    .add({
      url: publicUrl,
      fileName,
      originalName: file.originalname,
      uploadedAt: new Date(),
    });

  return publicUrl;
};

export const getJobOfferPhotos = async (userId: string) => {
  const snapshot = await db
    .collection(COLLECTION)
    .doc(userId)
    .collection('photos')
    .orderBy('uploadedAt', 'desc')
    .get();

  return snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const deleteJobOfferPhoto = async (userId: string, photoId: string, fileName: string) => {
  await bucket.file(`job-offers/${fileName}`).delete().catch(() => {});
  await db.collection(COLLECTION).doc(userId).collection('photos').doc(photoId).delete();
};