import OrganizationModel from "../models/Organization.js";

export default class Organization {
  constructor(reqObj) {
    this.id = reqObj.id;
    this.name = reqObj.name;
    this.createdBy = reqObj.createdBy;
    this.address = reqObj.address;
    this.phone = reqObj.phone;
    this.email = reqObj.email;
    this.website = reqObj.website;
    this.establishedDate = reqObj.establishedDate;
  }

  async createOrganization() {
    const organization = new OrganizationModel({
      name: this.name,
      createdBy: this.createdBy,
      address: this.address,
      phone: this.phone,
      email: this.email,
      website: this.website,
      establishedDate: this.establishedDate,
    });
    await organization.save();
    return organization;
  }

  async updateOrganization() {
    return await OrganizationModel.findByIdAndUpdate(this.id, this, {
      new: true,
    });
  }

  static async getOrganizations() {
    return await OrganizationModel.find();
  }

  static async getOrganizationById(id) {
    return await OrganizationModel.findById(id);
  }

  static async getOrganizationByName(name) {
    return await OrganizationModel.findOne({ name });
  }

  static async deleteOrganization(id) {
    return await OrganizationModel.findByIdAndDelete(id);
  }
}
