const {
  validateSignupPayload,
  validateLoginPayload,
} = require("../utils/validators");

const {
  createUser,
  authenticateUser,
  getUserById,
  updateUserProfile,
  getUserSubscription,
} = require("../services/userService");

const { createToken } = require("../utils/jwt");

async function signup(req, res, next) {
  try {
    const validationError = validateSignupPayload(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const user = await createUser(req.body);
    const token = createToken({ userId: user.id, email: user.email });

    return res.status(201).json({
      message: "Signup successful.",
      user,
      token,
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const validationError = validateLoginPayload(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const user = await authenticateUser(req.body);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = createToken({ userId: user.id, email: user.email });

    return res.status(200).json({
      message: "Login successful.",
      user,
      token,
    });
  } catch (error) {
    return next(error);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
}

async function updateCurrentUser(req, res, next) {
  try {
    const user = await updateUserProfile(req.user.id, req.body || {});

    return res.status(200).json({
      message: "Profile updated.",
      user,
    });
  } catch (error) {
    return next(error);
  }
}

async function getCurrentSubscription(req, res, next) {
  try {
    const subscription = await getUserSubscription(req.user.id);

    return res.status(200).json({ subscription });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  signup,
  login,
  getCurrentUser,
  updateCurrentUser,
  getCurrentSubscription,
};