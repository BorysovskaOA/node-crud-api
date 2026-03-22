import { z } from "zod";
import { FastifyReply, FastifyRequest } from "fastify";

interface ActionSchema {
  params?: z.ZodType;
  body?: z.ZodType;
  querystring?: z.ZodType;
}

export type ActionHandler<S extends ActionSchema> = (
  request: FastifyRequest<{
    Params: S["params"] extends z.ZodType ? z.infer<S["params"]> : any;
    Body: S["body"] extends z.ZodType ? z.infer<S["body"]> : any;
    Querystring: S["querystring"] extends z.ZodType
      ? z.infer<S["querystring"]>
      : any;
  }>,
  reply: FastifyReply,
) => Promise<any> | any;

export function createAction<S extends ActionSchema>(action: {
  schema?: S;
  successCode?: number;
  handler: ActionHandler<S>;
}) {
  return {
    ...action,
    handler: (async (request, reply) => {
      const result = await action.handler(request, reply);
      if (action.successCode) {
        reply.code(action.successCode || 200);
      }
      return result;
    }) as ActionHandler<S>,
  };
}
