import { CreateOfferInput } from "./newOfferInput";

export interface JobOfferRepository {
  save(offer: CreateOfferInput): Promise<{ insertedId: string }>;
}