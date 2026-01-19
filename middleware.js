const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const Listing = require("./models/listing");
const Review = require("./models/review");

// check login
const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in!");
    return res.redirect("/login");
  }
  next();
};

// check listing owner
const isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (!listing.owner) {
    req.flash("error", "No owner found!");
    return res.redirect(`/listings/${id}`);
  }

  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "No permission!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

// check review author
const isReviewAuthor = async (req, res, next) => {
  const { reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect("back");
  }

  if (!review.author.equals(req.user._id)) {
    req.flash("error", "No permission!");
    return res.redirect("back");
  }

  next();
};

// validate listing
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    return next(new ExpressError(400, msg));
  }
  next();
};

// validate review
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    return next(new ExpressError(400, msg));
  }
  next();
};

module.exports = {
  isLoggedIn,
  isOwner,
  isReviewAuthor,   
  validateListing,
  validateReview,
};
