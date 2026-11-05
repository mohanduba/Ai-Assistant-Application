require("dotenv").config();

const express = require("express");
const cors = require("cors");
const ragRoutes = require("./routes/ragRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/rag", ragRoutes);

// Global JSON error handler
app.use((err, req, res, next) => {
    console.error("API Error:", err.message || err);
    const status = err.status || (err.name === "MulterError" ? 400 : 500);
    res.status(status).json({
        message: err.message || "An unexpected internal server error occurred"
    });
});

module.exports = app;
