//NOTE: This is the first collection being created in the WanderLust database. It stores details of all property listings. The schema of the collection is being defined here. The default option is being set if the property owner does not add any images. The set method is setting a default image if the property owner adds an image, but it is an empty url. The collection formed is being exported at the end

const mongoose=require("mongoose");
const {Schema} = mongoose;

const listingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        
        description: String,
        image: {
            type: String,
            default: "https://unsplash.com/photos/amazing-tropical-sand-beach-with-blue-transparent-sea-water-and-sky-in-background-tourism-and-tourists-travel-destination-for-summer-holiday-vacation-copy-space-and-beautiful-landscape-r3rVM4D1O5w",
            set: (v) => v === "" ? "https://unsplash.com/photos/amazing-tropical-sand-beach-with-blue-transparent-sea-water-and-sky-in-background-tourism-and-tourists-travel-destination-for-summer-holiday-vacation-copy-space-and-beautiful-landscape-r3rVM4D1O5w" : v
        },
        price: Number,
        location: String,
        country: String,
        reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: "Review"
            }
        ]
    }
);

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;