import express from "express";
const routes = express.Router();

import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import tenantRoutes from "./tenant.routes.js";
import uiConfigRoutes from "./ui-schema.routes.js";

routes.use("/auth", authRoutes);
routes.use("/user", userRoutes);
routes.use("/tenant", tenantRoutes);
routes.use("/ui", uiConfigRoutes);

export default routes;
