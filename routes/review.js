const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js"); 
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

//A function to carry out the schema validations using Joi while creating a new listing
const validateReview = (req, res, next) =>{
    let result  = reviewSchema.validate(req.body);

    if(result.error){
        throw new ExpressError(400, result.error);
    }
    next();
}



//POST request to save a review that a user has written
router.post("/", validateReview, wrapAsync(async(req, res) =>{
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

//delete request to delete a review
router.delete("/:reviewId", wrapAsync(async(req, res) =>{
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});  //this method will take the listing id, and pull all reviews having review ID = reviewId from its reviews array. The $pull operator is a MongoDB operator used to pull (delete) all instances of something (here, reviewId) from something (here, reviews array of that listing)
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}))

module.exports = router;