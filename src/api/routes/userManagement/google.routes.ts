import { Router } from "express";
import { googleAuth, verifyJWT } from "../../controllers/userManagement/google.controller";

const router = Router();

router.post("/auth", googleAuth);
router.get("/verify", verifyJWT, (req, res) => {
  return res.json({ valid: true, user: (req as any).user });
});

export default router;