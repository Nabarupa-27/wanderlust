const express = require("express");
const router = express.Router();

const listingController = require("../controllers/listings");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");

const multer = require("multer");
const { storage } = require("../utils/cloudinary");
const upload = multer({ storage });

// index
router.get("/", listingController.index);

// wishlist toggle (GET – SIMPLE)
router.get("/:id/wishlist", isLoggedIn, listingController.toggleWishlist);

// new
router.get("/new", isLoggedIn, listingController.renderNewForm);

// create
router.post(
  "/",
  isLoggedIn,
  upload.single("image"),
  validateListing,
  listingController.createListing
);

// show
router.get("/:id", listingController.showListing);

// edit
router.get("/:id/edit", isLoggedIn, isOwner, listingController.renderEditForm);

// update
router.put(
  "/:id",
  isLoggedIn,
  upload.single("image"),
  validateListing,
  listingController.updateListing
);

// delete
router.delete("/:id", isLoggedIn, isOwner, listingController.deleteListing);

module.exports = router;
