//@ts-ignore
import { z } from "zod";
import { docRegistry } from "../doc/openAPIDocumentGenerator.js";

import { createApiResponse } from "../doc/openAPIDocumentGenerator.js";

import { idSchema } from "./common.schema.js";

/**@description User signup schema */
export const TenantCreateSchema = z.object({
  name: z.string().min(3),
  domain: z.string().min(3),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password should be at least 6 characters long"),
});
docRegistry.register("User", TenantCreateSchema);

/**@description Generic API response schema */
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  data: z.any(), // This will be overridden for specific endpoints
});

/**@description Sidebar schema response schema */
export const SidebarSchemaResponse = ApiResponseSchema.extend({
  data: z
    .object({
      // The sidebar schema can be any JSON object structure
      // This is flexible to accommodate different tenant configurations
    })
    .passthrough(),
});

/**@description Request schema for getting schema by ID */
export const GetSchemaByIdRequest = z.object({
  id: z.string().min(1, "Schema ID is required"),
});

/**@description Schema data structure */
export const SchemaData = z.object({
  id: z.string(),
  name: z.string(),
  label: z.string(),
  schema: z.any(), // The schema can be any JSON object structure
});

/**@description Get schema by ID response schema */
export const GetSchemaByIdResponse = ApiResponseSchema.extend({
  data: SchemaData,
});

/**@description Request schema for getting data by query */
export const GetDataByQueryRequest = z.object({
  query: z.string().min(1, "SQL query is required"),
});

/**@description Database query result structure */
export const QueryResult = z.object({
  rows: z.array(z.any()), // Array of row objects from the query
  rowCount: z.number().optional(), // Number of rows returned
  command: z.string().optional(), // SQL command type (SELECT, INSERT, etc.)
  fields: z.array(z.any()).optional(), // Field definitions
});

/**@description Get data by query response schema */
export const GetDataByQueryResponse = ApiResponseSchema.extend({
  data: QueryResult,
});

docRegistry.register("SidebarSchemaResponse", SidebarSchemaResponse);
docRegistry.register("GetSchemaByIdRequest", GetSchemaByIdRequest);
docRegistry.register("GetSchemaByIdResponse", GetSchemaByIdResponse);
docRegistry.register("GetDataByQueryRequest", GetDataByQueryRequest);
docRegistry.register("GetDataByQueryResponse", GetDataByQueryResponse);
