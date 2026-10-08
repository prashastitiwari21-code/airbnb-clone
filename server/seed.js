import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Listing from "./models/Listing.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

const img = (seed) => `https://picsum.photos/seed/${seed}/600/400`;

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const host = await User.findOne({ email: "test@test.com" });
  if (!host) {
    console.log("Host user test@test.com not found");
    process.exit(1);
  }

  const data = [
    { title: "Hillside Cabin", description: "Quiet cabin with mountain views", pricePerNight: 2200, city: "Manali", propertyType: "cabin", maxGuests: 3, bedrooms: 1, lat: 32.2396, lng: 77.1887, amenities: ["wifi", "heater"], images: [img("manali1")] },
    { title: "City Apartment", description: "Modern flat near the metro", pricePerNight: 1800, city: "Delhi", propertyType: "apartment", maxGuests: 2, bedrooms: 1, lat: 28.6139, lng: 77.209, amenities: ["wifi", "ac"], images: [img("delhi1")] },
    { title: "Palace Villa", description: "Private villa with a pool", pricePerNight: 9500, city: "Jaipur", propertyType: "villa", maxGuests: 8, bedrooms: 4, lat: 26.9124, lng: 75.7873, amenities: ["wifi", "pool", "parking"], images: [img("jaipur1")] },
    { title: "Lake View Room", description: "Cosy room by the lake", pricePerNight: 1200, city: "Udaipur", propertyType: "room", maxGuests: 2, bedrooms: 1, lat: 24.5854, lng: 73.7125, amenities: ["wifi"], images: [img("udaipur1")] },
    { title: "Family House", description: "Spacious house with a garden", pricePerNight: 4000, city: "Goa", propertyType: "house", maxGuests: 6, bedrooms: 3, lat: 15.2993, lng: 74.124, amenities: ["wifi", "kitchen", "parking"], images: [img("goa2")] },
  ];

  await Listing.insertMany(data.map((d) => ({ ...d, host: host._id })));
  console.log("Seeded", data.length, "listings");
  process.exit(0);
};

run();