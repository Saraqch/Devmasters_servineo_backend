import { Router } from "express";
import { verifyClientJWT } from "../../../middlewares/verificar";
import {
  getClientProfile,
  unlinkLoginMethod,
  linkEmailPasswordMethod,
  linkGoogleMethod
} from "../../controllers/userManagement/cliente.controller";

const router = Router();

router.get("/profile", verifyClientJWT, getClientProfile);
router.patch("/unlink", verifyClientJWT, unlinkLoginMethod);
router.post("/link-email-password", verifyClientJWT, linkEmailPasswordMethod);
router.post("/link-google", verifyClientJWT, linkGoogleMethod);


export default router;