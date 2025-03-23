import express from "express";
import {
  SchemaCreateSchema,
  SchemaUpdateSchema,
  getSchemaDoc,
} from "../schemas/schema.schema.js";
import { stringIdValidation } from "../schemas/common.schema.js";
import {
  createSchema,
  getSchemas,
  getSchemaById,
  updateSchema,
  deleteSchema,
  getEntriesBySchemaId,
} from "../controllers/schema.controller.js";
import RouteRegistrar from "../middleware/RouteRegistrar.js";
import { authRoleMiddleware } from "../middleware/authRoleMiddleware.js";

const router = express.Router();

const registrar = new RouteRegistrar(router, {
  basePath: "/schema",
  tags: ["Schema"],
});

/**@description create schema  */
registrar.post("/", {
  requestSchema: { bodySchema: SchemaCreateSchema },
  responseSchemas: [{ statusCode: 201, schema: SchemaCreateSchema }],
  middleware: [authRoleMiddleware()],
  controller: createSchema,
});

/**@description get all schemas  */
registrar.get("/list", {
  openApiDoc: getSchemaDoc,
  middleware: [authRoleMiddleware()],
  controller: getSchemas,
});

/**@description get schema by id  */
registrar.get("/:id", {
  requestSchema: { paramsSchema: { id: stringIdValidation } },
  middleware: [authRoleMiddleware()],
  controller: getSchemaById,
});

/**@description get schema entry by id*/
registrar.get("/:id/entries", {
  requestSchema: {
    paramsSchema: { id: stringIdValidation },
  },
  middleware: [authRoleMiddleware()],
  controller: getEntriesBySchemaId,
});

/**@description update schema by id  */
registrar.put("/:id", {
  requestSchema: {
    paramsSchema: { id: stringIdValidation },
    bodySchema: SchemaUpdateSchema,
  },
  responseSchemas: [{ statusCode: 200, schema: SchemaUpdateSchema }],
  middleware: [authRoleMiddleware()],
  controller: updateSchema,
});

/**@description delete schema by id  */
registrar.delete("/:id", {
  requestSchema: { paramsSchema: { id: stringIdValidation } },
  middleware: [authRoleMiddleware()],
  controller: deleteSchema,
});

export default router;
