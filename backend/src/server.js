const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const { apiLimiter } = require("./middleware/rateLimiter");

const app = express();

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const carRoutes = require("./routes/carRoutes");
const connectDB = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");
const reportRoutes = require("./routes/reportRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { razorpayWebhook } = require("./controllers/paymentController");
const multer = require("multer");

const Conversation = require("./models/Conversation");
const Message = require("./models/Message");

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.post("/api/payments/webhook", express.raw({ type: "application/json" }), razorpayWebhook);
app.use(express.json());
app.use(cookieParser());
app.use("/api", apiLimiter);

app.use("/api/cars", carRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", reportRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);


app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Each image must be 5 MB or smaller" });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ message: "You can upload a maximum of 6 images" });
    }
  }

  if (error?.message === "Only image files are allowed") {
    return res.status(400).json({ message: error.message });
  }

  next(error);
});

app.get("/", (req, res) => {
  res.json({
    message: "MyCarsHub API is running",
  });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;

      if (!cookies) {
        return next(new Error("Not authenticated"));
      }

      const parsedCookies = cookie.parse(cookies);

      const token = parsedCookies.token;

      if (!token) {
        return next(new Error("Not authenticated"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.userId = decoded.userId;

      next();
    } catch (error) {
      console.error("SOCKET AUTH ERROR:", error);

      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Authenticated user connected:", socket.userId, socket.id);

    socket.on("joinConversation", async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          return;
        }

        const isParticipant =
          conversation.buyer.toString() === socket.userId ||
          conversation.seller.toString() === socket.userId;

        if (!isParticipant) {
          console.log("Unauthorized conversation access:", socket.userId);

          return;
        }

        socket.join(conversationId);

        console.log(
          `User ${socket.userId} joined conversation ${conversationId}`,
        );
      } catch (error) {
        console.error("JOIN CONVERSATION ERROR:", error);
      }
    });

    socket.on("sendMessage", async ({ conversationId, text }) => {
      try {
        if (!text || !text.trim()) {
          return;
        }

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          return;
        }

        const isParticipant =
          conversation.buyer.toString() === socket.userId ||
          conversation.seller.toString() === socket.userId;

        if (!isParticipant) {
          console.log("Unauthorized message attempt:", socket.userId);

          return;
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          text: text.trim(),
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          updatedAt: new Date(),
        });

        const populatedMessage = await message.populate("sender", "name");

        io.to(conversationId).emit("newMessage", populatedMessage);
      } catch (error) {
        console.error("SEND MESSAGE ERROR:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId, socket.id);
    });
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();