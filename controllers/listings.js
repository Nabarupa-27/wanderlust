const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");

// INDEX
module.exports.index = async (req, res) => {
  try {
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

    res.render("listings/index.ejs", {
      allListings,
      category,
      search,
    });

  } catch (err) {
    console.log("INDEX ERROR:", err);
    res.send("Error loading listings");
  }
};


// NEW FORM
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};


// CREATE 
module.exports.createListing = async (req, res) => {
  try {
    const data = req.body.listing;

    if (!data) {
      return res.send("Form data not received");
    }

    const listing = new Listing(data);
    listing.owner = req.user._id;

    // IMAGE HANDLE
    if (req.file && req.file.path) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    } else {
      listing.image = {
        url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
        filename: "default",
      };
    }

    await listing.save();

    req.flash("success", "New listing created");
    res.redirect("/listings");

  } catch (err) {
    console.log("CREATE ERROR:", err);
    res.send("Error while creating listing");
  }
};


// SHOW
module.exports.showListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("owner")
      .populate({
        path: "reviews",
        populate: { path: "author" },
      });

    if (!listing) {
      return next(new ExpressError(404, "Listing not found"));
    }

    res.render("listings/show.ejs", { listing });

  } catch (err) {
    console.log("SHOW ERROR:", err);
    res.send("Error loading listing");
  }
};


// EDIT FORM
module.exports.renderEditForm = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(new ExpressError(404, "Listing not found"));
    }

    res.render("listings/edit.ejs", { listing });

  } catch (err) {
    console.log("EDIT ERROR:", err);
    res.send("Error loading edit form");
  }
};


// UPDATE 
module.exports.updateListing = async (req, res) => {
  try {
    const data = req.body.listing;

    if (!data) {
      return res.send("No data received");
    }

    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    // IMAGE UPDATE
    if (req.file && req.file.path) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
      await listing.save();
    }

    req.flash("success", "Listing updated");
    res.redirect(`/listings/${listing._id}`);

  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.send("Error updating listing");
  }
};


// DELETE
module.exports.deleteListing = async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);

    req.flash("success", "Listing deleted");
    res.redirect("/listings");

  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.send("Error deleting listing");
  }
};


// WISHLIST
module.exports.toggleWishlist = async (req, res) => {
  try {
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

    req.flash("success", "Wishlist updated");
    res.redirect("/listings");

  } catch (err) {
    console.log("WISHLIST ERROR:", err);
    res.send("Error updating wishlist");
  }
};