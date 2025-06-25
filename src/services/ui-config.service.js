import { getHashPassword } from "../helper/authHelper.js";

export default class UiConfig {
  constructor(reqObj) {}

  /**
   * Get sidebar schema configuration for a specific tenant
   * @param {Object} tenantDbPool - Database pool for tenant-specific schema
   * @returns {Promise<Object>} Sidebar schema configuration
   */
  static async getSidebarSchema(tenantDbPool) {
    try {
      // Query the schema_config table to get the sidebar schema
      const result = await tenantDbPool.query(
        `SELECT "schema" FROM schema_config WHERE name = 'sidebarSchema'`
      );

      if (result.rows.length === 0) {
        throw new Error("Sidebar schema not found for this tenant");
      }

      const sidebarSchema = result.rows[0].schema;

      return sidebarSchema;
    } catch (error) {
      console.error("Error fetching sidebar schema:", error);
      throw new Error(`Failed to retrieve sidebar schema: ${error.message}`);
    }
  }

  /**
   * Get all available schemas for a tenant
   * @param {Object} tenantDbPool - Database pool for tenant-specific schema
   * @returns {Promise<Array>} List of available schemas
   */
  static async getAllSchemas(tenantDbPool) {
    try {
      const result = await tenantDbPool.query(
        `SELECT id, name, label, "schema" FROM schema_config ORDER BY name`
      );

      return result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        label: row.label,
        schema: row.schema,
      }));
    } catch (error) {
      console.error("Error fetching schemas:", error);
      throw new Error(`Failed to retrieve schemas: ${error.message}`);
    }
  }

  /**
   * Get a specific schema by name
   * @param {Object} tenantDbPool - Database pool for tenant-specific schema
   * @param {string} schemaName - Name of the schema to retrieve
   * @returns {Promise<Object>} Schema configuration
   */
  static async getSchemaConfigByName(tenantDbPool, schemaName) {
    const result = await tenantDbPool.query(
      `SELECT id, name, label, "schema" FROM schema_config WHERE name = $1`,
      [schemaName]
    );

    if (result.rows.length === 0) {
      throw new Error(`Schema '${schemaName}' not found`);
    }

    return result.rows[0];
  }

  /**
   * Get a specific schema by name
   * @param {Object} tenantDbPool - Database pool for tenant-specific schema
   * @param {string} schemaName - Name of the schema to retrieve
   * @returns {Promise<Object>} Schema configuration
   */
  static async getSchemaByName(tenantDbPool, schemaName) {
    const result = await tenantDbPool.query(
      `SELECT "schema" FROM schema_config WHERE name = $1`,
      [schemaName]
    );

    if (result.rows.length === 0) {
      throw new Error(`Schema '${schemaName}' not found`);
    }

    return result.rows[0].schema || {};
  }

  static async getDataByQuery(tenantDbPool, query) {
    const result = await tenantDbPool.query(query);
    return result.rows;
  }
}