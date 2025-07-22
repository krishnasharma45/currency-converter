require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const axios = require("axios");

const PORT = process.env.PORT || 5000;
const API_KEY = process.env.EXCHANGE_RATE_API_KEY;
const API_URL = "https://v6.exchangerate-api.com/v6";

const app = express();

// Rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// CORS setup
const corsOption = {
  origin: ["http://localhost:5173"],
};

// Middleware
app.use(express.json());
app.use(apiLimiter);
app.use(cors(corsOption)); // ✅ Correct usage

// Route to handle currency conversion
app.post("/api/convert", async (req, res) => {
  try {
    const { from, to, amount } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const url = `${API_URL}/${API_KEY}/pair/${from}/${to}/${amount}`;
    const response = await axios.get(url);

    if (response.data && response.data.result === "success") {
      res.json({
        base: from,
        target: to,
        conversionRate: response.data.conversion_rate,
        convertedAmount: response.data.conversion_result,
      });
    } else {
      res.status(400).json({
        message: "Error converting currency",
        details: response.data,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Server error during currency conversion",
      details: error.message,
    });
  }
});

// Start server
app.listen(PORT, () =>
  console.log(`Server is running at http://localhost:${PORT}`)
);
