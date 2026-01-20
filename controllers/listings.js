const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const { cloudinary } = require("../utils/cloudinary");

//INDEX
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

//SEARCH DROPDOWN API
module.exports.searchSuggestions = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  const results = await Listing.find({
    $or: [
      { title: new RegExp(q, "i") },
      { location: new RegExp(q, "i") },
      { country: new RegExp(q, "i") },
    ],
  })
    .limit(5)
    .select("title location country");

  res.json(
    results.map(r =>
      r.location ? `${r.location} - ${r.title}` : r.title
    )
  );
};

//NEW FORM
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

//CREATE
module.exports.createListing = async (req, res) => {
  const listing = new Listing(req.body.listing);
  listing.owner = req.user._id;

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await listing.save();
  req.flash("success", "New listing created");
  res.redirect("/listings");
};

//SHOW
module.exports.showListing = async (req, res, next) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: { path: "author" },
    });

  if (!listing) return next(new ExpressError(404, "Listing not found"));
  res.render("listings/show.ejs", { listing });
};

//EDIT FORM
module.exports.renderEditForm = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return next(new ExpressError(404, "Listing not found"));
  res.render("listings/edit.ejs", { listing });
};

//UPDATE
module.exports.updateListing = async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    { ...req.body.listing },
    { new: true }
  );

  if (req.file) {
    if (listing.image?.filename) {
      await cloudinary.uploader.destroy(listing.image.filename);
    }
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await listing.save();
  }

  req.flash("success", "Listing updated");
  res.redirect(`/listings/${listing._id}`);
};

//DELETE
module.exports.deleteListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (listing.image?.filename) {
    await cloudinary.uploader.destroy(listing.image.filename);
  }

  await Listing.findByIdAndDelete(req.params.id);
  req.flash("success", "Listing deleted");
  res.redirect("/listings");
};

// wishlist toggle
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

  // always safe
  res.redirect("/listings");
};


