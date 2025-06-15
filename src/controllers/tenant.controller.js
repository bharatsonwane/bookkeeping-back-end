import Tenant from "../services/tenant.service.js";
import { HttpError } from "../helper/httpError.js";
import { createTwtToken, validatePassword } from "../helper/authHelper.js";
import User from "../services/user.service.js";

export const postTenantSignup = async (req, res, next) => {
  const commonDbClient = req.commonDbClient;
  const tenantDbClient = req.tenantDbClient;
  try {
    const body = req.body;

    await commonDbClient.query("BEGIN");

    const tenantService = new Tenant({
      name: body.name,
      domain: body.domain,
    });

    const tenantId = await tenantService.createTenant(commonDbClient);

    const userService = new User({
      email: body.email,
      password: body.password,
      tenantId: tenantId,
    });

    await userService.createUser(commonDbClient);

    await commonDbClient.query("COMMIT");
    res.status(200).send({ token: "jwtToken", userData: "tokenData" });
  } catch (error) {
    await commonDbClient.query("ROLLBACK");
    res.error(error);
  }
};
