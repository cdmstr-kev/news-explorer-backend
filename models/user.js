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

userSchema.pre("save", async function() {
  if (!this.isModified("password")) {
    return
  }
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.statics.findUserByCredentials = function findUserByCredentials(
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