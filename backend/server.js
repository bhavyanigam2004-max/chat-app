/**
 * Simple Chat App Backend
 * - Express for REST endpoints (dummy login, message history)
 * - Socket.io for realtime messaging
 * - In-memory storage (no DB needed to keep this simple)
 */

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // relax for demo purposes; restrict in production
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 4000;

// ---- In-memory "database" ----
let messages = []; // { id, username, text, timestamp }
let onlineUsers = new Map(); // socket.id -> username

// ---- Dummy auth ----
// Not real authentication. Accepts any username/password and returns
// a fake token + the username. Good enough for demo/assignment purposes.
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({ error: "Username is required" });
  }

  // Dummy check - any non-empty password is "valid"
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  const fakeToken = `dummy-token-${Date.now()}`;

  return res.json({
    success: true,
    token: fakeToken,
    username: username.trim(),
  });
});

// ---- REST: fetch chat history ----
app.get("/api/messages", (req, res) => {
  res.json(messages);
});

// ---- Health check ----
app.get("/", (req, res) => {
  res.send("Chat backend is running.");
});

// ---- Socket.io realtime logic ----
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("user_join", (username) => {
    onlineUsers.set(socket.id, username);
    io.emit("online_users", Array.from(onlineUsers.values()));
    console.log(`${username} joined (${socket.id})`);
  });

  // Send full history to the newly connected client
  socket.emit("message_history", messages);

  socket.on("send_message", (payload) => {
    const { username, text } = payload;
    if (!text || !text.trim()) return;

    const message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      username: username || "Anonymous",
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    messages.push(message);

    // Broadcast to everyone, including sender
    io.emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    const username = onlineUsers.get(socket.id);
    onlineUsers.delete(socket.id);
    io.emit("online_users", Array.from(onlineUsers.values()));
    console.log(`Socket disconnected: ${socket.id} (${username || "unknown"})`);
  });
});

server.listen(PORT, () => {
  console.log(`Chat backend listening on http://localhost:${PORT}`);
});
