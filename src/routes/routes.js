import express from "express";
import lookupRoutes from "./lookup.routes.js";
import userRoutes from "./user.routes.js";
import organizationRoutes from "./organization.routes.js";
import schemaRoutes from "./schema.routes.js";

const routes = express.Router();

routes.use("/lookup", lookupRoutes);
routes.use("/user", userRoutes);
routes.use("/organization", organizationRoutes);
routes.use("/schema", schemaRoutes);

export default routes;
