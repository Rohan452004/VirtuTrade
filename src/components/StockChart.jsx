import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { useTheme } from "../contexts/ThemeContext";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const fetchWithRetry = async (symbol, retries = 3, delay = 1000) => {
  try {
    return await axios.get(`/api/stock/${symbol}`);
  } catch (error) {
    if (error.response?.status === 429 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(symbol, retries - 1, delay * 2);
    }
    throw error;
  }
};

const StockChart = ({ chartData, stockSymbol }) => {
  const { theme } = useTheme();

  // Process data for Chart.js
  if (!chartData || chartData.length === 0) {
    return (
      <div className={`p-4 rounded-lg w-full h-[400px] flex items-center justify-center ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"
        }`}>
        <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
          No chart data available
        </span>
      </div>
    );
  }

  // Sort data by time (ascending)
  const sortedData = [...chartData].sort((a, b) => a.time - b.time);

  // Format time labels to show time in 24-hour format
  const formatTimeLabel = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // Use 24-hour format
    });
  };

  // Extract the data points
  const times = sortedData.map(item => formatTimeLabel(item.time));
  const prices = sortedData.map(item => item.close);

  // Create datasets
  const mainDataset = {
    label: `${stockSymbol} Price`,
    data: prices,
    fill: false,
    borderColor: "#3b82f6", // Blue
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderWidth: 2,
    pointRadius: 1,
    pointHoverRadius: 5,
    tension: 0.1, // Slight curve
  };

  // Chart data
  const data = {
    labels: times,
    datasets: [mainDataset],
  };

  // Theme-based colors
  const textColor = theme === "dark" ? "white" : "#1f2937";
  const textColorSecondary = theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)";
  const gridColor = theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  const tooltipBg = theme === "dark" ? "rgba(30, 41, 59, 0.9)" : "rgba(255, 255, 255, 0.95)";
  const tooltipTextColor = theme === "dark" ? "white" : "#1f2937";

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500, // Faster animation for smoother transitions
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: textColor,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: `${stockSymbol} - 1 min Chart`,
        color: textColor,
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: tooltipBg,
        titleColor: tooltipTextColor,
        bodyColor: tooltipTextColor,
        titleFont: {
          size: 12,
        },
        bodyFont: {
          size: 12,
        },
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return `Price: ₹${context.raw.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (9:15 - 15:30)',
          color: textColorSecondary,
          padding: { top: 10, bottom: 0 }
        },
        ticks: {
          color: textColorSecondary,
          maxTicksLimit: 8, // Show 8 time points
          font: {
            size: 10,
          },
        },
        grid: {
          color: gridColor,
          drawBorder: false,
        },
      },
      y: {
        ticks: {
          color: textColorSecondary,
          font: {
            size: 10,
          },
          callback: function (value) {
            return '₹' + value.toFixed(2);
          },
        },
        grid: {
          color: gridColor,
          drawBorder: false,
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    elements: {
      point: {
        radius: prices.length > 100 ? 0 : 1, // Hide points for dense data
        hoverRadius: 5,
      },
      line: {
        borderWidth: 2,
      },
    },
  };

  return (
    <div className={`p-4 rounded-lg w-full h-[400px] ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"
      }`}>
      <Line data={data} options={options} />
    </div>
  );
};

export default StockChart;