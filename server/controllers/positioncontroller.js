const History = require("../models/History");
const User = require("../models/user");
const { Position, BuyPosition, SellPosition } = require("../models/Position");

const buy = async (req, res) => {
  const { stockSymbol, buyPrice, quantity, currentStockPrice } =
    req.body;

  const userId = req.user.userId;

  try {
    let status = "pending";
    let executionprice = buyPrice;
    if (buyPrice >= currentStockPrice) {
      status = "executed";
      executionprice = currentStockPrice;
    }

    const position = new BuyPosition({
      type: "buy",
      userId,
      stockSymbol,
      buyPrice: executionprice,
      quantity,
      remainingQuantity: quantity,
      status,
    });

    await position.save();

    res.json({ success: true, message: "Order placed successfully", position });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

const sell = async (req, res) => {
  const { stockSymbol, sellPrice, marketPrice, quantity } = req.body;

  const userId = req.user.userId;

  console.log(req.body);

  try {
    const position = await BuyPosition.findOne({
      userId,
      stockSymbol,
      status: "executed",
    });

    if (!position) {
      return res.json({
        success: false,
        message: "Warning: No executed stock found to sell.",
      });
    } else if (quantity > position.remainingQuantity) {
      return res.json({
        success: false,
        message: `Warning: You can only sell maximim ${position.remainingQuantity} quantity.`,
      });
    }

    if (sellPrice <= marketPrice) {
      // Sell immediately

      const sellPosition = new SellPosition({
        type: "sell",
        userId,
        stockSymbol,
        buyPrice: position.buyPrice,
        sellPrice: marketPrice,
        quantity,
        sellStatus: "executed",
        sellId: position._id,
      });

      await sellPosition.save();

      if (position.remainingQuantity === quantity) {
        position.status = "closed";
        position.remainingQuantity = position.remainingQuantity - quantity;
      } else {
        position.remainingQuantity = position.remainingQuantity - quantity;
      }

      await position.save();

      const profit = (marketPrice - position.buyPrice) * quantity;

      const history = new History({
        userId,
        stockSymbol,
        buyPrice: position.buyPrice,
        sellPrice : marketPrice,
        quantity,
        profit,
      });

      await history.save();

      const user = await User.findById(userId);
      if (user) {
        user.balance = user.balance + position.buyPrice * quantity + profit;
        await user.save();
      }

      return res.json({
        success: true,
        message: "Stock sold successfully",
        history,
        user,
      });
    } else {
      // If price is not reached, mark status as "pending" server will handel this order
      const sell = new SellPosition({
        type: "sell",
        userId,
        stockSymbol,
        buyPrice: position.buyPrice,
        sellPrice,
        quantity,
        sellStatus: "pending",
        sellId: position._id,
      });

      await sell.save();
      return res.json({
        success: true,
        message: "Sell order placed, waiting for price to reach",
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getPositions = async (req, res) => {
  const id = req.user.userId;
  try {
    const positions = await Position.find({ userId: id });
    if (!positions) {
      return res.status(400).json({ message: "NO Data found" });
    }

    return res.status(200).json({ positions });
  } catch (error) {
    console.log("Error getting in getPositions: ", error.message);
  }
};

const getExecutedPositions = async (req, res) => {
  const id = req.user.userId;
  try {
    const positions = await Position.find({
      userId: id,
      $or: [
        { status: "executed" },
        { status: "closed" },
        { sellStatus: "executed" },
      ],
    });
    if (!positions) {
      return res.status(400).json({ message: "NO Data found" });
    }

    return res.status(200).json({ positions });
  } catch (error) {
    console.log("Error getting in getPositions: ", error.message);
  }
};

const getHistory = async (req, res) => {
  const id = req.user.userId;
  try {
    const history = await History.find({ userId: id });
    if (!history) {
      return res.status(400).json({ message: "NO Data found" });
    }

    return res.status(200).json({ history });
  } catch (error) {
    console.log("Error getting positions", error.message);
  }
};

const removeStockFromPositions = async (req, res) => {
  const id = req.params.id;

  try {
    const deletes = await Position.findByIdAndDelete(id);

    if (!deletes) {
      return res.status(404).json({ success: false, message: "No data found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Order cancelled from postions" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const modifyPriceAndQty = async (req, res) => {
  const { modifiedPrice, modifiedQty, type } = req.body;
  const id = req.params.id;

  try {
    let modified = null;
    if (type === "buy") {
      modified = await BuyPosition.findByIdAndUpdate(id, {
        $set: {
          buyPrice: modifiedPrice,
          quantity: modifiedQty,
          remainingQuantity: modifiedQty,
        },
      });
    } else {
      modified = await SellPosition.findByIdAndUpdate(id, {
        $set: {
          sellPrice: modifiedPrice,
          quantity: modifiedQty,
        },
      });
    }

    if (!modified) {
      return res.status(200).json({ success: false, message: "Error" });
    }

    res.status(200).json({ success: true, message: "Successfully Modified" });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ success: false, message: "Error" });
  }
};

module.exports = {
  buy,
  sell,
  getPositions,
  removeStockFromPositions,
  getHistory,
  modifyPriceAndQty,
  getExecutedPositions,
};
