import { Router } from "express";
import {rechargeWallet} from "../controllers/wallet.controller";

const router = Router();

router.post("/wallet/update", rechargeWallet);

export default router;
