import { useState, useRef, useEffect } from "react";
import "../index.css";
import { attemptReconnect } from "../reconnectionHelpers/attemptReconnect";

/**
 * 1. check the connection for already open or not "avoids creating duplicate connections."
 * 2. Establishes a new WebSocket connection to your server at ws://localhost:8000
 * 3. for tracking how much time the web socket connection is lived,
 * declare a variable that stores the current timestamp
 * 4. 'socket.onpen' means client is connected to the opened ws connection and
 * fires the initial connection logic with that --> inform the client with current status --> clearing errors on success
 * 5. 'socket.onmessage' this event is fire when the client ws connection recieves message from the server and try/catch for something, here or typically the recieved message is parsed and take use of it to update the ui or anything else,
 * for now, we parse the message ---> inform the user/client ---> checks the recieved response formate and its values ---> based on that continue the corresponding actions ---> if the try/catch fails then inform the user again
 * 6. 'socket.onclose' this event is fires when the server is closed, on closing event from the either both sides client and server ---> imdideately inform the user/client ---> then update the necessary component based states ---> check for the timestamp is recieved or not if avilable then procced the corresponding actions ---> like clacluate the time in seconds and inform to the user/client.
 * 7. 'socket.onerror' this event fires if there’s a network issue or unexpected socket based error ---> send a closing handshake to the server and relase the connected user/client based resources ---> inform the user/client with prefered message 'network issue' --->
 * 8. disconnectFromServer method ---> sockets current state like is it open or not ---> based on the that conditions, the corresponding tasks are executed ---> like sends the message to the server that the client is disconnected or intentionlly disconnect, so the server takes the further action on stored client resouces like relase the client information completely and lot more ---> send the closing handshake to the server.
 * 9. sendMessage method -==> first check the conection is open or not at the last rendering of component using socket instance reference variable ---> SEND THE JSON MESSAGE data TO THE SERVER SO SERVER RESPONSE BACK BASED ON SPECIFIED FLAGS NAMED AS ['start-animation', 'stop-animation'] UNDER CONDITION OF ['start', stop']---> AND THE CLIENT DECIDES WHAT TO DO WITH THAT RECIEVED MESSAGES FROM THE SERVER ---> like infroming the use/client for message is recieved by server.
 * 10.
 * **/

export default function ReqAnimation() {
  const boxRef = useRef(null);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [showBox, setShowBox] = useState(false);
  const [animationStep, setAnimationStep] = useState("");
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [userDisconnected, setUserDisconnected] = useState(false);

  const connectToServer = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("Already connected");
      return;
    }

    const socket = new WebSocket("ws://localhost:8000");
    socketRef.current = socket;

    let connectionStartTime;

    setUserDisconnected(false);

    // ========================================== onopen ==============================================
    socket.onopen = () => {
      console.log("Connection established");
      setConnected(true);
      setError(null); // clear error on success
      setReconnectAttempts(0); // reset attempts
      connectionStartTime = new Date();
    };

    // ============================================ onmessage =========================================
    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("Message from server:", msg.message);
        console.log("Response Type from server:", msg.type);

        if (msg.type === "response") {
          if (msg.message === "start-animation") {
            setShowBox(true); 
            setAnimationStep("scale"); 
            // Small timeout ensures DOM updates and animation restarts from step 1
            setTimeout(() => {
              setAnimationStep("scale");
            }, 50);
          } else if (msg.message === "stop-animation") {
            setAnimationStep(""); // remove animation classes
            setShowBox(false); // hide box
          }
        }
      } catch (err) {
        console.error("_Failed to parse server message:_", event.data);
      }
    };

    // ============================== on close ==========================================
    socket.onclose = () => {
      console.log("⚠️ WebSocket disconnected");
      setShowBox(false);
      setConnected(false);
      
      if(!userDisconnected){
        attemptReconnect(
          reconnectAttempts,
          setReconnectAttempts,
          connectToServer,
          setError,
          userDisconnected
        );
      }
      if (connectionStartTime) {
        setAnimationStep("");
        const connectionEndTime = new Date();
        const durationInMilliseconds = connectionEndTime - connectionStartTime;
        const durationInSeconds = durationInMilliseconds / 1000;
        console.log(
          `WebSocket connection duration: ${durationInSeconds} seconds.`
        );
      } else {
        console.log("Connection closed, but start time was not recorded.");
      }
    };

    // =========================================== on error ================================
    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      setUserDisconnected(false)
      setConnected(false);
      socket.close();
    };
  };

  // =================================== handlers =========================================
  const disconnectFromServer = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "disconnect" }));
      socketRef.current.close();
      setUserDisconnected(true);
      setError("");
    }
  };

  const sendMessage = (type, payload) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }));
      console.log(`➡️ Sent: ${type} | ${payload}`);
    } else {
      console.warn(`Cannot send "${type}", WebSocket is not connected.`);
    }
  };

  const handleAnimationEnd = (e) => {
    if (e.animationName === "expandX") {
      setAnimationStep("moveUp");
    } else if (e.animationName === "moveUp") {
      setAnimationStep("scale");
    }
  };

  // --------------reconnection logic------------------

  // Listen for network changes globally
  useEffect(() => {
    const handleOnline = () => {
      console.log("🌐 Network back online, retrying...");
      setError(null);
      attemptReconnect({
        reconnectAttempts,
        setReconnectAttempts,
        connectToServer,
        setError,
        userDisconnected,
      });
    };

    const handleOffline = () => {
      console.warn("📴 Network went offline, pausing reconnection.");
      setError("Network offline. Waiting...");
      setConnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [reconnectAttempts, userDisconnected]);

  return (
    <div className="wrapper">
      <div className="main">
        {showBox && (
          <div
            ref={boxRef}
            className={`box ${animationStep}`}
            onAnimationEnd={handleAnimationEnd}
          ></div>
        )}
      </div>

      <div className="heading-text-container">
        <h1 className="heading-text">Apple Intelligence</h1>
      </div>

      <div className="connection-btns space-x-2 relative">
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
          className={`btn ${!connected ? "btn-disabled" : ""}`}
          onClick={() => sendMessage("start", "start-to-animation")}
          disabled={!connected}
        >
          Start
        </button>

        <button
          className={`btn ${!connected ? "btn-disabled" : ""}`}
          onClick={() => sendMessage("stop", "stop-to-animation")}
          disabled={!connected}
        >
          Stop
        </button>

        <div>
          <span className="conn-status-box ml-3 ">
            {connected ? "🟢 Connected" : "🔴 Disconnected"}
          </span>
        </div>
      </div>
      <div className="network-status-message absolute bottom-0 right-0 ">
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
}
