import express from "express";

import { idValidation } from "../schemas/common.schema.js";
import { createEntry } from "../controllers/entries.controller.js";
import RouteRegistrar from "../middleware/RouteRegistrar.js";
import { authRoleMiddleware } from "../middleware/authRoleMiddleware.js";
import { EntryCreateSchema } from "../schemas/entries.schema.js";

const router = express.Router();

const registrar = new RouteRegistrar(router, {
  basePath: "/entries",
  tags: ["Entries"],
});

/**@description create entries  */
registrar.post("/", {
  requestSchema: { bodySchema: EntryCreateSchema },
  responseSchemas: [{ statusCode: 201 }],
  middleware: [authRoleMiddleware()],
  controller: createEntry,
});


export default router;
