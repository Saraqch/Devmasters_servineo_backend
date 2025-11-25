import "dotenv/config";
import Server from "./config/server.config";
import { SERVER_PORT } from "./config/env.config";

export default Server; 

async function startServer() {
  try {
    Server.listen(SERVER_PORT, () => {
      console.info(`Server running on http://localhost:${SERVER_PORT}`);
    });
  } catch (error) {
    console.error("Error starting server", error);
  }
}

if (process.env.NODE_ENV !== "production") {
  startServer();
}
