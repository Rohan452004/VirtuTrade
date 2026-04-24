const User = require("../models/user");
const { Position } = require("../models/Position");
const Watchlist = require("../models/Watchlist");
const History = require("../models/History");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const otpGenerator = require("otp-generator");
require("dotenv").config();

function sanitizeUser(userDoc) {
  if (!userDoc) return null;
  return {
    _id: userDoc._id,
    username: userDoc.username,
    email: userDoc.email,
    balance: userDoc.balance,
    googleAuth: Boolean(userDoc.googleAuth),
  };
}

function getCookieOptions() {
  const secure =
    String(process.env.COOKIE_SECURE || "").toLowerCase() === "true" ||
    String(process.env.NODE_ENV || "").toLowerCase() === "production";

  // Browsers require SameSite=None cookies to be Secure.
  const sameSite = secure ? "None" : "Lax";

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days expiry
  };
}

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
        user: sanitizeUser(newUser),
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

    res.cookie("token", token, getCookieOptions());

    res.status(200).json({
      success: true,
      token,
      user: sanitizeUser(user),
      message: "User Login Success",
    });
  } catch (error) {
    console.error("Error in login:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch user data" });
  }
};

const getStockData = async (req, res) => {
  try {
    const symbolParam = req.params.symbol;
    if (!symbolParam) {
      return res.status(400).json({ error: "Stock symbol is required" });
    }

    // Accept both "RELIANCE" and "RELIANCE.NS" from DB.
    let baseSymbol = String(symbolParam).toUpperCase().trim();
    while (baseSymbol.endsWith(".NS")) {
      baseSymbol = baseSymbol.slice(0, -3);
    }
    const yahooSymbol = `${baseSymbol}.NS`;

    const now = Math.floor(Date.now() / 1000);
    const fallbackResponse = {
      chart: {
        result: [
          {
            meta: {
              regularMarketPrice: null,
              chartPreviousClose: null,
              fullExchangeName: baseSymbol,
              instrumentType: "EQUITY",
              longName: baseSymbol,
              symbol: baseSymbol,
              regularMarketVolume: null,
              regularMarketDayHigh: null,
              regularMarketDayLow: null,
              exchangeName: "",
              currency: "INR",
              fiftyTwoWeekHigh: null,
              fiftyTwoWeekLow: null,
            },
            timestamp: [now],
            indicators: {
              quote: [
                {
                  open: [null],
                  high: [null],
                  low: [null],
                  close: [null],
                },
              ],
            },
          },
        ],
        error: null,
      },
    };

    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
        yahooSymbol
      )}`,
      {
        timeout: 8000,
        headers: {
          // Yahoo sometimes behaves better when a UA header is present.
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    const firstResult = response?.data?.chart?.result?.[0];
    if (!firstResult?.meta) {
      return res.status(200).json(fallbackResponse);
    }

    const quote = firstResult.indicators?.quote?.[0] || {};
    const timestamps = Array.isArray(firstResult.timestamp)
      ? firstResult.timestamp.slice(-120)
      : [now];

    const trimSeries = (arr) =>
      Array.isArray(arr) ? arr.slice(-120) : [null];

    return res.json({
      chart: {
        result: [
          {
            meta: {
              regularMarketPrice: firstResult.meta.regularMarketPrice ?? null,
              chartPreviousClose: firstResult.meta.chartPreviousClose ?? null,
              fullExchangeName: firstResult.meta.fullExchangeName ?? baseSymbol,
              instrumentType: firstResult.meta.instrumentType ?? "EQUITY",
              longName: firstResult.meta.longName ?? baseSymbol,
              symbol: firstResult.meta.symbol ?? baseSymbol,
              regularMarketVolume: firstResult.meta.regularMarketVolume ?? null,
              regularMarketDayHigh: firstResult.meta.regularMarketDayHigh ?? null,
              regularMarketDayLow: firstResult.meta.regularMarketDayLow ?? null,
              exchangeName: firstResult.meta.exchangeName ?? "",
              currency: firstResult.meta.currency ?? "INR",
              fiftyTwoWeekHigh: firstResult.meta.fiftyTwoWeekHigh ?? null,
              fiftyTwoWeekLow: firstResult.meta.fiftyTwoWeekLow ?? null,
            },
            timestamp: timestamps,
            indicators: {
              quote: [
                {
                  open: trimSeries(quote.open),
                  high: trimSeries(quote.high),
                  low: trimSeries(quote.low),
                  close: trimSeries(quote.close),
                },
              ],
            },
          },
        ],
        error: null,
      },
    });
  } catch (error) {
    console.error("Error fetching stock data:", error.message);
    // Never fail the frontend polling with a 500; return a safe payload instead.
    return res.status(200).json({
      chart: {
        result: [
          {
            meta: {
              regularMarketPrice: null,
              chartPreviousClose: null,
            },
            timestamp: [Math.floor(Date.now() / 1000)],
            indicators: { quote: [{ open: [null], high: [null], low: [null], close: [null] }] },
          },
        ],
        error: null,
      },
    });
  }
};

const updateBalance = async (req, res) => {
  const { balance } = req.body;
  const id = req.user.userId;

  try {
    if (!Number.isFinite(balance)) {
      return res.status(400).json({ success: false, message: "Invalid balance value" });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: { balance: Number(balance) } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "Balance updated", balance: updated.balance });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update balance" });
  }
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

    res.cookie("token", appToken, getCookieOptions());

    res.status(200).json({
      success: true,
      token: appToken,
      user: sanitizeUser(user),
      email: user.email,
      message: "User Login Success",
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ success: false, message: "Google Authentication Failed" });
  }
};

const askTradingAssistant = async (req, res) => {
  try {
    const question = String(req.body?.question || "").trim();
    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required.",
      });
    }

    if (question.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Question is too long. Please keep it under 500 characters.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message: "AI assistant is not configured on the server.",
      });
    }

    const modelCandidates = [
      process.env.GEMINI_MODEL,
      "gemini-2.5-flash",
      "gemini-flash-latest",
      "gemini-2.0-flash",
      "gemini-pro-latest",
    ].filter(Boolean);
    const prompt = [
      "You are a concise trading education assistant for the VirtuTrade app.",
      "Only answer general educational questions about markets, order types, risk management, and platform usage.",
      "Never provide guaranteed returns or personalized financial advice.",
      "If asked for investment recommendations, respond with a cautionary educational alternative.",
      `User question: ${question}`,
    ].join("\n");

    let answer = "";
    let lastError = null;

    for (const model of modelCandidates) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await axios.post(
          endpoint,
          {
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 300,
            },
          },
          {
            timeout: 12000,
            headers: { "Content-Type": "application/json" },
          }
        );

        answer =
          response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
          "";
        if (answer) break;
      } catch (error) {
        lastError = error;
        const statusCode = error?.response?.status;
        // Try next model only for "model not found/unsupported" style errors.
        if (statusCode !== 404) {
          break;
        }
      }
    }

    if (!answer) {
      const statusCode = lastError?.response?.status;
      const apiMessage =
        lastError?.response?.data?.error?.message || lastError?.message;
      console.error("Gemini assistant error:", statusCode || "", apiMessage);
      return res.status(502).json({
        success: false,
        message:
          statusCode === 404
            ? "Gemini model endpoint not found for this API key. Set GEMINI_MODEL in server/.env (example: gemini-1.5-flash)."
            : "Failed to get AI response from Gemini.",
      });
    }

    return res.status(200).json({
      success: true,
      answer,
      disclaimer: "Educational content only, not financial advice.",
    });
  } catch (error) {
    console.error(
      "Gemini assistant error:",
      error?.response?.status || "",
      error?.response?.data?.error?.message || error.message
    );
    return res.status(500).json({
      success: false,
      message: "Failed to get AI response.",
    });
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
  askTradingAssistant,
};
