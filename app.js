//main file

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const { reviewSchema } = require("./schema.js");
 

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine("ejs", ejsMate);

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

main().then(() => {
    console.log("Connection successful");
})
    .catch((err) => {
        console.log(err);
    });
const port = 3000;
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});

//GET request to root path. Does not do much right now
app.get("/", (req, res) => {
    res.send("Hello!");
});

//GET request to view all listings
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//NOTE: the below handler always has to be above the /listings/:id GET request handler. This is because when we are sending a GET request to /listings/new, express thinks the 'new' is an ID and it goes to /listings/:id instead

//GET request to render the form for creating a new listing
app.get("/listings/new", (req, res) => {
    res.render("listings/newListing.ejs");
})

//GET request to show more details about a particular listing after clicking on it
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/showListing.ejs", { listing });
}));

//A function to carry out the schema validations using Joi while creating a new listing
const validateListing = (req, res, next) =>{
    let result  = listingSchema.validate(req.body);

    if(result.error){
        throw new ExpressError(400, result.error);
    }
    next();
}


//POST request to save the newly created listing in the database. The form to create a listing sends a POST request here
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
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
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/editListing.ejs", { listing });
}));

////POST request to save the newly updated listing in the database. The form to update a listing sends a PUT request here
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
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
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));


//A function to carry out the schema validations using Joi while creating a new listing
const validateReview = (req, res, next) =>{
    let result  = reviewSchema.validate(req.body);

    if(result.error){
        throw new ExpressError(400, result.error);
    }
    next();
}


//POST request to save a review that a user has written
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req, res) =>{
    let listing = await Listing.findById(req.params.id);
    let { rating, comment } = req.body;
    
    let newReview = new Review({
        comment: comment,
        rating: rating
    });

    listing.reviews.push(newReview); //store it into the reviews array of the listing
    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}))

//a function that handles the incoming request if it does not match with any of the above
app.all(/.*/, (req, res, next) =>{
    next(new ExpressError(404, "Page not found!"));
});


app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", { err });
})