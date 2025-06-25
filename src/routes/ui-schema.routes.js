import express from "express";

import RouteRegistrar from "../middleware/RouteRegistrar.js";
// import { authRoleMiddleware } from "../middleware/authRoleMiddleware.js";
import {
  SidebarSchemaResponse,
  GetSchemaByNameRequest,
  GetSchemaByNameResponse,
  GetDataByQueryRequest,
  GetDataByQueryResponse,
} from "../schemas/ui-schema.schema.js";
import {
  getSidebarSchema,
  postGetSchemaByName,
  postGetDataByQuery,
  postGetSchemaConfigByName,
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

/**@description Get schema-config by name */
registrar.post("/get-schema-config-by-name", {
  requestSchema: { bodySchema: GetSchemaByNameRequest },
  responseSchemas: [{ statusCode: 200, schema: GetSchemaByNameResponse }],
  controller: postGetSchemaConfigByName,
});

/**@description Get schema by name */
registrar.post("/get-schema-by-name", {
  requestSchema: { bodySchema: GetSchemaByNameRequest },
  responseSchemas: [{ statusCode: 200, schema: GetSchemaByNameResponse }],
  controller: postGetSchemaByName,
});

/**@description Get data by custom SQL query */
registrar.post("/get-data-by-query", {
  requestSchema: { bodySchema: GetDataByQueryRequest },
  responseSchemas: [{ statusCode: 200, schema: GetDataByQueryResponse }],
  controller: postGetDataByQuery,
});

export default router;
