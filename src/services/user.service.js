import UserModel from "../models/User.js";
import { validatePassword, createTwtToken } from "../helper/authHelper.js";

export default class User {
  constructor(reqObj) {
    this.id = reqObj.id;
    this.email = reqObj.email;
    this.password = reqObj.password;
    this.name = reqObj.name;
    this.role = reqObj.role;
    this.organizationId = reqObj.organizationId;
  }

  async createUser() {
    const user = new UserModel({
      email: this.email,
      passwordHash: this.password, // Ensure to hash the password before saving
      name: this.name,
      role: this.role,
      organizationId: this.organizationId,
    });
    await user.save();
    return user;
  }

  async updateUser() {
    return await UserModel.findByIdAndUpdate(
      this.id,
      {
        email: this.email,
        name: this.name,
        role: this.role,
        organizationId: this.organizationId,
      },
      { new: true }
    );
  }

  static async updateUserPassword(id, password) {
    const user = await UserModel.findById(id);
    if (!user) {
      return null;
    }
    user.passwordHash = password;
    await user.save();
    return user;
  }

  static async findUserByEmail(email) {
    return await UserModel.findOne({ email });
  }

  static async getUsers() {
    return await UserModel.find();
  }

  static async getUserById(id) {
    return await UserModel.findById(id);
  }

  static async deleteUser(id) {
    return await UserModel.findByIdAndDelete(id);
  }
}
