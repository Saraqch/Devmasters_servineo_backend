import { ServicioRepository } from "../../core/ports/ServicioRepository";
import { Servicio } from "../../core/entities/Servicio";
import { connectDB } from "../../config/db/mongoClient";

export class ServicioMongoRepository implements ServicioRepository {
  async save(servicio: Servicio): Promise<{ insertedId: string }> {
    const db = await connectDB();
    const collection = db.collection<Servicio>("newoffers");
    const result = await collection.insertOne(servicio);
    return { insertedId: result.insertedId.toHexString() }; 
  }
}
