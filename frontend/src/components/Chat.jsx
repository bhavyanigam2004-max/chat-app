import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:4000";

const AVATAR_COLORS = ["#ff7a45", "#4ade80", "#60a5fa", "#f472b6", "#fbbf24", "#a78bfa"];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitial(name) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export default function Chat({ username, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.emit("user_join", username);

    socket.on("message_history", (history) => {
      setMessages(history);
    });

    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.disconnect();
    };
  }, [username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    socketRef.current.emit("send_message", { username, text });
    setText("");
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div>
          <h2>Simple Chat</h2>
          <span className="online-count">{onlineUsers.length} online</span>
        </div>
        <div className="user-info">
          <div
            className="avatar"
            style={{ width: 26, height: 26, fontSize: 11, background: getAvatarColor(username) }}
          >
            {getInitial(username)}
          </div>
          <span>{username}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="online-strip">
        {onlineUsers.map((user, idx) => (
          <div className="online-chip" key={`${user}-${idx}`}>
            <div
              className="avatar"
              style={{ width: 22, height: 22, fontSize: 10, background: getAvatarColor(user) }}
            >
              {getInitial(user)}
            </div>
            <span>{user === username ? `${user} (you)` : user}</span>
          </div>
        ))}
      </div>

      <div className="messages-list">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-row ${msg.username === username ? "own" : "other"}`}
          >
            <div
              className="avatar"
              style={{ background: getAvatarColor(msg.username) }}
            >
              {getInitial(msg.username)}
            </div>
            <div className="message-bubble">
              {msg.username !== username && (
                <div className="message-sender">{msg.username}</div>
              )}
              <div className="message-text">{msg.text}</div>
              <div className="message-time">{formatTime(msg.timestamp)}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="message-input-form" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
