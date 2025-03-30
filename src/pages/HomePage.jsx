import Navbar from "../components/Navbar";
import StockData from "../components/StockData";
import Watchlist from "../components/Watchlist";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Positions from "../components/Positions";
import Orders from "../components/Orders";

function HomePage() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [symbol, setSymbol] = useState("");
  const [positions, setPositions] = useState([]);
  const [executedPositions, setExecutedPositions] = useState([]);
  const [watchlists, setWatchlist] = useState({});
  const [activeView, setActiveView] = useState("stock");

  const hasFetchedWatchlist = useRef(false); // Prevent multiple API calls

  // Function to update stock data from Navbar
  const handleStockSearch = (newStock) => {
    setSymbol(newStock);
  };

  async function getPositions() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_WEB_URL}/api/position/get`,
        { withCredentials: true }
      );
      setPositions(res.data.positions);
      getExecutedPositions();
    } catch (error) {
      console.log("Error getting positions", error.message);
    }
  }

  async function getExecutedPositions() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_WEB_URL}/api/position/getexecuted/`,
        { withCredentials: true }
      );
      setExecutedPositions(res.data.positions);
    } catch (error) {
      console.log("Error getting executed positions", error.message);
    }
  }

  async function getWatchlist() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_WEB_URL}/api/watchlist/get`,
        { withCredentials: true }
      );

      // Only update state if the data has changed
      if (JSON.stringify(res.data.watchlist) !== JSON.stringify(watchlists)) {
        setWatchlist(res.data.watchlist);
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    }
  }

  // Run getWatchlist only once when component mounts
  useEffect(() => {
    if (!hasFetchedWatchlist.current) {
      getWatchlist();
      hasFetchedWatchlist.current = true;
    }
  }, []);

  return (
    <div className="min-h-screen bg-black pb-16 lg:pb-0">
      <Navbar onSearch={handleStockSearch} />

      {/* Main Content */}
      <div className="w-full mx-auto p-4 flex flex-col lg:flex-row gap-6">
        {/* Desktop Left Section (Watchlist + Orders) */}
        <div className="hidden lg:flex lg:w-1/3 flex-col gap-6">
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
            <Watchlist
              title="Watchlist"
              selectedStock={setSymbol}
              getWatchlist={getWatchlist}
              watchlists={watchlists}
            />
          </div>
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
            <Orders
              title="Orders"
              selectedStock={setSymbol}
              getPositions={getPositions}
              positions={positions}
            />
          </div>
        </div>

        {/* Mobile Views */}
        <div className="lg:hidden w-full">
          {/* Watchlist Mobile View */}
          <div className={`${activeView === "watchlist" ? "block" : "hidden"}`}>
            <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700 mb-4">
              <Watchlist
                title="Watchlist"
                selectedStock={setSymbol}
                getWatchlist={getWatchlist}
                watchlists={watchlists}
              />
            </div>
          </div>

          {/* Orders Mobile View */}
          <div className={`${activeView === "orders" ? "block" : "hidden"}`}>
            <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700 mb-4">
              <Orders
                title="Orders"
                selectedStock={setSymbol}
                getPositions={getPositions}
                positions={positions}
              />
            </div>
          </div>

          {/* Stock Data Mobile View */}
          <div className={`${activeView === "stock" ? "block" : "hidden"}`}>
            <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700 mb-4">
              <StockData
                newSymbol={symbol}
                defaultSymbol="TATAMOTORS"
                getWatchlist={getWatchlist}
                getPositions={getPositions}
              />
            </div>
          </div>

          {/* Positions Mobile View */}
          <div className={`${activeView === "positions" ? "block" : "hidden"}`}>
            <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
              <Positions
                title="Positions"
                selectedStock={setSymbol}
                getExecutedPositions={getExecutedPositions}
                positions={executedPositions}
              />
            </div>
          </div>
        </div>

        {/* Desktop Middle Section */}
        <div className="hidden lg:block lg:w-1/2">
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700 h-full">
            <StockData
              newSymbol={symbol}
              defaultSymbol="TATAMOTORS"
              getWatchlist={getWatchlist}
              getPositions={getPositions}
            />
          </div>
        </div>

        {/* Desktop Right Section */}
        <div className="hidden lg:block lg:w-2/7">
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
            <Positions
              title="Positions"
              selectedStock={setSymbol}
              getExecutedPositions={getExecutedPositions}
              positions={executedPositions}
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-gray-900 border-t border-gray-700">
        <div className="grid grid-cols-4 gap-1 p-2">
          <button
            onClick={() => setActiveView("watchlist")}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeView === "watchlist"
                ? "bg-gray-700 text-amber-400"
                : "text-gray-400"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="text-xs mt-1">Watchlist</span>
          </button>

          <button
            onClick={() => setActiveView("orders")}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeView === "orders"
                ? "bg-gray-700 text-amber-400"
                : "text-gray-400"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5h6a2 2 0 012 2v11a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2zm0 4h6M9 13h6"
              />
            </svg>
            <span className="text-xs mt-1">Orders</span>
          </button>

          <button
            onClick={() => setActiveView("stock")}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeView === "stock"
                ? "bg-gray-700 text-amber-400"
                : "text-gray-400"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-xs mt-1">Stock</span>
          </button>

          <button
            onClick={() => setActiveView("positions")}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeView === "positions"
                ? "bg-gray-700 text-amber-400"
                : "text-gray-400"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs mt-1">Positions</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
