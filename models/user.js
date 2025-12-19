const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema =  new mongoose.Schema( {
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  username: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30
  },

})

userSchema.pre("save", function(next) {
  if (!this.isModified("password")) {
    return next();
  }

  return bcrypt.hash(this.password, 10)
    .then((hash) => {
      this.password = hash;
      next();
    })
    .catch(next);
})

userSchema.statics.findByCredentials = function findUserByCredentials(
  email,
  password
) {
  return this.findOne({email})
  .select("+password")
  .then((user) => {

     if (!user) {
        return Promise.reject(new Error("Incorrect email or password"));
     }

     return bcrypt.compare(password, user.password).then((matched) => {
       if (!matched) {
         return Promise.reject(new Error("Incorrect email or password"));
       }
       return user;
      });
    });
};


const User = mongoose.model( "User", userSchema);

module.exports = User;