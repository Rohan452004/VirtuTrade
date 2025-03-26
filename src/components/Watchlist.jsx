import React, { useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const Watchlist = ({ title, selectedStock, getWatchlist, watchlists }) => {

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

  useEffect(() => {
    getWatchlist();
  }, [watchlists]);

  return (
    <div className="border border-gray-600 rounded-lg bg-gray-800 shadow-lg w-full lg:w-96 h-[40vh] overflow-hidden">
      {/* Title remains unchanged */}
      <h2 className="text-lg font-semibold text-white p-4 border-b border-gray-700">
        {title}
      </h2>

      {/* Watchlist items */}
      <div className="overflow-y-auto h-[32vh] p-3">
        {watchlists?.stocks?.length > 0 ? (
          watchlists.stocks.map((stockSymbol, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 mb-2 rounded-lg cursor-pointer transition-colors bg-gray-700 hover:bg-gray-600"
              onClick={() => selectedStock(stockSymbol)}
            >
              {/* Stock symbol */}
              <span className="text-white text-sm font-medium truncate w-24">
                {stockSymbol.toUpperCase()}
              </span>

              {/* Remove button */}
              <button
                className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-500 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
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