const jwt = require("jsonwebtoken");

/**
 * Generates a JSON Web Token (JWT) for a given user.
 * The token includes user ID, username, email, and description (if available).
 * @param {Object} user - The user object from which to create the token payload.
 * @returns {string} The generated JWT.
 * @throws {Error} If JWT_SECRET is not defined in environment variables.
 */
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    console.error(
      "Configuration Error: JWT_SECRET is not defined in environment variables."
    );
    throw new Error("Server configuration error: JWT secret is missing.");
  }

  const payload = {
    id: user._id, // User's unique ID from MongoDB
    username: user.username,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || "1h",
  });
};

module.exports = generateToken;
