const express = require("express");
const {
  buy,
  sell,
  getPositions,
  removeStockFromPositions,
  getHistory,
  modifyPriceAndQty,
  getExecutedPositions,
} = require("../controllers/positioncontroller");

const { auth } = require("../middlewares/auth");

const router = express.Router();

// Base router '/api/position'
router.post("/buy", auth, buy);
router.post("/sell", auth, sell);
router.get("/get", auth, getPositions);
router.get("/getexecuted", auth, getExecutedPositions);
router.get("/history/get", auth, getHistory);
router.delete("/remove/:id", auth, removeStockFromPositions);
router.patch("/modify/:id", auth, modifyPriceAndQty);

module.exports = router;
