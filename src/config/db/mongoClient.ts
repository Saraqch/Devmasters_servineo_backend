/*
import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`❌ La variable de entorno ${name} no está definida`);
  }
  return value;
}

const uri = getEnvVar("MONGO_URI");
const dbName = getEnvVar("DB_NAME");

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (db && client) return db;

  try {
    client = new MongoClient(uri);
    await client.connect();

    db = client.db(dbName);
    console.log(`✅ Conectado correctamente a MongoDB: ${dbName}`);
    return db;
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error);
    throw error;
  }
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    console.log("🔒 Conexión cerrada a MongoDB");
    client = null;
    db = null;
  }
}
*/