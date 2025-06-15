// @ts-ignore
import { Umzug } from "umzug";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { pathToFileURL, fileURLToPath } from "url";
import db from "./db.js";
import logger from "../helper/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getFileMd5 = async (filePath) => {
  const content = await fs.readFile(filePath, "utf8");
  return crypto.createHash("md5").update(content).digest("hex");
};

const extractVersion = (name) => {
  const match = name.match(/^(\d+)-/);
  return match ? parseInt(match[1], 10) : null;
};

export const runMigrationForSchema = async (schemaName = "common") => {
  const client = await db.getDbClient();
  const migrationDir = path.join(__dirname, `migrations/${schemaName}`);

  // 🔧 Ensure migration directory exists
  await fs.mkdir(migrationDir, { recursive: true });

  // 🔐 Wrap everything in a transaction
  try {
    await client.query("BEGIN");

    // Ensure schema + migration table exists
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

    const files = await fs.readdir(migrationDir);
    const allMigrations = files
      .filter((f) => f.endsWith(".js") || f.endsWith(".sql"))
      .map((name) => ({
        name,
        version: extractVersion(name),
        fullPath: path.join(migrationDir, name),
      }))
      .filter((m) => m.version !== null)
      .sort((a, b) => a.version - b.version);

    const { rows: applied } = await client.query(
      `SELECT version, name, md5 FROM migrations ORDER BY version::int`
    );

    const appliedVersions = applied.map((r) => parseInt(r.version, 10));
    const lastAppliedVersion = appliedVersions.at(-1) ?? 0;
    const expectedNextVersion = lastAppliedVersion + 1;

    // 🔍 Validate MD5 hashes of applied migrations
    for (const row of applied) {
      const { version, name: recordedName, md5: recordedMd5 } = row;
      const filePath = path.join(migrationDir, recordedName);
      try {
        const currentMd5 = await getFileMd5(filePath);
        if (currentMd5 !== recordedMd5) {
          throw new Error(
            `❌ MD5 mismatch in ${recordedName}. Was modified after applying.\nExpected: ${recordedMd5}, Found: ${currentMd5}`
          );
        }
      } catch (err) {
        if (err.code === "ENOENT") {
          throw new Error(`❌ Applied migration missing: ${recordedName}`);
        }
        throw err;
      }
    }

    const pendingMigrations = allMigrations.filter(
      (m) => !appliedVersions.includes(m.version)
    );

    // 🚫 Prevent version skipping
    for (let i = 0; i < pendingMigrations.length; i++) {
      const expected = expectedNextVersion + i;
      if (pendingMigrations[i].version !== expected) {
        throw new Error(
          `⛔ Migration version mismatch: expected ${expected}, but got ${pendingMigrations[i].name}`
        );
      }
    }

    // 🛠 Run migrations using Umzug
    const umzug = new Umzug({
      migrations: pendingMigrations.map(({ name, fullPath }) => ({
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
          const res = await client.query(`SELECT name FROM migrations`);
          return res.rows.map((r) => r.name);
        },
        logMigration: async (migration) => {
          const { name, path: migrationPath } = migration;
          const version = extractVersion(name);
          const md5 = await getFileMd5(migrationPath);
          await client.query(
            `INSERT INTO migrations(version, name, md5) VALUES ($1, $2, $3)`,
            [version.toString(), name, md5]
          );
        },
        unlogMigration: async (migrationName) => {
          const name =
            typeof migrationName === "object"
              ? migrationName.name
              : migrationName;
          const version = extractVersion(name);
          await client.query(`DELETE FROM migrations WHERE version = $1`, [
            version.toString(),
          ]);
        },
      },
      logger: {
        info: (msg) => logger.log("ℹ️", msg),
        warn: (msg) => logger.warn("⚠️", msg),
        error: (msg) => logger.error("❌", msg),
      },
    });

    await umzug.up();
    await client.query("COMMIT");
    await client.query(`RESET search_path`);
    logger.log(`✅ Migrations completed for schema: ${schemaName}`);
  } catch (err) {
    await client.query("ROLLBACK");
    logger.error(`❌ Rolled back schema: ${schemaName}`, err);
    throw err;
  }
};

const main = async () => {
  try {
    await runMigrationForSchema("common");

    const client = await db.getDbClient();
    const { rows: tenants } = await client.query(
      "SELECT id, name FROM common.tenants"
    );

    for (const tenant of tenants) {
      const schemaName = `tenant_${tenant.id}`;
      logger.log(`ℹ️ Running migration for: ${tenant.name} (${schemaName})`);
      try {
        await runMigrationForSchema(schemaName);
      } catch (err) {
        logger.error(
          `❌ Failed to migrate ${tenant.name} (${schemaName}). Skipping.`
        );
      }
    }

    await db.shutdown();
    logger.info("✅ All migrations completed");
  } catch (error) {
    logger.error("❌ Migration process failed:", error);
  } finally {
    logger.info("Migration script exiting...");
    process.exit();
  }
};

main();
