import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Payment } from "../../models/payment.model";

type PaymentSummary = {
  _id: mongoose.Types.ObjectId;
  code: string;
  status: "paid" | "pending" | "failed";
  codeExpiresAt?: Date;
  amount: { total: number; currency: string };
};

export async function getPaymentSummaryByIdLab(req: Request, res: Response) {
  try {
    const { id } = req.params;

    console.log("🔍 Consultando payment ID:", id); // LOG

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "id inválido" });
    }

    const doc = await Payment.findById(id)
      .select({ "amount.total": 1, "amount.currency": 1, code: 1, status: 1, codeExpiresAt: 1 })
      .lean<PaymentSummary>();

    if (!doc) return res.status(404).json({ error: "no encontrado" });

    if (typeof doc?.amount?.total !== "number") {
      return res.status(422).json({ error: "documento sin 'amount.total' válido" });
    }

    // ✅ Verificar si el código expiró
    const now = new Date();
    const codeExpired = doc.codeExpiresAt ? doc.codeExpiresAt < now : false;

    console.log("⏰ Verificación de expiración:", {
      now: now.toISOString(),
      codeExpiresAt: doc.codeExpiresAt?.toISOString() || "N/A",
      codeExpired,
      difference: doc.codeExpiresAt 
        ? ((doc.codeExpiresAt.getTime() - now.getTime()) / 1000).toFixed(2) + " segundos"
        : "N/A"
    }); // LOG

    const responseData = {
      data: {
        id,
        code: codeExpired ? null : doc.code,  // ✅ Ocultar código si expiró
        codeExpired,  // ✅ Agregar flag de expiración
        codeExpiresAt: doc.codeExpiresAt ?? null,
        status: doc.status,
        amount: {
          total: doc.amount.total,
          currency: doc.amount.currency ?? "BOB",
        }
      },
    };

    console.log("📤 Respuesta enviada:", JSON.stringify(responseData, null, 2)); // LOG

    return res.json({
      data: {
        id: String((doc as any)?._id ?? id),
        total: (doc as any).amount.total,
        currency: (doc as any).amount.currency ?? "BOB",
        status: (doc as any).status,
        codeExpiresAt: (doc as any).codeExpiresAt ?? null,
        code: (doc as any).code,
        codeExpired,
      },
    });
  } catch (e: any) {
    console.error("❌ Error obteniendo resumen:", e);
    return res.status(400).json({ error: e.message || "Error buscando resumen por id (lab)" });
  }
}
