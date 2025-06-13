const User = require("../models/user");
const hashPassword = require("../utils/hashPassword");

/**
 * Controller function to fetch the authenticated user's profile.
 * This function assumes that req.user has been populated by an authentication middleware.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
exports.profile = async (req, res) => {
  try {
    // req.user will have 'id' (from Sequelize) instead of '_id'
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User information not available." });
    }

    // Sequelize user objects might have slightly different properties,
    // but 'id', 'username', 'email', 'description', 'role' should be directly accessible.
    const { id, username, email, role } = req.user;

    res.status(200).json({
      id, // Use 'id' for Sequelize primary key
      username,
      email,
      role,
    });
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Controller function to update the authenticated user's profile.
 * This function assumes that req.user has been populated by an authentication middleware.
 * Allowed updates: username, email, description, and optionally password.
 * @param {Object} req - The Express request object (req.body contains update data).
 * @param {Object} res - The Express response object.
 */
exports.updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User information not available." });
    }

    // Get the user's ID from the authenticated user object (now `id`)
    const userId = req.user.id;
    const { username, email, password } = req.body;

    const updateFields = {};

    if (username) updateFields.username = username;
    if (email) updateFields.email = email.toLowerCase(); // Ensure email is lowercased on update

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          message: "New password must be at least 6 characters long.",
        });
      }
      updateFields.password = await hashPassword(password);
    }

    // Find the user by primary key (id) and update
    // Sequelize's `update` method returns an array [affectedRows, affectedInstances]
    const [affectedRows] = await User.update(updateFields, {
      where: { id: userId },
      individualHooks: true, // Run hooks for bulk update (if you added any in User model)
    });

    if (affectedRows === 0) {
      // No rows were updated, might mean user not found or no changes
      return res
        .status(404)
        .json({ message: "User not found or no changes applied." });
    }

    // Fetch the updated user to send in response, as `update` doesn't return the instance by default
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error("Profile Update Error:", err);
    if (err.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ message: "Username or email is already in use." });
    }
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Controller function to delete the authenticated user's profile.
 * This function assumes that req.user has been populated by an authentication middleware.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
exports.deleteProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User information not available." });
    }

    const userId = req.user.id; // Use 'id' for Sequelize primary key

    // Delete the user by primary key (id)
    // Sequelize's `destroy` returns the number of destroyed rows (1 if successful, 0 if not found)
    const deletedRows = await User.destroy({
      where: { id: userId },
    });

    if (deletedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Profile deleted successfully!" });
  } catch (err) {
    console.error("Profile Delete Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Controller function to fetch all users.
 * This route should typically be restricted to admin users via middleware.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users, excluding their passwords for security
    const users = await User.findAll({
      attributes: { exclude: ["password"] }, // Exclude password column
    });

    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (err) {
    console.error("Get All Users Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
