const bcrypt = require("bcryptjs");

/**
 * Compares a plain text password with a hashed password using bcrypt.
 * @param {string} input - The plain text password provided by the user.
 * @param {string} hashed - The hashed password stored in the database.
 * @returns {Promise<boolean>} - A promise that resolves to true if passwords match, false otherwise.
 * @throws {Error} - Throws an error if the comparison fails.
 */
const validatePassword = async (input, hashed) => {
  try {
    const isMatch = await bcrypt.compare(input, hashed);
    return isMatch;
  } catch (err) {
    console.error("validatePassword Utility Error:", err);
    throw new Error("Error validating password during comparison.");
  }
};

module.exports = validatePassword;
