import express from "express";
import mongoose from "mongoose";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Listing from "../models/Listing.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Recalculate a listing's average rating and review count
const updateListingRating = async (listingId) => {
  const stats = await Review.aggregate([
    { $match: { listing: new mongoose.Types.ObjectId(listingId) } },
    { $group: { _id: "$listing", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await Listing.findByIdAndUpdate(listingId, {
    avgRating: stats.length ? Math.round(stats[0].avg * 10) / 10 : 0,
    numReviews: stats.length ? stats[0].count : 0,
  });
};

// Add a review (only after a completed stay)
router.post("/", protect, async (req, res) => {
  try {
    const { listingId, rating, comment } = req.body;

    const stay = await Booking.findOne({
      listing: listingId,
      guest: req.user.id,
      status: "confirmed",
      checkOut: { $lt: new Date() },
    });
    if (!stay) {
      return res.status(403).json({ message: "You can only review after a completed stay" });
    }

    const review = await Review.create({
      listing: listingId,
      guest: req.user.id,
      rating,
      comment,
    });

    await updateListingRating(listingId);
    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You already reviewed this listing" });
    }
    res.status(500).json({ message: err.message });
  }
});

// Get all reviews for a listing
router.get("/listing/:listingId", async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate("guest", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete your own review
router.delete("/:id", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.guest.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your review" });
    }

    await review.deleteOne();
    await updateListingRating(review.listing);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;