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

export async function obtenerTodasLasOfertas() {
  return await repo.findAll();
}

export async function obtenerOfertasPorFixer(fixerId: string) {
  return await repo.findByFixerId(fixerId);
}

export async function actualizarOferta(offerId: string, data: Partial<CreateOfferInput>) {
  return await repo.update(offerId, data);
}

export async function eliminarOferta(offerId: string) {
  return await repo.delete(offerId);
}