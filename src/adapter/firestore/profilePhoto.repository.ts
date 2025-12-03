import { db } from '../../config/firebase.config';

const COLLECTION = 'fotodeperfil';

export const setProfilePhotoUrl = async (userId: string, photoUrl: string): Promise<void> => {
  await db.collection(COLLECTION).doc(userId).set(
    {
      photoUrl,
      updatedAt: new Date(),
    },
    { merge: true }
  );
};

export const getProfilePhotoUrl = async (userId: string): Promise<string | null> => {
  const doc = await db.collection(COLLECTION).doc(userId).get();
  return doc.exists ? doc.data()?.photoUrl ?? null : null;
};

export const deleteProfilePhoto = async (userId: string): Promise<void> => {
  await db.collection(COLLECTION).doc(userId).delete();
};