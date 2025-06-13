import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  db: {
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  },
  migrationsTable: "pgmigrations",
  schema: "main",
  dir: path.join(__dirname, "migrations/main"),
  direction: "up",
  verbose: true,
  createSchema: true,
  createMigrationsSchema: true,
  singleTransaction: true,
};
