const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Car = require("../models/Car");

const createConversation = async (req, res) => {
  try {
    const { carId } = req.body;
    const buyerId = req.user.userId;
    const car = await Car.findById(carId);

    if (!car || car.status !== "active") {
      return res.status(404).json({ message: "Car listing not found" });
    }

    const sellerId = car.seller.toString();

    if (sellerId === buyerId) {
      return res.status(400).json({ message: "You cannot chat with yourself" });
    }

    let conversation = await Conversation.findOne({
      buyer: buyerId,
      seller: sellerId,
      car: carId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        buyer: buyerId,
        seller: sellerId,
        car: carId,
      });
    }

    res.status(200).json({ conversation });
  } catch (error) {
    console.error("CREATE CONVERSATION ERROR:", error);
    res.status(500).json({ message: "Failed to create conversation" });
  }
};

const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId)
      .populate("buyer", "name createdAt")
      .populate("seller", "name createdAt")
      .populate("car", "brand model variant price images status")
      .lean();

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const userId = req.user.userId;
    const isParticipant =
      conversation.buyer?._id.toString() === userId ||
      conversation.seller?._id.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({ message: "You are not part of this conversation" });
    }

    res.status(200).json({ conversation });
  } catch (error) {
    console.error("GET CONVERSATION ERROR:", error);
    res.status(500).json({ message: "Failed to fetch conversation" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant =
      conversation.buyer.toString() === userId ||
      conversation.seller.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({ message: "You are not part of this conversation" });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name")
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({ messages });
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

const getMyConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await Conversation.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate("buyer", "name createdAt")
      .populate("seller", "name createdAt")
      .populate("car", "brand model variant price images status")
      .sort({ updatedAt: -1 })
      .lean();

    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await Message.findOne({ conversation: conversation._id })
          .populate("sender", "name")
          .sort({ createdAt: -1 })
          .lean();

        return { ...conversation, lastMessage };
      }),
    );

    res.status(200).json({ conversations: conversationsWithMessages });
  } catch (error) {
    console.error("GET MY CONVERSATIONS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

module.exports = {
  createConversation,
  getConversation,
  getMessages,
  getMyConversations,
};
