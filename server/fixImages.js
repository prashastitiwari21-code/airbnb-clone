import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Listing from "./models/Listing.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

const colors = ["#ff385c", "#2d9cdb", "#27ae60", "#f2994a", "#9b51e0", "#eb5757"];

const makeImage = (title, color) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="${color}"/><text x="300" y="210" font-family="Arial" font-size="40" fill="#ffffff" text-anchor="middle">${title}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const listings = await Listing.find();
  for (let i = 0; i < listings.length; i++) {
    listings[i].images = [makeImage(listings[i].title, colors[i % colors.length])];
    await listings[i].save();
  }

  console.log("Updated images for", listings.length, "listings");
  process.exit(0);
};

run();