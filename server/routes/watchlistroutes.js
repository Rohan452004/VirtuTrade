const express = require("express");
const {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} = require("../controllers/watchlistcontrollers");

const router = express.Router();

//Base router '/api/watchlist'
router.post("/add", addToWatchlist); //Add Stock to Watchlist
router.get("/get/:userId", getWatchlist); //Get User Watchlist
router.delete("/remove", removeFromWatchlist); //Remove Stock from Watchlist

module.exports = router;
