const CACHE = "habit-tracker-v785";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./utils.js",
  "./clock.js",
  "./tracker.js",
  "./app-data.js",
  "./styles-core.js",
  "./styles-settings.js",
  "./coverflow.js",
  "./drag.js",
  "./manage.js",
  "./tumbler.js",
  "./bootstrap.js",
  "./font.js",
  "./notifications.js"
];

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url && "focus" in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow("./");
    })
  );
});

self.addEventListener("push", e => {
  const data = e.data ? e.data.json() : { title: "Habit Tracker", body: "Reminder" };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "./icon-192.png",
      vibrate: [200],
      tag: "habit-reminder"
    })
  );
});

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      console.log("Caching assets...");
      return c.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (k !== CACHE) {
            console.log("Removing old cache:", k);
            return caches.delete(k);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.url.endsWith("index.html") || e.request.url.endsWith("/")) {
    e.respondWith(fetch(e.request).catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).catch(() => {});
    })
  );
});
