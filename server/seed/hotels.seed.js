import dotenv from "dotenv";
import mongoose from "mongoose";
import { HOTEL_DATASETS } from "../../client/src/data/hotelData.js";
import Hotel from "../models/hotel.model.js";
import Package from "../models/package.model.js";

dotenv.config();

export const seedHotels = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      console.error("ERROR: MONGO_URL environment variable is missing.");
      process.exit(1);
    }

    console.log("Connecting to MongoDB database...");
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB successfully.");

    let insertedCount = 0;
    let updatedCount = 0;
    let packageLinkedCount = 0;

    for (const sourceHotel of HOTEL_DATASETS) {
      // 1. Resolve package reference from MongoDB
      const matchingPackage = await Package.findOne({ packageName: sourceHotel.packageName });

      const packageId = matchingPackage ? matchingPackage._id : null;
      if (matchingPackage) {
        packageLinkedCount++;
      } else {
        console.warn(`[WARN] No matching MongoDB package found for: "${sourceHotel.packageName}"`);
      }

      // 2. Prepare images array preserving exact Cloudinary URLs and metadata
      const sanitizedImages = (sourceHotel.images || []).map((img) => ({
        url: (img.url || img.src || "").trim(),
        label: (img.label || img.type || "Hotel Image").trim(),
        alt: (img.alt || sourceHotel.hotelName).trim(),
      }));

      // 3. Prepare hotel document fields
      const hotelPayload = {
        hotelName: sourceHotel.hotelName.trim(),
        packageName: sourceHotel.packageName.trim(),
        packageId: packageId,
        location: sourceHotel.location.trim(),
        destination: sourceHotel.destination.trim(),
        stay: sourceHotel.stay ? sourceHotel.stay.trim() : "5 Nights",
        roomType: sourceHotel.roomType ? sourceHotel.roomType.trim() : "Deluxe Room",
        mealPlan: sourceHotel.mealPlan ? sourceHotel.mealPlan.trim() : "Breakfast Included",
        rating: Number(sourceHotel.rating) || 4.8,
        reviewsCount: Number(sourceHotel.reviewsCount) || 0,
        badge: sourceHotel.badge ? sourceHotel.badge.trim() : "LUXURY STAY",
        description: sourceHotel.description.trim(),
        amenities: (sourceHotel.amenities || []).map((a) => String(a).trim()),
        roomFeatures: (sourceHotel.roomFeatures || []).map((rf) => String(rf).trim()),
        images: sanitizedImages,
        isActive: true,
      };

      // 4. Idempotent Upsert based on unique packageName or hotelName
      const existingHotel = await Hotel.findOne({
        $or: [
          { packageName: sourceHotel.packageName },
          { hotelName: sourceHotel.hotelName, destination: sourceHotel.destination },
        ],
      });

      let savedHotelDoc;

      if (existingHotel) {
        savedHotelDoc = await Hotel.findByIdAndUpdate(
          existingHotel._id,
          { $set: hotelPayload },
          { new: true, runValidators: true }
        );
        console.log(`[UPDATED] Hotel refreshed: "${sourceHotel.hotelName}" (${sourceHotel.destination})`);
        updatedCount++;
      } else {
        savedHotelDoc = await Hotel.create(hotelPayload);
        console.log(`[INSERTED] New Hotel created: "${sourceHotel.hotelName}" (${sourceHotel.destination})`);
        insertedCount++;
      }

      // 5. Update Package -> Hotel reference if package exists
      if (matchingPackage && savedHotelDoc) {
        await Package.findByIdAndUpdate(matchingPackage._id, {
          $set: { hotel: savedHotelDoc._id },
        });
      }
    }

    const totalHotelsInDb = await Hotel.countDocuments();
    const totalPackagesInDb = await Package.countDocuments();

    console.log("\n==========================================");
    console.log(`HOTEL SEED SUMMARY:`);
    console.log(`Source Hotel Records: ${HOTEL_DATASETS.length}`);
    console.log(`Newly Inserted:       ${insertedCount}`);
    console.log(`Updated / Refreshed:  ${updatedCount}`);
    console.log(`Packages Linked:      ${packageLinkedCount}/${totalPackagesInDb}`);
    console.log(`Final Hotel Count:    ${totalHotelsInDb}`);
    console.log("==========================================");

    await mongoose.connection.close();
    console.log("MongoDB connection closed cleanly.");
    process.exit(0);
  } catch (error) {
    console.error("ERROR DURING HOTEL SEEDING:", error);
    process.exit(1);
  }
};

seedHotels();
