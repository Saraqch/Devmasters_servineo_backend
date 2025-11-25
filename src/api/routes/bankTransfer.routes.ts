//pasar
import express from 'express';
import { createOrReuseIntent } from '../controllers/bankTransfer.controller';
import PaymentIntent from '../../models/PaymentIntent.model';
import ProviderPaymentMethod from '../../models/ProviderPaymentMethod.model';

const SERVINEO_PROVIDER_ID = 'prov_123';

const router = express.Router();

router.get('/ping', (_req, res) => {
  res.json({ ok: true, from: 'transferencia-bancaria' });
});

router.post('/intent', createOrReuseIntent);

// NUEVA RUTA GET para obtener intent de un fixerId
router.get('/intent/:fixerId', async (req, res) => {
  try {
    const { fixerId } = req.params;
    if (!fixerId) return res.status(400).json({ error: 'MISSING_FIXER_ID' });

    const intent = await PaymentIntent.findOne({ fixerId, type: 'wallet', method: 'transfer' });
    if (!intent) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'No existe transferencia para este fixer' });
    }

    const method = await ProviderPaymentMethod.findOne({ providerId: SERVINEO_PROVIDER_ID, active: true });
    if (!method) {
      return res.status(404).json({ error: 'NO_TRANSFER_METHOD', message: 'No se encontró método de transferencia' });
    }

    return res.json({
      intent,
      paymentMethod: {
        accountDisplay: method.accountDisplay,
        accountNumber: method.accountNumber || 'N/A',
      },
    });
  } catch (err) {
    console.error('[transferencia-bancaria] GET /intent/:fixerId error:', err);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

export default router;