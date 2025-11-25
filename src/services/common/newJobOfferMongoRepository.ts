import { JobOfferRepository } from "../../types/newJobOfferRepository";
import { JobOfferModel, IJobOffer } from "../../models/newJobOffer.model";
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

  async findAll(): Promise<IJobOffer[]> {
    try {
      return await JobOfferModel.find().sort({ createdAt: -1 });
    } catch (error: any) {
      throw new Error(`Error al obtener ofertas: ${error.message}`);
    }
  }

  async findByFixerId(fixerId: string): Promise<IJobOffer[]> {
    try {
      return await JobOfferModel.find({ fixerId }).sort({ createdAt: -1 });
    } catch (error: any) {
      throw new Error(`Error al obtener ofertas del fixer: ${error.message}`);
    }
  }

  async update(offerId: string, data: Partial<CreateOfferInput>): Promise<IJobOffer | null> {
    try {
      return await JobOfferModel.findByIdAndUpdate(
        offerId,
        { $set: data },
        { new: true }
      );
    } catch (error: any) {
      throw new Error(`Error al actualizar oferta: ${error.message}`);
    }
  }

  async delete(offerId: string): Promise<void> {
    try {
      await JobOfferModel.findByIdAndDelete(offerId);
    } catch (error: any) {
      throw new Error(`Error al eliminar oferta: ${error.message}`);
    }
  }
}