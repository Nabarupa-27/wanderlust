const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// safe import
const passportLocalMongoose =
  require("passport-local-mongoose").default ||
  require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  wishlist: [
    {
      type: Schema.Types.ObjectId,
      ref: "Listing",
    },
  ],
});

// plugin
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
