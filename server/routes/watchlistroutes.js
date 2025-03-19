const express = require("express");
const {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} = require("../controllers/watchlistcontrollers");
const { auth } = require("../middlewares/auth");

const router = express.Router();

//Base router '/api/watchlist'
router.post("/add", auth, addToWatchlist); //Add Stock to Watchlist
router.get("/get", auth, getWatchlist); //Get User Watchlist
router.delete("/remove", auth, removeFromWatchlist); //Remove Stock from Watchlist

module.exports = router;
