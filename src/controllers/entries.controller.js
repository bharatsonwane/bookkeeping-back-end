import { HttpError } from "../helper/httpError.js";
import Entry from "../services/entries.service.js";

export const createEntry = async (req, res, next) => {
  try {
    const body = req.body;
    const entryObject = new Entry({
      schemaId: body.schemaId,
      entryData: body.entryData,
    });

    // Create new organization
    const newOrganization = await entryObject.createEntry();
    res.status(201).send(newOrganization);
  } catch (error) {
    res.error(error);
  }
};
