import express from "express";
import lookupRoutes from "./lookup.routes.js";
import userRoutes from "./user.routes.js";
import organizationRoutes from "./organization.routes.js";
import schemaRoutes from "./schema.routes.js";
import entriesRoutes from "./entries.routes.js";

const routes = express.Router();

routes.use("/lookup", lookupRoutes);
routes.use("/user", userRoutes);
routes.use("/organization", organizationRoutes);
routes.use("/schema", schemaRoutes);
routes.use("/entries", entriesRoutes);

export default routes;
