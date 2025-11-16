import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";

const SellOrderModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentPrice,
  stockSymbol,
  maxQuantity,
}) => {
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isMarketOrder, setIsMarketOrder] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    if (isMarketOrder && currentPrice) {
      setPrice(currentPrice.toFixed(2));
    }
    setQuantity(maxQuantity.toString());
  }, [isMarketOrder, currentPrice, maxQuantity]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const sellPrice = isMarketOrder ? currentPrice : parseFloat(price);
    const sellQuantity = parseInt(quantity);

    if (sellQuantity > maxQuantity) {
      toast.warning("Quantity exceeds available shares");
      return;
    }

    onSubmit({
      price: sellPrice,
      marketPrice: currentPrice,
      quantity: sellQuantity,
      isMarketOrder,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-lg p-6 w-full max-w-md ${theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
          Sell {stockSymbol.toUpperCase()}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
              Quantity (Max: {maxQuantity})
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={`w-full p-2 rounded focus:ring-2 focus:ring-green-500 ${theme === "dark"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-100 text-gray-900"
                }`}
              min="1"
              max={maxQuantity}
              required
            />
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="marketOrder"
              checked={isMarketOrder}
              onChange={(e) => setIsMarketOrder(e.target.checked)}
              className="form-checkbox h-4 w-4 text-green-500"
            />
            <label htmlFor="marketOrder" className={theme === "dark" ? "text-white" : "text-gray-900"}>
              Market Order
            </label>
          </div>

          {!isMarketOrder && (
            <div className="mb-4">
              <label className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                Limit Price
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`w-full p-2 rounded focus:ring-2 focus:ring-green-500 ${theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-900"
                  }`}
                required
                min="0.01"
              />
            </div>
          )}

          {isMarketOrder && (
            <div className={`mb-4 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
              Estimated Price: ₹{currentPrice?.toFixed(2)}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 ${theme === "dark"
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-700 hover:text-gray-900"
                }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Confirm Sell
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Positions = ({
  title,
  selectedStock,
  getExecutedPositions,
  positions,
}) => {
  const [isSellModalOpen, setSellModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [currentPrices, setCurrentPrices] = useState({});
  const user = JSON.parse(sessionStorage.getItem("user"));
  const { theme } = useTheme();

  const fetchStockPrice = async (symbol) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_WEB_URL}/api/stock/${symbol}`
      );
      return response.data.chart.result[0].meta.regularMarketPrice;
    } catch (error) {
      console.error("Error fetching stock price:", error);
      return null;
    }
  };

  // Fetch current prices for all positions
  const fetchAllPrices = async () => {
    try {
      const uniqueSymbols = [
        ...new Set(
          positions
            .filter((pos) => pos.type === "buy" && pos.status === "executed")
            .map((pos) => pos.stockSymbol)
        ),
      ];

      const pricePromises = uniqueSymbols.map((symbol) =>
        axios.get(`${import.meta.env.VITE_APP_WEB_URL}/api/stock/${symbol}`)
      );

      const responses = await Promise.all(pricePromises);
      const newPrices = {};

      responses.forEach((response, index) => {
        const symbol = uniqueSymbols[index];
        newPrices[symbol] =
          response.data.chart.result[0].meta.regularMarketPrice;
      });

      setCurrentPrices((prev) => ({ ...prev, ...newPrices }));
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  };

  // Calculate total P&L
  const calculateTotalPnL = () => {
    return positions
      .filter((pos) => pos.type === "buy" && pos.status === "executed")
      .reduce((total, position) => {
        const currentPrice = currentPrices[position.stockSymbol];
        if (!currentPrice) return total;
        const pnl =
          (currentPrice - position.buyPrice) * position.remainingQuantity;
        return total + pnl;
      }, 0);
  };

  // Calculate position P&L
  const calculatePositionPnL = (position) => {
    const currentPrice = currentPrices[position.stockSymbol];
    if (!currentPrice) return null;
    return (currentPrice - position.buyPrice) * position.remainingQuantity;
  };

  // Update prices periodically
  useEffect(() => {
    if (positions.length === 0) return;

    fetchAllPrices();
    const interval = setInterval(fetchAllPrices, 30000);
    return () => clearInterval(interval);
  }, [positions]);

  const handleSellSubmit = async ({
    price,
    quantity,
    marketPrice,
    isMarketOrder,
  }) => {
    try {
      if (!marketPrice) {
        toast.error("Could not fetch current market price");
        return;
      }
      const response = await axios.post(
        `${import.meta.env.VITE_APP_WEB_URL}/api/position/sell`,
        {
          stockSymbol: selectedPosition.stockSymbol,
          sellPrice: Number(price),
          marketPrice: Number(marketPrice),
          quantity: Number(quantity),
        },
        { withCredentials: true }
      );

      user.balance = response.data.balance;
      sessionStorage.setItem("user", JSON.stringify(user));
      getExecutedPositions();
      setSellModalOpen(false);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Sell error:", error);
      toast.error(
        error.response?.data?.message || "Failed to place sell order"
      );
    }
  };

  const handleSellClick = async (position) => {
    try {
      const price = await fetchStockPrice(position.stockSymbol);
      if (!price) {
        toast.error("Failed to fetch current market price");
        return;
      }

      setCurrentPrices((prevPrices) => ({
        ...prevPrices,
        [position.stockSymbol]: price,
      }));
      setSelectedPosition(position);
      setSellModalOpen(true);
    } catch (error) {
      console.error("Error preparing sell order:", error);
    }
  };

  return (
    <div className={`border rounded-lg shadow-lg w-full lg:w-96 h-[60vh] sm:h-[96vh] overflow-hidden ${theme === "dark"
        ? "border-gray-600 bg-gray-800"
        : "border-gray-200 bg-white"
      }`}>
      {/* Total P&L Section */}
      <div className={`pt-4 px-4 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}>
        <div className="text-center mb-3">
          <div className={`text-xs mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>Total Profit & Loss</div>
          <div
            className={`text-2xl font-bold ${calculateTotalPnL() >= 0 ? "text-green-500" : "text-red-500"
              }`}
          >
            {calculateTotalPnL().toFixed(2)}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className={`p-4 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}>
        <div className="flex justify-between items-center">
          <h2 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"
            }`}>{title}</h2>
          <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
            * Live P&L based on current prices
          </div>
        </div>
      </div>

      {/* Positions List */}
      <div className="overflow-y-auto h-[72%] sm:h-[82%] p-3">
        {positions
          .filter((pos) => pos.type === "buy" && pos.status === "executed")
          .map((position, index) => {
            const pnl = calculatePositionPnL(position);
            const isPositive = pnl >= 0;

            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 mb-2 rounded-lg transition-colors cursor-pointer ${theme === "dark"
                    ? "bg-gray-900 hover:bg-green-900"
                    : "bg-gray-50 hover:bg-green-50"
                  }`}
                onClick={() => selectedStock(position.stockSymbol)}
              >
                {/* Stock Info */}
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"
                      }`}>
                      {position.stockSymbol.toUpperCase()}
                    </span>
                    {pnl !== null && (
                      <span
                        className={`text-xs font-medium ${isPositive ? "text-green-500" : "text-red-500"
                          }`}
                      >
                        ₹{pnl.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className={`flex justify-between text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}>
                    <span>Avg: ₹{position.buyPrice.toFixed(2)}</span>
                    <span>Qty: {position.remainingQuantity}</span>
                  </div>
                </div>

                {/* Sell Button */}
                <button
                  className="ml-4 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSellClick(position);
                  }}
                >
                  Sell
                </button>
              </div>
            );
          })}
      </div>

      <SellOrderModal
        isOpen={isSellModalOpen}
        onClose={() => setSellModalOpen(false)}
        onSubmit={handleSellSubmit}
        currentPrice={currentPrices[selectedPosition?.stockSymbol] || 0}
        stockSymbol={selectedPosition?.stockSymbol || ""}
        maxQuantity={selectedPosition?.remainingQuantity || 0}
      />
    </div>
  );
};

export default Positions;
