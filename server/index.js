import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
  console.error("ERROR: JWT_SECRET environment variable is required.");
  process.exit(1);
}

import connectDB from "./config/database.js";
import app from "./app.js";

connectDB();

const Port = process.env.PORT || 6005;

app.listen(Port, () => {
  console.log(`Server is Listening at ${Port}`);
});
