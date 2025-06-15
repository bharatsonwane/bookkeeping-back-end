import express from "express";

import RouteRegistrar from "../middleware/RouteRegistrar.js";
import { authRoleMiddleware } from "../middleware/authRoleMiddleware.js";
import { TenantCreateSchema } from "../schemas/tenant.schema.js";
import { postTenantSignup } from "../controllers/tenant.controller.js";

const router = express.Router();

const registrar = new RouteRegistrar(router, {
  basePath: "/tenant",
  tags: ["Tenant"],
});

/**@description create tenant  */
registrar.post("/signup", {
  requestSchema: { bodySchema: TenantCreateSchema },
  responseSchemas: [{ statusCode: 200, schema: TenantCreateSchema }],
  controller: postTenantSignup,
});

export default router;
