const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// controller
const listingController = require("../controllers/listings");

// middleware
const { isLoggedIn, isOwner, validateListing } = require("../middleware");

// multer + cloudinary
const multer = require("multer");
const { storage } = require("../utils/cloudinary");
const upload = multer({ storage });

// INDEX – show all listings
router.get("/", listingController.index);

// NEW – form (login required)
router.get("/new", isLoggedIn, listingController.renderNewForm);

// CREATE – IMPORTANT ORDER: multer → joi → controller
router.post(
  "/",
  isLoggedIn,
  upload.single("image"),
  validateListing,
  listingController.createListing
);

// SHOW – single listing
router.get("/:id", listingController.showListing);

// EDIT – form (only owner)
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  listingController.renderEditForm
);

// UPDATE – IMPORTANT ORDER: multer → joi → controller
router.put(
  "/:id",
  isLoggedIn,
  upload.single("image"),
  validateListing,
  listingController.updateListing
);

// DELETE – only owner
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  listingController.deleteListing
);

module.exports = router;
