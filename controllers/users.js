const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const BadRequestError = require("../utils/badRequestError");
const NotFoundError = require("../utils/notFoundError");
const ConflictError = require("../utils/conflictError");
const { SUCCESSFUL, CREATED } = require("../utils/success");

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).orFail(
      () => new NotFoundError("User not found")
    );
    res.status(SUCCESSFUL).json(user);
  } catch (err) {
    console.log(err);
    if (err.name === "CastError") {
      next(new BadRequestError("Invalid user ID"));
    } else {
      next(err);
    }
  }
};

const createUser = async (req, res, next) => {
  try {
    console.log("📝 Signup request body:", req.body);
    const { email, password, username } = req.body;
    const user = await User.create({ email, password, username });
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    const userObject = user.toObject();
    delete userObject.password;
    return res.status(201).json({
      message: "User created successfully!",
      user: userObject,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      next(new BadRequestError(err.message));
    } else if (err.code === 11000) {
      next(new ConflictError("Email already exists"));
    } else {
      next(err);
    }
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
    res.status(SUCCESSFUL).json({ token });
  } catch (err) {
    console.error(err);
    if (err.message === "Incorrect email or password") {
      next(new BadRequestError("incorrect email or password"));
    } else {
      next(err);
    }
  }
};

module.exports = { getCurrentUser, createUser, login };
