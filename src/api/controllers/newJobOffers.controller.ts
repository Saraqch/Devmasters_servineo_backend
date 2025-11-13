import { JobOfferMongoRepository } from "../../services/common/newJobOfferMongoRepository";
import { JobOfferRepository } from "../../types/newJobOfferRepository";
import { CreateOfferInput } from "../../types/newOfferInput";

const repo: JobOfferRepository = new JobOfferMongoRepository();

export async function crearOfertaTrabajo(
  data: CreateOfferInput
): Promise<{ insertedId: string }> {
  const nuevaOferta = {
    ...data,
    price: parseFloat(data.price.toFixed(2)),
    createdAt: new Date(),
  };

  return await repo.save(nuevaOferta);
}