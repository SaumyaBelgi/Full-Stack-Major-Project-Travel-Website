//This is the code for setting up the schema validations for the server side before storing the received data into the database. The bootstrap form already handles the client side validations bu the server side validations are also important for API requests sent via any other software

const Joi = require("joi");

module.exports.listingSchema = Joi.object({

    title: Joi.string().required(),
    description: Joi.string().required(),
    country: Joi.string().required(),
    location: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().allow("", null),

});

module.exports.reviewSchema = Joi.object({

    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required()
});