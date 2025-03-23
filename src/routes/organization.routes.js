import express from "express";
import {
  OrganizationSchema,
  OrganizationCreateSchema,
  OrganizationUpdateSchema,
  getOrganizationDoc,
  updateOrganizationDoc,
} from "../schemas/organization.schema.js";
import { idValidation } from "../schemas/common.schema.js";
import {
  getOrganizationById,
  getOrganizations,
  createOrganization,
  updateOrganization,
} from "../controllers/organization.controller.js";
import RouteRegistrar from "../middleware/RouteRegistrar.js";
import { authRoleMiddleware } from "../middleware/authRoleMiddleware.js";

const router = express.Router();

const registrar = new RouteRegistrar(router, {
  basePath: "/organization",
  tags: ["Organization"],
});

/**@description create organization  */
registrar.post("/", {
  requestSchema: { bodySchema: OrganizationCreateSchema },
  responseSchemas: [{ statusCode: 201, schema: OrganizationSchema }],
  controller: createOrganization,
});

/**@description get all organizations  */
registrar.get("/list", {
  openApiDoc: getOrganizationDoc,
  middleware: [authRoleMiddleware()],
  controller: getOrganizations,
});

/**@description get organization by id  */
registrar.get("/:id", {
  requestSchema: { paramsSchema: { id: idValidation } },
  middleware: [authRoleMiddleware()],
  controller: getOrganizationById,
});

/**@description update organization by id  */
registrar.put("/:id", {
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: OrganizationUpdateSchema,
  },
  responseSchemas: [{ statusCode: 200, schema: OrganizationSchema }],
  middleware: [authRoleMiddleware()],
  controller: updateOrganization,
});

export default router;