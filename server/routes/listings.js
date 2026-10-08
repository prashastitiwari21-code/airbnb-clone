import express from "express";
import Listing from "../models/Listing.js";
import { protect, hostOnly } from "../middleware/auth.js";

const router = express.Router();

// Create a listing (hosts only)
router.post("/", protect, hostOnly, async (req, res) => {
  try {
    const { host, avgRating, numReviews, ...data } = req.body;
    const listing = await Listing.create({ ...data, host: req.user.id });
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all listings, with filters
router.get("/", async (req, res) => {
  try {
    const { city, type, guests, minPrice, maxPrice } = req.query;

    const filter = {};
    if (city) filter.city = { $regex: city, $options: "i" };
    if (type) filter.propertyType = type;
    if (guests) filter.maxGuests = { $gte: Number(guests) };

    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    }

    const listings = await Listing.find(filter)
      .populate("host", "name email")
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get the logged-in host's own listings (must come BEFORE "/:id")
router.get("/mine", protect, hostOnly, async (req, res) => {
  try {
    const listings = await Listing.find({ host: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one listing
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate("host", "name email");
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a listing (owner only)
router.put("/:id", protect, hostOnly, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.host.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own listings" });
    }

    const { host, avgRating, numReviews, ...updates } = req.body;
    Object.assign(listing, updates);
    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a listing (owner only)
router.delete("/:id", protect, hostOnly, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.host.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own listings" });
    }

    await listing.deleteOne();
    res.json({ message: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;