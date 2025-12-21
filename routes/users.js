const express = require("express");
const auth = require("../middlewares/auth");
const { validateSignup, validateSignin } = require("../middlewares/validation");

const router = express.Router();
const { getCurrentUser, createUser, login } = require("../controllers/users");

router.post("/signup", validateSignup, createUser);
router.post("/signin", validateSignin, login);

router.get("/me", auth, getCurrentUser);
module.exports = router;
