// src/database/migrate.js
import { Umzug } from "umzug";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { pathToFileURL, fileURLToPath } from "url";
import db from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getFileMd5 = async (filePath) => {
  const content = await fs.readFile(filePath, "utf8");
  return crypto.createHash("md5").update(content).digest("hex");
};

const extractVersion = (name) => {
  const match = name.match(/^(\d+)-/);
  return match ? parseInt(match[1], 10) : null;
};

export const runMigrations = async (schemaName = "common") => {
  const client = await db.getDbClient();

  // Ensure schema and migration tracking table exist
  await client.query(`
    CREATE SCHEMA IF NOT EXISTS ${schemaName};
    CREATE TABLE IF NOT EXISTS ${schemaName}.migrations (
      version TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      md5 TEXT NOT NULL,
      run_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`SET search_path TO ${schemaName}`);

  const migrationDir = path.join(__dirname, `migrations/${schemaName}`);
  const files = await fs.readdir(migrationDir);

  const allMigrations = files
    .filter((file) => file.endsWith(".js") || file.endsWith(".sql"))
    .map((file) => ({
      name: file,
      fullPath: path.join(migrationDir, file),
      version: extractVersion(file),
    }))
    .filter((m) => m.version !== null)
    .sort((a, b) => a.version - b.version);

  // Get already executed versions
  const { rows: applied } = await client.query(
    `SELECT version FROM migrations ORDER BY version::int`
  );
  debugger;

  const appliedVersions = applied.map((r) => parseInt(r.version, 10));
  const lastAppliedVersion = appliedVersions.at(-1) ?? 0;
  const expectedNextVersion = lastAppliedVersion + 1;

  const pendingMigrations = allMigrations.filter(
    (m) => !appliedVersions.includes(m.version)
  );

  for (let i = 0; i < pendingMigrations.length; i++) {
    const expected = expectedNextVersion + i;
    if (pendingMigrations[i].version !== expected) {
      throw new Error(
        `⛔ Migration version mismatch: expected ${expected}, but found ${pendingMigrations[i].name}`
      );
    }
  }

  const umzug = new Umzug({
    migrations: pendingMigrations.map(({ name, fullPath, version }) => ({
      name,
      path: fullPath,
      async up() {
        if (name.endsWith(".sql")) {
          const sql = await fs.readFile(fullPath, "utf8");
          await client.query(sql);
        } else {
          const migration = await import(pathToFileURL(fullPath).href);
          await migration.up(client);
        }
      },
    })),
    storage: {
      executed: async () => {
        const res = await client.query(
          `SELECT name FROM ${schemaName}.migrations`
        );
        return res.rows.map((r) => r.name);
      },
      logMigration: async (migration) => {
        const { name, path: migrationPath } = migration;
        const version = extractVersion(name);
        const md5 = await getFileMd5(migrationPath);
        await client.query(
          `INSERT INTO ${schemaName}.migrations(version, name, md5) VALUES ($1, $2, $3)`,
          [version.toString(), name, md5]
        );
      },
      unlogMigration: async (migrationName) => {
        const name =
          typeof migrationName === "object"
            ? migrationName.name
            : migrationName;
        const version = extractVersion(name);
        await client.query(
          `DELETE FROM ${schemaName}.migrations WHERE version = $1`,
          [version.toString()]
        );
      },
    },
    logger: {
      info: (msg) => console.log("ℹ️", msg),
      warn: (msg) => console.warn("⚠️", msg),
      error: (msg) => console.error("❌", msg),
    },
  });

  await umzug.up();
  console.log(`✅ Migrations completed for schemaName: ${schemaName}`);
};

export const runMigrationsForTenants = async () => {
  /**@description  
   * get all tenant from db apply migrations
  */
};

const main = async () => {
  await runMigrations();
  await runMigrationsForTenants()
  await db.shutdown();
};

main().catch((err) => {
  console.error("❌ Migration failed", err);
  process.exit(1);
});
