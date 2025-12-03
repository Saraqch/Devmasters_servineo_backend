import express from "express";
import cors from "cors";
import serviciosRoutes from "../routes/servicios.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/newoffers", serviciosRoutes);

export default app;
