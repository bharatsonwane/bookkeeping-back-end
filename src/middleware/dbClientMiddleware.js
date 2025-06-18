import db from "../database/db.js";

export async function dbClientMiddleware(req, res, next) {
  const commonSchema = "common";
  const tenantSchemaId = req.user?.schema || req.headers["x-tenant-schema"];

  try {
    // Always get a pool for the common schema
    req.commonDbPool = await db.getSchemaPool(commonSchema);

    // Get tenant-specific schema pool if provided
    if (tenantSchemaId) {
      req.tenantDbPool = await db.getSchemaPool(`tenant_${tenantSchemaId}`);
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
