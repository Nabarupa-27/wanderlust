require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError");

// SESSION + STORE
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");

// PASSPORT
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

// ROUTES
const userRoutes = require("./route/user");
const listingRoutes = require("./route/listingroute");
const reviewRoutes = require("./route/reviewroute");

// DATABASE
const dbUrl = process.env.ATLASTDB_URL;

// CONNECT DB
mongoose
  .connect(dbUrl)
  .then(() => console.log("connected to DB"))
  .catch((err) => console.log(err));

// VIEW ENGINE
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

/* SESSION STORE (IMPORTANT)*/
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600, 
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

/* SESSION CONFIG */
const sessionOptions = {
  store,
  name: "session",
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 3, 
  },
};

// SESSION FIRST
app.use(session(sessionOptions));

// FLASH AFTER SESSION
app.use(flash());

// PASSPORT CONFIG
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// GLOBAL TEMPLATE VARIABLES
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// ROOT
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// ROUTES
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

// 404 HANDLER
app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});
// ERROR HANDLER
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// SERVER
app.listen(8080, () => {
  console.log("server is listening on port 8080");
});
