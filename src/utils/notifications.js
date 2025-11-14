// src/utils/notifications.js
export function notifyCountdownStart() {
  try {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      new Notification("RPS64", { body: "Game starts in 30 seconds! Find your seat!" });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((p) => {
        if (p === "granted") {
          new Notification("RPS64", { body: "Game starts in 30 seconds!" });
        }
      });
    }
  } catch {
    // ignore
  }
}
