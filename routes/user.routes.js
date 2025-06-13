const express = require("express");
const router = express.Router();

const {
  profile,
  updateProfile,
  deleteProfile,
  getAllUsers,
} = require("../controllers/user.controller");
const { protect, authorize } = require("../middleware/auth");

router.get("/profile", protect, profile);
router.put("/profile", protect, updateProfile);
router.delete("/profile", protect, deleteProfile);

router.get("/users", protect, authorize("admin"), getAllUsers);

module.exports = router;
