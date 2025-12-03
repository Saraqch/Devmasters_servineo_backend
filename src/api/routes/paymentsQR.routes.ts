import express from "express";
import PaymentIntent from "../../models/PaymentIntent.model";
import ProviderPaymentMethod from "../../models/ProviderPaymentMethod.model";

const router = express.Router();

function generateRef() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "SV-";
  for (let i = 0; i < 5; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

console.log("[payments] router cargado");

router.get("/ping", (_req, res) => {
  res.json({ ok: true, from: "payments" });
});


// Crea o reutiliza una intención por bookingId y devuelve datos + método de pago
router.post("/intent", async (req, res) => {
  try {
    const { bookingId, providerId: rawProviderId, amount, currency = "BOB", deadlineMinutes = 60 } = req.body ?? {};
    const providerId = String(rawProviderId || "").trim();

    //console.log("[/intent] payload:", { bookingId, providerId, amount, currency });

    // Reusar si ya existe; sino crear con referencia nueva
    let intent = await PaymentIntent.findOne({ bookingId });
    if (!intent) {
      intent = await PaymentIntent.create({
        bookingId,
        providerId,
        amountExpected: amount,
        currency,
        paymentReference: generateRef(),
        deadlineAt: new Date(Date.now() + deadlineMinutes * 60_000),
        status: "pending",
      });
    }

    // Buscar método de pago del proveedor (QR estático)
    const method = await ProviderPaymentMethod.findOne({ providerId, active: true });
   // console.log("[/intent] method found?", Boolean(method), "for providerId:", providerId);

    if (!method) {
      return res.json({
        intent,
        error: "NO_QR",
        message: "Proveedor sin QR configurado.",
      });
    }

    return res.json({
      intent,
      paymentMethod: {
        qrImageUrl: method.qrImageUrl,
        accountDisplay: method.accountDisplay,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
