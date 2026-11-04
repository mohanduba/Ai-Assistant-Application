const express = require("express");

const upload = require("../middleware/upload");

const {
    uploadDocument,
    askQuestion,
    getChatHistory
} = require("../controllers/ragController");

const router = express.Router();

router.post("/upload", upload.single("pdf"), uploadDocument);

router.post("/ask", askQuestion);

router.get("/chat-history", getChatHistory);

module.exports = router;
