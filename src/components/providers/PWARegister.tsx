"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // PWA registration should never block the app shell.
      });
    };

    /**
     * THE BUG THIS FIXES, WHICH MADE THE WHOLE PWA INERT
     *
     * This used to call window.addEventListener("load", register) and
     * nothing else. An effect runs after hydration, and hydration happens
     * after the load event has already fired, so the listener was attached
     * to an event that would never fire again. The service worker was
     * therefore never registered, on any page, for anyone: a live check
     * found zero registrations after a full page load.
     *
     * Everything downstream was dead as a result. No offline page could
     * ever be served, the push handler in sw.js could never run, and the
     * install prompt Chrome offers depends on a controlling worker with a
     * fetch handler, which is what the "Install this Companion" button in
     * each product's settings was waiting for.
     *
     * Waiting for load at all is deliberate: registration competes with
     * first paint for bandwidth, and this is never urgent enough to win
     * that. So it still defers when the page is genuinely still loading,
     * and only registers immediately when there is nothing left to wait
     * for.
     */
    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
