import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { io } from "socket.io-client";

import { createConversation, getConversation, getMessages } from "../api/api";

import { useAuth } from "../context/AuthContext";

export default function Chat() {
  const { carId, conversationId: routeConversationId } = useParams();

  const { user, loading: authLoading } = useAuth();

  const userId = user?.id;

  const [conversation, setConversation] = useState(null);

  const [conversationId, setConversationId] = useState(
    routeConversationId || null,
  );

  const [messages, setMessages] = useState([]);

  const [text, setText] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const socketRef = useRef(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (authLoading || !user) return;

    let active = true;
    let socket;

    async function setupChat() {
      try {
        setLoading(true);
        setError("");

        let currentConversation;

        if (routeConversationId) {
          const response = await getConversation(routeConversationId);

          currentConversation = response.data.conversation;
        } else {
          const response = await createConversation(carId);

          currentConversation = response.data.conversation;
        }

        if (!active) return;

        setConversation(currentConversation);

        setConversationId(currentConversation._id);

        const messagesResponse = await getMessages(currentConversation._id);

        if (!active) return;

        setMessages(messagesResponse.data.messages || []);

        socket = io(
          import.meta.env.VITE_SOCKET_URL || "http://localhost:3000",
          {
            withCredentials: true,
          },
        );

        socketRef.current = socket;

        socket.on("connect", () => {
          socket.emit("joinConversation", currentConversation._id);
        });

        socket.on("newMessage", (message) => {
          setMessages((prev) =>
            prev.some((item) => item._id === message._id)
              ? prev
              : [...prev, message],
          );
        });

        socket.on("connect_error", () => {
          setError("Unable to connect to chat. Please try again.");
        });
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Failed to open chat");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    setupChat();

    return () => {
      active = false;

      socket?.disconnect();

      socketRef.current = null;
    };
  }, [carId, routeConversationId, authLoading, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  function sendMessage(event) {
    event.preventDefault();

    const trimmed = text.trim();

    if (!trimmed || !conversationId || !socketRef.current?.connected) {
      return;
    }

    socketRef.current.emit("sendMessage", {
      conversationId,
      text: trimmed,
    });

    setText("");
  }

  function formatTime(date) {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function getOtherUser() {
    if (!conversation) return null;

    return conversation.buyer?._id === userId
      ? conversation.seller
      : conversation.buyer;
  }

  if (authLoading || loading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <p className="text-sm text-gray-500">Opening chat...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-shell flex items-center justify-center px-5">
        <div className="surface max-w-md p-7 text-center">
          <p className="font-semibold">Please login to use chat.</p>

          <Link to="/login" className="primary-button mt-5">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell flex items-center justify-center px-5">
        <div className="surface max-w-md p-7 text-center">
          <p className="font-semibold">{error}</p>

          <Link to="/messages" className="primary-button mt-5">
            Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  const otherUser = getOtherUser();
  const car = conversation?.car;

  return (
    <div className="page-shell">
      <div className="page-container max-w-3xl">
        <Link
          to="/messages"
          className="text-sm font-medium text-gray-500 hover:text-black"
        >
          ← Back to Messages
        </Link>

        <div className="surface mt-5 overflow-hidden">
          <header className="border-b border-gray-200 px-5 py-5 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
              Conversation
            </p>

            <h1 className="mt-1 text-xl font-bold">
              Chat with {otherUser?.name || "User"}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {car
                ? `${car.brand} ${car.model}${
                    car.variant ? ` · ${car.variant}` : ""
                  }`
                : "Car listing"}
            </p>
          </header>

          <div className="h-130 overflow-y-auto bg-[#fbfbfa] px-4 py-5 sm:px-6">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-500">
                    M
                  </div>

                  <p className="mt-3 font-medium">No messages yet</p>

                  <p className="mt-1 text-sm text-gray-500">
                    Send a message to start the conversation.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => {
                  const mine = message.sender?._id === userId;

                  return (
                    <div
                      key={message._id}
                      className={`flex ${
                        mine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex max-w-[82%] flex-col ${
                          mine ? "items-end" : "items-start"
                        }`}
                      >
                        {!mine && (
                          <p className="mb-1 px-1 text-xs font-medium text-gray-500">
                            {message.sender?.name || "User"}
                          </p>
                        )}

                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-5 ${
                            mine
                              ? "rounded-br-md bg-[#111111] text-white"
                              : "rounded-bl-md border border-gray-200 bg-white text-gray-800"
                          }`}
                        >
                          <p className="wrap-break-word">{message.text}</p>
                        </div>

                        <p className="mt-1 px-1 text-[11px] text-gray-400">
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form
            onSubmit={sendMessage}
            className="flex gap-2 border-t border-gray-200 bg-white p-3 sm:p-4"
          >
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={2000}
              placeholder="Write a message..."
              className="field"
            />

            <button
              type="submit"
              disabled={!text.trim()}
              className="primary-button shrink-0 px-5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}