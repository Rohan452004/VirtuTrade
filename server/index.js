const express = require('express');
const app = express();
const db = require('./config/db');
require("dotenv").config();
const userRoutes = require("./routes/userroutes");
const watchlistRoutes = require("./routes/watchlistroutes");
const positionRoutes = require("./routes/positionroutes");
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
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/position", positionRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});