//main file

const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const Listing = require("./models/listing.js"); //all these were required in the router files so shifted there
// const Review = require("./models/review.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
// const { listingSchema } = require("./schema.js");
// const { reviewSchema } = require("./schema.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
 

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



app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);


//a function that handles the incoming request if it does not match with any of the above
app.all(/.*/, (req, res, next) =>{
    next(new ExpressError(404, "Page not found!"));
});


app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", { err });
})