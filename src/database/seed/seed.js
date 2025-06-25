import { getHashPassword } from "../../helper/authHelper.js";
import logger from "../../helper/logger.js";
import db from "../db.js";

export const seed = async () => {
  const client = await db.getDbClient();

  const tenantList = [
    {
      tenant: {
        name: "Techno Food",
        domain: "Food",
      },
      users: [
        {
          email: "bharat@gmail.com",
          password: "Password@123",
        },
      ],
    },
    {
      tenant: {
        name: "Globes Inc",
        domain: "Textile",
      },
      users: [
        {
          email: "tushar@gmail.com",
          password: "Password@123",
        },
      ],
    },
  ];

  try {
    await client.query("BEGIN");

    // 👇 Set the default schema to 'common'
    await client.query("SET search_path TO common");

    for (const entry of tenantList) {
      const { tenant, users } = entry;

      const tenantResult = await client.query(
        `INSERT INTO tenants (name, domain) VALUES ($1, $2) RETURNING id`,
        [tenant.name, tenant.domain]
      );

      const tenantId = tenantResult.rows[0].id;
      logger.info(`Inserted tenant: ${tenant.name} (id: ${tenantId})`);

      for (const user of users) {
        const hashPassword = await getHashPassword(user.password);
        await client.query(
          `INSERT INTO users (email, password, "tenantId") VALUES ($1, $2, $3)`,
          [user.email, hashPassword, tenantId]
        );
        logger.info(`  ↳ Inserted user: ${user.email}`);
      }
    }

    await client.query("COMMIT");
    logger.info("✅ Seeding completed successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("❌ Error occurred during seeding:", error);
  } finally {
    client.release?.();
    logger.info("Seeding reached finally block!");
    process.exit();
  }
};

seed();
