import { useEffect, useRef, useState } from "react";

export default function StreamAnimation() {
  const [positions, setPositions] = useState([-1000, -1000, -1000]);
  const socketRef = useRef(null); // keep socket reference
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket server
    const socket = new WebSocket("ws://localhost:8080");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      setConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (Array.isArray(data)) {
          setPositions(data);
        } else if (data.ellipse1 !== undefined) {
          setPositions([data.ellipse1, data.ellipse2, data.ellipse3]);
        }
      } catch (err) {
        console.error("❌ Error parsing data:", err);
      }
    };

    socket.onclose = () => {
      console.log("⚠️ WebSocket disconnected");
      setConnected(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  // --- handlers for Start/Stop ---
  const handleStart = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send("Start");
      console.log("▶️ Start command sent");
    }
  };

  const handleStop = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send("Stop");
      console.log("⏹ Stop command sent");
    }
  };

  return (
    <div className="wrapper grid place-items-center h-screen w-screen relative p-8">
      <div className="main">
        {/* <svg
          class="svg-image"
          width="395"
          height="132"
          viewBox="0 0 395 132"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_f_5_5)">
            <path
              d="M25 25H196H370V87.0714H279L196 107L132 87.0714L25 80V25Z"
              fill="url(#paint0_linear_5_5)"
            />
          </g>
          <defs>
            <filter
              id="filter0_f_5_5"
              x="0"
              y="0"
              width="395"
              height="132"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="12.5"
                result="effect1_foregroundBlur_5_5"
              />
            </filter>

            <linearGradient
              id="paint0_linear_5_5"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="50%" stop-color="#FF1E21">
                <animate
                  attributeName="offset"
                  values="0.5;0;0.5"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stop-color="#2B2EE1">
                <animate
                  attributeName="offset"
                  values="0.5;1;0.5"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
          </defs>
        </svg> */}
        <div className="box"></div>
      </div>

      <div className="heading-text-container absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <h1 className="heading-text">Apple Intelligence</h1>
      </div>
      <div className="connection-btns">
        <div
          className="flex items-center justify-evenly h-full w-full"
          style={{ marginBottom: "20px" }}
        >
          <button onClick={handleStart} disabled={!connected}>
            Start
          </button>
          <button onClick={handleStop} disabled={!connected}>
            Stop
          </button>
          <span style={{ marginLeft: "12px", color: "black" }}>
            {connected ? "🟢 Connected" : "🔴 Disconnected"}
          </span>
        </div>
      </div>
    </div>
  );
}

