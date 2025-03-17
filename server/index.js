const express = require('express');
const app = express();
const db = require('./config/db');
require("dotenv").config();
const userRoutes = require("./routes/userroutes");
const cors = require("cors");

const PORT = process.env.PORT || 4000;
const frontendurl = process.env.FRONTEND_URL;

db.connectDB();
app.use(
  cors({
    origin: [frontendurl],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api", userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});