const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignupPayload(payload) {
  const { name, email, password } = payload || {};

  if (!name || !email || !password) {
    return "Name, email, and password are required.";
  }

  if (String(name).trim().length < 2) {
    return "Name must be at least 2 characters.";
  }

  if (!EMAIL_REGEX.test(String(email).trim().toLowerCase())) {
    return "Email format is invalid.";
  }

  if (String(password).length < 6) {
    return "Password must be at least 6 characters.";
  }

  return null;
}

function validateLoginPayload(payload) {
  const { email, password } = payload || {};

  if (!email || !password) {
    return "Email and password are required.";
  }

  return null;
}

module.exports = {
  validateSignupPayload,
  validateLoginPayload,
};
