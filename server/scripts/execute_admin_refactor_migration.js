import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl) {
  console.error("MONGO_URL not found!");
  process.exit(1);
}

async function runMigration() {
  try {
    console.log("=== PHASE 9: MONGODB CONTROLLED REFACTOR MIGRATION ===");
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUrl);
    console.log("Connected successfully!");

    const db = mongoose.connection.db;

    // 1. Audit pre-migration document counts
    const pkgCount = await db.collection("packages").countDocuments();
    const hotelCount = await db.collection("hotels").countDocuments();
    console.log(`\n[PRE-MIGRATION AUDIT] Packages count: ${pkgCount} | Hotels count: ${hotelCount}`);

    const packages = await db.collection("packages").find({}).toArray();
    const hotels = await db.collection("hotels").find({}).toArray();

    // 2. Export full pre-migration JSON backups
    const backupDir = "C:/Users/haneen/.gemini/antigravity/brain/4e712637-78f9-4db1-ad66-4e13a74578fc/scratch";
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    fs.writeFileSync(path.join(backupDir, "backup_packages_pre_refactor.json"), JSON.stringify(packages, null, 2));
    fs.writeFileSync(path.join(backupDir, "backup_hotels_pre_refactor.json"), JSON.stringify(hotels, null, 2));
    console.log("[BACKUP] Created JSON snapshots in scratch directory.");

    // 3. Verify Package -> Hotel mapping & check for orphan references
    console.log("\n=== PACKAGE -> HOTEL MAPPING AUDIT ===");
    const hotelMap = new Map(hotels.map(h => [String(h._id), h]));
    let validRefs = 0;
    let orphanRefs = 0;

    for (const pkg of packages) {
      const hotelIdStr = pkg.hotel ? String(pkg.hotel) : null;
      const matchedHotel = hotelIdStr ? hotelMap.get(hotelIdStr) : null;

      if (matchedHotel) {
        validRefs++;
        console.log(`✓ Package: "${pkg.packageName}" (${pkg._id}) -> Hotel: "${matchedHotel.hotelName}" (${matchedHotel._id})`);
      } else if (hotelIdStr) {
        orphanRefs++;
        console.warn(`⚠️ ORPHAN REF: Package "${pkg.packageName}" references missing hotelId: ${hotelIdStr}`);
      } else {
        console.log(`ℹ️ Package "${pkg.packageName}" has no linked hotel (hotel = null)`);
      }
    }

    console.log(`\nMapping Summary: ${validRefs} valid hotel references, ${orphanRefs} orphan references.`);

    // 4. Perform $unset migration on hotels collection
    console.log("\n[EXECUTION] Removing deprecated 'packageId' and 'packageName' fields from 'hotels' collection...");
    const unsetResult = await db.collection("hotels").updateMany(
      {},
      { $unset: { packageId: "", packageName: "" } }
    );
    console.log(`[EXECUTION RESULT] Matched ${unsetResult.matchedCount} documents, modified ${unsetResult.modifiedCount} documents.`);

    // 5. Post-migration integrity verification
    const updatedHotels = await db.collection("hotels").find({}).toArray();
    let staleFieldsCount = 0;
    for (const h of updatedHotels) {
      if (h.packageId !== undefined || h.packageName !== undefined) {
        staleFieldsCount++;
      }
    }

    const postPkgCount = await db.collection("packages").countDocuments();
    const postHotelCount = await db.collection("hotels").countDocuments();

    console.log("\n=== POST-MIGRATION INTEGRITY VERIFICATION ===");
    console.log(`- Packages Count: ${postPkgCount} (expected ${pkgCount})`);
    console.log(`- Hotels Count: ${postHotelCount} (expected ${hotelCount})`);
    console.log(`- Stale fields on hotels documents: ${staleFieldsCount} (expected 0)`);

    if (postPkgCount === pkgCount && postHotelCount === hotelCount && staleFieldsCount === 0) {
      console.log("\nSUCCESS: MongoDB Package/Hotel refactor migration completed with 100% data integrity!");
    } else {
      console.error("\nERROR: Integrity check failed after migration!");
    }

    await mongoose.disconnect();
    console.log("Disconnected cleanly from MongoDB.");
  } catch (err) {
    console.error("Migration Error:", err);
    process.exit(1);
  }
}

runMigration();
