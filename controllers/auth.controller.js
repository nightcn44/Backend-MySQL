const User = require("../models/user"); // Import the Sequelize User model
const hashPassword = require("../utils/hashPassword");
const generateToken = require("../utils/generateToken");
const validatePassword = require("../utils/validatePassword");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // if (password.length < 6) {
  //   return res
  //     .status(400)
  //     .json({ message: "Password must be at least 6 characters long" });
  // }

  try {
    // Ensure email is lowercase before checking/saving (Sequelize doesn't auto-lowercase by default)
    const lowercasedEmail = email.toLowerCase();

    // Check for Existing User (using Sequelize's findOne)
    const existingUser = await User.findOne({
      where: {
        // Using Sequelize's Op.or for OR condition
        // You'd need to import { Op } from 'sequelize' at the top if using Op.or
        // For simplicity, let's do two queries or one OR query.
        // For this example, let's just check for username or email
        // If you want to use Op.or, add `const { Op } = require('sequelize');`
        // $or: [{ username }, { email }] becomes:
        // [Op.or]: [{ username: username }, { email: lowercasedEmail }]
        // For now, let's make it simpler and rely on unique constraints, or separate checks.
        // A single query with OR is better.
        // Assuming `Op` is imported for simplicity here.
        // (This comment is for explanation, actual code uses Sequelize's syntax for OR)
        [require("sequelize").Op.or]: [
          { username: username },
          { email: lowercasedEmail },
        ],
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or Email is already registered" });
    }

    const hashedPassword = await hashPassword(password);

    // Create New User (using Sequelize's create method)
    const newUser = await User.create({
      username,
      email: lowercasedEmail, // Save the lowercased email
      password: hashedPassword,
    });

    // Note: Sequelize's `create` returns the instance directly, no need for `await newUser.save()`

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error("Register Error:", err);
    // Handle Sequelize-specific errors for validation or unique constraints
    if (err.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ message: "Username or Email is already registered" });
    }
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ message: err.message });
    }
    if (err.message.includes("Failed to hash password")) {
      return res.status(500).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Find User by Username (using Sequelize's findOne)
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Invalid Credentials (User not found)" });
    }

    // Validate Password
    const isMatch = await validatePassword(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "Invalid Credentials (Password incorrect)" });
    }

    // Generate JWT Token
    // Sequelize instances behave like objects, so user.id will work
    const token = generateToken(user);

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login Error:", err);
    if (err.message.includes("Server configuration error")) {
      return res.status(500).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
