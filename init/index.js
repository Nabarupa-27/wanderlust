const mongoose = require("mongoose");
const Listing = require("../models/listing");
const initData = require("./data");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
    initDB();
  })
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  // delete old listings
  await Listing.deleteMany({});

  // add owner to each listing
  const dataWithOwner = initData.data.map((obj) => ({
    ...obj,
    owner: "6965394a220490b5ca03be29", 
  }));

  // insert into DB
  await Listing.insertMany(dataWithOwner);

  console.log("data was initialized");
};
