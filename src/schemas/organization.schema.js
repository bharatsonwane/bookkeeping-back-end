//@ts-ignore
import { z } from "zod";
import { docRegistry } from "../doc/openAPIDocumentGenerator.js";
import { createApiResponse } from "../doc/openAPIDocumentGenerator.js";
import { idSchema } from "./common.schema.js";

/**@description Organization schema */
export const OrganizationSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email("Invalid email").optional(),
  website: z.string().url("Invalid URL").optional(),
  establishedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, should be YYYY-MM-DD")
    .optional(),
});
docRegistry.register("Organization", OrganizationSchema);

/**@description Organization Create schema */
export const OrganizationCreateSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email("Invalid email").optional(),
  website: z.string().url("Invalid URL").optional(),
  establishedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, should be YYYY-MM-DD")
    .optional(),
});
docRegistry.register("OrganizationCreate", OrganizationCreateSchema);

/**@description Organization Update schema */
export const OrganizationUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email("Invalid email").optional(),
  website: z.string().url("Invalid URL").optional(),
  establishedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, should be YYYY-MM-DD")
    .optional(),
});
docRegistry.register("OrganizationUpdate", OrganizationUpdateSchema);

/**@description Get Organization Doc */
export const getOrganizationDoc = ({ routePath, method, tags, security }) => {
  docRegistry.registerPath({
    method: method,
    path: routePath,
    tags: tags,
    security: security,
    responses: createApiResponse(z.array(OrganizationSchema), "Success"),
  });
};

/**@description Update Organization Doc */
export const updateOrganizationDoc = ({ routePath, method, tags, security }) => {
  docRegistry.registerPath({
    method: method,
    path: routePath,
    tags: tags,
    security: security,
    request: {
      params: idSchema.shape.params,
      body: {
        description: "Organization update",
        content: {
          "application/json": { schema: OrganizationUpdateSchema.openapi({}) },
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