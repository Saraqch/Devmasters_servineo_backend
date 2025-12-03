import express from "express";
import { verifyJWT } from "../../../middlewares/authMiddleware";
import { logoutAllController } from "../../controllers/userManagement/cerrarSesion.controller";

const router = express.Router();
router.post("/logout-all", verifyJWT, logoutAllController);
export default router;