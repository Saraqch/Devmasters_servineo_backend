import express from "express";
import { cambiarContrasena } from "../../controllers/userManagement/editarContraseña.controller";

const router = express.Router();

router.post("/change-password", cambiarContrasena);


export default router;