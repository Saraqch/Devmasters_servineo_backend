import { Request, Response } from "express";
import mongoose from "mongoose";
import { Payment } from "../../models/payment.model";
import crypto from "crypto";

const CODE_EXPIRATION_MS = 48 * 60 * 60 * 1000; // 48 horas

// ============================================
// HELPER: Generar código alfanumérico seguro
// ============================================
function generateSecureCode(length: number = 6): string {
  const chars = 'BCDFGHJKLMNPQRSTVWXYZ23456789'; // Sin vocales ni números confusos (0,1,O,I)
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    code += chars[randomIndex];
  }
  return code;
}

// ============================================
// PATCH /lab/payments/regenerate-code/:jobId
// Regenerar código y refrescar tiempo de expiración usando jobId
// ============================================
export const regeneratePaymentCodeByJob = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  
  try {
    const { jobId } = req.params as { jobId: string };

    // Validar jobId
    if (!jobId || !mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ 
        error: "jobId inválido" 
      });
    }

    session.startTransaction();

    // Buscar el pago que coincida con el jobId (independiente del status)
    const payment = await Payment.findOne({
      jobId: new mongoose.Types.ObjectId(jobId)
    })
    .sort({ createdAt: -1 }) // Obtener el más reciente si hay varios
    .session(session);

    if (!payment) {
      await session.abortTransaction();
      return res.status(404).json({ 
        error: "No se encontró un pago asociado a este jobId" 
      });
    }

    // Verificar que el pago esté pendiente
    const status = String(payment.status).toLowerCase();
    if (status !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({ 
        error: "Solo se puede regenerar el código para pagos pendientes",
        currentStatus: payment.status,
        jobId: String(payment.jobId)
      });
    }

    // Verificar si hay un bloqueo activo
    const now = new Date();
    if (payment.lockUntil && payment.lockUntil.getTime() > now.getTime()) {
      await session.abortTransaction();
      const msLeft = payment.lockUntil.getTime() - now.getTime();
      const waitMinutes = Math.ceil(msLeft / 60000);
      
      console.warn(`Payment ${payment._id}: regeneración bloqueada por intentos fallidos`);
      
      return res.status(429).json({
        error: "El pago está bloqueado por intentos fallidos",
        message: `Espera ${waitMinutes} minuto(s) antes de regenerar el código`,
        waitMinutes,
        unlocksAt: payment.lockUntil
      });
    }

    // Intentar generar un código único (máximo 10 intentos)
    let newCode: string | null = null;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const candidate = generateSecureCode(6).toUpperCase();
      
      // Verificar que el código no exista
      const exists = await Payment.findOne({ 
        code: candidate,
        _id: { $ne: payment._id } // Excluir el pago actual
      }).session(session);

      if (!exists) {
        newCode = candidate;
        break;
      }
      
      attempts++;
    }

    // Si no se pudo generar un código único después de 10 intentos, usar uno más largo
    if (!newCode) {
      newCode = generateSecureCode(8).toUpperCase();
    }

    // Actualizar el pago con el nuevo código y expiración
    const newExpiresAt = new Date(Date.now() + CODE_EXPIRATION_MS);

    payment.code = newCode;
    payment.codeExpiresAt = newExpiresAt;
    payment.failedAttempts = 0; // Resetear intentos fallidos
    payment.lockUntil = undefined; // Limpiar bloqueo si existía

    await payment.save({ session });
    await session.commitTransaction();

    console.log(`✅ Código regenerado para job ${jobId}, payment ${payment._id}: ${newCode}`);

    return res.status(200).json({
      message: "Código regenerado exitosamente",
      data: {
        paymentId: String(payment._id),
        jobId: String(payment.jobId),
        code: payment.code,
        expiresAt: payment.codeExpiresAt,
        status: payment.status,
        timeRemaining: {
          hours: 48,
          milliseconds: CODE_EXPIRATION_MS
        }
      }
    });

  } catch (e: any) {
    await session.abortTransaction();
    
    console.error("❌ Error regenerando código por jobId:", {
      error: e.message,
      stack: e.stack,
      jobId: req.params.jobId
    });

    // Manejo de errores específicos
    if (e.name === "ValidationError") {
      return res.status(400).json({ 
        error: "Error de validación",
        details: process.env.NODE_ENV === 'development' ? e.message : undefined
      });
    }

    if (e.code === 11000) {
      // Colisión de código único (muy raro)
      return res.status(409).json({ 
        error: "Conflicto al generar código único, intenta nuevamente"
      });
    }

    if (e.name === "CastError") {
      return res.status(400).json({ 
        error: "Formato de jobId inválido" 
      });
    }

    return res.status(500).json({ 
      error: "Error del servidor al regenerar código",
      ...(process.env.NODE_ENV === 'development' && { details: e.message })
    });
    
  } finally {
    session.endSession();
  }
};

// ============================================
// GET /lab/payments/job/:jobId/code-status
// Verificar estado del código usando jobId
// ============================================
export const checkCodeStatusByJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params as { jobId: string };

    if (!jobId || !mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ 
        error: "jobId inválido" 
      });
    }

    const payment = await Payment.findOne({
      jobId: new mongoose.Types.ObjectId(jobId),
      status: "pending"
    })
      .select('code codeExpiresAt status failedAttempts lockUntil jobId')
      .lean<{
        _id: mongoose.Types.ObjectId;
        jobId: mongoose.Types.ObjectId;
        code: string;
        codeExpiresAt?: Date;
        status: string;
        failedAttempts?: number;
        lockUntil?: Date;
      }>();

    if (!payment) {
      return res.status(404).json({ 
        error: "No se encontró un pago pendiente para este trabajo" 
      });
    }

    const now = new Date();
    const isExpired = payment.codeExpiresAt 
      ? payment.codeExpiresAt.getTime() < now.getTime() 
      : false;
    
    const isLocked = payment.lockUntil 
      ? payment.lockUntil.getTime() > now.getTime() 
      : false;

    const msUntilExpiration = payment.codeExpiresAt 
      ? Math.max(0, payment.codeExpiresAt.getTime() - now.getTime())
      : 0;

    const hoursUntilExpiration = Math.floor(msUntilExpiration / (60 * 60 * 1000));
    const minutesUntilExpiration = Math.floor((msUntilExpiration % (60 * 60 * 1000)) / (60 * 1000));

    return res.status(200).json({
      data: {
        paymentId: String(payment._id),
        jobId: String(payment.jobId),
        code: payment.code,
        status: payment.status,
        expiresAt: payment.codeExpiresAt,
        isExpired,
        isLocked,
        failedAttempts: payment.failedAttempts || 0,
        timeRemaining: {
          hours: hoursUntilExpiration,
          minutes: minutesUntilExpiration,
          milliseconds: msUntilExpiration
        },
        ...(isLocked && {
          unlocksAt: payment.lockUntil,
          lockedMinutes: Math.ceil((payment.lockUntil!.getTime() - now.getTime()) / 60000)
        })
      }
    });

  } catch (e: any) {
    console.error("❌ Error verificando estado del código por jobId:", e);
    
    return res.status(500).json({ 
      error: "Error del servidor",
      ...(process.env.NODE_ENV === 'development' && { details: e.message })
    });
  }
};