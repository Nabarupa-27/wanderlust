const User = require("../models/user");

// render signup form
module.exports.renderSignupForm = (req, res) => {
  res.render("user/signup.ejs");
};

// signup logic
module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// render login form
module.exports.renderLoginForm = (req, res) => {
  res.render("user/login.ejs");
};

// login success
module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  res.redirect("/listings");
};

// logout
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out!");
    res.redirect("/listings");
  });
};
