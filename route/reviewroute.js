const express = require("express");
const router = express.Router({ mergeParams: true });

// controllers
const reviewController = require("../controllers/review");

// middleware
const {
  isLoggedIn,
  validateReview,
  isReviewAuthor,
} = require("../middleware");

// CREATE REVIEW
router.post(
  "/",
  isLoggedIn,
  validateReview,
  reviewController.createReview
);

// DELETE REVIEW
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  reviewController.deleteReview
);

module.exports = router;
