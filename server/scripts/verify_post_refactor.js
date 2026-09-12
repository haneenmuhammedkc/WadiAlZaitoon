import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoUrl = process.env.MONGO_URL;

async function runVerify() {
  try {
    await mongoose.connect(mongoUrl);
    const db = mongoose.connection.db;

    const packages = await db.collection("packages").find({}).toArray();
    const hotels = await db.collection("hotels").find({}).toArray();

    console.log("=== READ-ONLY MONGODB AUDIT ===");
    console.log(`Packages Count: ${packages.length}`);
    console.log(`Hotels Count: ${hotels.length}`);

    const hotelIds = new Set(hotels.map((h) => String(h._id)));
    let validRefs = 0;
    let nullRefs = 0;
    let orphanRefs = 0;

    for (const pkg of packages) {
      if (!pkg.hotel) {
        nullRefs++;
      } else if (hotelIds.has(String(pkg.hotel))) {
        validRefs++;
      } else {
        orphanRefs++;
        console.log(`ORPHAN REF: Package ${pkg._id} references missing hotel: ${pkg.hotel}`);
      }
    }

    let hotelsWithPackageId = 0;
    let hotelsWithPackageName = 0;

    for (const h of hotels) {
      if (h.packageId !== undefined) hotelsWithPackageId++;
      if (h.packageName !== undefined) hotelsWithPackageName++;
    }

    console.log(`Valid Package.hotel refs: ${validRefs}`);
    console.log(`Null Package.hotel refs: ${nullRefs}`);
    console.log(`Orphan Package.hotel refs: ${orphanRefs}`);
    console.log(`Hotels containing packageId: ${hotelsWithPackageId}`);
    console.log(`Hotels containing packageName: ${hotelsWithPackageName}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

runVerify();
