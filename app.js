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
// const MongoStore = require("connect-mongo"); 
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
const dbUrl =
  "mongodb+srv://nabarupabhunia27_db_user:Naba12345@cluster0.hyjzly4.mongodb.net/wanderlust";

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

/* SESSION CONFIG */
const sessionOptions = {
  name: "session",
  secret: process.env.SECRET || "mysupersecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 3,
  },
};

// SESSION
app.use(session(sessionOptions));

// FLASH
app.use(flash());

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// GLOBAL VARIABLES
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user || null;
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

// 404
app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// SERVER
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});