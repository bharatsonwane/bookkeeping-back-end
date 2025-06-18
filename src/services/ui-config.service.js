import { getHashPassword } from "../helper/authHelper.js";

export default class UiConfig {
  constructor(reqObj) {}

  /**
   * Get sidebar schema configuration for a specific tenant
   * @param {Object} tenantDbPool - Database pool for tenant-specific schema
   * @returns {Promise<Object>} Sidebar schema configuration
   */
  async getSidebarSchema(tenantDbPool) {
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
  async getAllSchemas(tenantDbPool) {
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
   * Get a specific schema by id
   * @param {Object} tenantDbPool - Database pool for tenant-specific schema
   * @param {string} schemaId - Name of the schema to retrieve
   * @returns {Promise<Object>} Schema configuration
   */
  async getSchemaById(tenantDbPool, schemaId) {
    try {
      const result = await tenantDbPool.query(
        `SELECT id, name, label, "schema" FROM schema_config WHERE id = $1`,
        [schemaId]
      );

      if (result.rows.length === 0) {
        throw new Error(`Schema '${schemaId}' not found`);
      }

      return {
        id: result.rows[0].id,
        name: result.rows[0].name,
        label: result.rows[0].label,
        schema: result.rows[0].schema,
      };
    } catch (error) {
      console.error(`Error fetching schema '${schemaId}':`, error);
      throw new Error(
        `Failed to retrieve schema '${schemaId}': ${error.message}`
      );
    }
  }

  async getDataByQuery(tenantDbPool, query) {
    const result = await tenantDbPool.query(query);

    return result;
  }
}
