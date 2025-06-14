import bcrypt from "bcryptjs";
import db from "../database/db.js";
import { getHashPassword, validatePassword } from "../helper/authHelper.js";

export const signUpService = async (userData, tenantData = null) => {
  const client = await db.getDbClient();

  try {
    await client.query("BEGIN");
    await client.query(`SET search_path TO common`);

    let tenantId;

    // If tenant data is provided, create a new tenant
    if (tenantData) {
      const tenantResult = await client.query(
        "INSERT INTO tenants (name, domain) VALUES ($1, $2) RETURNING id",
        [tenantData.name, tenantData.domain]
      );
      tenantId = tenantResult.rows[0].id;
    } else {
      // If no tenant data, use the provided tenant_id
      tenantId = userData.tenant_id;
    }

    // Hash the password
    const hashedPassword = await getHashPassword(userData.password);

    // Create the user
    const userResult = await client.query(
      "INSERT INTO users (username, password, tenant_id) VALUES ($1, $2, $3) RETURNING id, username, tenant_id, createdat",
      [userData.username, hashedPassword, tenantId]
    );

    await client.query("COMMIT");

    const newUser = userResult.rows[0];
    delete newUser.password; // Remove password from response

    return {
      user: newUser,
      tenantId: tenantId,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
};

export const validateUserService = async (username, password) => {
  try {
    const client = await db.getDbClient();

    const result = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (result?.rows?.length === 0) {
      return null;
    }

    const user = result.rows[0];
    const isValid = await validatePassword(password, user.password);

    if (!isValid) {
      return null;
    }

    delete user.password;
    return user;
  } catch (error) {
    throw error;
  }
};
