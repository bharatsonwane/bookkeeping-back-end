import Tenant from "../services/tenant.service.js";
import UiConfig from "../services/ui-config.service.js";

export const getSidebarSchema = async (req, res, next) => {
  const tenantDbPool = req.tenantDbPool;
  try {
    const result = await UiConfig.getSidebarSchema(tenantDbPool);
    res.status(200).send({
      success: true,
      msg: "Logged In!",
      data: result,
    });
  } catch (error) {
    res.error(error);
  }
};


export const postGetSchemaConfigByName = async (req, res, next) => {
  const tenantDbPool = req.tenantDbPool;
  try {
    const body = req.body;

    const result = await UiConfig.getSchemaByName(
      tenantDbPool,
      req.body.name
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

export const postGetSchemaByName = async (req, res, next) => {
  const tenantDbPool = req.tenantDbPool;
  try {
    const body = req.body;

    const result = await UiConfig.getSchemaByName(
      tenantDbPool,
      req.body.name
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
    const body = req.body;

    const result = await UiConfig.getDataByQuery(
      tenantDbPool,
      body.query,
      body.dataValue
    );

    res.status(200).send({
      success: true,
      msg: "Data Fetched Successfully!",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.error(error);
  }
};
