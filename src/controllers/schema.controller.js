import Schema from "../services/schema.service.js";
import { HttpError } from "../helper/httpError.js";

export const createSchema = async (req, res, next) => {
  try {
    const schemaService = new Schema(req.body);
    const schema = await schemaService.createSchema();
    res.status(201).send(schema);
  } catch (error) {
    res.error(error);
  }
};

export const getSchemas = async (req, res, next) => {
  try {
    if (req.user.userRole == "superAdmin") {
      const schemas = await Schema.getSchemas();
      return res.status(200).send(schemas);
    }
    const schemas = await Schema.getSchemasByOrganizationId(
      req.user.organizationId
    );
    res.status(200).send(schemas);
  } catch (error) {
    res.error(error);
  }
};

export const getSchemaById = async (req, res, next) => {
  try {
    const schemaId = req.params.id;
    const schema = await Schema.getSchemaById(schemaId);
    if (!schema) {
      throw new HttpError("Schema not found", 404);
    }
    res.status(200).send(schema);
  } catch (error) {
    res.error(error);
  }
};

export const updateSchema = async (req, res, next) => {
  try {
    const schemaId = req.params.id;
    const updateData = { ...req.body, id: schemaId, isValidated: true };
    const schemaService = new Schema(updateData);
    const updatedSchema = await schemaService.updateSchema();
    res.status(200).send(updatedSchema);
  } catch (error) {
    res.error(error);
  }
};

export const deleteSchema = async (req, res, next) => {
  try {
    const schemaId = req.params.id;
    await Schema.deleteSchema(schemaId);
    res.status(204).send();
  } catch (error) {
    res.error(error);
  }
};

export const getEntriesBySchemaId = async (req, res, next) => {
  try {
    const schemaId = req.params.id;
    const entries = await Schema.getEntriesBySchemaId(schemaId);
    res.status(200).send(entries);
  } catch (error) {
    res.error(error);
  }
};
