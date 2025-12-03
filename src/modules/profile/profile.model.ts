export type FixerProfile = {
  name: string;
  photo_url: string;
  role: string;
  average_rating: number;
  ratings: { [key: number]: number };
  rating_count: number;
};
