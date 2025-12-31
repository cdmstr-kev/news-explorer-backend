const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const BadRequestError = require("../utils/badRequestError");
const NotFoundError = require("../utils/notFoundError");
const ConflictError = require("../utils/conflictError");
const { SUCCESSFUL } = require("../utils/success");

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).orFail(
      () => new NotFoundError("User not found")
    );
    return res.status(SUCCESSFUL).json(user);
  } catch (err) {
    console.log(err);
    if (err.name === "CastError") {
      return next(new BadRequestError("Invalid user ID"));
    }
    return next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    console.log("📝 Signup request body:", req.body);
    const { email, password, username } = req.body;
    const user = await User.create({ email, password, username });
    const userObject = user.toObject();
    delete userObject.password;
    return res.status(201).json({
      message: "User created successfully!",
      user: userObject,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return next(new BadRequestError(err.message));
    }
    if (err.code === 11000) {
      return next(new ConflictError("Email already exists"));
    }
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new BadRequestError("Email and password are required"));
    }
    const user = await User.findUserByCredentials(email, password);
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.status(SUCCESSFUL).json({ token });
  } catch (err) {
    console.error(err);
    if (err.message === "Incorrect email or password") {
      return next(new BadRequestError("incorrect email or password"));
    }
    return next(err);
  }
};

module.exports = { getCurrentUser, createUser, login };
