import {
  signUpService,
  validateUserService,
} from "../services/auth.service.js";

export const signupController = async (req, res) => {
  try {
    const { username, password, tenant_id, tenant } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // If creating new tenant, validate tenant data
    if (tenant) {
      if (!tenant.name || !tenant.domain) {
        return res.status(400).json({
          success: false,
          message:
            "Tenant name and domain are required when creating a new tenant",
        });
      }
    } else if (!tenant_id) {
      return res.status(400).json({
        success: false,
        message: "Either tenant data or tenant_id is required",
      });
    }

    const result = await signUpService(
      { username, password, tenant_id },
      tenant
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (error) {
    res.error(error);
  }
};

export const loginService = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const user = await validateUserService(username, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    return res.json({
      success: true,
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    res.error(error);
  }
};
