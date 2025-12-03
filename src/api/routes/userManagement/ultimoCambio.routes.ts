import express from "express";
import { consultarUltimoCambio } from "../../controllers/userManagement/ultimoCambio.controller";

const router = express.Router();

router.get("/fecha-ultimo-cambio", consultarUltimoCambio);

export default router;