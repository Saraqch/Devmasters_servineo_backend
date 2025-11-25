import mongoose from 'mongoose';
import type { WalletModelAdapter, WalletSlice } from './adapter';

function toQueryForId(id: string) {
  const asObjId = /^[0-9a-fA-F]{24}$/.test(String(id))
    ? new mongoose.Types.ObjectId(String(id))
    : String(id);

  // Si nos dijeron que el campo es ObjectId, usa solo ObjectId
  if (process.env.WALLET_USER_ID_IS_OBJECTID === 'true') {
    return asObjId;
  }
  // Por defecto (string), busca por string; si el doc ya estuviera con ObjectId, igual lo encontrará
  return { $in: [String(id), asObjId] };
}

/** Wallet en colección separada, referenciando usuario por WALLET_USER_ID_FIELD */
export function makeWalletCollectionByUserIdAdapter(
  collectionName: string,
  idField: string = 'users_id'
): WalletModelAdapter {
  return {
    async getWalletById(fixerId: string): Promise<WalletSlice | null> {
      const query = { [idField]: toQueryForId(fixerId) };
      const db = mongoose.connection.db;
      if (!db) throw new Error("Database connection not available");
      
      const doc = await db.collection(collectionName).findOne(
        query,
        { projection: { balance: 1, lowBalanceThreshold: 1, flags: 1, lastLowBalanceNotification: 1 } }
      );
      if (!doc) return null;

      const flags = doc.flags ?? null; // puede no existir aún
      return {
        balance: Number(doc.balance ?? 0),
        lowBalanceThreshold: Number(doc.lowBalanceThreshold ?? 0),
        flags,
        lastLowBalanceNotification: doc.lastLowBalanceNotification ?? null,
      };
    },

    async updateWalletById(fixerId: string, patch: any): Promise<void> {
      const query = { [idField]: toQueryForId(fixerId) };
      const db = mongoose.connection.db;
      if (!db) throw new Error("Database connection not available");
      
      const $set: any = { updatedAt: new Date() };
      if (patch.balance !== undefined) $set.balance = patch.balance;
      if (patch.lowBalanceThreshold !== undefined) $set.lowBalanceThreshold = patch.lowBalanceThreshold;
      if (patch.flags !== undefined) $set.flags = patch.flags;
      if (patch.lastLowBalanceNotification !== undefined) $set.lastLowBalanceNotification = patch.lastLowBalanceNotification;

      const setOnInsert: any = { createdAt: new Date() };
      // aseguremos el campo users_id en el upsert:
      const usersIdValue = (process.env.WALLET_USER_ID_IS_OBJECTID === 'true')
        ? new mongoose.Types.ObjectId(String(fixerId))
        : String(fixerId);
      setOnInsert[idField] = usersIdValue;

      await db.collection(collectionName).updateOne(
        query,
        { $set, $setOnInsert: setOnInsert },
        { upsert: true }
      );
    },
  };
}
