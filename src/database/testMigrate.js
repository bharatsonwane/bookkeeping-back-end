// src/database/migrate.js
import { Umzug } from "umzug";
import fs from "fs";
import { pathToFileURL } from "url";
import path from "path";
import { fileURLToPath } from "url";
import db from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const runCommonMigrations = async () => {
  const client = await db.getDbClient();

  // Ensure the common schema and its migration tracking table exist
  await client.query(`
    CREATE SCHEMA IF NOT EXISTS common;
    CREATE TABLE IF NOT EXISTS common.migrations (
      name TEXT PRIMARY KEY
    );
  `);

  const migrationPath = path.join(__dirname, "migrations/common/*.js");

  const umzug = new Umzug({
    migrations: {
      glob: migrationPath,
      resolve: ({ name, path: migrationPath }) => ({
        name: name ?? path.basename(migrationPath),
        up: async () =>
          (await import(pathToFileURL(migrationPath).href)).up(client),
        down: async () =>
          (await import(pathToFileURL(migrationPath).href)).down(client),
      }),
    },
    storage: {
      executed: async () => {
        const res = await client.query("SELECT name FROM common.migrations");
        return res.rows.map((r) => r.name);
      },
      logMigration: async (name) => {
        if (typeof name === "object" && name.name) {
          name = name.name;
        }
        await client.query("INSERT INTO common.migrations(name) VALUES ($1)", [
          name,
        ]);
      },
      unlogMigration: async (name) => {
        if (typeof name === "object" && name.name) {
          name = name.name;
        }
        await client.query("DELETE FROM common.migrations WHERE name = $1", [
          name,
        ]);
      },
    },
    logger: {
      info: (msg) => console.log("ℹ️", msg),
      warn: (msg) => console.warn("⚠️", msg),
      error: (msg) => console.error("❌", msg),
    },
  });

  await umzug.up();
  console.log("✅ Common migrations completed");
};

// const runTenantMigrations = async () => {
//   const client = await db.getDbClient();

//   const tenantsPath = path.join(__dirname, "migration/tenants");
//   const tenants = fs
//     .readdirSync(tenantsPath)
//     .filter((name) => fs.statSync(path.join(tenantsPath, name)).isDirectory());

//   for (const tenantName of tenants) {
//     const schemaName = tenantName;

//     await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName};`);
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS ${schemaName}.migrations (
//         name TEXT PRIMARY KEY
//       );
//     `);

//     const umzug = new Umzug({
//       migrations: {
//         glob: path.join(tenantsPath, tenantName, "*.js"),
//         resolve: async ({ name, path }) => {
//           const migration = await import(path);
//           return {
//             name,
//             up: () => migration.up(client, schemaName),
//             down: () => migration.down(client, schemaName),
//           };
//         },
//       },
//       context: client,
//       storage: {
//         async executed() {
//           const res = await client.query(
//             `SELECT name FROM ${schemaName}.migrations`
//           );
//           return res.rows.map((r) => r.name);
//         },
//         async logMigration(name) {
//           await client.query(
//             `INSERT INTO ${schemaName}.migrations(name) VALUES ($1)`,
//             [name]
//           );
//         },
//         async unlogMigration(name) {
//           await client.query(
//             `DELETE FROM ${schemaName}.migrations WHERE name = $1`,
//             [name]
//           );
//         },
//       },
//       logger: console,
//     });

//     await umzug.up();
//     console.log(`✅ Migrated ${tenantName}`);
//   }
// };

const run = async () => {
  await runCommonMigrations();
  // await runTenantMigrations();
  await db.shutdown();
};

run().catch((err) => {
  console.error("❌ Migration failed", err);
  process.exit(1);
});
