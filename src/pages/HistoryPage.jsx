import React, { useEffect, useState } from "react";
import axios from "axios";

const HistoryPage = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [history, setHistory] = useState([]);

  const getHistory = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_WEB_URL}/api/position/history/get`,
        {
            withCredentials: true,
        }
      );
      setHistory(res.data.history);
    } catch (error) {
      console.log("Error getting data", error.message);
    }
  };

  useEffect(() => {
    getHistory();
  }, []);

  return (
    <div className="w-[95%] mx-auto p-5 h-[90vh] rounded-lg bg-gray-50 mt-3">
      {/* History Title */}
      <h2 className="text-2xl font-bold text-center mb-4">
        Transaction History
      </h2>

      {/* Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg overflow-hidden shadow-md">
          {/* Table Header */}
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-3 text-center">Stock Symbol</th>
              <th className="p-3 text-center">Buy Price (₹)</th>
              <th className="p-3 text-center">Sell Price (₹)</th>
              <th className="p-3 text-center">Quantity</th>
              <th className="p-3 text-center">Profit/Loss (₹)</th>
              <th className="p-3 text-center">Date</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {history.map((item) => (
              <tr
                key={item._id}
                className="hover:bg-gray-100 transition-colors even:bg-gray-50"
              >
                <td className="p-3 text-center">{item.stockSymbol}</td>
                <td className="p-3 text-center">{item.buyPrice}</td>
                <td className="p-3 text-center">{item.sellPrice}</td>
                <td className="p-3 text-center">{item.quantity}</td>
                <td
                  className={`p-3 text-center font-bold ${
                    item.profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.profit >= 0
                    ? `+₹${item.profit.toFixed(4)}`
                    : `-₹${Math.abs(item.profit.toFixed(4))}`}
                </td>
                <td className="p-3 text-center">
                  {new Date(item.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryPage;
