(function() {
  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  function isPushupsDone() {
    try {
      const raw = localStorage.getItem('pushups:' + todayStr());
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data.status === 'yes') return true;
      if (Array.isArray(data.sets) && data.sets.some(s => s !== null && s > 0)) return true;
    } catch {}
    return false;
  }
  function notify() {
    if (isPushupsDone()) return;
    const h = new Date().getHours();
    if (h < 7 || h >= 23) return;
    const _na = document.createElement('a'); _na.href = 'habitnotify://pushups-not-done'; _na.click();
}
  function schedule() {
    notify();
    setInterval(notify, 60 * 60 * 1000);
  }
  window.notifyTest = function() { if (window.notifSendTest) window.notifSendTest(); };
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    schedule();
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(p => { if (p === 'granted') schedule(); });
  }
})();
window.notifOpenSettings = function() {
  if (window.AndroidSettings) {
    window.AndroidSettings.openAppSettings();
  } else {
    window.location.href = 'appsettings://open';
  }
};
window.notifRefreshPermission = function() {
  const el = document.getElementById('notif-permission-status');
  if (el && 'Notification' in window) el.textContent = Notification.permission;
};
window.notifSendTest = async function() {
  const statusEl = document.getElementById('notif-status-msg');
  const btn = document.getElementById('notif-send-test-btn');
  if (statusEl) statusEl.textContent = 'Sending...';
  if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
  try {
    if (Notification.permission !== 'granted') {
      const result = await Notification.requestPermission();
      window.notifRefreshPermission();
      if (result !== 'granted') {
        if (statusEl) statusEl.textContent = 'No permission.';
        if (btn) { btn.textContent = 'Send Test'; btn.disabled = false; }
        return;
      }
    }
    const reg = await navigator.serviceWorker.ready;
    if (statusEl) statusEl.textContent = 'SW: ' + (reg.active ? reg.active.state : 'none') + ' | ctrl: ' + (navigator.serviceWorker.controller ? 'yes' : 'no');
    try {
      if (window.AndroidSettings && window.AndroidSettings.showNotification) {
        window.AndroidSettings.showNotification('Habit Tracker', 'Pushups not done yet today.');
      } else {
        const _na2 = document.createElement('a'); _na2.href = 'habitnotify://pushups-not-done'; _na2.click();
      }
      await reg.showNotification('Habit Tracker', { body: 'Test notification.', icon: './icon-192.png', tag: 'test-' + Date.now(), vibrate: [200], requireInteraction: false });
      if (btn) { btn.textContent = 'Send Test'; btn.disabled = false; }
    } catch(e2) {
      new Notification('Habit Tracker', { body: 'Test notification.', icon: './icon-192.png', tag: 'test-' + Date.now() });
      if (btn) { btn.textContent = 'Send Test'; btn.disabled = false; }
    }
  } catch(e) {
    if (statusEl) statusEl.textContent = 'Error: ' + e.message;
    if (btn) { btn.textContent = 'Send Test'; btn.disabled = false; }
  }
};