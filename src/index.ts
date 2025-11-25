import "dotenv/config";
import app from "./app";
import { SERVER_PORT } from "./config/env.config";

export default app;

async function startServer() {
  try {
    app.listen(SERVER_PORT, () => {
      console.info(`Server running on http://localhost:${SERVER_PORT}`);
    });
  } catch (error) {
    console.error("Error starting server", error);
  }
}

if (process.env.NODE_ENV !== "production") {
  startServer();
}
