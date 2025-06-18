import { getHashPassword } from "../helper/authHelper.js";

export default class User {
  constructor(reqObj) {
    this.id = reqObj.id;
    this.email = reqObj.email;
    this.password = reqObj.password;
    this.tenantId = reqObj.tenantId;
  }

  async createUser(commonDbPool) {
    const hashedPassword = await getHashPassword(this.password);
    const tenantResult = await commonDbPool.query(
      `INSERT INTO users (email, password, "tenantId") 
        VALUES ($1, $2, $3) RETURNING id`,
      [this.email, hashedPassword, this.tenantId]
    );
    const tenantId = tenantResult.rows[0].id;
    return tenantId;
  }

  static async findUserByEmail(commonDbPool, email) {
    const userResult = await commonDbPool.query(
      `SELECT id, email, password, "tenantId" from users WHERE email=$1`,
      [email]
    );

    return userResult?.rows[0];
  }
}
