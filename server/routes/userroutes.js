const express = require("express");
const {
  createUser,
  loginUser,
  getUserData,
  getStockData,
  updateBalance,
  sendotp,
  resetAccount,
  googlelogin,
} = require("../controllers/usercontroller");

const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/resetpasswordcontroller");

const { auth } = require("../middlewares/auth");

const router = express.Router();

// Base router '/api'
//user request
router.post("/auth/google", googlelogin);
router.post("/users/sendotp", sendotp);
router.post("/users/signup", createUser);
router.post("/users/login", loginUser);
router.get("/users/:email", getUserData);
router.patch("/users/:id", updateBalance);
router.get("/stock/:symbol", getStockData);
router.post("/account/reset", auth, resetAccount);

router.post("/users/reset-password-token", resetPasswordToken);
router.post("/users/reset-password", resetPassword);

module.exports = router;
