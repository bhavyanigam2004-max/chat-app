import { useState } from "react";
import Login from "./components/Login.jsx";
import Chat from "./components/Chat.jsx";

export default function App() {
  const [user, setUser] = useState(null); // { username, token }

  const handleLogin = (username, token) => {
    setUser({ username, token });
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <Chat username={user.username} onLogout={handleLogout} />;
}
