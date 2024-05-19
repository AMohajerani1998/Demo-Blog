const express = require("express");
const router = express.Router();
const userControllers = require('../controllers/user-controllers')



router.get("/sign-up", userControllers.loadSignUpPage);

router.post("/sign-up", userControllers.createUser);

router.get("/log-in", userControllers.loadLoginPage);

router.post("/log-in", userControllers.loginUser);

router.post("/logout", userControllers.logoutUser);

router.get('/401', userControllers.get401)

module.exports = router;
