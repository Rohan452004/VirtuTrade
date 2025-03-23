import React, { useEffect, useState } from "react";
import axios from "axios";

const Positions = ({
  title,
  selectedStock,
  getExecutedPositions,
  positions,
}) => {
  const [data, setSymbolData] = useState([]);
  const user = JSON.parse(sessionStorage.getItem("user"));

  const fetchStockCurrentPrice = async (symbol) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_WEB_URL}/api/stock/${symbol}`
      );
      const chartData = response.data.chart.result[0];
      setSymbolData(chartData.meta);

      if (
        !chartData ||
        !chartData.timestamp ||
        !chartData.indicators.quote[0]
      ) {
        console.error("Invalid stock data received.");
        return;
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };

  const handleSell = async (symbol, quantity) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_WEB_URL}/api/position/sell`,
        {
          stockSymbol: symbol,
          sellPrice: Number(data.regularMarketPrice),
          marketPrice: Number(data.regularMarketPrice),
          quantity,
        },
        {
            withCredentials: true,
        }
      );

      user.balance = response.data.user.balance;
      sessionStorage.setItem("user", JSON.stringify(user));
      alert(response.data.message);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const sellOrder = async (symbol, quantity) => {
    let c = 1;

    do {
      await fetchStockCurrentPrice(symbol);
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (data.length !== 0) break;

      if (c === 10) {
        alert("Warning: Problem in Selling. Try again");
        return;
      }

      c++;
    } while (true);

    await handleSell(symbol, quantity);
    getExecutedPositions();
  };

  useEffect(() => {
    getExecutedPositions();
  }, []);

  return (
    <div className="border border-gray-600 rounded-lg bg-gray-800 shadow-lg w-full lg:w-96 h-[89.7vh] overflow-hidden">
      {/* Positions Title */}
      <h2 className="text-lg font-semibold text-white p-4 border-b border-gray-700">
        {title}
      </h2>

      {/* Positions Data */}
      <div className="overflow-y-auto h-[89.5%] p-3">
        {positions.length > 0 ? (
          positions.map((position, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                position.status === "executed" ? "bg-green-900" : "bg-gray-700"
              } hover:bg-gray-600`}
              onClick={() => selectedStock(position.stockSymbol)}
            >
              {/* Stock Symbol */}
              <span className="text-white text-sm font-medium truncate w-24">
                {position.stockSymbol.toUpperCase()}
              </span>

              {/* Position Details */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    position.type === "buy" ? "bg-blue-500" : "bg-red-500"
                  }`}
                >
                  {position.type.toUpperCase()}
                </span>
                {position.type === "buy" ? (
                  <>
                    <span className="text-xs font-medium bg-gray-600 px-2 py-1 rounded">
                      B: {position.buyPrice.toFixed(1)}
                    </span>
                    <span className="text-xs font-medium bg-gray-600 px-2 py-1 rounded">
                      Q: {position.quantity}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        position.status === "executed"
                          ? "bg-green-500"
                          : "bg-gray-600"
                      }`}
                    >
                      {position.status === "executed" ? "OPEN" : "CLOSED"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-medium bg-gray-600 px-2 py-1 rounded">
                      S: {position.sellPrice.toFixed(1)}
                    </span>
                    <span className="text-xs font-medium bg-gray-600 px-2 py-1 rounded">
                      Q: {position.quantity}
                    </span>
                    <span className="text-xs font-medium bg-gray-600 px-2 py-1 rounded">
                      CLOSED
                    </span>
                  </>
                )}
              </div>

              {/* Sell Button */}
              {position.type === "buy" && position.status !== "closed" && (
                <button
                  className="bg-green-600 text-white px-3 ml-2 py-1 rounded hover:bg-green-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent onClick
                    sellOrder(position.stockSymbol, position.remainingQuantity);
                  }}
                >
                  Sell
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center">No positions</p>
        )}
      </div>
    </div>
  );
};

export default Positions;
