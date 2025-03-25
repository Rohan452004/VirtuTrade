import React, { useEffect, useState } from "react";
import axios from "axios";

const StockData = ({
  newSymbol,
  defaultSymbol,
  getWatchlist,
  getPositions,
}) => {
  const [data, setSymbolData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [symbol, setNewSymbol] = useState(newSymbol || defaultSymbol); // Initialize with newSymbol or defaultSymbol
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [requiredAmount, setRequiredAmount] = useState();
  const [priceChange, setPriceChange] = useState();
  const [percentageChange, setPercentageChange] = useState();
  const user = JSON.parse(sessionStorage.getItem("user"));

  // Update symbol whenever newSymbol changes
  useEffect(() => {
    if (newSymbol && newSymbol !== symbol) {
      setNewSymbol(newSymbol);
    }
  }, [newSymbol]);

  async function calculateRequiredAmount(e) {
    const qty = Number(e.target.value);
    setQuantity(qty);
    const amo = buyPrice * qty;
    setRequiredAmount(amo);
  }

  // Add Stock to Watchlist
  async function addToWatchlist() {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_APP_WEB_URL}/api/watchlist/add`,
        {
          stockSymbol: symbol, // Use the current symbol
        },
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        getWatchlist();
        alert("Added to Watchlist");
      } else {
        alert("Not Added to Watchlist");
      }
    } catch (error) {
      console.error("Error adding stock:", error);
    }
  }

  const updateBalance = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_APP_WEB_URL}/api/users/${user._id}`,
        {
          balance: Number(user.balance - requiredAmount),
        }
      );
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  const handleBuy = async () => {
    if (user.balance < requiredAmount) {
      alert("Warning: Your current balance is below the required amount.");
      return;
    } else if (
      buyPrice === "" ||
      quantity === "" ||
      buyPrice === 0 ||
      quantity === 0
    ) {
      alert("Warning: All fields are required.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_WEB_URL}/api/position/buy`,
        {
          stockSymbol: symbol, // Use the current symbol
          buyPrice: Number(buyPrice),
          quantity: Number(quantity),
          currentStockPrice: Number(data.regularMarketPrice),
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        alert(response.data.message);
        updateBalance();
        getPositions();
        user.balance = user.balance - requiredAmount;
        sessionStorage.setItem("user", JSON.stringify(user));
        setBuyPrice("");
        setQuantity("");
        setRequiredAmount(0);
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const handleSell = async () => {
    if (
      buyPrice === "" ||
      quantity === "" ||
      buyPrice === 0 ||
      quantity === 0
    ) {
      alert("Warning: All fields are required.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_WEB_URL}/api/position/sell`,
        {
          stockSymbol: symbol, // Use the current symbol
          sellPrice: Number(buyPrice),
          marketPrice: Number(data.regularMarketPrice),
          quantity,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success && response.data.user) {
        getPositions();
        user.balance = response.data.user?.balance;
        sessionStorage.setItem("user", JSON.stringify(user));
        alert(response.data.message);
        setBuyPrice("");
        setQuantity("");
      } else if (response.data.success && !response.data.user) {
        getPositions();
        alert(response.data.message);
        setBuyPrice("");
        setQuantity("");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  useEffect(() => {
    const fetchStockData = async () => {
      if (!symbol) return; // Avoid fetching if no symbol is available

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_WEB_URL}/api/stock/${symbol}`
        );
        const chartData = response.data.chart.result[0];

        if (
          !chartData ||
          !chartData.timestamp ||
          !chartData.indicators?.quote[0]
        ) {
          console.error("Invalid stock data received.");
          return;
        }

        setSymbolData((prevData) => {
          if (JSON.stringify(prevData) === JSON.stringify(chartData.meta)) {
            return prevData; // Prevent unnecessary updates
          }
          return chartData.meta;
        });

        const formattedData = chartData.timestamp.map((time, index) => ({
          time,
          open: chartData.indicators.quote[0].open[index],
          high: chartData.indicators.quote[0].high[index],
          low: chartData.indicators.quote[0].low[index],
          close: chartData.indicators.quote[0].close[index],
        }));

        setChartData((prevData) => {
          if (JSON.stringify(prevData) === JSON.stringify(formattedData)) {
            return prevData; // Prevent unnecessary updates
          }
          return formattedData;
        });
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData(); // Fetch immediately

    const intervalId = setInterval(fetchStockData, 5000); // Fetch every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [symbol]); // Depend on symbol

  useEffect(() => {
    if (!data) return; // Ensure data exists before calculating

    const previousClose = data.chartPreviousClose || 0;
    const marketPrice = data.regularMarketPrice || 0;

    const priceChange = marketPrice - previousClose;
    const percentageChange =
      previousClose !== 0
        ? ((priceChange / previousClose) * 100).toFixed(2)
        : "0.00";
    setPriceChange(priceChange);
    setPercentageChange(percentageChange);
  }, [data]);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 w-full h-[96vh] overflow-y-auto">
      {/* Market Details */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <span className="bg-gray-700 text-white px-3 py-1 rounded text-sm">
            {data.fullExchangeName}
          </span>
          <span className="bg-gray-700 text-white px-3 py-1 rounded text-sm">
            {data.instrumentType}
          </span>
        </div>
        <button
          className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
          onClick={addToWatchlist}
        >
          Add to Watchlist
        </button>
      </div>

      {/* Stock Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">{data.longName}</h1>
        <h2 className="text-lg text-gray-400">{data.symbol}</h2>
      </div>

      {/* Stock Price */}
      <div className="text-center mb-6">
        <span className="text-3xl font-bold text-green-500">
          ₹{data.regularMarketPrice}
        </span>
        <span
          className={`ml-2 text-lg ${
            priceChange > 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {priceChange > 0 ? "▲" : "▼"} {Math.abs(priceChange).toFixed(2)} (
          {percentageChange}%)
        </span>
      </div>

      {/* Stock Info Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 p-3 rounded-lg text-center">
          <span className="text-sm text-gray-300">Market</span>
          <p className="text-white font-bold">{data.exchangeName}</p>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg text-center">
          <span className="text-sm text-gray-300">Currency</span>
          <p className="text-white font-bold">{data.currency}</p>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg text-center">
          <span className="text-sm text-gray-300">Volume</span>
          <p className="text-white font-bold">{data.regularMarketVolume}</p>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg text-center">
          <span className="text-sm text-gray-300">Day High</span>
          <p className="text-white font-bold">₹{data.regularMarketDayHigh}</p>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg text-center">
          <span className="text-sm text-gray-300">Day Low</span>
          <p className="text-white font-bold">₹{data.regularMarketDayLow}</p>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg text-center">
          <span className="text-sm text-gray-300">Previous Close</span>
          <p className="text-white font-bold">₹{data.chartPreviousClose}</p>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg text-center">
          <span className="text-sm text-gray-300">52W High</span>
          <p className="text-white font-bold">₹{data.fiftyTwoWeekHigh}</p>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg text-center">
          <span className="text-sm text-gray-300">52W Low</span>
          <p className="text-white font-bold">₹{data.fiftyTwoWeekLow}</p>
        </div>
      </div>

      {/* Place Order Section */}
      <h2 className="text-xl font-semibold text-white border-b border-gray-600 pb-2 mb-4">
        Place Order
      </h2>
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <input
          type="number"
          placeholder="Enter price"
          className="w-full lg:w-1/3 p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Enter Qty"
          className="w-full lg:w-1/3 p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={quantity}
          onChange={(e) => calculateRequiredAmount(e)}
        />
        <button
          className="w-full lg:w-1/6 p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          onClick={handleBuy}
        >
          Buy
        </button>
        <button
          className="w-full lg:w-1/6 p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          onClick={handleSell}
        >
          Sell
        </button>
      </div>

      {/* Margin and Required Amount */}
      <div className="text-right text-white">
        <span>Margin Avail: {user.balance.toFixed(2)}</span>
        <span className="ml-4">Req: {requiredAmount?.toFixed(2) || 0}</span>
      </div>
    </div>
  );
};

export default StockData;
