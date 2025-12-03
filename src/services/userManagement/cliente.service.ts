import clientPromise from "../../config/db/mongodb";
import { ObjectId } from "mongodb";

export interface LoginMethod {
  provider: string; 
  email: string;
}

export async function getClientById(id: string) {
  const mongoClient = await clientPromise;
  const db = mongoClient.db("ServineoBD");

  const client = await db.collection("users").findOne(
    { _id: new ObjectId(id) },
    { projection: { name: 1, email: 1, url_photo: 1, authProviders: 1 } } 
  );

  return client;
}

export async function removeLoginMethod(userId: string, provider: string) {
  const mongoClient = await clientPromise;
  const db = mongoClient.db("ServineoBD");

  const result = await db.collection("users").findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $pull: { authProviders: { provider } } as any }, 
    { returnDocument: "after" }
  );

  if (!result?.value) {
    throw new Error("No se encontró el cliente para actualizar");
  }

  return result.value;
}