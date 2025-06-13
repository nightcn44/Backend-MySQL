const bcrypt = require("bcryptjs");

/**
 * Hashes a given plain text password using bcrypt.
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} - A promise that resolves to the hashed password.
 * @throws {Error} - Throws an error if hashing fails.
 */
const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (err) {
    console.error("Hashing Error:", err);
    throw new Error("Failed to hash password. Please try again.");
  }
};

module.exports = hashPassword;
