import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoUrl = process.env.MONGO_URL;

async function runAudit() {
  await mongoose.connect(mongoUrl);
  const db = mongoose.connection.db;

  const packages = await db.collection("packages").find({}).toArray();
  console.log("=== PACKAGES COUNT:", packages.length);
  for (const pkg of packages) {
    console.log({
      _id: pkg._id,
      packageName: pkg.packageName,
      packageDestination: pkg.packageDestination,
      packageAccommodation: pkg.packageAccommodation,
      hotel: pkg.hotel,
      packagePrice: pkg.packagePrice,
      packageDiscountPrice: pkg.packageDiscountPrice,
      packageOffer: pkg.packageOffer
    });
  }

  const hotels = await db.collection("hotels").find({}).toArray();
  console.log("\n=== HOTELS COUNT:", hotels.length);
  for (const h of hotels) {
    console.log({
      _id: h._id,
      hotelName: h.hotelName,
      destination: h.destination,
      packageName: h.packageName,
      packageId: h.packageId,
      location: h.location,
      stay: h.stay,
      roomType: h.roomType
    });
  }

  await mongoose.disconnect();
}

runAudit();
