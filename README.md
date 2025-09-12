### (Client-Side WebSocket Management)

When we talk about **WebSocket management on the client side**, we basically mean **how the browser or client app establishes, maintains, and controls the real-time connection** with the server.

A WebSocket client in JavaScript is typically created using the built-in **`WebSocket` API**, for example:

```js
const socket = new WebSocket("ws://localhost:8080");
```

Now, once the connection is created, the client can manage it through **different event handlers and methods**:

#### 1. **`onopen`**

This event fires when the connection is successfully established.
Here, you usually:

* Confirm that the client is connected.
* Maybe send an initial handshake message or authentication token.

```js
socket.onopen = () => {
  console.log("✅ Connected to server");
  socket.send("Hello from client!");
};
```

#### 2. **`onmessage`**

This event handles **incoming data** from the server.
Clients typically:

* Parse JSON messages.
* Update the UI in real-time (like chat apps, dashboards, live notifications).

```js
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("📩 Received:", data);
};
```

#### 3. **`onerror`**

This event fires if there’s a **network issue or unexpected error**.
Here, you can:

* Log the error.
* Optionally retry or show an error message to the user.

```js
socket.onerror = (error) => {
  console.error("⚠️ WebSocket error:", error);
};
```

#### 4. **`onclose`**

This event fires when the connection is **closed by either the client or the server**.
Typical use cases:

* Reconnect automatically after some delay.
* Inform the user that the connection was lost.

```js
socket.onclose = (event) => {
  console.log("❌ Disconnected:", event.reason);
  // Optional: attempt reconnection
};
```

#### 5. **Client Methods**

Apart from events, the client has methods to actively manage the connection:

* **`send(data)`** → Send messages to the server.

  ```js
  socket.send(JSON.stringify({ type: "chat", message: "Hi Server!" }));
  ```

* **`close(code, reason)`** → Gracefully close the connection.

  ```js
  socket.close(1000, "User logged out");
  ```

#### 6. **Advanced Client Management**

In real-world apps, we often add:

* **Heartbeat/Ping-Pong**: To detect if the server is still alive.
* **Reconnection logic**: Try reconnecting after disconnection.
* **Queueing messages**: If the connection is not open, temporarily store messages and send them later.
* **Authentication**: Send tokens during connection or inside messages.

### 🔑 Summary

So in short, the client manages WebSockets mainly with **four key events**:
👉 `onopen` for establishing connection,
👉 `onmessage` for receiving data,
👉 `onerror` for handling issues,
👉 `onclose` for disconnects.

And with **two main methods**:
👉 `send()` to send data,
👉 `close()` to end the connection.

Beyond this, we can build features like **reconnection, heartbeats, and authentication** for more reliability in production apps.

---

## (Server-Side WebSocket Management in Node.js)

On the server side, WebSocket management means **how the backend accepts client connections, handles messages, errors, disconnections, and optionally integrates with HTTP routes**.

In Node.js, the most common library is **`ws`**. You can implement it either:

* as a **standalone WebSocket server**, or
* **combined with Express/HTTP server** if you also need REST APIs.

---

### 🔹 1. Starting a WebSocket server

With pure WebSocket:

```js
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
```

Or with Express integration:

```js
import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
server.listen(3000);
```

---

### 🔹 2. Handling `connection`

The `connection` event is triggered when a client connects.
Here, you can:

* Log the new connection.
* Send a welcome message.
* Optionally perform authentication.

```js
wss.on("connection", (ws) => {
  console.log("✅ Client connected");
  ws.send("Hello from server!");
});
```

---

### 🔹 3. Handling `message`

Each client socket has a `message` event.
Here, the server usually:

* Parses incoming data (often JSON).
* Executes business logic (chat, notifications, DB operations).
* Optionally broadcasts messages to other clients.

```js
ws.on("message", (msg) => {
  const data = msg.toString();
  console.log("📩 Message from client:", data);

  // Echo back
  ws.send(`Server received: ${data}`);
});
```

---

### 🔹 4. Handling `error`

If there is a **network failure or client issue**, the `error` event fires.
Here you log it or clean up resources.

```js
ws.on("error", (err) => {
  console.error("⚠️ WebSocket error:", err.message);
});
```

---

### 🔹 5. Handling `close`

When a client disconnects (voluntarily or due to network issues), the `close` event fires.
Here you might:

* Remove the client from an active connections list.
* Log the disconnection.
* Optionally trigger reconnection logic from client side.

```js
ws.on("close", (code, reason) => {
  console.log(`❌ Client disconnected. Code: ${code}, Reason: ${reason}`);
});
```

---

### 🔹 6. Server-Side Methods

Apart from handling events, the server can also manage connections with methods like:

* **`ws.send(data)`** → send message to a specific client.
* **`wss.clients`** → access all connected clients for broadcasting.

Example of broadcasting:

```js
wss.clients.forEach((client) => {
  if (client.readyState === 1) { // 1 = OPEN
    client.send("Broadcast message to all clients");
  }
});
```

---

### 🔹 7. Advanced Features in Real Projects

In production-grade WebSocket servers, you often add:

* **Authentication** (JWT tokens or session checks during connection).
* **Heartbeat / ping-pong** mechanism to detect dead connections.
* **Scalability support** (using Redis Pub/Sub, Kafka, or message brokers for multi-server communication).
* **Graceful shutdown** (closing all sockets when server restarts).

---

### Summary 

So on the server side, WebSocket management is mainly about handling **four key events**:
👉 `connection` for new clients,
👉 `message` for data received,
👉 `error` for issues,
👉 `close` for disconnections.

And we use **methods like `send()` and `wss.clients`** for communication and broadcasting.

In larger systems, we extend this with **authentication, heartbeats, reconnections, and clustering** to ensure a scalable, production-ready WebSocket backend.

---