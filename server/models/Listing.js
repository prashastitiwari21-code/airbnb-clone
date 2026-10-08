import mongoose from "mongoose";
const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
        city: { type: String, required: true },
    address: { type: String },
    lat: { type: Number },
    lng: { type: Number },
        images: [{ type: String }],
            propertyType: {
      type: String,
      enum: ["apartment", "house", "villa", "cabin", "room"],
      default: "apartment",
    },
    maxGuests: { type: Number, default: 2 },
    bedrooms: { type: Number, default: 1 },
    amenities: [{ type: String }],
        host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            avgRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export default mongoose.model("Listing", listingSchema);
