import process from "node:process";
import Fastify from "fastify";
import { routes } from "./routes.js";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { errorHandler } from "./utils/errorHandler.js";

const app = Fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.setErrorHandler(errorHandler);

app.register(routes, { prefix: "/api" });

try {
  const port = Number(process.env.PORT);
  await app.listen({ port });
  console.log(`Server is running on http://localhost:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
