const express = require("express");
const auth = require("../middlewares/auth");

const router = express.Router();
const { getCurrentUser } = require("../controllers/users");

router.get("/me", auth, getCurrentUser);

module.exports = router;
