import db from "../database/db.js";

export async function dbClientMiddleware(req, res, next) {
  const commonSchema = "common";
  const tenantSchema = req.user?.schema || req.headers["x-tenant-schema"];

  try {
    // Always get a pool for the common schema
    req.commonDbPool = await db.getSchemaPool(commonSchema);

    // Get tenant-specific schema pool if provided
    if (tenantSchema) {
      req.tenantDbPool = await db.getSchemaPool(tenantSchema);
    } else {
      // Fallback: use common as tenant
      req.tenantDbPool = req.commonDbPool;
    }

    res.on("finish", () => {
      req.tenantDbPool?.release?.();
      if (req.commonDbPool && req.commonDbPool !== req.tenantDbPool) {
        req.commonDbPool.release();
      }
    });

    next();
  } catch (err) {
    console.error("dbClientMiddleware error:", err);
    return res.status(500).json({ error: "Database connection error" });
  }
}
