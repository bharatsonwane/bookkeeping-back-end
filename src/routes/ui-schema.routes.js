import express from "express";

import RouteRegistrar from "../middleware/RouteRegistrar.js";
// import { authRoleMiddleware } from "../middleware/authRoleMiddleware.js";
// import { TenantCreateSchema } from "../schemas/tenant.schema.js";
import {
  SidebarSchemaResponse,
  GetSchemaByIdRequest,
  GetSchemaByIdResponse,
  GetDataByQueryRequest,
  GetDataByQueryResponse,
} from "../schemas/ui-schema.schema.js";
import {
  getSidebarSchema,
  postGetSchemaById,
  postGetDataByQuery,
} from "../controllers/ui-config.controller.js";

const router = express.Router();

const registrar = new RouteRegistrar(router, {
  basePath: "/ui",
  tags: ["UI-Schema"],
});

/**@description Get sidebar schema configuration */
registrar.get("/get-sidebar-schema", {
  responseSchemas: [{ statusCode: 200, schema: SidebarSchemaResponse }],
  controller: getSidebarSchema,
});

/**@description Get schema by ID */
registrar.post("/get-schema-by-id", {
  requestSchema: { bodySchema: GetSchemaByIdRequest },
  responseSchemas: [{ statusCode: 200, schema: GetSchemaByIdResponse }],
  controller: postGetSchemaById,
});

/**@description Get data by custom SQL query */
registrar.post("/get-data-by-query", {
  requestSchema: { bodySchema: GetDataByQueryRequest },
  responseSchemas: [{ statusCode: 200, schema: GetDataByQueryResponse }],
  controller: postGetDataByQuery,
});

export default router;
