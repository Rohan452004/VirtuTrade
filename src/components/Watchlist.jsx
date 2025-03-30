import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const Watchlist = ({ title, selectedStock, getWatchlist, watchlists }) => {
  const [stockData, setStockData] = useState({});

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
    <div className="border border-gray-600 rounded-lg bg-gray-800 shadow-lg w-full lg:w-96 h-[60vh] sm:h-[40vh] overflow-hidden">
      <h2 className="text-lg font-semibold text-white p-4 border-b border-gray-700">
        {title}
      </h2>

      <div className="overflow-y-auto h-[53vh] sm:h-[32vh] p-3">
        {watchlists?.stocks?.length > 0 ? (
          watchlists.stocks.map((stockSymbol, index) => {
            const data = stockData[stockSymbol];

            return (
              <div
                key={index}
                className="flex justify-between items-center p-3 mb-2 rounded-lg cursor-pointer transition-colors bg-gray-700 hover:bg-gray-600"
                onClick={() => selectedStock(stockSymbol)}
              >
                <div className="flex flex-col max-w-[60%]">
                  <span className="text-white text-sm font-medium truncate">
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
                  className="bg-gray-600 text-white px-2 sm:px-3 py-1 rounded-lg hover:bg-gray-500 transition-colors text-xs sm:text-sm"
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
          <p className="text-gray-400 text-center text-sm p-4">
            {watchlists?.stocks ? "No stocks in watchlist" : "Loading..."}
          </p>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
