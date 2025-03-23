//@ts-ignore
import { z } from "zod";
import { docRegistry } from "../doc/openAPIDocumentGenerator.js";
import { createApiResponse } from "../doc/openAPIDocumentGenerator.js";
import { idSchema } from "./common.schema.js";

/**@description Entry schema */
export const EntrySchema = z.object({
  id: z.string().optional(),
  schemaId: z.string().optional(),
  entryData: z.object({}).passthrough(),
});
docRegistry.register("Entry", EntrySchema);

/**@description Entry Create schema */
export const EntryCreateSchema = z.object({
  schemaId: z.string().min(1),
  entryData: z.object({}).passthrough(),
});
docRegistry.register("EntryCreate", EntryCreateSchema);

/**@description Entry Update schema */
export const EntryUpdateSchema = z.object({
  schemaId: z.string().min(1).optional(),
  entryData: z.object({}).passthrough().optional(),
});
docRegistry.register("EntryUpdate", EntryUpdateSchema);


/**@description Get Entry Doc */
export const getEntryDoc = ({ routePath, method, tags, security }) => {
  docRegistry.registerPath({
    method: method,
    path: routePath,
    tags: tags,
    security: security,
    responses: createApiResponse(z.array(EntrySchema), "Success"),
  });
};


/**@description Update Entry Doc */
export const updateEntryDoc = ({ routePath, method, tags, security }) => {
  docRegistry.registerPath({
    method: method,
    path: routePath,
    tags: tags,
    security: security,
    request: {
      params: idSchema.shape.params,
      body: {
        description: "Entry update",
        content: {
          "application/json": { schema: EntryUpdateSchema.openapi({}) },
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
