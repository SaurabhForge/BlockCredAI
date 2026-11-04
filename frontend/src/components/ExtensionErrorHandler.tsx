"use client";

import { useEffect } from "react";

/**
 * Suppresses unhandled promise rejections originating from third-party browser
 * extensions (such as MetaMask inpage.js session restore disconnects), preventing
 * Next.js development Turbopack overlay from breaking the screen.
 */
export default function ExtensionErrorHandler() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg = String(event.reason?.message || event.reason || "");
      const stack = String(event.reason?.stack || "");

      if (
        msg.includes("Failed to connect to MetaMask") ||
        msg.includes("MetaMask extension not found") ||
        stack.includes("chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn") ||
        stack.includes("inpage.js")
      ) {
        event.preventDefault();
        console.warn("[BlockCredAI] Intercepted browser extension error:", event.reason);
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
