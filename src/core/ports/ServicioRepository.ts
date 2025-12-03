import { Servicio } from "../entities/Servicio";

export interface ServicioRepository {
  save(servicio: Servicio): Promise<{ insertedId: string }>;
}
