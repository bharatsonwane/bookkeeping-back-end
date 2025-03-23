import User from "../services/user.service.js";
import { HttpError } from "../helper/httpError.js";
import { createTwtToken, validatePassword } from "../helper/authHelper.js";

export const postUserLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findUserByEmail(email);
    if (!user) {
      throw new HttpError("Invalid email or password", 401);
    }

    const isPasswordValid = await validatePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new HttpError("Invalid email or password", 401);
    }

    const token = await createTwtToken({ email: user.email, role: user.role });

    const tokenData = {
      userId: user.id,
      email: user.email,
      userRole: user.role,
      organizationId: user.organizationId,
    };

    const jwtToken = await createTwtToken(tokenData);

    res.status(200).send({ token: jwtToken, userData: tokenData });
  } catch (error) {
    res.error(error);
  }
};

export const postUserSignup = async (req, res, next) => {
  try {
    const userService = new User(req.body);
    const user = await userService.createUser();
    res.status(201).send(user);
  } catch (error) {
    res.error(error);
  }
};

export const getUsersList = async (req, res, next) => {
  try {
    const users = await User.getUsers();
    res.status(200).send(users);
  } catch (error) {
    res.error(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.getUserById(userId);
    if (!user) {
      throw new HttpError("User not found", 404);
    }
    res.status(200).send(user);
  } catch (error) {
    res.error(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updateData = { ...req.body, id: userId };
    const user = new User(updateData);
    const updatedUser = await user.updateUser();
    res.status(200).send(updatedUser);
  } catch (error) {
    res.error(error);
  }
};

export const updateUserPassword = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    const updatedUser = await User.updateUserPassword(userId, updateData.password);
    res.status(200).send(updatedUser);
  } catch (error) {
    res.error(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    await User.deleteUser(userId);
    res.status(204).send();
  } catch (error) {
    res.error(error);
  }
};
