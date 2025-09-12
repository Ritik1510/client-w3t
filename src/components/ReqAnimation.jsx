import { useState, useRef } from "react";
import "../index.css";

export default function ReqAnimation() {
  const boxRef = useRef(null);
  const socketRef = useRef(null);
  const [ connected, setConnected ] = useState(false);
  const [ animationStep, setAnimationStep ] = useState("scale"); // "scale" | "moveUp"

  // --------------------------
  // WebSocket helpers
  // --------------------------

  const connectToServer = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("Already connected");
      return;
    }

    const socket = new WebSocket(
      "ws://localhost:8000"
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ Connection established");
      setConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("📩 Message from server:", msg);

        if (msg.type === "ack") {
          // Example: handle server acknowledgments
          console.log(`Server ACK: ${msg.payload}`);
        } else if (msg.type === "status") {
          console.log(`Server status: ${msg.payload}`);
        }
      } catch (err) {
        console.error("Failed to parse server message:", event.data);
      }
    };

    socket.onclose = () => {
      console.log("⚠️ WebSocket disconnected");
      setConnected(false);
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
  };

  const disconnectFromServer = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "disconnect" }));
      socketRef.current.close();
    }
  };

  const sendMessage = (type, payload) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }));
      console.log(`➡️ Sent: ${type} | ${payload}`);
    } else {
      console.log("⚠️ Cannot send, WebSocket not connected");
    }
  };

  const handleAnimationEnd = (e) => {
    if (e.animationName === "expandX") {
      setAnimationStep("moveUp");
    } else if (e.animationName === "moveUp") {
      setAnimationStep("scale");
    }
  };

  return (
    <div className="wrapper grid place-items-center h-screen w-screen relative p-8">
      <div className="main">
        <div
          ref={boxRef}
          className={`box ${animationStep}`}
          onAnimationEnd={handleAnimationEnd}
        ></div>
      </div>

      <div className="heading-text-container">
        <h1 className="heading-text">Apple Intelligence</h1>
      </div>

      <div className="connection-btns space-x-2">
        {!connected ? (
          <button className="btn" onClick={connectToServer}>
            Connect
          </button>
        ) : (
          <button className="btn" onClick={disconnectFromServer}>
            Disconnect
          </button>
        )}

        <button
          className="btn"
          onClick={() => sendMessage("start", "start-to-animation")}
          disabled={!connected}
        >
          Start
        </button>

        <button
          className="btn"
          onClick={() => sendMessage("stop", "stop-to-animation")}
          disabled={!connected}
        >
          Stop
        </button>

        <span className="conn-status-box ml-3">
          {connected ? "🟢 Connected" : "🔴 Disconnected"}
        </span>
      </div>
    </div>
  );
}
