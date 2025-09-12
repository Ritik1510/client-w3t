import { useState, useEffect, useRef } from "react";
import '../App.css'

export default function ReqAnimation() {
  const boxRef = useRef(null);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [animationStep, setAnimationStep] = useState("scale"); // "scale" | "moveUp"

  // WebSocket setup
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("connection established ;>")
      setConnected(true); 
    };

    socket.onclose = () => setConnected(false);
    socket.onerror = (err) => console.error("WebSocket error:", err);

    return () => socket.close();
  }, []);

  // Animation handler
  const handleAnimationEnd = (e) => {
    if (e.animationName === "expandX") {
      setAnimationStep("moveUp");
    } else if (e.animationName === "moveUp") {
      setAnimationStep("scale");
    }
  };

  // Start / Stop handlers
  const handleStart = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send("Start");
      console.log("try to send the start request");
    }
  };

  const handleStop = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send("Stop");
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

      <div className="connection-btns">
        <button className="btn" onClick={handleStart} disabled={!connected}>
          <span className="btn-text">Start</span> 
        </button>
        <button className="btn" onClick={handleStop} disabled={!connected}>
          <span className="btn-text" >stop</span>
        </button>
        <span className="conn-status-box ml-3">
          {connected ? "🟢 Connected" : "🔴 Disconnected"}
        </span>
      </div>
    </div>
  );
}
