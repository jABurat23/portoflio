"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("sw registered", reg.scope))
        .catch((err) => console.log("sw failed", err));
    }
  }, []);

  return null;
}