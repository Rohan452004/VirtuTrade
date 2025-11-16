import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";

const Watchlist = ({ title, selectedStock, getWatchlist, watchlists }) => {
  const [stockData, setStockData] = useState({});
  const { theme } = useTheme();

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
      toast.success(res.data.message);
    } catch (error) {
      console.error("Error removing stock:", error);
    }
  };

  const fetchStockChanges = async () => {
    if (!watchlists?.stocks?.length) return;

    try {
      const responses = await Promise.all(
        watchlists.stocks.map((symbol) =>
          axios.get(`${import.meta.env.VITE_APP_WEB_URL}/api/stock/${symbol}`)
        )
      );

      const newData = {};
      responses.forEach((response, index) => {
        const symbol = watchlists.stocks[index];
        const meta = response.data.chart.result[0].meta;
        const previousClose = meta.chartPreviousClose;
        const currentPrice = meta.regularMarketPrice;

        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;

        newData[symbol] = {
          change: change.toFixed(2),
          changePercent: changePercent.toFixed(2),
          isPositive: change >= 0,
        };
      });

      setStockData(newData);
    } catch (error) {
      console.error("Error fetching stock changes:", error);
    }
  };

  useEffect(() => {
    getWatchlist();
  }, [watchlists]);

  useEffect(() => {
    if (watchlists?.stocks?.length) {
      fetchStockChanges();
      const interval = setInterval(fetchStockChanges, 30000);
      return () => clearInterval(interval);
    }
  }, [watchlists?.stocks]);

  return (
    <div className={`border rounded-lg shadow-lg w-full lg:w-96 h-[60vh] sm:h-[40vh] overflow-hidden ${
      theme === "dark" 
        ? "border-gray-600 bg-gray-800" 
        : "border-gray-200 bg-white"
    }`}>
      <h2 className={`text-lg font-semibold p-4 border-b ${
        theme === "dark" 
          ? "text-white border-gray-700" 
          : "text-gray-900 border-gray-200"
      }`}>
        {title}
      </h2>

      <div className="overflow-y-auto h-[53vh] sm:h-[32vh] p-3">
        {watchlists?.stocks?.length > 0 ? (
          watchlists.stocks.map((stockSymbol, index) => {
            const data = stockData[stockSymbol];

            return (
              <div
                key={index}
                className={`flex justify-between items-center p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => selectedStock(stockSymbol)}
              >
                <div className="flex flex-col max-w-[60%]">
                  <span className={`text-sm font-medium truncate ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>
                    {stockSymbol.toUpperCase()}
                  </span>
                  {data && (
                    <div
                      className={`text-xs ${
                        data.isPositive ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {data.change} ({data.changePercent}%)
                    </div>
                  )}
                </div>

                <button
                  className={`px-2 sm:px-3 py-1 rounded-lg transition-colors text-xs sm:text-sm ${
                    theme === "dark"
                      ? "bg-gray-600 text-white hover:bg-gray-500"
                      : "bg-gray-300 text-gray-900 hover:bg-gray-400"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchlist(stockSymbol);
                  }}
                >
                  Remove
                </button>
              </div>
            );
          })
        ) : (
          <p className={`text-center text-sm p-4 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}>
            {watchlists?.stocks ? "No stocks in watchlist" : "Loading..."}
          </p>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
