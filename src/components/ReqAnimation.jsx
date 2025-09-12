import { useState, useRef } from "react";
import "../index.css";

export default function ReqAnimation() {
  const boxRef = useRef(null);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [animationStep, setAnimationStep] = useState([null]); // "scale" | "moveUp"

  const connectToServer = () => {
    /**
     *
     * **/
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("Already connected");
      return;
    }

    const socket = new WebSocket("ws://localhost:8000");
    socketRef.current = socket;

    let connectionStartTime;
    socket.onopen = () => {
      console.log("✅ Connection established");
      setConnected(true);
      connectionStartTime = new Date();
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("📩 Message from server:", msg);
        console.log("Response Type:", msg.type);
        if (msg.type === "response") {
          if (msg.message === "start-animation") {
            setAnimationStep([scale, moveUp]);
            console.log("Response Message:", msg.message);
            console.log(`Server ACK: ${msg.payload}`);
          } else if (msg.message === "stop-animation") {
            console.log(`Server status: ${msg.payload}`);
            // remove the both  classes
          }
        }
      } catch (err) {
        console.error("_Failed to parse server message:_", event.data);
      }
    };

    socket.onclose = () => {
      console.log("⚠️ WebSocket disconnected");
      if (connectionStartTime) {
        const connectionEndTime = new Date();
        const durationInMilliseconds = connectionEndTime - connectionStartTime;
        const durationInSeconds = durationInMilliseconds / 1000;
        console.log(
          `WebSocket connection duration: ${durationInSeconds} seconds.`
        );
      } else {
        console.log("Connection closed, but start time was not recorded.");
      }
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
