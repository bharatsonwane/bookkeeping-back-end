import { HttpError } from "../helper/httpError.js";
import Organization from "../services/organization.service.js";

export const createOrganization = async (req, res, next) => {
  try {
    const reqBody = req.body;
    const organizationObject = new Organization(reqBody);

    // Check if organization already exists
    const organizationData = await Organization.getOrganizationByName(
      reqBody.name
    );
    if (organizationData) {
      throw new HttpError("Organization already exists", 400);
    }

    // Create new organization
    const newOrganization = await organizationObject.createOrganization();
    res.status(201).send(newOrganization);
  } catch (error) {
    res.error(error);
  }
};

export const getOrganizations = async (req, res, next) => {
  try {
    const organizations = await Organization.getOrganizations();
    res.status(200).send(organizations);
  } catch (error) {
    res.error(error);
  }
};

export const getOrganizationById = async (req, res, next) => {
  try {
    const organizationId = req.params.id;
    const organization = await Organization.getOrganizationById(organizationId);

    if (!organization) {
      throw new HttpError("Organization not found", 404);
    }

    res.status(200).send(organization);
  } catch (error) {
    res.error(error);
  }
};

export const updateOrganization = async (req, res, next) => {
  try {
    const organizationId = req.params.id;
    const reqBody = req.body;
    const organizationObject = new Organization({
      ...reqBody,
      id: organizationId,
    });

    // Update organization
    const updatedOrganization = await organizationObject.updateOrganization();
    res.status(200).send(updatedOrganization);
  } catch (error) {
    res.error(error);
  }
};
