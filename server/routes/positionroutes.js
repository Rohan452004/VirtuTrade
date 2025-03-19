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

const router = express.Router();

// Base router '/api/position'
router.post("/buy", buy);
router.post("/sell", sell);
router.get("/get/:id", getPositions);
router.get("/getexecuted/:id", getExecutedPositions);
router.get("/history/get/:id", getHistory);
router.delete("/remove/:id", removeStockFromPositions);
router.patch("/modify/:id", modifyPriceAndQty);

module.exports = router;
