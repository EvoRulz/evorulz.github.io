// @version 1610
const CACHE = "habit-tracker-v1610";
const ASSETS = [
  "./index.html?v=1610",
  "./manifest.json?v=1610",
  "./icons/icon-192.png?v=1610",
  "./icons/icon-512.png?v=1610",
  "./settings-overlay-1.js?v=1610",
  "./settings-overlay-2.js?v=1610",
  "./utils.js?v=1610",
  "./clock.js?v=1610",
  "./tracker.js?v=1610",
  "./app-data.js?v=1610",
  "./styles-app.js?v=1610",
  "./styles-btn.js?v=1610",
  "./styles-colors.js?v=1610",
  "./settings-panel.js?v=1610",
  "./settings-change.js?v=1610",
  "./styles-drag-rows.js?v=1610",
  "./coverflow.js?v=1610",
  "./drag.js?v=1610",
  "./manage.js?v=1610",
  "./tumbler.js?v=1610",
  "./bootstrap.js?v=1610",
  "./font.js?v=1610",
  "./notifications.js?v=1610",
  "./slider-init.js?v=1610",
  "./color-picker-core.js?v=1610",
  "./color-picker-sync.js?v=1610",
  "./app.css?v=1610",
  "./settings-ui.css?v=1610"
];
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const habitId = e.notification.data && e.notification.data.habitId;
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url && "focus" in c) {
          if (habitId && "postMessage" in c) c.postMessage({ type: "openHabit", habitId: habitId });
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(habitId ? "./?openHabit=" + encodeURIComponent(habitId) : "./");
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
