import express from "express";
import { obtenerDatosUsuario, actualizarDatosUsuario } from "../../controllers/userManagement/modificarDatos.controller";

const router = express.Router();

router.get("/requester/data", obtenerDatosUsuario);
router.put("/requester/update-profile", actualizarDatosUsuario);

export default router;