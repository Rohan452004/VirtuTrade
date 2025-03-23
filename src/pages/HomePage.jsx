import Navbar from "../components/Navbar";
import StockData from "../components/StockData";
import Watchlist from "../components/Watchlist";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Positions from "../components/Positions";
import Orders from "../components/Orders";

function HomePage() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [symbol, setSymbol] = useState("");
  const [positions, setPositions] = useState([]);
  const [executedPositions, setExecutedPositions] = useState([]);
  const [watchlists, setWatchlist] = useState({});

  // Function to update stock data from Navbar
  const handleStockSearch = (newStock) => {
    setSymbol(newStock); // Add new stock to the existing data
  };

  async function getPositions() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_WEB_URL}/api/position/get`,
        {
          withCredentials: true,
        }
      );
      setPositions(res.data.positions);
      getExecutedPositions();
    } catch (error) {
      console.log("Error getting data", error.message);
    }
  }

  async function getExecutedPositions() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_WEB_URL}/api/position/getexecuted/`,
        {
          withCredentials: true,
        }
      );
      setExecutedPositions(res.data.positions);
    } catch (error) {
      console.log("Error getting data", error.message);
    }
  }

  async function getWatchlist() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_WEB_URL}/api/watchlist/get`,
        {
          withCredentials: true,
        }
      );
      setWatchlist(res.data.watchlist);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar onSearch={handleStockSearch} />

      <div className="w-full mx-auto p-4 flex flex-col lg:flex-row gap-6">
        {/* Left Section (Watchlist and Orders) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          {/* Watchlist Card */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
            <Watchlist
              title="Watchlist 1"
              selectedStock={setSymbol}
              getWatchlist={getWatchlist}
              watchlists={watchlists}
            />
          </div>

          {/* Orders Card */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
            <Orders
              title="Orders"
              selectedStock={setSymbol}
              getPositions={getPositions}
              positions={positions}
            />
          </div>
        </div>

        {/* Middle Section (Stock Data) */}
        <div className="w-full lg:w-1/2 bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
          <StockData
            newSymbol={symbol}
            defaultSymbol="TATAMOTORS"
            getWatchlist={getWatchlist}
            getPositions={getPositions}
          />
        </div>

        {/* Right Section (Positions) */}
        <div className="w-full lg:w-2/7 bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
          <Positions
            title="Position"
            selectedStock={setSymbol}
            getExecutedPositions={getExecutedPositions}
            positions={executedPositions}
          />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
