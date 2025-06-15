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
