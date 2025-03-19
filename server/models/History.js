const mongoose = require("mongoose");
const HistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stockSymbol: { type: String, required: true },
  buyPrice: { type: Number, required: true },
  sellPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  profit: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("History", HistorySchema);
