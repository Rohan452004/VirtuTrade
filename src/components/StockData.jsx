import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import StockChart from "./StockChart";

const StockData = ({
  newSymbol,
  defaultSymbol,
  getWatchlist,
  getPositions,
}) => {
  const [data, setSymbolData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [symbol, setNewSymbol] = useState(newSymbol || defaultSymbol);
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [requiredAmount, setRequiredAmount] = useState();
  const [priceChange, setPriceChange] = useState();
  const [percentageChange, setPercentageChange] = useState();
  const [showChart, setShowChart] = useState(false);
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
        toast.success("Added to Watchlist");
      } else {
        toast.error("Not Added to Watchlist");
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
      toast.warning(
        "Warning: Your current balance is below the required amount."
      );
      return;
    } else if (
      buyPrice === "" ||
      quantity === "" ||
      buyPrice === 0 ||
      quantity === 0
    ) {
      toast.warning("Warning: All fields are required.");
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
        toast.success(response.data.message);
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
      toast.warning("Warning: All fields are required.");
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
        toast.success(response.data.message);
        setBuyPrice("");
        setQuantity("");
      } else if (response.data.success && !response.data.user) {
        getPositions();
        toast.success(response.data.message);
        setBuyPrice("");
        setQuantity("");
      } else {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  useEffect(() => {
    const fetchStockData = async () => {
      if (!symbol) return;

      try {
        // Always use 5m interval
        const response = await axios.get(
          `${import.meta.env.VITE_APP_WEB_URL}/api/stock/${symbol}?interval=5m`
        );
        
        if (!response.data?.chart?.result?.[0]) {
          console.error("Invalid API response:", response.data);
          return;
        }
        
        const chartData = response.data.chart.result[0];
        setSymbolData(chartData.meta);

        // Make sure we have valid timestamp and quote data
        if (
          !Array.isArray(chartData.timestamp) || 
          !chartData.indicators?.quote?.[0]
        ) {
          console.error("Missing required chart data");
          return;
        }

        // Process timestamps and OHLC data
        const timestamps = chartData.timestamp;
        const quotes = chartData.indicators.quote[0];
        
        // Create properly formatted data for the chart
        const formattedData = [];
        
        for (let i = 0; i < timestamps.length; i++) {
          // Only add points with valid close values
          if (quotes.close[i] !== null && quotes.close[i] !== undefined) {
            formattedData.push({
              time: timestamps[i],
              open: quotes.open[i] !== null ? quotes.open[i] : quotes.close[i],
              high: quotes.high[i] !== null ? quotes.high[i] : quotes.close[i],
              low: quotes.low[i] !== null ? quotes.low[i] : quotes.close[i],
              close: quotes.close[i]
            });
          }
        }

        console.log(`Processed ${formattedData.length} valid data points for chart`);
        
        if (formattedData.length > 0) {
          setChartData(formattedData);
          setShowChart(true);
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();
    const intervalId = setInterval(fetchStockData, 30000); // 30 seconds
    
    return () => clearInterval(intervalId);
  }, [symbol]); // Only depend on symbol now

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
        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            onClick={() => setShowChart(!showChart)}
          >
            {showChart ? "Hide Chart" : "View Chart"}
          </button>
          <button
            className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
            onClick={addToWatchlist}
          >
            Add
            <span className="hidden min-[385px]:inline"> to Watchlist</span>
          </button>
        </div>
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

      {/* Stock Chart - No time frame selector anymore */}
      {showChart && (
        <div className="mb-6">
          <StockChart 
            chartData={chartData} 
            stockSymbol={symbol}
          />
        </div>
      )}

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
