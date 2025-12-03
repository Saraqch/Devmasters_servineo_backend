// src/routes/dev-wallet.ts
import mongoose from 'mongoose';
import { Router } from 'express';
import { applyCommissionToWallet, applyTopUpToWallet } from '../../models/wallet/applyCommission';
import { walletAdapterReal } from '../../models/wallet/adapter.real';

export const devWalletRouter = Router();

// colección de USERS solo para buscar por email
const usersCollection = process.env.FIXERS_COLLECTION || 'users';

// A) Ver DB y colecciones
devWalletRouter.get('/dbinfo', async (_req, res) => {
  const name = mongoose.connection.name;
  if (!mongoose.connection.db) return res.status(500).json({ error: 'Database not connected' });
  const cols = await mongoose.connection.db.listCollections().toArray();
  res.json({
    db: name,
    collections: cols.map(c => c.name),
    walletMode: process.env.WALLET_STORAGE_MODE,
    walletsCollection: process.env.WALLETS_COLLECTION,
    usersCollection,
  });
});

// B) Buscar FIXER por email (devuelve _id del user)
devWalletRouter.get('/wallet/find-by-email', async (req, res) => {
  const email = String(req.query.email || '').trim();
  if (!email) return res.status(400).json({ error: 'EMAIL_REQUIRED' });
  if (!mongoose.connection.db) return res.status(500).json({ error: 'Database not connected' });

  const db = mongoose.connection.db;
  if (!db) return res.status(500).json({ error: 'DATABASE_CONNECTION_NOT_AVAILABLE' });
  
  const doc = await db.collection(usersCollection).findOne(
    { email },
    { projection: { _id: 1, role: 1, name: 1 } }
  );
  if (!doc) return res.status(404).json({ error: 'FIXER_NOT_FOUND_IN_COLLECTION', col: usersCollection, email });
  res.json({ id: doc._id, role: doc.role, name: doc.name, col: usersCollection });
});

// Inicializar/Upsert de wallet en colección separada (solo dev)
devWalletRouter.post('/wallet/init', async (req, res) => {
  try {
    const { fixerId, balance = 0, lowBalanceThreshold = 50 } = req.body ?? {};
    if (!fixerId) return res.status(400).json({ error: 'FIXER_ID_REQUIRED' });

    await walletAdapterReal.updateWalletById(String(fixerId), {
      balance,
      lowBalanceThreshold,
      flags: {
        needsLowAlert: false,
        needsCriticalAlert: false,
        updatedAt: null,
        cooldownUntil: null,
      },
      lastLowBalanceNotification: null,
    });

    res.json({ ok: true, upserted: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'SERVER_ERROR' });
  }
});

// Comisión (usa adapter REAL -> colección wallet)
devWalletRouter.post('/wallet/apply-commission', async (req, res) => {
  try {
    const { fixerId, commission } = req.body ?? {};
    if (!fixerId || typeof commission !== 'number') {
      return res.status(400).json({ error: 'BAD_REQUEST', hint: 'fixerId & commission:number' });
    }
    const result = await applyCommissionToWallet(walletAdapterReal, String(fixerId), commission);
    res.json({ ok: true, result });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'SERVER_ERROR' });
  }
});

// Recarga (usa adapter REAL -> colección wallet)
devWalletRouter.post('/wallet/top-up', async (req, res) => {
  try {
    const { fixerId, amount } = req.body ?? {};
    if (!fixerId || typeof amount !== 'number') {
      return res.status(400).json({ error: 'BAD_REQUEST', hint: 'fixerId & amount:number' });
    }
    const result = await applyTopUpToWallet(walletAdapterReal, String(fixerId), amount);
    res.json({ ok: true, result });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'SERVER_ERROR' });
  }
});

// Ver wallet (lee desde colección wallet)
devWalletRouter.get('/wallet/:id', async (req, res) => {
  const w = await walletAdapterReal.getWalletById(String(req.params.id));
  if (!w) return res.status(404).json({ error: 'FIXER_NOT_FOUND' });
  res.json(w);
});

export default devWalletRouter;