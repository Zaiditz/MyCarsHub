const express = require("express");
const {
  createConversation,
  getConversation,
  getMessages,
  getMyConversations,
} = require("../controllers/chatController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/conversations", protect, createConversation);
router.get("/conversations", protect, getMyConversations);
router.get("/conversations/:conversationId", protect, getConversation);
router.get("/conversations/:conversationId/messages", protect, getMessages);

module.exports = router;