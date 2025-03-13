const express = require('express');
const app = express();
const db = require('./config/db');
require("dotenv").config();
const userRoutes = require("./routes/userroutes");

const PORT = process.env.PORT || 4000;

db.connectDB();

app.use(express.json());
app.use("/api", userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});