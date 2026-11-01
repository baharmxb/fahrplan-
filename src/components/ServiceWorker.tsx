"use client";

import { useEffect } from "react";
import { BASE_PATH } from "@/lib/content";

export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(`${BASE_PATH}/sw.js`).catch(() => {
      // بدون سرویس‌ورکر اپ فقط حالت آفلاین را ندارد
    });
  }, []);
  return null;
}
