const mongoose = require("mongoose");

const WatchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stocks: [{ type: String }],
});

module.exports = mongoose.model("Watchlist", WatchlistSchema);
