import { z } from "zod";
import { docRegistry } from "../doc/openAPIDocumentGenerator.js";
import { createApiResponse } from "../doc/openAPIDocumentGenerator.js";
import { idSchema } from "./common.schema.js";

/**@description Schema Create schema */
export const SchemaCreateSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  schema: z.object({}).passthrough(),
  organizationId: z.string().min(1),
});
docRegistry.register("SchemaCreate", SchemaCreateSchema);

/**@description Schema Create schema by AI*/
export const SchemaCreateByAISchema = z.object({
  description: z.string().min(6),
});
docRegistry.register("SchemaCreateByAi", SchemaCreateByAISchema);

/**@description Schema Update schema */
export const SchemaUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  version: z.string().min(1).optional(),
  schema: z.object({}).passthrough().optional(),
  organizationId: z.string().min(1).optional(),
});
docRegistry.register("SchemaUpdate", SchemaUpdateSchema);

/**@description Schema schema */
export const SchemaSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  version: z.string().min(1),
  schema: z.object({}).passthrough(),
  organizationId: z.string().min(1),
});
docRegistry.register("Schema", SchemaSchema);

/**@description Get Schema Doc */
export const getSchemaDoc = ({ routePath, method, tags, security }) => {
  docRegistry.registerPath({
    method: method,
    path: routePath,
    tags: tags,
    security: security,
    responses: createApiResponse(z.array(SchemaSchema), "Success"),
  });
};

/**@description Update Schema Doc */
export const updateSchemaDoc = ({ routePath, method, tags, security }) => {
  docRegistry.registerPath({
    method: method,
    path: routePath,
    tags: tags,
    security: security,
    request: {
      params: idSchema.shape.params,
      body: {
        description: "Schema update",
        content: {
          "application/json": { schema: SchemaUpdateSchema.openapi({}) },
        },
      },
    },
    responses: {
      200: {
        description: "Success",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string" },
              },
            },
          },
        },
      },
    },
  });
};
