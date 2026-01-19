const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const { cloudinary } = require("../utils/cloudinary");

// SHOW ALL LISTINGS
module.exports.index = async (req, res) => {
  let query = {};   
  if (req.query.category) {
    query.category = req.query.category;
  }
  if (req.query.location) {
    query.location = new RegExp(req.query.location, "i");
  }
  const allListings = await Listing.find(query);
  res.render("listings/index.ejs", { allListings });
};

// RENDER NEW LISTING FORM
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// CREATE NEW LISTING
module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);

  // owner set
  newListing.owner = req.user._id;

  // image save (Cloudinary)
  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

// SHOW SINGLE LISTING
module.exports.showListing = async (req, res, next) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    return next(new ExpressError(404, "Listing not found!"));
  }

  res.render("listings/show.ejs", { listing });
};

// RENDER EDIT FORM
module.exports.renderEditForm = async (req, res, next) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    return next(new ExpressError(404, "Listing not found!"));
  }

  res.render("listings/edit.ejs", { listing });
};

// UPDATE LISTING
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  // image replace (only if new file uploaded)
  if (req.file) {
    // delete old image
    if (listing.image && listing.image.filename) {
      await cloudinary.uploader.destroy(listing.image.filename);
    }

    // save new image
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };

    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

// DELETE LISTING
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  // delete image from cloudinary
  if (listing.image && listing.image.filename) {
    await cloudinary.uploader.destroy(listing.image.filename);
  }

  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
