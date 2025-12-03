import { Router } from "express";
import { createPayment } from "../controllers/payment.controller";

const router = Router();

router.post("/createpayment", createPayment);

export default router;
