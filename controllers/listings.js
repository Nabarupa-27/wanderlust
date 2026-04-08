const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");

// INDEX
module.exports.index = async (req, res) => {
  const { category, search } = req.query;
  let query = {};

  if (category) query.category = category;

  if (search) {
    query.$or = [
      { title: new RegExp(search, "i") },
      { location: new RegExp(search, "i") },
      { country: new RegExp(search, "i") },
    ];
  }

  const allListings = await Listing.find(query);
  res.render("listings/index.ejs", { allListings, category, search });
};

// NEW FORM
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// CREATE (FINAL FIXED)
module.exports.createListing = async (req, res) => {
  try {
    // SAFE BODY FIX
    const data = req.body.listing || req.body;

    const listing = new Listing(data);
    listing.owner = req.user._id;

    // ALWAYS DEFAULT IMAGE
    listing.image = {
      url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
      filename: "default",
    };

    await listing.save();

    req.flash("success", "New listing created");
    res.redirect("/listings");

  } catch (err) {
    console.log(err);
    res.send("Error while creating listing");
  }
};

// SHOW
module.exports.showListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: { path: "author" },
    });

  if (!listing) return next(new ExpressError(404, "Listing not found"));
  res.render("listings/show.ejs", { listing });
};

// EDIT FORM
module.exports.renderEditForm = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return next(new ExpressError(404, "Listing not found"));
  res.render("listings/edit.ejs", { listing });
};

// UPDATE 
module.exports.updateListing = async (req, res) => {
  const data = req.body.listing || req.body;

  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    data,
    { new: true }
  );

  req.flash("success", "Listing updated");
  res.redirect(`/listings/${listing._id}`);
};

// DELETE
module.exports.deleteListing = async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  req.flash("success", "Listing deleted");
  res.redirect("/listings");
};

// WISHLIST
module.exports.toggleWishlist = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const exists = user.wishlist.some(
    item => item.toString() === id
  );

  if (exists) {
    user.wishlist = user.wishlist.filter(
      item => item.toString() !== id
    );
  } else {
    user.wishlist.push(id);
  }

  await user.save();
  res.redirect("/listings");
};