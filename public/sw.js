// با هر تغییر محتوای پیش‌ذخیره، شماره‌ی نسخه را بالا ببر
const CACHE = "fahrplan-v7";
const scope = new URL(self.registration.scope);
const lessons = Array.from({ length: 12 }, (_, i) => `content/lektion-${String(i + 1).padStart(2, "0")}.json`);
const PRECACHE = ["", "dashboard/", "plan/", "lessons/", "reports/", "manifest.webmanifest", ...lessons].map(
  (path) => new URL(path, scope).href,
);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const home = await cache.match(new URL("", scope).href);
      if (home) return home;
    }
    throw new Error("offline");
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // PDF کتاب حجیم است و فقط از خود فایل محلی باز می‌شود
  if (event.request.method !== "GET" || url.origin !== scope.origin || url.pathname.endsWith(".pdf")) return;
  const immutable = url.pathname.includes("/_next/static/");
  event.respondWith(immutable ? cacheFirst(event.request) : networkFirst(event.request));
});
