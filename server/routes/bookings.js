import express from "express";
import Booking from "../models/Booking.js";
import Listing from "../models/Listing.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Create a booking
router.post("/", protect, async (req, res) => {
  try {
    const { listingId, checkIn, checkOut, guests } = req.body;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid dates" });
    }
    if (start >= end) {
      return res.status(400).json({ message: "Check-out must be after check-in" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.host.toString() === req.user.id) {
      return res.status(400).json({ message: "You can't book your own listing" });
    }
    if (guests > listing.maxGuests) {
      return res.status(400).json({ message: `Max ${listing.maxGuests} guests allowed` });
    }

    const conflict = await Booking.findOne({
      listing: listingId,
      status: "confirmed",
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    });
    if (conflict) {
      return res.status(409).json({ message: "These dates are already booked" });
    }

    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * listing.pricePerNight;

    const booking = await Booking.create({
      listing: listingId,
      guest: req.user.id,
      checkIn: start,
      checkOut: end,
      guests,
      totalPrice,
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// My bookings (as a guest)
router.get("/mine", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ guest: req.user.id })
      .populate("listing", "title city images pricePerNight")
      .sort({ checkIn: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Booked date ranges for one listing (used by the date picker)
router.get("/listing/:listingId", async (req, res) => {
  try {
    const bookings = await Booking.find({
      listing: req.params.listingId,
      status: "confirmed",
    }).select("checkIn checkOut");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel a booking (guest only)
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.guest.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your booking" });
    }

    booking.status = "cancelled";
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;