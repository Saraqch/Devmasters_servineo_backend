import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Payment } from "../../models/payment.model";
import { Users } from "../../models/usersPayment.model";
import { User as UserPay } from "../../models/userPayment.model";

type FixerSummaryDoc = {
  _id: mongoose.Types.ObjectId;
  fixerId: mongoose.Types.ObjectId;
  status: "paid" | "pending" | "failed";
  codeExpiresAt?: Date | null;
  amount: { total: number; currency: string };
};

export async function getPaymentSummaryByFixerIdLab(req: Request, res: Response) {
  try {
    const { fixerId } = req.params;
    if (!mongoose.isValidObjectId(fixerId)) {
      return res.status(400).json({ error: "fixerId inválido" });
    }

    // Verificar existencia del fixer en 'users' o en 'userpay'
    const existsInUsers = await Users.findById(fixerId).lean().catch(() => null);
    const existsInUserPay = existsInUsers ? null : await UserPay.findById(fixerId).lean().catch(() => null);
    if (!existsInUsers && !existsInUserPay) {
      return res.status(404).json({ error: "fixer no encontrado (users/userpay)" });
    }

    // Filtro por estado: si no se especifica, devuelve TODOS
    const qs = (req.query?.status as string | undefined)?.toLowerCase();
    const allowed = new Set(["paid", "pending", "failed"]);
    const statusQuery = qs && allowed.has(qs) ? { status: qs } : {};

    const docs = await Payment.find({
      fixerId: new mongoose.Types.ObjectId(fixerId),
      ...statusQuery,
    })
      .sort({ createdAt: -1 })
      .select({ amount: 1, currency: 1, status: 1, codeExpiresAt: 1, _id: 1, fixerId: 1, createdAt: 1 })
      .lean<any[]>();

    // Responder 200 con arreglo vacío si no hay pagos
    if (!docs || docs.length === 0) {
      return res.json({ data: [] });
    }

    const data = docs.map((doc: any) => {
      const amt = doc?.amount;
      const total = typeof amt === "number" ? amt : (amt?.total ?? 0);
      const currency = (typeof amt === "object" ? amt?.currency : doc?.currency) ?? "BOB";
      return {
        id: String(doc._id),
        total,
        currency,
        status: doc.status,
        codeExpiresAt: doc.codeExpiresAt ?? null,
      };
    });

    return res.json({ data });
  } catch (e: any) {
    return res.status(400).json({ error: e.message || "Error summary por fixerId (lab)" });
  }
}
