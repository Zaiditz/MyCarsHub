import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getMyConversations } from "../api/api";

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => { getMyConversations().then((response) => setConversations(response.data.conversations)).catch((err) => setError(err.response?.data?.message || "Failed to load conversations")).finally(() => setLoading(false)); }, []);

  function getOtherUser(conversation) { return conversation.buyer?._id === user?.id ? conversation.seller : conversation.buyer; }
  function formatDate(date) { if (!date) return ""; const d = new Date(date); const now = new Date(); if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }); return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }); }

  if (loading) return <div className="page-shell flex items-center justify-center"><p className="text-sm text-gray-500">Loading messages...</p></div>;
  return <div className="page-shell"><div className="page-container max-w-4xl"><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-400">Inbox</p><h1 className="section-title mt-2">Messages</h1><p className="section-copy">Your conversations with buyers and sellers.</p></div>{error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}{!error && !conversations.length && <div className="surface p-12 text-center"><h2 className="text-xl font-bold">No conversations yet</h2><p className="mt-2 text-sm text-gray-500">Contact a seller from a listing to start a conversation.</p><Link to="/cars" className="primary-button mt-6">Browse Cars</Link></div>}{!error && conversations.length > 0 && <div className="surface overflow-hidden">{conversations.map((conversation) => { const otherUser = getOtherUser(conversation); const car = conversation.car; const lastMessage = conversation.lastMessage; return <Link key={conversation._id} to={`/chat/conversation/${conversation._id}`} className="flex items-center gap-4 border-b border-gray-100 p-4 transition last:border-0 hover:bg-gray-50 sm:gap-5 sm:p-5"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">{car?.images?.length ? <img src={car.images[0]} alt={`${car.brand} ${car.model}`} className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center text-xs text-gray-400">No image</div>}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><h2 className="truncate font-bold">{otherUser?.name || "User"}</h2><span className="shrink-0 text-xs text-gray-400">{formatDate(lastMessage?.createdAt || conversation.updatedAt)}</span></div><p className="mt-1 truncate text-sm text-gray-500">{car ? `${car.brand} ${car.model}${car.variant ? ` · ${car.variant}` : ""}` : "Car listing"}</p>{car?.price && <p className="mt-1 text-sm font-semibold">₹{car.price.toLocaleString("en-IN")}</p>}<p className="mt-2 truncate text-sm text-gray-500">{lastMessage ? `${lastMessage.sender?._id === user?.id ? "You: " : ""}${lastMessage.text}` : "No messages yet"}</p></div><span className="text-lg text-gray-400">→</span></Link>; })}</div>}</div></div>;
}
