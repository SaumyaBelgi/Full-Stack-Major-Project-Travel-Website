const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js"); 
const Listing = require("../models/listing.js");

//.. in the file path as app.js is outside of the routes directory of listing.js. Its in the parent directory, so we need to write paths according to its location

//A function to carry out the schema validations using Joi while creating a new listing
const validateListing = (req, res, next) =>{
    let result  = listingSchema.validate(req.body);

    if(result.error){
        throw new ExpressError(400, result.error);
    }
    next();
}


//GET request to view all listings
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//NOTE: the below handler always has to be above the /listings/:id GET request handler. This is because when we are sending a GET request to /listings/new, express thinks the 'new' is an ID and it goes to /listings/:id instead

//GET request to render the form for creating a new listing
router.get("/new", (req, res) => {
    res.render("listings/newListing.ejs");
})

//GET request to show more details about a particular listing after clicking on it
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/showListing.ejs", { listing });
}));



//POST request to save the newly created listing in the database. The form to create a listing sends a POST request here
router.post("/", validateListing, wrapAsync(async (req, res, next) => {
    let { title, description, image, price, location, country } = req.body;
    let newListing = new Listing({
        title: title,
        description: description,
        image: image,
        price: price,
        location: location,
        country: country
    });
    await newListing.save();
    res.redirect("/listings");
    })
);


//GET request to render the form for editing a particular listing
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/editListing.ejs", { listing });
}));

////POST request to save the newly updated listing in the database. The form to update a listing sends a PUT request here
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let { title, description, image, price, location, country } = req.body;
    let updatedListing = {
        title: title,
        description: description,
        image: image,
        price: price,
        location: location,
        country: country
    };

    await Listing.findByIdAndUpdate(id, updatedListing);
    res.redirect(`/listings/${id}`);
}));

//DELETE request to delete the required listing
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

module.exports = router;