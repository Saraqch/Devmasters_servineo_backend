import { Router } from "express";
import { getPaymentSummaryByIdLab } from "../controllers/get-by-id-summary.controller";
import { getPaymentSummaryByJobIdLab } from "../controllers/get-by-job-summary.controller";
import { getPaymentSummaryByFixerIdLab } from "../controllers/get-by-fixer-summary.controller";
import { confirmPaymentLab } from "../controllers/confirm-payment.controller";
import { createPaymentLab, regeneratePaymentCode } from "../controllers/cashpay.controller";
import { regeneratePaymentCodeByJob } from "../controllers/regeneratecode.controller";
import { checkCodeStatusByJob } from "../controllers/regeneratecode.controller";

const labRouter = Router();

/** 
 * Middleware de log y conexión DB
 */
labRouter.use((req, _res, next) => {
  console.log("[LAB]", req.method, req.originalUrl);
  next();
});

/** 
 * Healthcheck para probar el router
 * GET /api/lab/health
 */
labRouter.get("/health", (_req, res) => res.json({ ok: true, where: "lab" }));

/** 
 * ENDPOINTS reales
 */
labRouter.post("/cashpay", createPaymentLab); // -> POST /api/lab/cashpay
labRouter.get("/payments/:id/summary", getPaymentSummaryByIdLab);
labRouter.post("/payments", createPaymentLab);
labRouter.get("/payments/by-job/:jobId/summary", getPaymentSummaryByJobIdLab);
labRouter.get("/payments/by-fixer/:fixerId/summary", getPaymentSummaryByFixerIdLab);
// Rutas actualizadas
labRouter.patch('/payments/regenerate-code/:jobId', regeneratePaymentCodeByJob);
labRouter.get('/payments/code-status/:jobId', checkCodeStatusByJob);
labRouter.patch("/payments/:id/confirm", confirmPaymentLab);
labRouter.post("/payments/:id/regenerate-code", regeneratePaymentCode);

// Exporta el router correcto ✅
export default labRouter;
