const express = require("express");
const router = express.Router();
const passport = require("passport");

// controller
const userController = require("../controllers/user");

// SIGNUP
router.get("/signup", userController.renderSignupForm);
router.post("/signup", userController.signup);

// LOGIN
router.get("/login", userController.renderLoginForm);
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.login
);

// LOGOUT
router.get("/logout", userController.logout);

module.exports = router;
