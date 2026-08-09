const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  patchUser,
  deleteUser
} = require("../controllers/usersController");
const {
  createUserValidator,
  updateUserValidator,
  patchUserValidator,
} = require("../validators/usersValidator");
const validateRequest = require("../middlewares/validateRequest");
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post(
  "/",
  createUserValidator,
  validateRequest,
  createUser
);
router.put(
  "/:id",
updateUserValidator,
  validateRequest,
  updateUser
);
router.patch(
  "/:id",
  patchUserValidator,
  validateRequest,
  patchUser
);
router.delete("/:id", deleteUser);

module.exports = router;