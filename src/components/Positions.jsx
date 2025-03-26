import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

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
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-white mb-4">
          Sell {stockSymbol.toUpperCase()}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">
              Quantity (Max: {maxQuantity})
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded focus:ring-2 focus:ring-green-500"
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
            <label htmlFor="marketOrder" className="text-white">
              Market Order
            </label>
          </div>

          {!isMarketOrder && (
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">
                Limit Price
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded focus:ring-2 focus:ring-green-500"
                required
                min="0.01"
              />
            </div>
          )}

          {isMarketOrder && (
            <div className="mb-4 text-sm text-gray-300">
              Estimated Price: ₹{currentPrice?.toFixed(2)}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
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
  const [currentMarketPrice, setCurrentMarketPrice] = useState(0);
  const user = JSON.parse(sessionStorage.getItem("user"));

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

  const handleSellSubmit = async ({ price, quantity, marketPrice, isMarketOrder }) => {
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
      toast.error(error.response?.data?.message || "Failed to place sell order");
    }
  };

  const handleSellClick = async (position) => {
    try {
      const price = await fetchStockPrice(position.stockSymbol);
      if (!price) {
        toast.error("Failed to fetch current market price");
        return;
      }

      setCurrentMarketPrice(price);
      setSelectedPosition(position);
      setSellModalOpen(true);
    } catch (error) {
      console.error("Error preparing sell order:", error);
    }
  };

  return (
    <div className="border border-gray-600 rounded-lg bg-gray-800 shadow-lg w-full lg:w-96 h-[96vh] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>

      {/* Positions List */}
      <div className="overflow-y-auto h-[89.5%] p-3">
        {positions
          .filter((pos) => pos.type === "buy" && pos.status === "executed")
          .map((position, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 mb-2 rounded-lg bg-gray-900 hover:bg-green-900 transition-colors cursor-pointer"
              onClick={() => selectedStock(position.stockSymbol)}
            >
              {/* Stock Info */}
              <div className="flex flex-col">
                <span className="text-white font-medium">
                  {position.stockSymbol.toUpperCase()}
                </span>
                <span className="text-xs text-gray-300">
                  Avg Price: ₹{position.buyPrice.toFixed(2)}
                </span>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-gray-300">
                    Qty: {position.remainingQuantity}
                  </div>
                </div>

                {/* Sell Button */}
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSellClick(position);
                  }}
                >
                  Sell
                </button>
              </div>
            </div>
          ))}
      </div>

      <SellOrderModal
        isOpen={isSellModalOpen}
        onClose={() => setSellModalOpen(false)}
        onSubmit={handleSellSubmit}
        currentPrice={currentMarketPrice}
        stockSymbol={selectedPosition?.stockSymbol || ""}
        maxQuantity={selectedPosition?.remainingQuantity || 0}
      />
    </div>
  );
};

export default Positions;
