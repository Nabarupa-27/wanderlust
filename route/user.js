const express = require("express");
const router = express.Router();

const passport = require("passport");
const User = require("../models/user");
const { isLoggedIn } = require("../middleware");

// LOGIN
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/listings");
  }
);

// SIGNUP
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post("/signup", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
});

// LOGOUT
router.get("/logout", (req, res) => {
  req.logout(() => {
    req.flash("success", "Logged out");
    res.redirect("/listings");
  });
});

// WISHLIST PAGE
router.get("/wishlist", isLoggedIn, async (req, res) => {
  const user = await req.user.populate("wishlist");
  res.render("user/wishlist.ejs", { wishlist: user.wishlist });
});

module.exports = router;
