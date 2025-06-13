const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db"); // Import the sequelize instance

const User = sequelize.define(
  "User",
  {
    // Sequelize automatically adds an 'id' (INTEGER, primary key, auto-increment) field by default.
    // So you don't need to define it explicitly unless you want a different name or type.

    username: {
      type: DataTypes.STRING(32), // VARCHAR(32)
      allowNull: false,
      unique: true,
      // trim is a Mongoose concept, handle in controller if needed, or rely on client-side
      // minlength/maxlength handled by DataTypes.STRING(length) and validation
    },
    email: {
      type: DataTypes.STRING, // VARCHAR(255)
      allowNull: false,
      unique: true,
      // lowercase is a Mongoose concept, handle in controller or before saving
      // validate: {
      //   isEmail: true, // Sequelize's built-in email validation
      // },
    },
    password: {
      type: DataTypes.STRING, // VARCHAR(255) - hashed password will be long
      allowNull: false,
      // minlength is handled by validation in controller or model hooks (if added)
    },
    role: {
      type: DataTypes.ENUM("user", "admin"), // ENUM type for roles
      defaultValue: "user",
      allowNull: false,
    },
  },
  {
    // Model options
    timestamps: true, // Adds createdAt and updatedAt columns
    tableName: "users", // Explicitly name the table (defaults to 'Users')
    // You can add hooks here if you want to handle password hashing/email lowercasing
    // before an instance is created or updated:
    // hooks: {
    //     beforeCreate: async (user) => {
    //         if (user.password) {
    //             user.password = await require('../utils/hashPassword')(user.password);
    //         }
    //         if (user.email) {
    //             user.email = user.email.toLowerCase();
    //         }
    //     },
    //     beforeUpdate: async (user) => {
    //         if (user.password && user.changed('password')) {
    //             user.password = await require('../utils/hashPassword')(user.password);
    //         }
    //         if (user.email && user.changed('email')) {
    //             user.email = user.email.toLowerCase();
    //         }
    //     }
    // }
  }
);

module.exports = User;
