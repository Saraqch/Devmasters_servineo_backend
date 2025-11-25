import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Payment } from "../../models/payment.model";
import { Comision } from "../../models/historycomission.model";
import { Wallet } from "../../models/wallet.model";
import { Job } from "../../models/jobsPayment.model";
import { UserPayment as User } from "../../models/userPayment.model"; 

const MAX_ATTEMPTS = 3;
const LOCK_MINUTES = 10;

export async function confirmPaymentLab(req: Request, res: Response) {
  const session = await mongoose.startSession();
  
  try {
    const { id } = req.params as { id: string };
    const { code } = (req.body || {}) as { code?: string };

    // 1. Validaciones básicas de 'id' y 'code' (del req.body)
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "id inválido" });
    }

    if (!code) { 
      return res.status(400).json({ error: "code requerido" });
    }

    // 2. Definir 'provided' DESPUÉS de validar que 'code' existe
    const provided = String(code).toUpperCase().trim();
    
    // 3. Validar el formato de 'provided'
    if (!/^[A-Z0-9]{4,10}$/.test(provided)) {
      return res.status(400).json({ 
        error: "formato de código inválido" 
      });
    }

    session.startTransaction();

    // Obtener el pago con lock pesimista
    const pay = await Payment.findById(id).session(session);
    
    if (!pay) {
      await session.abortTransaction();
      return res.status(404).json({ error: "pago no encontrado" });
    }

    // Verificar que el pago esté pendiente
    if (String(pay.status).toLowerCase() !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({ 
        error: `el pago ya fue procesado`,
        status: pay.status 
      });
    }

    // Verificar expiración del código
    if (pay.codeExpiresAt && pay.codeExpiresAt.getTime() < Date.now()) {
      await session.abortTransaction();
      return res.status(410).json({ 
        error: "código expirado",
        expiredAt: pay.codeExpiresAt 
      });
    }

    const now = new Date();

    // Verificar si hay un bloqueo activo
    if (pay.lockUntil && pay.lockUntil.getTime() > now.getTime()) {
      await session.abortTransaction();
      const msLeft = pay.lockUntil.getTime() - now.getTime();
      const waitMinutes = Math.ceil(msLeft / 60000);
      
      console.warn(`Payment ${id}: intento rechazado por bloqueo activo`);
      
      return res.status(429).json({
        error: "demasiados intentos fallidos",
        message: `intenta nuevamente en ${waitMinutes} minuto(s)`,
        waitMinutes,
        unlocksAt: pay.lockUntil
      });
    }

    // Limpiar bloqueo si ya expiró
    if (pay.lockUntil && pay.lockUntil.getTime() <= now.getTime()) {
      pay.lockUntil = null;
      pay.failedAttempts = 0;
    }

    const real = String(pay.code);

    // Verificar código
    if (provided !== real) {
      // Incrementar intentos fallidos
      const newAttempts = (pay.failedAttempts ?? 0) + 1;
      pay.failedAttempts = newAttempts;

      console.warn(`Payment ${id}: intento fallido ${newAttempts}/${MAX_ATTEMPTS}`);

      // Bloquear si se alcanzó el límite
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockUntil = new Date(now.getTime() + LOCK_MINUTES * 60 * 1000);
        pay.lockUntil = lockUntil;
        await pay.save({ session });
        await session.commitTransaction();

        console.warn(`Payment ${id}: BLOQUEADO por ${LOCK_MINUTES} minutos`);

        return res.status(429).json({
          error: "cuenta bloqueada",
          message: `has superado los ${MAX_ATTEMPTS} intentos; intenta nuevamente en ${LOCK_MINUTES} minuto(s)`,
          waitMinutes: LOCK_MINUTES,
          unlocksAt: lockUntil
        });
      }

      // Guardar intento fallido
      await pay.save({ session });
      await session.commitTransaction();

      const remaining = MAX_ATTEMPTS - newAttempts;
      return res.status(401).json({
        error: "código inválido",
        remainingAttempts: remaining,
        message: `código inválido, te quedan ${remaining} intento(s)`
      });
    }

    // ✅ Código correcto - Confirmar pago usando operación atómica
    const confirmedPayment = await Payment.findOneAndUpdate(
      { 
        _id: id,
        status: "pending", // doble verificación
        code: provided
      },
      {
        $set: {
          status: "paid",
          paymentDate: now,
          failedAttempts: 0,
          lockUntil: null
        }
      },
      { 
        new: true,
        session 
      }
    );

    if (!confirmedPayment) {
      await session.abortTransaction();
      return res.status(409).json({ 
        error: "conflicto: el pago ya fue procesado por otra solicitud" 
      });
    }

    // ============================================
    // 🎯 NUEVO: ACTUALIZAR STATUS DEL JOB A "PAGADO"
    // ============================================
    let jobActualizado = false;
    
    if (confirmedPayment.jobId) {
      try {
        console.log(`🔄 Actualizando status del job ${confirmedPayment.jobId} a "Pagado"`);
        
        const jobUpdated = await Job.findByIdAndUpdate(
          confirmedPayment.jobId,
          { 
            $set: { 
              status: "Pagado" 
            } 
          },
          { 
            new: true,
            session 
          }
        );

        if (jobUpdated) {
          console.log(`✅ Job ${confirmedPayment.jobId} actualizado a status "Pagado"`);
          jobActualizado = true;
        } else {
          console.warn(`⚠️ No se encontró el job ${confirmedPayment.jobId}`);
        }
      } catch (jobError: any) {
        console.error(`❌ Error actualizando job ${confirmedPayment.jobId}:`, jobError);
        // No abortamos la transacción, el pago ya se confirmó
      }
    } else {
      console.warn(`⚠️ El pago ${id} no tiene jobId asociado`);
    }

    // ============================================
    // 🔥 TRIGGER: ENRIQUECER PAGO CON DATOS DE FACTURA (CORREGIDO)
    // ============================================
    console.log(`🧾 Añadiendo datos de factura al pago ${id}`);
    
    try {
      // 1. Buscar los datos usando los modelos correctos
      const [job, requester] = await Promise.all([
        // ¡CAMBIO! Usamos Job (de jobs.model.ts) para encontrar el trabajo
        Job.findById(confirmedPayment.jobId).session(session),
        User.findById(confirmedPayment.payerId).session(session) // Usamos User (de user.model.ts)
      ]);

      if (!job || !requester) {
        throw new Error("No se encontraron el Job (en jobspays) o el Requester (en users) para la factura.");
      }

      // 2. Calcular montos finales
      const subtotal = confirmedPayment.amount.total;
      const commission = subtotal * (confirmedPayment.commissionRate || 0.05);
      const iva = (subtotal + commission) * 0.13; 
      const totalFinal = subtotal + commission + iva;

      // 3. Actualizar el documento 'Payment' con los datos de la factura
      await Payment.findByIdAndUpdate(confirmedPayment._id, {
        $set: {
          requesterName: requester.name, // SÍ existe en user.model.ts
          companyName: (requester as any).companyName || "N/A", // (user.model.ts no tiene companyName)
          taxId: (requester as any).taxId || "N/A",             // (user.model.ts no tiene taxId)
          jobType: job.type, 
          jobDescription: job.description, 
          transactionId: `CASH-${confirmedPayment._id}`, 
          "Payment Method": "Efectivo", 
          commission: commission,
          iva: iva,
          "amount.total": totalFinal 
        }
      }, { session });

      console.log(`✅ Datos de factura añadidos al pago ${confirmedPayment._id}`);

    } catch (invoiceError: any) {
      console.error("❌ Error en trigger de facturación:", invoiceError.message);
    }
    // ============================================
    // FIN DE LÓGICA DE FACTURACIÓN
    // ============================================


    // ============================================
    // 🔥 TRIGGER: ACTUALIZAR 'jobspays' (AÑADIDO)
    // ============================================
    try {
      console.log(`🧾 Actualizando estado en 'jobspays' para el jobId: ${confirmedPayment.jobId}`);
      
      // Busca el job en la colección 'jobspays' (usando el modelo Job)
      await Job.findByIdAndUpdate( 
        confirmedPayment.jobId,
        { $set: { status: "Pagado" } }, // Actualiza el estado a "Pagado"
        { session }
      );
      console.log(`✅ 'jobspays' actualizado a "Pagado".`);
    } catch (jobspayError: any) {
      console.error("❌ Error al actualizar 'jobspays':", jobspayError.message);
    }
    // ============================================
    // FIN DEL TRIGGER 'jobspays'
    // ============================================


    // ============================================
    // 🔥 TRIGGER: CREAR COMISIÓN AUTOMÁTICAMENTE
    // ============================================
    console.log(`💰 Activando trigger de comisión para pago ${id}`);
    
    try {
      // Buscar la wallet del fixer
      const fixerWallet = await Wallet.findOne({ 
        users_id: confirmedPayment.fixerId 
      }).session(session);

      if (!fixerWallet) {
        console.warn(`❌ No se encontró wallet para fixer: ${confirmedPayment.fixerId}`);
      }

      // Calcular comisión
      const comisionRate = confirmedPayment.commissionRate || 0.05;
      const montoServicio = confirmedPayment.amount.total; 
      const comisionMonto = montoServicio * comisionRate;

      let estadoComision = "completada";
      let motivoFallo = null;

      if (fixerWallet && fixerWallet.balance >= comisionMonto) {
        await Wallet.findByIdAndUpdate(
          fixerWallet._id,
          { $inc: { balance: -comisionMonto } },
          { session }
        );
        console.log(`✅ Comisión de ${comisionMonto} Bs descontada del wallet`);
      } else {
        estadoComision = "fallida";
        motivoFallo = fixerWallet 
          ? `Fondos insuficientes: ${fixerWallet.balance} Bs < ${comisionMonto} Bs`
          : "Wallet del fixer no encontrado";
        console.warn(`❌ ${motivoFallo}`);
      }

      await Comision.create([{
        wallets_id: fixerWallet?._id || confirmedPayment.fixerId,
        payments_id: confirmedPayment._id,
        fixer_id: confirmedPayment.fixerId,
        comision: comisionMonto,
        monto_servicio: montoServicio,
        tipo_servicio: "Servicio general", 
        estado: estadoComision,
        motivo_fallo: motivoFallo,
        fecha_completada: estadoComision === "completada" ? new Date() : undefined
      }], { session });

      console.log(`✅ Comisión registrada en historial: ${estadoComision}`);

    } catch (error: any) {
      console.error("❌ Error en trigger de comisión:", error);
    }

    await session.commitTransaction();

    console.info(`Payment ${id}: confirmado exitosamente + triggers ejecutados`);

    // Devolvemos el documento 'Payment' completo y actualizado
    //const finalPaymentDoc = await Payment.findById(id).lean();

    return res.json({
      message: "pago confirmado exitosamente",
      data: {
        id: String(confirmedPayment._id),
        total: confirmedPayment.amount.total,
        status: confirmedPayment.status,
        paidAt: confirmedPayment.paymentDate,
        comisionProcesada: true,
        jobActualizado: jobActualizado, // ← NUEVO: Indicar si se actualizó el job
        jobId: confirmedPayment.jobId || null
      }
    });

  } catch (e: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    
    console.error("Error confirmando pago:", {
      error: e.message,
      stack: e.stack,
      paymentId: req.params.id
    });

    if (e.name === 'ValidationError') {
      return res.status(400).json({ 
        error: "datos de validación inválidos",
        details: process.env.NODE_ENV === 'development' ? e.message : undefined
      });
    }

    if (e.name === 'CastError') {
      return res.status(400).json({ error: "formato de id inválido" });
    }

    return res.status(500).json({ 
      error: "error del servidor al procesar el pago",
      ...(process.env.NODE_ENV === 'development' && { details: e.message })
    });
    
  } finally {
    session.endSession();
  }
}