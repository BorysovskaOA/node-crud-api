import process from "node:process";
import createApp from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

try {
  await app.listen({ host: env.HOST, port: env.PORT });
  console.log(`Server is running on ${env.HOST}:${env.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
signals.forEach((signal) => {
  process.on(signal, async () => {
    try {
      await app.close();
      process.exit(0);
    } catch (err) {
      console.log("Error while closing", err);
      process.exit(1);
    }
  });
});
