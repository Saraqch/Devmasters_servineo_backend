import { Servicio } from "../core/entities/Servicio";
import { ServicioRepository } from "../core/ports/ServicioRepository";

export async function crearServicio(
  repo: ServicioRepository,
  data: Servicio
) {
  const nuevoServicio: Servicio = {
    ...data,
    precio: parseFloat(data.precio.toFixed(2)),
    createdAt: new Date(),
  };

  return await repo.save(nuevoServicio);
}
