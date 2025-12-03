import express from "express";
import { cambiarContrasena } from "../../controllers/userManagement/obtener.controller";

const router = express.Router();

router.post("/cambiar-password/:id", cambiarContrasena);

export default router;