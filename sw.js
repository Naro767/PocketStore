"use strict";

const VERSION = "v1";
const SHELL_CACHE = `pocketstore-shell-${VERSION}`;
const DATA_CACHE = `pocketstore-data-${VERSION}`;
const API_HOST = "jsonplaceholder.typicode.com";

// Archivos del App Shell que se guardan al instalar
const SHELL_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

/* INSTALL: precarga el App Shell */
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando…");
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

/* ACTIVATE: borra cachés de versiones anteriores */
self.addEventListener("activate", (event) => {
  console.log("[SW] Activado");
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== DATA_CACHE)
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* FETCH: estrategia según el tipo de recurso */
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // API: red primero; si falla, usa la última copia guardada
  if (url.hostname === API_HOST) {
    event.respondWith(networkFirst(request));
    return;
  }

  // App Shell: caché primero; si no está, va a la red
  event.respondWith(cacheFirst(request));
});

async function networkFirst(request) {
  const cache = await caches.open(DATA_CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify([]), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    return await fetch(request);
  } catch (err) {
    if (request.mode === "navigate") return caches.match("./index.html");
    return new Response("Sin conexión", { status: 503 });
  }
}
