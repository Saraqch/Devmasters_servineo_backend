import { CreateOfferInput } from "./newOfferInput";
import { IJobOffer } from "../models/newJobOffer.model";

export interface JobOfferRepository {
  save(offer: CreateOfferInput): Promise<{ insertedId: string }>;
  findAll(): Promise<IJobOffer[]>;
  findByFixerId(fixerId: string): Promise<IJobOffer[]>;
  update(offerId: string, data: Partial<CreateOfferInput>): Promise<IJobOffer | null>;
  delete(offerId: string): Promise<void>;
}