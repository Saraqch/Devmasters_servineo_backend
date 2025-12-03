import { Router } from "express";
import { registrarUbicacion } from "../../controllers/userManagement/ubicacion.controller";
import { verifyJWT } from "../../controllers/userManagement/google.controller";

const router = Router();

router.post("/", verifyJWT, registrarUbicacion);

export default router;