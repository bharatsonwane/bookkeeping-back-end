import Tenant from "../services/tenant.service.js";
import UiConfig from "../services/ui-config.service.js";

export const getSidebarSchema = async (req, res, next) => {
  const tenantDbPool = req.tenantDbPool;
  try {
    const uiConfigService = new UiConfig();

    const result = await uiConfigService.getSidebarSchema(tenantDbPool);
    res.status(200).send({
      success: true,
      msg: "Logged In!",
      data: result,
    });
  } catch (error) {
    res.error(error);
  }
};

export const postGetSchemaById = async (req, res, next) => {
  const tenantDbPool = req.tenantDbPool;
  try {
    const uiConfigService = new UiConfig();
    const body = req.body;

    const result = await uiConfigService.getSchemaById(
      tenantDbPool,
      req.body.id
    );

    res.status(200).send({
      success: true,
      msg: "Schema Fetched Successfully!",
      data: result,
    });
  } catch (error) {
    res.error(error);
  }
};

export const postGetDataByQuery = async (req, res, next) => {
  const tenantDbPool = req.tenantDbPool;
  try {
    const uiConfigService = new UiConfig();
    const body = req.body;

    const result = await uiConfigService.getDataByQuery(
      tenantDbPool,
      body.query
    );

    res.status(200).send({
      success: true,
      msg: "Data Fetched Successfully!",
      data: result,
    });
  } catch (error) {
    res.error(error);
  }
};
