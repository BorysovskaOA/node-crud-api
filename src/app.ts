import process from "node:process";
import Fastify from "fastify";
import { routes } from "./routes.js";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { errorHandler } from "./utils/errorHandler.js";
import { NotFoundError } from "./errors.js";
import { env } from "./config/env.js";

const app = Fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.setNotFoundHandler((request) => {
  throw new NotFoundError(`Route ${request.method} ${request.url} not found`);
});
app.setErrorHandler(errorHandler);

app.register(routes, { prefix: "/api" });

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
    await app.close();
    process.exit(0);
  });
});
