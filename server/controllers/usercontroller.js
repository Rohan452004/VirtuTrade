const User = require("../models/user");
const { Position } = require("../models/Position");
const Watchlist = require("../models/Watchlist");
const History = require("../models/History");
const OTP = require("../models/OTP");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const otpGenerator = require("otp-generator");
const OAuth2Client = require ("google-auth-library");
require("dotenv").config();

const createUser = async (req, res) => {
    try {
      const { username, email, password, confirmPassword, otp } = req.body;

      if (!username || !email || !password || !confirmPassword || !otp) {
        return res.status(403).send({
          success: false,
          message: "All Fields are required",
        });
      }

      // Check if password and confirm password match
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message:
            "Password and Confirm Password do not match. Please try again.",
        });
      }

      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }

      // Find the most recent OTP for the email
      const response = await OTP.find({ email })
        .sort({ createdAt: -1 })
        .limit(1);
      console.log(response);
      if (response.length === 0) {
        // OTP not found for the email
        return res.status(400).json({
          success: false,
          message: "No OTP found for the email",
        });
      } else if (otp !== response[0].otp) {
        // Invalid OTP
        return res.status(400).json({
          success: false,
          message: "The OTP is not valid",
        });
      }

      // Create a new user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
      });

      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: newUser,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password); // Fixed typo from `isMath` to `isMatch`
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    user.token = token;
    await user.save(); // Ensure the user token is saved properly

    // ✅ Corrected Cookie Options
    res.cookie("token", token, {
      httpOnly: true, // Prevents client-side access
      secure: true, // Required for HTTPS (Remove for local testing)
      sameSite: "None", // Required for cross-origin requests
      path: "/",
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days expiry
    });

    res.status(200).json({
      success: true,
      token,
      user,
      message: "User Login Success",
    });
  } catch (error) {
    console.error("Error in login:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getUserData = async (req, res) => {
  const email = req.params.email;
  console.log(email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false });
    }

    return res.json({ success: true, user });
  } catch (error) {}
};

const getStockData = async (req, res) => {
  try {
    const symbol = req.params.symbol;
    if (!symbol) {
      return res.status(400).json({ error: "Stock symbol is required" });
    }

    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS`
    );
    // const response = await axios.get(
    //     `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1d&range=1mo`,
    // );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching stock data:", error.message);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
};

const updateBalance = async (req, res) => {
  const { balance } = req.body;
  const id = req.params.id;

  try {
    const updated = await User.findByIdAndUpdate(id, { $set: { balance } });

    return res.status(200).json({ message: "Balance updated" });
  } catch (error) {}
};

// Send OTP For Email Verification
const sendotp = async (req, res) => {
  console.log("INSIDE SEND OTP");
  try {
    const { email } = req.body;

    const checkUserPresent = await User.findOne({ email });

    // If user found with provided email
    if (checkUserPresent) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      });
    }

    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const result = await OTP.findOne({ otp: otp });
    console.log("Result is Generate OTP Func");
    console.log("OTP", otp);
    console.log("Result", result);
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
    }
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    console.log("OTP Body", otpBody);
    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const resetAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const INITIAL_BALANCE = 1000000; 

    // Reset user balance
    const user = await User.findByIdAndUpdate(
      userId,
      { balance: INITIAL_BALANCE },
      { new: true }
    );

    // Delete all associated data
    await Promise.all([
      Position.deleteMany({ userId: userId }),
      Watchlist.deleteMany({ userId: userId }),
      History.deleteMany({ userId: userId }),
    ]);

    res.status(200).json({
      success: true,
      newBalance: user.balance,
      message: "Account reset successfully",
    });
  } catch (error) {
    console.error("Reset error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during account reset",
    });
  }
};

const googlelogin = async (req, res) => {
  console.log("Inside Google Login");
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    // 🔹 Fetch Google User Info from Backend (to bypass CORS)
    const googleRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { email, name } = googleRes.data;

    // 🔹 Check if user exists in DB
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ username:name, email, googleAuth: true });
      await user.save();
    }

    // 🔹 Generate JWT Token for session
    const appToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("Generated Token", appToken);

    // ✅ Corrected Cookie Options
    res.cookie("token", appToken, {
      httpOnly: true, // Prevents client-side access
      secure: true, // Required for HTTPS (Remove for local testing)
      sameSite: "None", // Required for cross-origin requests
      path: "/",
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days expiry
    });

    res.status(200).json({
      success: true,
      token: appToken,
      user,
      email: user.email,
      message: "User Login Success",
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ success: false, message: "Google Authentication Failed" });
  }
};


module.exports = {
  createUser,
  loginUser,
  getUserData,
  getStockData,
  updateBalance,
  sendotp,
  resetAccount,
  googlelogin,
};
