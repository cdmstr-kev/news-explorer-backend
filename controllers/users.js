const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { JWT_SECRET } = require('../utils/config');
const BadRequestError = require('../utils/badRequestError');
const NotFoundError = require('../utils/notFoundError');
const ConflictError = require('../utils/conflictError');
const {SUCCESSFUL, CREATED } = require('../utils/success');


const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
  orFail(() => new NotFoundError("User not found"))
    .then((user) => res.status(SUCCESSFUL).json(user))
    .catch((err) => {
      if (err.name === "castError") {
        next(new BadRequestError("Invalid user ID"));
      } else {
        next(err);
      }
    })
}

const createUser = (req, res, next) => {
  const {email, password, username} = req.body;

  user.create({email, password, username})
    .then((user) => {
      const token = jwt.sign({_id: newUser._id }, JWT_SECRET, {expiresIn: "7d"})

      const userObject = newUser.toObject();
      delete userObject.password;

      return res.status(201).json({
        token,
        user: userObject
      });
    }).catch((err) => {
    if (err.name === "validationError" ) {
    next(new BadRequestError(err.message));
    } else if (err.code === 11000) {
      next(new ConflictError("Email already exists"));
    } else {
      next(err);
    }
  });
};

const login = (req, res, next) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({_id: user._id }, JWT_SECRET, {expiresIn: "7d"});
      res.status(SUCCESSFUL).json({token});
    })
    .catch((err) =>{
      if (err.message === "Incorrect email or password") {
        next(new BadRequestError("incorrect email or password"));
      } else {
        next(err);
      }
    })
}


module.exports = {getCurrentUser, createUser, login};