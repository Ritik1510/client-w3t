/**
 * utils/attemptReconnect.js
 * Stop if user clicked disconnect
 * Stop if browser is offline
 * Stop retrying after max attempts
 * Retry delay grows with attempts (1s → 5s max)
 *
 */
export function attemptReconnect({
    reconnectAttempts,
    setReconnectAttempts,
    connectToServer,
    setError,
    userDisconnected,
    maxAttempts = 5,
    maxDelay = 5000,
}) {
    if (userDisconnected) {
        console.log("Reconnection skipped: user disconnected.");
        return;
    }

    if (!navigator.onLine) {
        console.warn("📴 Offline: Skipping reconnection until network is back.");
        setError("📴 No internet connection. Waiting for network...");
        return;
    }

    if (reconnectAttempts >= maxAttempts) {
        setError(
            `Failed to reconnect after ${maxAttempts} attempts. Please check network.`
        );
        return;
    }

    const retryDelay = Math.min(maxDelay, (reconnectAttempts + 1) * 1000);
    console.log(`Reconnecting in ${retryDelay / 1000}s...`);

    setTimeout(() => {
        setReconnectAttempts((prev) => prev + 1);
        connectToServer(true); // call connect again
    }, retryDelay);
}
