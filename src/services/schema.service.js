import SchemaModel from "../models/Schema.js";
import EntryModel from "../models/Entry.js";

export default class Schema {
  constructor(reqObj) {
    this.id = reqObj.id;
    this.name = reqObj.name;
    this.label = reqObj.label;
    this.version = reqObj.version;
    this.isValidated = reqObj.isValidated || false;
    this.children = reqObj.children || [];
    this.organizationId = reqObj.organizationId;
  }

  async createSchema() {
    const schema = new SchemaModel({
      name: this.name,
      version: this.version,
      children: this.children,
      organizationId: this.organizationId,
    });
    await schema.save();
    return schema;
  }

  async updateSchema() {
    return await SchemaModel.findByIdAndUpdate(
      this.id,
      {
        name: this.name,
        label: this.label,
        version: this.version,
        isValidated: this.isValidated || false,
        children: this.children || [],
        organizationId: this.organizationId,
      },
      {
        new: true,
      }
    );
  }

  static async getSchemaById(id) {
    return await SchemaModel.findById(id);
  }

  static async getSchemasByOrganizationId(organizationId) {
    const schemas = await SchemaModel.find({ organizationId });
    const newSchema = schemas.map((schema) => {
      return {
        id: schema._id,
        name: schema.name,
        label: schema.label,
        version: schema.version,
        organizationId: schema.organizationId,
        createdAt: schema.createdAt,
        updatedAt: schema.updatedAt,
        isValidated: schema.isValidated,
      };
    });
    return newSchema;
  }

  static async getSchemas() {
    const schemas = await SchemaModel.find();

    const newSchema = schemas.map((schema) => {
      return {
        id: schema._id,
        name: schema.name,
        label: schema.label,
        version: schema.version,
        organizationId: schema.organizationId,
        createdAt: schema.createdAt,
        updatedAt: schema.updatedAt,
        isValidated: schema.isValidated,
      };
    });
    return newSchema;
  }

  static async deleteSchema(id) {
    return await SchemaModel.findByIdAndDelete(id);
  }

  static async getEntriesBySchemaId(id) {
    const entries = await EntryModel.find({ schemaId: id });
    return entries;
  }
}
