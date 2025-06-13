const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Import the Sequelize User model

/**
 * Middleware to protect routes by verifying a JWT token.
 * It expects a token in the 'Authorization' header in the format 'Bearer <token>'.
 * If valid, it attaches the user object to req.user and calls next().
 * Otherwise, it sends an appropriate error response.
 */
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by primary key (ID) from the decoded token payload
      // Use findByPk for Sequelize. select('-password') becomes attributes: { exclude: ['password'] }
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
      });

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Unauthorized: User not found." });
      }

      next();
    } catch (err) {
      console.error("Auth Middleware Error:", err);

      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token has expired." });
      }
      if (err.name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({ message: "Unauthorized: Invalid token." });
      }
      res
        .status(500)
        .json({ message: "Internal server error during authentication." });
    }
  } else {
    res
      .status(401)
      .json({ message: "Unauthorized: No token provided or invalid format." });
  }
};

/**
 * Middleware to authorize users based on their role.
 * This middleware should be placed AFTER the 'protect' middleware.
 * @param {...string} roles - The roles that are allowed to access the route (e.g., 'admin', 'moderator').
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // req.user should be populated by the 'protect' middleware
    if (!req.user) {
      return res
        .status(403)
        .json({ message: "Forbidden: User not authenticated." });
    }

    // Check if the user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      // User.role is directly accessible from Sequelize instance
      return res.status(403).json({
        message: `Forbidden: User role '${req.user.role}' is not authorized to access this route.`,
      });
    }
    next(); // User is authorized, proceed to the next middleware/controller
  };
};
