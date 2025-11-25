import "dotenv/config";
import app from "./app";
import { SERVER_PORT } from "./config/env.config";
import { connectDatabase } from "./config/db.config";

async function startServer() {
  try {
    // 🔌 1️⃣ Conectamos a la base de datos
    await connectDatabase();

    // 🚀 2️⃣ Iniciamos el servidor Express
    app.listen(SERVER_PORT, () => {
      console.info(`✅ Server running on http://localhost:${SERVER_PORT}`);
    });
  } catch (error) {
    console.error("❌ Error starting server", error);
  }
}

startServer();
