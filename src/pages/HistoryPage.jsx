import React, { useEffect, useState } from "react";
import axios from "axios";

const HistoryPage = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [history, setHistory] = useState([]);

  const getHistory = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_WEB_URL}/api/position/history/get`,
        { withCredentials: true }
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
    <div className="w-full mx-auto p-4 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 sticky top-0 bg-gray-50 py-4">
        Transaction History
      </h2>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow">
        <table className="w-full bg-white">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-3 text-left">Symbol</th>
              <th className="p-3 text-right">Buy Price</th>
              <th className="p-3 text-right">Sell Price</th>
              <th className="p-3 text-right">Qty</th>
              <th className="p-3 text-right">P/L</th>
              <th className="p-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50 even:bg-gray-100">
                <td className="p-3 text-gray-900 font-medium">
                  {item.stockSymbol}
                </td>
                <td className="p-3 text-right">₹{item.buyPrice.toFixed(2)}</td>
                <td className="p-3 text-right">₹{item.sellPrice.toFixed(2)}</td>
                <td className="p-3 text-right">{item.quantity}</td>
                <td
                  className={`p-3 text-right font-bold ${
                    item.profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.profit >= 0 ? "+" : ""}₹
                  {Math.abs(item.profit).toFixed(2)}
                </td>
                <td className="p-3 text-right text-gray-600 text-sm">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {history.map((item) => (
          <div key={item._id} className="bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* Row 1 */}
              <div className="col-span-2 flex justify-between border-b pb-2">
                <span className="font-medium text-gray-900">
                  {item.stockSymbol}
                </span>
                <span className="text-gray-600">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Row 2 */}
              <div>
                <p className="text-gray-600">Buy Price</p>
                <p className="font-medium">₹{item.buyPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Sell Price</p>
                <p className="font-medium">₹{item.sellPrice.toFixed(2)}</p>
              </div>

              {/* Row 3 */}
              <div>
                <p className="text-gray-600">Quantity</p>
                <p className="font-medium">{item.quantity}</p>
              </div>
              <div>
                <p className="text-gray-600">Profit/Loss</p>
                <p
                  className={`font-bold ${
                    item.profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.profit >= 0 ? "+" : "-"}₹
                  {Math.abs(item.profit).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {history.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No transactions found in your history
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
