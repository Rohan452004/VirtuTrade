import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { FaEdit, FaTimes } from "react-icons/fa";
import ModifyAmount from "./ModifyAmount";

const socket = io(import.meta.env.VITE_APP_WEB_URL); // server URL

const Orders = ({ title, selectedStock, getPositions, positions }) => {
  const [data, setSymbolData] = useState([]);
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState();
  const [price, setPrice] = useState();
  const [qty, setQty] = useState();
  const [stockName, setStockName] = useState();
  const [type, setType] = useState();

  useEffect(() => {
    // Listen for 'orderUpdated' event from server side
    socket.on("orderUpdated", (data) => {
      getPositions();
      user.balance = data?.balance || user.balance;
      sessionStorage.setItem("user", JSON.stringify(user));
      alert(data.stockSymbol + " " + data.status);
    });

    return () => {
      socket.off("orderUpdated"); // Cleanup event listener
    };
  }, []);

  const modifyPriceAndQty = async (newPrice, newQty) => {
    let newBalance = 0;

    if (type === "buy") {
      let oldInvestment = price * qty;
      let newInvestment = newPrice * newQty;
      let difference = oldInvestment - newInvestment;

      if (newPrice === price && newQty === qty) {
        alert("No changes done.");
        return;
      }

      newBalance = user.balance + difference;
      if (newBalance < 0) {
        alert("Insufficient account balance.");
        return;
      }
    }

    try {
      const res = await axios.patch(
        `${
          import.meta.env.VITE_APP_WEB_URL
        }/api/position/modify/${selectedPositionId}`,
        {
          modifiedPrice: newPrice,
          modifiedQty: newQty,
          type,
        },
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        if (type === "buy") {
          await updateBalance(newBalance);
          user.balance = newBalance;
          sessionStorage.setItem("user", JSON.stringify(user));
        }
        getPositions();
        setDialogOpen(false);
        alert(res.data.message);
      } else {
        alert("Modification Error. Try again: " + res.data.message);
      }
    } catch (error) {
      alert("Modification Error. Try again");
      console.error("Error: ", error.message);
    }
  };

  const updateBalance = async (balance) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_APP_WEB_URL}/api/users/${user._id}`,
        {
          balance,
        }
      );
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

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

  const cancelOrder = async (id, price, qty) => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_APP_WEB_URL}/api/position/remove/${id}`,
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        user.balance = user.balance + price * qty;
        sessionStorage.setItem("user", JSON.stringify(user));
        updateBalance(user.balance);
        getPositions();
        alert(res.data.message);
      }
    } catch (error) {
      console.error("Error removing stock:", error);
    }
  };

  useEffect(() => {
    getPositions();
  }, []);

  return (
    <div className="border border-gray-600 rounded-lg bg-gray-800 shadow-lg w-full lg:w-96 h-[48.5vh] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className="text-xs text-gray-400">
          {positions.length} orders
        </span>
      </div>

      {/* Orders List */}
      <div className="overflow-y-auto h-[39vh] p-3">
        {positions.length > 0 ? (
          positions.map((position, index) => (
            <div
              key={index}
              className={`group flex items-center justify-between p-3 mb-2 rounded-lg transition-all ${
                position.status === "executed"
                  ? "bg-green-900/30"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {/* Left Section */}
              <div className="flex items-center gap-3 flex-1">
                {/* Stock Symbol */}
                <div className="flex flex-col min-w-[70px]">
                  <span className="text-white font-medium text-sm">
                    {position.stockSymbol.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400">
                    {position.type === "buy" ? "Buy" : "Sell"}
                  </span>
                </div>

                {/* Order Details */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      position.type === "buy"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {position.type.toUpperCase()}
                  </span>

                  <div className="flex flex-col">
                    <span className="text-xs text-gray-300">
                      Price:{" "}
                      {position.type === "buy"
                        ? position?.buyPrice.toFixed(1)
                        : position?.sellPrice.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-300">
                      Qty: {position.quantity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-3">
                {/* Status */}
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    position.status === "executed" ||
                    position?.sellStatus === "executed"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {position.status === "executed" ||
                  position?.sellStatus === "executed"
                    ? "EXECUTED"
                    : "PENDING"}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(position?.status === "pending" ||
                    position?.sellStatus === "pending") && (
                    <>
                      <button
                        className="p-1.5 rounded-lg bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDialogOpen(true);
                          setSelectedPositionId(position._id);
                          setPrice(
                            position.type === "buy"
                              ? position?.buyPrice
                              : position?.sellPrice
                          );
                          setQty(position.quantity);
                          setStockName(position.stockSymbol);
                          setType(position.type);
                        }}
                      >
                        <FaEdit className="text-lg" />
                      </button>

                      <button
                        className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelOrder(
                            position._id,
                            position.buyPrice,
                            position.quantity
                          );
                        }}
                      >
                        <FaTimes className="text-lg" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-400 mb-2">No active orders</p>
            <span className="text-xs text-gray-600">
              Place orders from the trading panel
            </span>
          </div>
        )}
      </div>

      <ModifyAmount
        isOpen={isDialogOpen}
        data={{ price, qty, stockName }}
        onClose={() => setDialogOpen(false)}
        onSubmit={(price, qty) => modifyPriceAndQty(price, qty)}
      />
    </div>
  );
};

export default Orders;