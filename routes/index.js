const router = require('express').Router();
const userRouter = require('./users');
const articlesRouter = require('./articles');
const { createUser, login } = require('../controllers/users');
const { validateSignup, validateSignin } = require('../middlewares/validation');

router.post('/signup', validateSignup, createUser);
router.post('/signin', validateSignin, login);

router.use('/users', userRouter);
router.use('/articles', articlesRouter);

module.exports = router;