import { ObjectId } from 'mongodb';
import { connectDB } from '../../config/db/mongoClient';
import { FixerProfile } from './profile.model';
export async function getProfileData(id: string): Promise<FixerProfile> {
  const db = await connectDB();
  const usersCollection = db.collection('users');
  const user = await usersCollection.findOne({ _id: new ObjectId(id) });
  if (!user) {
    throw new Error('User not found');
  }
  const jobsCollection = db.collection('jobs');
  const ratings = await jobsCollection
    .find({ fixerId: new ObjectId(id) }, { projection: { rating: 1 } })
    .toArray();

  //Order ratings
  ratings.sort((a, b) => b.rating - a.rating);
  const ratingCounts: { [key: number]: number } = {};
  ratings.forEach((job) => {
    if (job.rating) {
      ratingCounts[job.rating] = (ratingCounts[job.rating] || 0) + 1;
    }
  });
  const fixerProfile: FixerProfile = {
    name: user.name,
    photo_url: user.url_photo,
    role: user.role,
    ratings: ratingCounts || 0,
    rating_count: ratings.length || 0,
    average_rating:
      ratings?.reduce((sum, job) => sum + (job.rating || 0), 0) / (ratings.length || 1) || 0,
  };

  return fixerProfile;
}
