import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { FaEdit } from "react-icons/fa";
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
            withCredentials:true,
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
            withCredentials:true,
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
      {/* Orders Title */}
      <h2 className="text-lg font-semibold text-white p-4 border-b border-gray-700">
        {title}
      </h2>

      {/* Orders Data */}
      <div className="overflow-y-auto h-[39vh] p-3">
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
                {position.type === "buy" ? (
                  <>
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-500">
                      {position.type.toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        position?.status === "executed" ||
                        position?.status === "closed"
                          ? "bg-green-500"
                          : "bg-gray-600"
                      }`}
                    >
                      {position?.status === "executed" ||
                      position?.status === "closed"
                        ? "EXECUTED"
                        : "PENDING"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-red-500">
                      {position.type.toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        position?.sellStatus === "executed"
                          ? "bg-green-500"
                          : "bg-gray-600"
                      }`}
                    >
                      {position?.sellStatus?.toUpperCase()}
                    </span>
                  </>
                )}
                <span className="px-2 py-1 text-xs font-medium bg-gray-600 rounded">
                  {position.type === "buy"
                    ? `B:${position?.buyPrice.toFixed(1)}`
                    : `S:${position?.sellPrice.toFixed(1)}`}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-600 rounded">
                  Q: {position.quantity}
                </span>
              </div>

              {/* Edit Icon */}
              {position?.status !== "executed" &&
                position?.status !== "closed" &&
                position?.sellStatus !== "executed" && (
                  <FaEdit
                    className="text-gray-400 hover:text-green-500 cursor-pointer transition-colors"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the parent onClick
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
                  />
                )}

              {/* Cancel Button */}
              {(position?.status === "pending" ||
                position?.sellStatus === "pending") && (
                <button
                  className="bg-red-600 text-white px-0 py-1 rounded hover:bg-red-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent onClick
                    cancelOrder(
                      position._id,
                      position.buyPrice,
                      position.quantity
                    );
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center">No orders</p>
        )}
      </div>

      {/* Modify Amount Dialog */}
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
