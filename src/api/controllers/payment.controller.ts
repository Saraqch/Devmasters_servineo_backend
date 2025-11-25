import type { Request, Response } from "express";
import Stripe from "stripe";
import { Payment } from "../../models/payment.model";
import { Card } from "../../models/card.model";
import { UserPayment as User } from "../../models/userPayment.model";
import { Job } from "../../models/jobsPayment.model";
import 'dotenv/config';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ ERROR: Falta STRIPE_SECRET_KEY en el archivo .env");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16" as any,
});

export const createPayment = async (req: Request, res: Response) => {
  console.group("🧾 [createPayment] Nueva solicitud de pago");
  console.time("⏱ Duración total del proceso");

  try {
    const { requesterId, fixerId, jobId, cardId, amount, paymentMethodId } = req.body;

    console.log("📥 Datos recibidos:", { requesterId, fixerId, jobId, cardId, amount, paymentMethodId });

    // --- VALIDACIONES BÁSICAS ---
    if (!requesterId || !fixerId || !jobId || !amount) {
      console.error("❌ Faltan datos obligatorios en la solicitud");
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    if (isNaN(amount) || amount <= 0) {
      console.error("❌ El monto debe ser un número positivo");
      return res.status(400).json({ error: "El monto debe ser un número positivo" });
    }

    // --- BUSCAR USUARIOS ---
    console.log("🔍 Buscando requester y fixer...");
    const [requester, fixer] = await Promise.all([
      User.findById(requesterId),
      User.findById(fixerId),
    ]);

    if (!requester) {
      console.error(`❌ Requester ${requesterId} no encontrado`);
      return res.status(404).json({ error: "Requester no encontrado" });
    }

    if (!fixer) {
      console.error(`❌ Fixer ${fixerId} no encontrado`);
      return res.status(404).json({ error: "Fixer no encontrado" });
    }

    if (requester.role !== "requester") {
      console.error("⚠️ El pagador no tiene rol 'requester'");
      return res.status(400).json({ error: "El pagador debe tener rol 'requester'" });
    }

    if (fixer.role !== "fixer") {
      console.error("⚠️ El receptor no tiene rol 'fixer'");
      return res.status(400).json({ error: "El receptor debe tener rol 'fixer'" });
    }

    // --- CREAR CLIENTE STRIPE SI NO EXISTE ---
    let customerId = requester.stripeCustomerId;
    if (!customerId) {
      console.log("🆕 Creando nuevo cliente Stripe...");
      const customer = await stripe.customers.create({
        email: requester.email,
        name: requester.name,
      });
      requester.stripeCustomerId = customer.id;
      await requester.save();
      customerId = customer.id;
      console.log(`✅ Cliente Stripe creado: ${customerId}`);
    } else {
      console.log(`🟢 Cliente Stripe existente: ${customerId}`);
    }

    // --- OBTENER MÉTODO DE PAGO ---
    let stripePaymentMethodId;
    if (cardId) {
      console.log("💳 Buscando tarjeta por ID...");
      const card = await Card.findById(cardId);
      if (!card) {
        console.error("❌ Card no encontrada");
        return res.status(404).json({ error: "Card no encontrada" });
      }
      if (card.userId.toString() !== requesterId.toString()) {
        console.error("⚠️ La tarjeta no pertenece al requester");
        return res.status(400).json({ error: "La tarjeta no pertenece al requester" });
      }
      stripePaymentMethodId = card.stripePaymentMethodId;
    } else if (paymentMethodId) {
      stripePaymentMethodId = paymentMethodId;
      console.log("💳 Usando paymentMethodId temporal del frontend");
    } else {
      console.error("❌ No se proporcionó tarjeta ni paymentMethod");
      return res.status(400).json({ error: "No se proporcionó tarjeta ni PaymentMethod" });
    }

    // --- CREAR INTENTO DE PAGO ---
    console.log("🚀 Creando PaymentIntent en Stripe...");
    let paymentIntent;

    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "BOB",
        customer: customerId,
        payment_method: stripePaymentMethodId,
        confirm: true,
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      });
      console.log("✅ PaymentIntent creado:", paymentIntent.id, "Estado:", paymentIntent.status);
    } catch (stripeError: any) {
      console.error("❌ Error al crear PaymentIntent:", (stripeError as any).message);
      return res.status(400).json({
        error: "Error al procesar el pago con Stripe",
        details: (stripeError as any).message,
      });
    }

    // --- GUARDAR PAGO EN MONGODB ---
    console.log("🗃️ Guardando información del pago en MongoDB...");
    const paymentData = await Payment.create({
      requesterId,
      fixerId,
      jobId,
      cardId: cardId || null,
      temporaryPaymentMethodId: cardId ? null : paymentMethodId,
      amount,
      status: paymentIntent.status === "succeeded" ? "paid" : "pending",
      paymentIntentId: paymentIntent.id,
    });

    console.log(`✅ Pago guardado correctamente con estado '${paymentData.status}'`);

    // --- ACTUALIZAR ESTADO DEL TRABAJO ---
    const job = await Job.findById(jobId);
    if (!job) {
      console.error(`⚠️ Trabajo con ID ${jobId} no encontrado`);
    } else {
      job.status = paymentIntent.status === "succeeded" ? "Pagado" : "Pago pendiente";
      await job.save();
      console.log(`🧱 Estado del trabajo '${job.title}' actualizado a '${job.status}'`);
    }

    console.timeEnd("⏱ Duración total del proceso");
    console.groupEnd();

    return res.json({
      message: "✅ Pago procesado correctamente",
      payment: paymentData,
    });

  } catch (error: any) {
    console.error("🔥 Error inesperado en createPayment:", error);
    console.timeEnd("⏱ Duración total del proceso");
    console.groupEnd();

    return res.status(500).json({
      error: "Error inesperado en el servidor",
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};
