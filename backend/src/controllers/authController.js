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

function getAuthUserId(req) {
  return req.user?.userId || req.user?.id;
}

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
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const user = await getUserById(userId);

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
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const user = await updateUserProfile(userId, req.body || {});

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
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const subscription = await getUserSubscription(userId);

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