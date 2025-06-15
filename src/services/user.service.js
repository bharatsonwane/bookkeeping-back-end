import { getHashPassword } from "../helper/authHelper.js";

export default class User {
  constructor(reqObj) {
    this.id = reqObj.id;
    this.email = reqObj.email;
    this.password = reqObj.password;
    this.tenantId = reqObj.tenantId
  }

  async createUser(commonDbClient) {
    const hashedPassword = await getHashPassword(this.password);
    const tenantResult = await commonDbClient.query(
      `INSERT INTO users (email, password, "tenantId") 
        VALUES ($1, $2, $3) RETURNING id`,
        [this.email, hashedPassword, this.tenantId]
    );
    const tenantId = tenantResult.rows[0].id;
    return tenantId;
  }
}
