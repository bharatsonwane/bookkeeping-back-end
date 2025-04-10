/** nodejs inbuilt library */
import path from "path";

import express from "express";
import cors from "cors"; // Import the cors package
import { envVariable } from "./src/config/envVariable.js";
import routes from "./src/routes/routes.js";
import { HttpError } from "./src/helper/httpError.js";
import openApiRoutes from "./src/doc/openApiRoutes.js";
import responseHandler from "./src/middleware/responseHandler.js";
import logger from "./src/helper/logger.js";
import connectDB from "./src/database/db.js";

async function main() {
  /** define add */
  const app = express();

  connectDB();
  
  /** add middleware  */
  app.use(express.json());
  app.use(cors()); // Use the cors middleware
  /* Use the response & error handling middleware */
  app.use(responseHandler);

  /** Route */
  app.use("/test", (req, res, next) => {
    res.send(
      `<html><body><h1><em>Chat backend project testing.</em></h1></body></html>`
    );
  });

  app.use("/", routes); // App Main Routes

  // Swagger Doc UI
  app.use("/docs", openApiRoutes);

  app.use((req, res, next) => {
    const err = new HttpError("Url not found", 404);
    next(err);
  });

  /** API url */
  app.listen(envVariable.API_PORT, () => {
    logger.info(`Server is listening on port '${envVariable.API_PORT}'`);
  });
}

main()
  .then(() => {
    logger.log("done");
  })
  .catch((err) => {
    logger.error(err);
  });
