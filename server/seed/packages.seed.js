import dotenv from "dotenv";
import mongoose from "mongoose";
import Package from "../models/package.model.js";

dotenv.config();

const packagesToSeed = [
  {
    packageName: "Dubai Luxury Escape",
    packageDestination: "Dubai, UAE",
    packageDays: 6,
    packageNights: 5,
    packagePrice: 39999,
    packageDiscountPrice: 34999,
    packageOffer: true,
    packageRating: 4.8,
    packageTotalRatings: 126,
    packageAccommodation: "4★ Hotel (Deluxe Double/Twin Room)",
    packageTransportation: "Private AC Vehicle & Airport Transfers",
    packageMeals: "Daily Breakfast Included",
    packageActivities: "Dubai City Sightseeing, Desert Safari, Dune Bashing, Camel Ride & BBQ Dinner",
    packageDescription:
      "Experience the best of Dubai with luxury accommodation, iconic city attractions and unforgettable desert adventures. This package combines modern Dubai, traditional experiences and premium leisure time.",
    packageImages: ["/assets/images/dubai.png"],
  },
  {
    packageName: "Maldives Island Escape",
    packageDestination: "Maldives",
    packageDays: 5,
    packageNights: 4,
    packagePrice: 54999,
    packageDiscountPrice: 49999,
    packageOffer: true,
    packageRating: 4.9,
    packageTotalRatings: 84,
    packageAccommodation: "4★ Premium Resort (Beach / Overwater Villa)",
    packageTransportation: "Speedboat / Seaplane Airport Transfers",
    packageMeals: "Daily Breakfast Included",
    packageActivities: "Island Hopping, Snorkeling Excursion, Dolphin Spotting & Sunset Cruise",
    packageDescription:
      "Escape to the crystal-clear waters and white-sand beaches of the Maldives. Enjoy a relaxing island stay with beautiful ocean views, resort experiences and optional water activities.",
    packageImages: ["/assets/images/maldives.png"],
  },
  {
    packageName: "Bali Tropical Experience",
    packageDestination: "Bali, Indonesia",
    packageDays: 6,
    packageNights: 5,
    packagePrice: 44999,
    packageDiscountPrice: 39999,
    packageOffer: true,
    packageRating: 4.8,
    packageTotalRatings: 126,
    packageAccommodation: "4★ Resort & Spa (Deluxe Room)",
    packageTransportation: "Private AC Vehicle & Airport Transfers",
    packageMeals: "Daily Breakfast Included",
    packageActivities: "Ubud Tour, Tegallalang Rice Terraces, Tegenungan Waterfall & Tanah Lot Temple",
    packageDescription:
      "Discover Bali's temples, rice terraces, waterfalls and tropical beaches on a carefully planned island escape. Enjoy a balance of culture, nature, sightseeing and relaxation.",
    packageImages: ["/assets/images/bali.png"],
  },
  {
    packageName: "Thailand Island Getaway",
    packageDestination: "Bangkok & Phuket, Thailand",
    packageDays: 6,
    packageNights: 5,
    packagePrice: 37999,
    packageDiscountPrice: 32999,
    packageOffer: true,
    packageRating: 4.7,
    packageTotalRatings: 92,
    packageAccommodation: "4★ Beachfront Hotel (Deluxe Room)",
    packageTransportation: "Airport Transfers & Island Speedboats",
    packageMeals: "Daily Breakfast Included",
    packageActivities: "Bangkok City & Temple Sightseeing, Phi Phi Island Speedboat Tour & Big Buddha",
    packageDescription:
      "Explore Thailand's vibrant city life and tropical islands in one exciting holiday. Experience Bangkok highlights before relaxing on the beaches of Phuket.",
    packageImages: ["/assets/images/thailand.png"],
  },
  {
    packageName: "Georgia Discovery",
    packageDestination: "Tbilisi & Gudauri, Georgia",
    packageDays: 5,
    packageNights: 4,
    packagePrice: 34999,
    packageDiscountPrice: 29999,
    packageOffer: true,
    packageRating: 4.8,
    packageTotalRatings: 78,
    packageAccommodation: "4★ Hotel (Standard/Deluxe Room)",
    packageTransportation: "Private / Shared AC Vehicle & Airport Transfers",
    packageMeals: "Daily Breakfast Included",
    packageActivities: "Old Tbilisi Tour, Gudauri Mountain Drive, Ananuri Fortress & Mtskheta Monasteries",
    packageDescription:
      "Explore Georgia's historic capital, mountain landscapes and charming countryside. This package combines culture, nature and scenic mountain experiences.",
    packageImages: ["/assets/images/dubai.png"],
  },
  {
    packageName: "Azerbaijan Escape",
    packageDestination: "Baku, Azerbaijan",
    packageDays: 5,
    packageNights: 4,
    packagePrice: 36999,
    packageDiscountPrice: 31999,
    packageOffer: true,
    packageRating: 4.7,
    packageTotalRatings: 65,
    packageAccommodation: "4★ Hotel (Deluxe Room)",
    packageTransportation: "Private AC Vehicle & Airport Transfers",
    packageMeals: "Daily Breakfast Included",
    packageActivities: "Baku Old City & Flame Towers Tour, Gobustan Mud Volcanoes & Absheron Fire Temple",
    packageDescription:
      "Discover the modern architecture and rich heritage of Baku while exploring Azerbaijan's fascinating landscapes. Enjoy city sightseeing, cultural landmarks and a memorable countryside excursion.",
    packageImages: ["/assets/images/maldives.png"],
  },
  {
    packageName: "Turkey Highlights",
    packageDestination: "Istanbul & Cappadocia, Turkey",
    packageDays: 7,
    packageNights: 6,
    packagePrice: 59999,
    packageDiscountPrice: 52999,
    packageOffer: true,
    packageRating: 4.9,
    packageTotalRatings: 142,
    packageAccommodation: "4★ Boutique Hotels (Deluxe Room)",
    packageTransportation: "Airport Transfers & Domestic Transport Arrangements",
    packageMeals: "Daily Breakfast Included",
    packageActivities: "Hagia Sophia & Blue Mosque Tour, Bosphorus Dinner Cruise & Cappadocia Rock Formations",
    packageDescription:
      "Experience the magic of Turkey through Istanbul's historic landmarks and Cappadocia's spectacular landscapes. Discover ancient architecture, local culture and unforgettable scenic experiences.",
    packageImages: ["/assets/images/bali.png"],
  },
  {
    packageName: "Switzerland Explorer",
    packageDestination: "Zurich, Lucerne & Interlaken, Switzerland",
    packageDays: 8,
    packageNights: 7,
    packagePrice: 119999,
    packageDiscountPrice: 109999,
    packageOffer: true,
    packageRating: 4.9,
    packageTotalRatings: 188,
    packageAccommodation: "3★/4★ Alpine Hotels (Deluxe Room)",
    packageTransportation: "Swiss Scenic Train Tickets & Airport Transfers",
    packageMeals: "Daily Breakfast Included",
    packageActivities: "Lake Lucerne Cruise, Mount Titlis Cable Car, Interlaken & Jungfrau Alpine Region",
    packageDescription:
      "Discover Switzerland's spectacular alpine landscapes, charming cities and crystal-clear lakes. Enjoy scenic train journeys, mountain excursions and unforgettable European scenery.",
    packageImages: ["/assets/images/thailand.png"],
  },
  {
    packageName: "Italy Discovery Tour",
    packageDestination: "Rome, Florence & Venice, Italy",
    packageDays: 7,
    packageNights: 6,
    packagePrice: 89999,
    packageDiscountPrice: 79999,
    packageOffer: true,
    packageRating: 4.8,
    packageTotalRatings: 115,
    packageAccommodation: "3★/4★ Historic Hotels (Deluxe Room)",
    packageTransportation: "High-Speed Intercity Trains & Airport Transfers",
    packageMeals: "Daily Breakfast Included",
    packageActivities: "Rome Colosseum & Forum Tour, Vatican City, Florence Duomo & Venice Gondola Ride",
    packageDescription:
      "Explore Italy's legendary cities, historic architecture and unforgettable cultural attractions. From ancient Rome to romantic Venice, experience some of Europe's most iconic destinations.",
    packageImages: ["/assets/images/dubai.png"],
  },
  {
    packageName: "Singapore Family Getaway",
    packageDestination: "Singapore",
    packageDays: 5,
    packageNights: 4,
    packagePrice: 49999,
    packageDiscountPrice: 44999,
    packageOffer: true,
    packageRating: 4.8,
    packageTotalRatings: 96,
    packageAccommodation: "4★ City Hotel (Deluxe Family / Double Room)",
    packageTransportation: "Private AC Vehicle & Airport Transfers",
    packageMeals: "Daily Breakfast Included",
    packageActivities: "Singapore City Highlights, Marina Bay Sands, Sentosa Island & Gardens by the Bay",
    packageDescription:
      "Enjoy a fun-filled Singapore holiday designed for families and first-time visitors. Discover futuristic attractions, beautiful gardens, shopping districts and exciting family experiences.",
    packageImages: ["/assets/images/maldives.png"],
  },
];

const seedPackages = async () => {
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
    let skippedCount = 0;

    for (const pack of packagesToSeed) {
      const existing = await Package.findOne({ packageName: pack.packageName });
      if (existing) {
        console.log(`[EXISTS] Package already in DB: ${pack.packageName}`);
        skippedCount++;
      } else {
        await Package.create(pack);
        console.log(`[INSERTED] Imported package: ${pack.packageName}`);
        insertedCount++;
      }
    }

    const totalPackages = await Package.countDocuments();
    console.log("\n==========================================");
    console.log(`SEED SUMMARY:`);
    console.log(`Newly Inserted: ${insertedCount}`);
    console.log(`Skipped (Already Existed): ${skippedCount}`);
    console.log(`Total Package Count in DB: ${totalPackages}`);
    console.log("==========================================");

    await mongoose.connection.close();
    console.log("MongoDB connection closed cleanly.");
    process.exit(0);
  } catch (error) {
    console.error("ERROR DURING SEEDING:", error);
    process.exit(1);
  }
};

seedPackages();
