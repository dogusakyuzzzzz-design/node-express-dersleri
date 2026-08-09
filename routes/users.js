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
  userIdValidator,
} = require("../validators/usersValidator");
const validateRequest = require("../middlewares/validateRequest");
router.get("/", getAllUsers);
router.get(
  "/:id",
  userIdValidator,
  validateRequest,
  getUserById
);
router.post(
  "/",
  createUserValidator,
  validateRequest,
  createUser
);
router.put(
  "/:id",
userIdValidator,
updateUserValidator,
  validateRequest,
  updateUser
);
router.patch(
  "/:id",
  userIdValidator,
  patchUserValidator,
  validateRequest,
  patchUser
);
router.delete(
  "/:id",
  userIdValidator,
  validateRequest,
  deleteUser
);
module.exports = router;