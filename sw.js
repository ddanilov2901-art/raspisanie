// Офлайн-режим: оболочка приложения хранится на телефоне, данные — в localStorage.
// Обновления приходят сами: каждый раз страница запрашивается с сервера в обход кэша браузера,
// а сохранённая копия используется только без интернета. Номер VERSION менять не обязательно.
const VERSION = "rasp-web-3";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/apple-touch-icon.png", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return; // запросы к серверу — всегда в сеть
  // Сначала сеть в обход HTTP-кэша (GitHub Pages кэширует файлы на 10 минут), без сети — сохранённая копия
  e.respondWith(fetch(req, { cache: "no-cache" }).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then(r => r || caches.match("./index.html"))));
});
