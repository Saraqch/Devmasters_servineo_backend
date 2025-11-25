import { Request, Response } from 'express';
import * as paymentCenterService from '../../services/paymentCenter.service';
import mongoose from 'mongoose';

/**
 * Obtiene los datos del centro de pagos (Stats de Jobs Y Saldo de Wallet).
 */
export const handleGetPaymentCenter = async (req: Request, res: Response) => {
  try {
    const { fixerId } = req.params;

    // Validación del ID
    if (!fixerId || !mongoose.Types.ObjectId.isValid(fixerId)) {
      return res.status(400).json({ success: false, error: "ID de Fixer inválido." });
    }

    // Ejecuta ambas consultas en paralelo para mayor eficiencia
    const [jobStats, wallet] = await Promise.all([
      paymentCenterService.getPaymentCenterData(fixerId),
      paymentCenterService.findOrCreateWalletByUserId(fixerId)
    ]);

    // Combina los resultados de ambas consultas
    res.status(200).json({
      success: true,
      data: {
        saldoActual: wallet.balance, // <-- Dato de la Wallet
        totalGanado: jobStats.totalGanado, // <-- Dato de Jobs
        trabajosCompletados: jobStats.trabajosCompletados, // <-- Dato de Jobs
        fixerId: fixerId,
      }
    });

  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Error desconocido en el servidor.' });
    }
  }
};