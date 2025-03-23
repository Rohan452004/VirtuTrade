import React, { useEffect, useState } from "react";
import axios from "axios";

const Watchlist = ({ title, selectedStock, getWatchlist, watchlists }) => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [stockData, setStockData] = useState({}); // Store price, change, and % change for each stock

  // Fetch stock data (price, change, and % change) for all stocks in the watchlist
  const fetchStockData = async (symbols) => {
    try {
      const data = {};
      for (const symbol of symbols) {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_WEB_URL}/api/stock/${symbol}`,
          { withCredentials: true }
        );
        const chartData = response.data.chart.result[0].meta;
        const price = chartData.regularMarketPrice;
        const previousClose = chartData.chartPreviousClose;
        const change = price - previousClose; // Absolute change in price
        const changePercent = (change / previousClose) * 100; // Percentage change

        data[symbol] = {
          price,
          change,
          changePercent,
        };
      }
      setStockData(data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };

  // Remove Stock from Watchlist
  const removeFromWatchlist = async (stockSymbol) => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_APP_WEB_URL}/api/watchlist/remove`,
        {
          data: { stockSymbol },
          withCredentials: true,
        }
      );
      getWatchlist();
    } catch (error) {
      console.error("Error removing stock:", error);
    }
  };

  // Fetch stock data when watchlist changes
  useEffect(() => {
    getWatchlist();
    if (watchlists?.stocks?.length > 0) {
      fetchStockData(watchlists.stocks);
    }
  }, [watchlists]);

  return (
    <div className="border border-gray-600 rounded-lg bg-gray-800 shadow-lg w-full lg:w-96 h-[40vh] overflow-hidden">
      {/* Watchlist Title */}
      <h2 className="text-lg font-semibold text-white p-4 border-b border-gray-700">
        {title}
      </h2>

      {/* Watchlist Data */}
      <div className="overflow-y-auto h-[32vh] p-3">
        {watchlists?.stocks?.length > 0 ? (
          watchlists.stocks.map((stockSymbol, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 mb-2 rounded-lg cursor-pointer transition-colors bg-gray-700 hover:bg-gray-600"
              onClick={() => selectedStock(stockSymbol)}
            >
              {/* Stock Symbol */}
              <span className="text-white text-sm font-medium truncate w-24">
                {stockSymbol.toUpperCase()}
              </span>

              {/* Price, Change, and % Change */}
              <div className="flex items-center gap-3 mr-1.5">
                <span className="text-white text-sm font-medium">
                  ₹{stockData[stockSymbol]?.price?.toFixed(2) || "Loading..."}
                </span>
                <span
                  className={`text-sm font-medium ${
                    stockData[stockSymbol]?.change >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {stockData[stockSymbol]?.change
                    ? `₹${stockData[stockSymbol].change.toFixed(2)}`
                    : "Loading..."}
                </span>
                <span
                  className={`text-sm font-medium ${
                    stockData[stockSymbol]?.changePercent >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {stockData[stockSymbol]?.changePercent
                    ? `(${stockData[stockSymbol].changePercent.toFixed(2)}%)`
                    : "Loading..."}
                </span>
              </div>

              {/* Remove Button */}
              <button
                className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-500 transition-colors"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent onClick
                  removeFromWatchlist(stockSymbol);
                }}
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center">
            Loading or no stocks in your watchlist.
          </p>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
