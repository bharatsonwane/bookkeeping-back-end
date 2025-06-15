import { validatePassword, createTwtToken } from "../helper/authHelper.js";

export default class Tenant {
  constructor(reqObj) {
    this.id = reqObj.id;
    this.name = reqObj.name;
    this.domain = reqObj.domain;
  }

  async createTenant(commonDbClient) {
    const tenantResult = await commonDbClient.query(
        `INSERT INTO tenants (name, domain) VALUES ($1, $2) RETURNING id`,
        [this.name, this.domain]
      );
      const tenantId = tenantResult.rows[0].id;
      return tenantId
  }
}
