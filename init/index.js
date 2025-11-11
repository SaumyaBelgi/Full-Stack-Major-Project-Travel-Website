//NOTE: This file contains the code to insert the sample data into the database. It involves first creating the connection between express abd the database and then inserting data using the insertMany() method. Data from data.js is being required here

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

main().then(() =>{
    console.log("Connection successful");
})
.catch((err) =>{
    console.log(err);
});

const initDB = async () =>{
    await Listing.insertMany(initData.sampleListings);
    console.log("database was initialised");
}

initDB();