// @ts-ignore
import { z } from "zod";
// @ts-ignore
import dotenv from "dotenv";
import logger from "../helper/logger.js";

dotenv.config();

const envVariableSchema = z.object({
  /* server */
  NODE_ENV: z.enum(["development", "production", "test"]),
  API_HOST: z.string().url({ message: "API_HOST must be a valid URL" }),
  API_PORT: z.number().int().positive(),

  /* database */
  // DB_HOST: z.string().min(3, "DB_HOST is mandatory"),
  // DB_USER: z.string().min(3, "DB_USER is mandatory"),
  // DB_PASSWORD: z.string().min(1, "DB_PASSWORD is mandatory"),
  // DB_NAME: z.string().min(1, "DB_NAME is mandatory"),
  // DB_PORT: z.number().min(1, "DB_PORT is mandatory"),
  MONGO_URI: z.string().min(1, "MONGO_URI is mandatory"),

  /* auth */
  JWT_SECRET: z.string().min(6, "JWT_SECRET is mandatory"),
  OPENAI_API_KEY: z.string().min(6, "OPENAI_API_KEY is mandatory"),
});

const getEnvVariable = () => {
  try {
    const environmentVariable = {
      /* server */
      NODE_ENV: process.env.NODE_ENV,
      API_HOST: process.env.API_HOST,
      API_PORT: Number(process.env.API_PORT),

      /* database */
      // DB_HOST: process.env.DB_HOST,
      // DB_USER: process.env.DB_USER,
      // DB_PASSWORD: process.env.DB_PASSWORD,
      // DB_NAME: process.env.DB_NAME,
      // DB_PORT: Number(process.env.DB_PORT),
      MONGO_URI: process.env.MONGO_URI,

      /* auth */
      JWT_SECRET: process.env.JWT_SECRET,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    };

    envVariableSchema.parse(environmentVariable);
    return environmentVariable;
  } catch (error) {
    logger.error(error);
    throw new Error("Environment variable validation failed");
  }
};

export const envVariable = getEnvVariable();
