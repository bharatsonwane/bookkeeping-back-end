import EntryModel from "../models/Entry.js";

export default class Entry {
  constructor(reqObj) {
    this.id = reqObj.id;
    this.organizationId = reqObj.organizationId;
    this.schemaId = reqObj.schemaId;
    this.createdBy = reqObj.createdBy;
    this.entryData = reqObj.entryData;
  }

  async createEntry() {
    const entry = new EntryModel({
      organizationId: this.organizationId,
      schemaId: this.schemaId,
      createdBy: this.createdBy,
      entryData: this.entryData,
    });
    await entry.save();
    return entry;
  }
}
