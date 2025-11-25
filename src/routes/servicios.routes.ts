import { Router } from "express";
import { crearServicio } from "../controllers/servicios.controller";
import { ServicioMongoRepository } from "../adapter/mongo/servicioMongoRepository";

const router = Router();
const repo = new ServicioMongoRepository();

router.post("/", async (req, res) => {
  try {
    const { titulo, descripcion, precio, categoria } = req.body;

    if (!titulo || !descripcion || !precio || !categoria) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const resultado = await crearServicio(repo, {
      titulo,
      descripcion,
      precio: Number(precio),
      categoria,
    });

    res.status(201).json({
      message: "Servicio creado correctamente",
      id: resultado.insertedId,
    });
  } catch (error) {
    console.error("Error al crear servicio:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;