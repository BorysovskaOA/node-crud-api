import { FastifyReply, FastifyRequest } from "fastify";
import { NotFoundError } from "../errors.js";

export const errorHandler = async (
  error: any,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  if (error instanceof NotFoundError) {
    return reply.status(404).send({
      error: "Not Found",
      message: error.message,
    });
  }

  if (
    error.statusCode === 400 &&
    error.code === "FST_ERR_CTP_INVALID_JSON_BODY"
  ) {
    return reply.status(400).send({
      error: "Bad Request",
      message: "Invalid JSON format",
    });
  }

  if (error.validation) {
    return reply.status(400).send({
      error: "Bad Request",
      message: "Validation failed",
      details: error.validation.map((err: any) => ({
        field: err.instancePath.replace("/", ""),
        message: err.message,
      })),
    });
  }

  request.log.error(error);
  reply.status(500).send({ error: "Internal Server Error" });
};
