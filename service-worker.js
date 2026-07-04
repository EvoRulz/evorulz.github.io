// @version 1570
const CACHE = "habit-tracker-v1570";
const ASSETS = [
  "./index.html?v=1570",
  "./manifest.json?v=1570",
  "./icons/icon-192.png?v=1570",
  "./icons/icon-512.png?v=1570",
  "./settings-overlay-1.js?v=1570",
  "./settings-overlay-2.js?v=1570",
  "./utils.js?v=1570",
  "./clock.js?v=1570",
  "./tracker.js?v=1570",
  "./app-data.js?v=1570",
  "./styles-app.js?v=1570",
  "./styles-btn.js?v=1570",
  "./styles-colors.js?v=1570",
  "./settings-panel.js?v=1570",
  "./settings-change.js?v=1570",
  "./styles-drag-rows.js?v=1570",
  "./coverflow.js?v=1570",
  "./drag.js?v=1570",
  "./manage.js?v=1570",
  "./tumbler.js?v=1570",
  "./bootstrap.js?v=1570",
  "./font.js?v=1570",
  "./notifications.js?v=1570",
  "./slider-init.js?v=1570",
  "./color-picker-core.js?v=1570",
  "./color-picker-sync.js?v=1570",
  "./app.css?v=1570",
  "./settings-ui.css?v=1570"
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
      icon: "./icons/icon-192.png",
      vibrate: [200],
      tag: "habit-reminder"
    })
    );
});
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      self.clients.matchAll({includeUncontrolled:true,type:'window'}).then(cls => cls.forEach(c2 => c2.postMessage({type:"sw-installing"})));
      return Promise.all(
        ASSETS.map(url =>
          fetch(url).then(res => { if (res.ok) return c.put(url, res); }).catch(() => {})
        )
      );
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
