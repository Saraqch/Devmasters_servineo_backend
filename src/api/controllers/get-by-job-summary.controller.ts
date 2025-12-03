import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Payment } from "../../models/payment.model";

type JobSummary = {
  _id: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  status: "paid" | "pending" | "failed";
  codeExpiresAt?: Date | null;
  amount: { total: number; currency: string };
};

export async function getPaymentSummaryByJobIdLab(req: Request, res: Response) {
  try {
    const { jobId } = req.params;
    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ error: "jobId inválido" });
    }

    const doc = await Payment.findOne({ jobId: new mongoose.Types.ObjectId(jobId) })
      .sort({ createdAt: -1 })
      .select({ "amount.total": 1, "amount.currency": 1, status: 1, codeExpiresAt: 1, _id: 1, jobId: 1 })
      .lean<JobSummary>();

    if (!doc) return res.status(404).json({ error: "no encontrado" });

    if (typeof doc?.amount?.total !== "number") {
      return res.status(422).json({ error: "documento sin 'amount.total' válido" });
    }

    return res.json({
      data: {
        id: String(doc._id),
        jobId: String(doc.jobId),
        total: doc.amount.total,
        status: doc.status,
        currency: doc.amount.currency ?? "BOB",
        // Nuevo nombre solicitado
        codeExpiresAt: doc.codeExpiresAt ?? null,
        // Compatibilidad previa
        expiresAt: doc.codeExpiresAt ?? null,
      },
    });
  } catch (e: any) {
    return res.status(400).json({ error: e.message || "Error summary por jobId (lab)" });
  }
}
