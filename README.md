# Simple Chat App

A basic realtime chat application.

- **Backend:** Node.js + Express + Socket.io (realtime messaging, in-memory storage, dummy login)
- **Frontend:** React + Vite + socket.io-client (chat UI, timestamps, online user count)

## Project Structure

```
chat-app/
├── backend/
│   ├── server.js       # Express + Socket.io server
│   └── package.json
└── frontend/
    ├── index.html
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── main.jsx
    │   └── components/
    │       ├── Login.jsx
    │       └── Chat.jsx
    └── package.json
```

## How it works

- On sign in, the frontend calls `POST /api/login` (dummy — any non-empty
  username/password is accepted) and receives a fake token + username.
- The client then connects to the server over a Socket.io websocket.
- Sending a message emits `send_message`; the server timestamps it, stores it
  in memory, and broadcasts `receive_message` to every connected client.
- On connect, the server sends `message_history` so a new client sees prior
  messages. `GET /api/messages` exposes the same history over REST if needed.
- Online users are tracked in a `Map` and broadcast on join/disconnect.

## Running locally

### 1. Backend

```bash
cd backend
npm install
npm start
```

Server runs at `http://localhost:4000`.

### 2. Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in two browser tabs/windows, log in with two
different usernames, and chat between them in real time.

## Notes / limitations (by design, to keep this simple)

- **No real database** — messages and users live in memory and reset when the
  server restarts. Swapping in MongoDB/Postgres would be a small, isolated
  change (replace the `messages` array and `onlineUsers` map with DB calls).
- **No real authentication** — the login endpoint accepts any credentials and
  returns a fake token. It's there to satisfy the "basic login" bonus item
  and to show where real auth (JWT, sessions, etc.) would plug in.
- **React, not React Native** — per the instructions, since a full React
  Native + Expo build (and producing a signed APK) needs native build
  tooling that isn't available in this environment. This React app runs in
  a mobile browser fine, and the component structure (Login, Chat) would
  port to React Native almost 1:1 — swap `<div>`/`<input>` for `<View>`/
  `<TextInput>`, keep the same socket.io-client logic.
- **No APK / Google Drive upload** — I can't build an Android binary or
  upload to Google Drive from here. You'll need to push this code to your
  own GitHub repo and share that link, and optionally record your own
  screen while running the app locally (or via Expo if you port it to RN)
  for the demo video.

## Suggested next steps for submission

1. `git init` in the `chat-app` folder, commit, push to a new GitHub repo.
2. Run backend + frontend locally, record a short screen capture showing two
   browser tabs chatting in real time with timestamps.
3. Upload the recording to the provided Google Drive folder along with the
   GitHub link.
