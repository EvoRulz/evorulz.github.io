(function() {
  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function getNotifSettings() {
    try {
      const s = JSON.parse(localStorage.getItem('_notifSettings'));
      if (s) return s;
    } catch {}
    return { years: 0, days: 0, hours: 1, minutes: 0, seconds: 0, targetReps: 0 };
  }

  function getIntervalMs() {
    const s = getNotifSettings();
    return (
      (s.years  || 0) * 365 * 24 * 60 * 60 * 1000 +
      (s.days   || 0) * 24 * 60 * 60 * 1000 +
      (s.hours  || 0) * 60 * 60 * 1000 +
      (s.minutes|| 0) * 60 * 1000 +
      (s.seconds|| 0) * 1000
    ) || 60 * 60 * 1000;
  }

  function isPushupsDone() {
    try {
      const raw = localStorage.getItem('pushups:' + todayStr());
      if (!raw) return false;
      const data = JSON.parse(raw);
      const target = getNotifSettings().targetReps || 0;
      const total = Array.isArray(data.sets) ? data.sets.reduce((a,b) => a + (b||0), 0) : 0;
      if (data.status === 'yes') return target === 0 || total >= target;
      if (total > 0) return target === 0 || total >= target;
    } catch {}
    return false;
  }

  async function notify() {
    if (isPushupsDone()) return;
    const h = new Date().getHours();
    if (h < 7 || h >= 23) return;
    try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification('Habit Tracker', {
      body: 'Pushups not done yet today.',
      icon: './icon-192.png',
      vibrate: [200],
      requireInteraction: false,
      tag: 'habit-reminder'
    });
  } catch(e) {
    if (window.AndroidSettings && window.AndroidSettings.showNotification) {
      window.AndroidSettings.showNotification('Habit Tracker', 'Pushups not done yet today.');
    }
  }
  }

  let _notifInterval = null;
  function schedule() {
    if (_notifInterval) clearInterval(_notifInterval);
    scheduleNextNotification();
  }

  function scheduleNextNotification() {
    if (_notifInterval) clearInterval(_notifInterval);
    _notifInterval = setInterval(() => {
      notify();
    }, getIntervalMs());
  }

  window._notifReschedule = function() {
    if (_notifInterval) clearInterval(_notifInterval);
    schedule();
  };

  // Delay initial schedule to avoid triggering on app load
  setTimeout(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      scheduleNextNotification();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(p => { if (p === 'granted') scheduleNextNotification(); });
    }
  }, 10000);

  
})();

window.notifOpenSettings = function() {
  if (window.AndroidSettings) {
    window.AndroidSettings.openAppSettings();
  } else {
    window.location.href = 'appsettings://open';
  }
};

window.notifOpenAlarmSettings = function() {
  if (window.AndroidSettings) {
    window.AndroidSettings.openAlarmSettings();
  }
};

window.notifRefreshPermission = function() {
  const el = document.getElementById('notif-permission-status');
  if (!el) return;
  const webPerm = ('Notification' in window) ? Notification.permission : 'unavailable';
  if (window.AndroidSettings && window.AndroidSettings.getPermissionStatus) {
    try {
      const s = JSON.parse(window.AndroidSettings.getPermissionStatus());
      el.innerHTML =
        'Web: <span style="color:' + (webPerm === 'granted' ? '#99ff99' : '#ff9999') + '">' + webPerm + '</span>' +
        ' &nbsp; Notifications: <span style="color:' + (s.notifications ? '#99ff99' : '#ff9999') + '">' + (s.notifications ? 'granted' : 'denied') + '</span>' +
        ' &nbsp; Exact alarm: <span style="color:' + (s.exactAlarm ? '#99ff99' : '#ff9999') + '">' + (s.exactAlarm ? 'granted' : 'denied') + '</span>';
    } catch {
      el.textContent = webPerm;
    }
  } else {
    el.textContent = webPerm;
  }
};

window.notifSaveSchedule = function() {
  const g = id => { const el = document.getElementById(id); return el ? (parseInt(el.value) || 0) : 0; };
  const s = {
    years:      g('notif-years'),
    days:       g('notif-days'),
    hours:      g('notif-hours'),
    minutes:    g('notif-minutes'),
    seconds:    g('notif-seconds'),
    targetReps: g('notif-target-reps'),
  };
  localStorage.setItem('_notifSettings', JSON.stringify(s));
  if (window._notifReschedule) window._notifReschedule();
  const intervalMs = (
    (s.years   || 0) * 365 * 24 * 60 * 60 * 1000 +
    (s.days    || 0) * 24 * 60 * 60 * 1000 +
    (s.hours   || 0) * 60 * 60 * 1000 +
    (s.minutes || 0) * 60 * 1000 +
    (s.seconds || 0) * 1000
  ) || 60 * 60 * 1000;
  if (window.AndroidSettings && window.AndroidSettings.scheduleRepeatingNotification) {
    window.AndroidSettings.scheduleRepeatingNotification(intervalMs);
  }
  const btn = document.getElementById('notif-save-schedule-btn');
  if (btn) { const orig = btn.textContent; btn.textContent = 'Saved'; setTimeout(() => btn.textContent = orig, 1200); }
};

window.notifLoadScheduleUI = function() {
  try {
    const s = JSON.parse(localStorage.getItem('_notifSettings')) || {};
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || 0; };
    set('notif-years',       s.years);
    set('notif-days',        s.days);
    set('notif-hours',       s.hours !== undefined ? s.hours : 1);
    set('notif-minutes',     s.minutes);
    set('notif-seconds',     s.seconds);
    set('notif-target-reps', s.targetReps);
  } catch {}
};

window.notifSendTest = async function() {
  const statusEl = document.getElementById('notif-status-msg');
  const btn = document.getElementById('notif-send-test-btn');
  if (statusEl) statusEl.textContent = 'Sending in 5s...';
  if (btn) { btn.textContent = 'Sending in 5s...'; btn.disabled = true; }
  await new Promise(r => setTimeout(r, 5000));
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
      await reg.showNotification('Habit Tracker', { body: 'Test notification.', icon: './icon-192.png', vibrate: [200], requireInteraction: false });
      if (btn) { btn.textContent = 'Send Test'; btn.disabled = false; }
    } catch(e2) {
      if (window.AndroidSettings && window.AndroidSettings.showNotification) {
        window.AndroidSettings.showNotification('Habit Tracker', 'Test notification.');
      } else {
        new Notification('Habit Tracker', { body: 'Test notification.', icon: './icon-192.png' });
      }
      if (btn) { btn.textContent = 'Send Test'; btn.disabled = false; }
    }
  } catch(e) {
    if (statusEl) statusEl.textContent = 'Error: ' + e.message;
    if (btn) { btn.textContent = 'Send Test'; btn.disabled = false; }
  }
};