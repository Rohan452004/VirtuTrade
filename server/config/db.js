const mongoose = require("mongoose");
require("dotenv").config();

exports.connectDB = () => {
  const uri = process.env.DATABASE_URL;
  if (!uri || typeof uri !== "string") {
    console.error(
      "Missing DATABASE_URL. Create server/.env from server/.env.example and set your MongoDB connection string."
    );
    process.exit(1);
  }

  mongoose
    .connect(uri)
    .then(() => {
      console.log("Database Connection established");
    })
    .catch((err) => {
      console.error(err);
      console.log("Connection Issues with Database");
      process.exit(1);
    });
};
