import mongoose from "mongoose";

// 👇 Type definitions for wallet adapter
export interface WalletSlice {
  balance: number;
  lowBalanceThreshold: number;
  flags: any;
  lastLowBalanceNotification: Date | null;
}

export interface WalletModelAdapter {
  getWalletById(fixerId: string): Promise<WalletSlice | null>;
  updateWalletById(fixerId: string, patch: any): Promise<void>;
}

// 👇 helper: si son 24 hex, usa ObjectId; si no, deja string
function normalizeId(raw: string) {
  const s = String(raw).trim();
  return /^[0-9a-fA-F]{24}$/.test(s) ? new mongoose.Types.ObjectId(s) : s;
}

export function makeRawCollectionWalletAdapter(collectionName: string) {
  return {
    async getWalletById(fixerId: string) {
      const _id = normalizeId(fixerId); // <-- cambio
      const db = mongoose.connection.db;
      if (!db) throw new Error("Database connection not available");
      
      const doc = await db
        .collection(collectionName)
        .findOne(
          { _id } as any,
          {
            projection: {
              "wallet.balance": 1,
              "wallet.lowBalanceThreshold": 1,
              "wallet.flags": 1,
              "wallet.lastLowBalanceNotification": 1,
            },
          }
        );
      if (!doc?.wallet) return null;
      return {
        balance: Number(doc.wallet.balance ?? 0),
        lowBalanceThreshold: Number(doc.wallet.lowBalanceThreshold ?? 0),
        flags: doc.wallet.flags ?? null,
        lastLowBalanceNotification: doc.wallet.lastLowBalanceNotification ?? null,
      };
    },

    async updateWalletById(fixerId: string, patch: any) {
      const _id = normalizeId(fixerId); // <-- cambio
      const db = mongoose.connection.db;
      if (!db) throw new Error("Database connection not available");
      
      const $set: any = { "wallet.updatedAt": new Date() };
      if (patch.balance !== undefined) $set["wallet.balance"] = patch.balance;
      if (patch.lowBalanceThreshold !== undefined) $set["wallet.lowBalanceThreshold"] = patch.lowBalanceThreshold;
      if (patch.flags !== undefined) $set["wallet.flags"] = patch.flags;
      if (patch.lastLowBalanceNotification !== undefined) $set["wallet.lastLowBalanceNotification"] = patch.lastLowBalanceNotification;

      await db
        .collection(collectionName)
        .updateOne({ _id } as any, { $set });
    },
  };
}