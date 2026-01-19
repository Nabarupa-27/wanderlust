const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Safe import 
const passportLocalMongoose =
  require("passport-local-mongoose").default ||
  require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// plugin now gets a FUNCTION
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
