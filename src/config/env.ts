import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number(),
  HOST: z.union([z.ipv4(), z.literal("localhost")]),
  NODE_ENV: z.enum(["development", "test", "production"]),
});

export const env = envSchema.parse(process.env);
