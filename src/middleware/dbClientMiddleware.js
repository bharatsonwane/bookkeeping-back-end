import db from "../database/db.js";

export async function dbClientMiddleware(req, res, next) {
  const commonSchema = "common";
  const tenantSchema = req.user?.schema || req.headers["x-tenant-schema"];

  try {
    // Always get a client for the common schema
    req.commonDbClient = await db.getSchemaClient(commonSchema);

    // Get tenant-specific schema client if provided
    if (tenantSchema) {
      req.tenantDbClient = await db.getSchemaClient(tenantSchema);
    } else {
      // Fallback: use common as tenant
      req.tenantDbClient = req.commonDbClient;
    }

    res.on("finish", () => {
      req.tenantDbClient?.release?.();
      if (req.commonDbClient && req.commonDbClient !== req.tenantDbClient) {
        req.commonDbClient.release();
      }
    });

    next();
  } catch (err) {
    console.error("dbClientMiddleware error:", err);
    return res.status(500).json({ error: "Database connection error" });
  }
}
