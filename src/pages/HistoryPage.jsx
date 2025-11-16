import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

const HistoryPage = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [history, setHistory] = useState([]);
  const { theme } = useTheme();

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
    <div className={`w-full mx-auto p-4 min-h-screen relative overflow-hidden ${theme === "dark"
      ? "bg-gray-950 text-white"
      : "bg-gray-50 text-gray-900"
      }`}>
      {/* Floating Neon Glow Effects - Only in dark mode */}
      {theme === "dark" && (
        <div className="absolute inset-0">
          <div className="absolute w-60 h-60 bg-green-500 opacity-20 rounded-full filter blur-3xl top-20 left-10 animate-pulse"></div>
          <div className="absolute w-48 h-48 bg-purple-500 opacity-20 rounded-full filter blur-3xl bottom-10 right-20 animate-bounce"></div>
        </div>
      )}

      <motion.h2
        className={`text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-purple-500 mb-6 sticky top-0 backdrop-blur-lg py-4 z-10 ${theme === "dark"
          ? "bg-gray-950 bg-opacity-80"
          : "bg-gray-50 bg-opacity-80"
          }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Transaction History
      </motion.h2>

      {/* Desktop Table */}
      <motion.div
        className="hidden md:block overflow-x-auto rounded-lg z-10 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className={`backdrop-blur-lg border rounded-lg shadow-2xl overflow-hidden ${theme === "dark"
          ? "bg-gray-900 bg-opacity-80 border-gray-700"
          : "bg-white border-gray-200"
          }`}>
          <table className="w-full">
            <thead className={`border-b ${theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-100 border-gray-200"
              }`}>
              <tr>
                <th className={`p-4 text-left font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>Symbol</th>
                <th className={`p-4 text-right font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>Buy Price</th>
                <th className={`p-4 text-right font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>Sell Price</th>
                <th className={`p-4 text-right font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>Qty</th>
                <th className={`p-4 text-right font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>P/L</th>
                <th className={`p-4 text-right font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <motion.tr
                  key={item._id}
                  className={`border-b transition-colors ${theme === "dark"
                    ? "hover:bg-gray-800 border-gray-700"
                    : "hover:bg-gray-50 border-gray-200"
                    }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className={`p-4 font-medium ${theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                    {item.stockSymbol}
                  </td>
                  <td className={`p-4 text-right ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>₹{item.buyPrice.toFixed(2)}</td>
                  <td className={`p-4 text-right ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>₹{item.sellPrice.toFixed(2)}</td>
                  <td className={`p-4 text-right ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>{item.quantity}</td>
                  <td
                    className={`p-4 text-right font-bold ${item.profit >= 0
                      ? "text-green-400"
                      : "text-red-400"
                      }`}
                  >
                    {item.profit >= 0 ? "+" : ""}₹
                    {Math.abs(item.profit).toFixed(2)}
                  </td>
                  <td className={`p-4 text-right text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4 z-10 relative">
        {history.map((item, index) => (
          <motion.div
            key={item._id}
            className={`backdrop-blur-lg border p-4 rounded-lg shadow-2xl ${theme === "dark"
              ? "bg-gray-900 bg-opacity-80 border-gray-700"
              : "bg-white border-gray-200"
              }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* Row 1 */}
              <div className={`col-span-2 flex justify-between border-b pb-2 ${theme === "dark" ? "border-gray-700" : "border-gray-200"
                }`}>
                <span className={`font-medium text-base ${theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>
                  {item.stockSymbol}
                </span>
                <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Row 2 */}
              <div>
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>Buy Price</p>
                <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>₹{item.buyPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>Sell Price</p>
                <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>₹{item.sellPrice.toFixed(2)}</p>
              </div>

              {/* Row 3 */}
              <div>
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>Quantity</p>
                <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>{item.quantity}</p>
              </div>
              <div>
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>Profit/Loss</p>
                <p
                  className={`font-bold ${item.profit >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                >
                  {item.profit >= 0 ? "+" : ""}₹
                  {Math.abs(item.profit).toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {history.length === 0 && (
        <motion.div
          className="text-center py-12 z-10 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={`backdrop-blur-lg border rounded-lg shadow-2xl p-8 max-w-md mx-auto ${theme === "dark"
            ? "bg-gray-900 bg-opacity-80 border-gray-700"
            : "bg-white border-gray-200"
            }`}>
            <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
              No transactions found in your history
            </p>
            <p className={`text-sm mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-500"
              }`}>
              Start trading to see your transaction history here
            </p>
          </div>
        </motion.div>
      )}

      {/* Animated Wave Effect - Only in dark mode */}
      {theme === "dark" && (
        <div className="absolute bottom-0 left-0 w-full h-24 md:h-32 bg-gradient-to-t from-gray-950 via-black to-transparent"></div>
      )}

      {/* Footer */}
      {/* <footer className="absolute bottom-2 text-gray-400 text-xs md:text-sm z-10 text-center w-full">
        <p>&copy; 2025 VirtuTrade. All rights reserved.</p>
      </footer> */}
    </div>
  );
};

export default HistoryPage;
