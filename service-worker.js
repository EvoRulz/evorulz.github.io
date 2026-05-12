// @version 1386

const CACHE = "habit-tracker-v1386";

const ASSETS = [
  "./",
  "./index.html?v=1386",
  "./manifest.json?v=1386",
  "./icon-192.png?v=1386",
  "./icon-512.png?v=1386",
  "./settings-overlay-1.js?v=1386",
  "./settings-overlay-2.js?v=1386",
  "./utils.js?v=1386",
  "./clock.js?v=1386",
  "./tracker.js?v=1386",
  "./app-data.js?v=1386",
  "./styles-core.js?v=1386",
  "./styles-colors.js?v=1386",
  "./settings-panel.js?v=1386",
  "./settings-change.js?v=1386",
  "./styles-drag-rows.js?v=1386",
  "./coverflow.js?v=1386",
  "./drag.js?v=1386",
  "./manage.js?v=1386",
  "./tumbler.js?v=1386",
  "./bootstrap.js?v=1386",
  "./font.js?v=1386",
  "./notifications.js?v=1386",
  "./slider-init.js?v=1386",
  "./color-picker.js?v=1386",
  "./app.css?v=1386",
  "./settings-ui.css?v=1386"
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
      self.clients.matchAll({includeUncontrolled:true,type:'window'}).then(cls => cls.forEach(c2 => c2.postMessage({type:"sw-installing"})));
      return c.addAll(ASSETS);
    }).then(() => {
      self.clients.matchAll({includeUncontrolled:true,type:'window'}).then(cls => cls.forEach(c2 => c2.postMessage({type:"sw-installed"})));
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
    ).then(() => {
      self.clients.matchAll({includeUncontrolled:true,type:'window'}).then(cls => cls.forEach(c2 => c2.postMessage({type:"sw-activated"})));
    })
  );
  self.clients.claim();
});
