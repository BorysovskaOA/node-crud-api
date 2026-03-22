import Fastify from "fastify";
import { routes } from "./routes.js";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { errorHandler } from "./utils/errorHandler.js";
import { NotFoundError } from "./errors.js";

const createApp = () => {
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

  return app;
};

export default createApp;
