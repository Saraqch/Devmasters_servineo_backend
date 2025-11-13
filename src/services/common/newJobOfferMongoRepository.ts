import { JobOfferRepository } from "../../types/newJobOfferRepository";
import { JobOfferModel } from "../../models/newJobOffer.model";
import { CreateOfferInput } from "../../types/newOfferInput";

export class JobOfferMongoRepository implements JobOfferRepository {
  async save(offer: CreateOfferInput): Promise<{ insertedId: string }> {
    try {
      const saved = await JobOfferModel.create(offer);
      return { insertedId: saved._id.toString() };
    } catch (error: any) {
      throw new Error(`Error al guardar oferta: ${error.message}`);
    }
  }
}