const { celebrate, Joi } = require("celebrate");
const validator = require("validator");

const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error("string.uri");
};

const validateSignup = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email().messages({
      "string.empty": "Email is required",
      "string.email": "Email must be valid",
    }),
    password: Joi.string().required().min(8).messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters long",
    }),
    username: Joi.string().required().min(2).max(30).messages({
      "string.empty": "Username is required",
      "string.min": "Username must be at least 2 characters long",
      "string.max": "Username must not exceed 30 characters",
    }),
  }),
});

const validateSignin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email().messages({
      "string.empty": "Email is required",
      "string.email": "Email must be valid",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Password is required",
    }),
  }),
});

const validateArticleCreation = celebrate({
  body: Joi.object().keys({
    keyword: Joi.string().required().messages({
      "string.empty": "Keyword is required",
    }),
    title: Joi.string().required().messages({
      "string.empty": "Title is required",
    }),
    text: Joi.string().required().messages({
      "string.empty": "Text is required",
    }),
    date: Joi.string().required().messages({
      "string.empty": "Date is required",
    }),
    source: Joi.string().required().messages({
      "string.empty": "Source is required",
    }),
    link: Joi.string().required().custom(validateURL).messages({
      "string.empty": "Link is required",
      "string.uri": "Link must be a valid URL",
    }),
    image: Joi.string().required().custom(validateURL).messages({
      "string.empty": "Image is required",
      "string.uri": "Image must be a valid URL",
    }),
  }),
});

const validateArticleId = celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).messages({
      "string.hex": "Article ID must be a valid MongoDB ObjectId",
      "string.length": "Article ID must be 24 characters long",
    }),
  }),
});

module.exports = {
  validateSignup,
  validateSignin,
  validateArticleCreation,
  validateArticleId,
};