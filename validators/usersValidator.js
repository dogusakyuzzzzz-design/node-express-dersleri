const { body, param } = require("express-validator");

const createUserValidator = [
  body("isim")
    .trim()
    .notEmpty()
    .withMessage("İsim zorunludur")
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage("İsim 2 ile 50 karakter arasında olmalıdır"),

  body("yas")
    .notEmpty()
    .withMessage("Yaş zorunludur")
    .bail()
    .isInt({ min: 1, max: 120 })
    .withMessage("Yaş 1 ile 120 arasında tam sayı olmalıdır")
    .toInt(),
];
const updateUserValidator = createUserValidator;
const userIdValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID pozitif bir tam sayı olmalıdır")
    .toInt(),
];
  const patchUserValidator = [
  body("isim")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("İsim 2 ile 50 karakter arasında olmalıdır"),

  body("yas")
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage("Yaş 1 ile 120 arasında tam sayı olmalıdır")
    .toInt(),
];
module.exports = {
  createUserValidator,
  updateUserValidator,
  patchUserValidator,
  userIdValidator,
};