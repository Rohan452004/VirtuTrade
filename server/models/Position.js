const mongoose = require("mongoose");

const PositionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stockSymbol: { type: String, required: true },
    buyPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { discriminatorKey: "type" } // This tells Mongoose to differentiate based on "type"
);

// Create the base model
const Position = mongoose.model("Position", PositionSchema);

const BuyPositionSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["pending", "executed", "closed"],
    required: true,
  },
  remainingQuantity: { type: Number, required: true },
});

const SellPositionSchema = new mongoose.Schema({
  sellPrice: { type: Number, required: true },
  sellStatus: { type: String, enum: ["pending", "executed"], required: true },
  sellId: { type: mongoose.Schema.Types.ObjectId, required: true },
});

//discriminators
const BuyPosition = Position.discriminator("buy", BuyPositionSchema);
const SellPosition = Position.discriminator("sell", SellPositionSchema);

module.exports = { Position, BuyPosition, SellPosition };
