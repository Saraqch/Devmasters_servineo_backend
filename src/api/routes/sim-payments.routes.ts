import { Router } from 'express';
import { debitCommission, topUp } from '../../services/wallet.service';
import { FEATURE_NOTIFICATIONS } from '../../models/featureFlags.model';

// si tienes el módulo de notifs sandbox:
let notifyLowBalance: any;
try {
  // evita romper si aún no existe el módulo
  ({ notifyLowBalance } = require('../modules/notifications'));
} catch (_) {
  notifyLowBalance = null;
}

export const simPaymentsRouter = Router();

/**
 * POST /api/sim/payments/charge
 * body: { fixerId: string, amount: number, to?: string }
 * "amount" es la comisión a debitar (positiva)
 */
simPaymentsRouter.post('/payments/charge', async (req, res) => {
  try {
    const { fixerId, amount, to } = req.body ?? {};
    if (!fixerId || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'BAD_REQUEST', hint: 'fixerId & amount:number>0' });
    }

    const result = await debitCommission(String(fixerId), Number(amount));

    if (
      FEATURE_NOTIFICATIONS &&
      notifyLowBalance &&
      (result.flags.needsLowAlert || result.flags.needsCriticalAlert)
    ) {
      await notifyLowBalance({
        userId: String(fixerId),
        to: String(to || 'test@example.com'),
        balance: result.postBalance,
        threshold: result.threshold,
      });
    }

    res.json({ ok: true, kind: 'charge', result });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: String(e?.message ?? e) });
  }
});

/**
 * POST /api/sim/payments/topup
 * body: { fixerId: string, amount: number, to?: string }
 * "amount" es la recarga a sumar (positiva)
 */
simPaymentsRouter.post('/payments/topup', async (req, res) => {
  try {
    const { fixerId, amount, to } = req.body ?? {};
    if (!fixerId || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'BAD_REQUEST', hint: 'fixerId & amount:number>0' });
    }

    const result = await topUp(String(fixerId), Number(amount));

    if (
      FEATURE_NOTIFICATIONS &&
      notifyLowBalance &&
      (result.flags.needsLowAlert || result.flags.needsCriticalAlert)
    ) {
      await notifyLowBalance({
        userId: String(fixerId),
        to: String(to || 'test@example.com'),
        balance: result.postBalance,
        threshold: result.threshold,
      });
    }

    res.json({ ok: true, kind: 'topup', result });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: String(e?.message ?? e) });
  }
});
