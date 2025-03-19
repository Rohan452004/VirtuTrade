const Watchlist = require("../models/Watchlist");

//Add Stock to Watchlist
const addToWatchlist = async (req, res) => {
  const { userId, stockSymbol } = req.body;

  try {
    let watchlist = await Watchlist.findOne({ userId });

    if (!watchlist) {
      watchlist = new Watchlist({ userId, stocks: [stockSymbol] });
    } else {
      if (!watchlist.stocks.includes(stockSymbol)) {
        watchlist.stocks.push(stockSymbol);
      }
    }

    await watchlist.save();
    res
      .status(200)
      .json({ success: true, message: "Stock added to watchlist", watchlist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get User Watchlist
const getWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({ userId: req.user.userId });

    if (!watchlist) {
      return res
        .status(404)
        .json({ success: false, message: "No watchlist found" });
    }

    res.status(200).json({ success: true, watchlist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//Remove Stock from Watchlist
const removeFromWatchlist = async (req, res) => {
  const { userId, stockSymbol } = req.body;

  try {
    const watchlist = await Watchlist.findOne({ userId });

    if (!watchlist) {
      return res.status(404).json({ message: "No watchlist found" });
    }

    watchlist.stocks = watchlist.stocks.filter(
      (stock) => stock !== stockSymbol
    );
    await watchlist.save();

    res
      .status(200)
      .json({ message: "Stock removed from watchlist", watchlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addToWatchlist, getWatchlist, removeFromWatchlist };
