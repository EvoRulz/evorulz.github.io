// @version 1239

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
      try {
        const a = document.createElement('a');
        a.href = 'habitnotify://notify?title=' + encodeURIComponent('Habit Tracker') + '&body=' + encodeURIComponent('Pushups not done yet today.');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch(e2) {}
    }
  }

  let _notifInterval = null;
  function schedule() {
    if (_notifInterval) clearInterval(_notifInterval);
    scheduleNextNotification();
  }

  function scheduleNextNotification() {
    if (_notifInterval) clearInterval(_notifInterval);
    if (localStorage.getItem('_notifEnabled') !== 'true') return;
    _notifInterval = setInterval(() => {
      notify();
    }, getIntervalMs());
  }

  window._notifReschedule = function() {
    if (_notifInterval) clearInterval(_notifInterval);
    schedule();
  };

  setTimeout(() => {
    if (!('Notification' in window)) return;
    const _offUntil = parseInt(localStorage.getItem('_notifOffUntil') || '0');
    if (_offUntil && Date.now() >= _offUntil) { localStorage.setItem('_notifEnabled', 'true'); localStorage.removeItem('_notifOffUntil'); }
    if (localStorage.getItem('_notifEnabled') !== 'true') return;
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
  window.location.href = 'habitnotify://alarmsettings';
};

window.notifRefreshPermission = function() {
  const el = document.getElementById('notif-permission-status');
  if (!el) return;
  const webPerm = ('Notification' in window) ? Notification.permission : 'unavailable';
  const webColor = webPerm === 'granted' ? '#99ff99' : '#ff9999';
  if (window.AndroidSettings && window.AndroidSettings.getPermissionStatus) {
    try {
      const s = JSON.parse(window.AndroidSettings.getPermissionStatus());
      el.innerHTML =
        'Web: <span style="color:' + webColor + '">' + webPerm + '</span>' +
        '<br>Notifications: <span style="color:' + (s.notifications ? '#99ff99' : '#ff9999') + '">' + (s.notifications ? 'granted' : 'denied') + '</span>' +
        '<br>Exact alarm: <span style="color:' + (s.exactAlarm ? '#99ff99' : '#ff9999') + '">' + (s.exactAlarm ? 'granted' : 'denied') + '</span>';
    } catch {
      el.innerHTML = 'Web: <span style="color:' + webColor + '">' + webPerm + '</span>';
    }
  } else {
    el.innerHTML = 'Web: <span style="color:' + webColor + '">' + webPerm + '</span>';
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
  window.location.href = 'habitnotify://schedule?interval=' + intervalMs;
  console.log('[notif] scheduling interval ms:', intervalMs);
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
  _notifUpdateToggleUI();
  _notifTickCountdown();
};

function _notifUpdateToggleUI() {
  const enabled = localStorage.getItem('_notifEnabled') === 'true';
  const wrap  = document.getElementById('notif-toggle-wrap');
  const knob  = document.getElementById('notif-toggle-knob');
  const offWrap = document.getElementById('notif-off-wrap');
  if (wrap)  { wrap.style.background = enabled ? '#1a5a1a' : '#333'; }
  if (knob)  { knob.style.left = enabled ? '27px' : '3px'; knob.style.background = enabled ? '#99ff99' : '#666'; }
  if (offWrap) { offWrap.style.display = enabled ? 'none' : 'flex'; }
}

function _notifTickCountdown() {
  const el = document.getElementById('notif-countdown-display');
  if (!el) return;
  const enabled = localStorage.getItem('_notifEnabled') === 'true';
  if (enabled) { el.textContent = ''; return; }
  const until = parseInt(localStorage.getItem('_notifOffUntil') || '0');
  if (!until) { el.textContent = 'Off indefinitely'; return; }
  const remaining = until - Date.now();
  if (remaining <= 0) {
    localStorage.setItem('_notifEnabled', 'true');
    localStorage.removeItem('_notifOffUntil');
    _notifUpdateToggleUI();
    if (window._notifReschedule) window._notifReschedule();
    const _s = JSON.parse(localStorage.getItem('_notifSettings') || '{}');
    const _ms = (
      (_s.years   || 0) * 365 * 24 * 60 * 60 * 1000 +
      (_s.days    || 0) * 24 * 60 * 60 * 1000 +
      (_s.hours   || 0) * 60 * 60 * 1000 +
      (_s.minutes || 0) * 60 * 1000 +
      (_s.seconds || 0) * 1000
    ) || 60 * 60 * 1000;
    if (window.AndroidSettings && window.AndroidSettings.scheduleRepeatingNotification) {
      window.AndroidSettings.scheduleRepeatingNotification(_ms);
    } else {
      window.location.href = 'habitnotify://schedule?interval=' + _ms;
    }
    el.textContent = '';
    return;
  }
  const totalSec = Math.floor(remaining / 1000);
  const s = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const m = totalMin % 60;
  const totalHr = Math.floor(totalMin / 60);
  const h = totalHr % 24;
  const d = Math.floor(totalHr / 24);
  const parts = [];
  if (d) parts.push(d + 'd');
  if (h) parts.push(h + 'h');
  if (m) parts.push(m + 'm');
  parts.push(s + 's');
  el.textContent = 'Enables in: ' + parts.join(' ');
}

setInterval(() => {
  const until = parseInt(localStorage.getItem('_notifOffUntil') || '0');
  if (until && Date.now() >= until && localStorage.getItem('_notifEnabled') !== 'true') {
    localStorage.setItem('_notifEnabled', 'true');
    localStorage.removeItem('_notifOffUntil');
    _notifUpdateToggleUI();
    if (window._notifReschedule) window._notifReschedule();
    const _s2 = JSON.parse(localStorage.getItem('_notifSettings') || '{}');
    const _ms2 = (
      (_s2.years   || 0) * 365 * 24 * 60 * 60 * 1000 +
      (_s2.days    || 0) * 24 * 60 * 60 * 1000 +
      (_s2.hours   || 0) * 60 * 60 * 1000 +
      (_s2.minutes || 0) * 60 * 1000 +
      (_s2.seconds || 0) * 1000
    ) || 60 * 60 * 1000;
    if (window.AndroidSettings && window.AndroidSettings.scheduleRepeatingNotification) {
      window.AndroidSettings.scheduleRepeatingNotification(_ms2);
    } else {
      window.location.href = 'habitnotify://schedule?interval=' + _ms2;
    }
  }
  _notifTickCountdown();
}, 1000);

window.notifToggle = function() {
  const enabled = localStorage.getItem('_notifEnabled') === 'true';
  if (enabled) {
    localStorage.setItem('_notifEnabled', 'false');
    localStorage.removeItem('_notifOffUntil');
    if (window._notifReschedule) window._notifReschedule();
    if (window.AndroidSettings && window.AndroidSettings.scheduleRepeatingNotification) {
      window.AndroidSettings.scheduleRepeatingNotification(0);
    } else {
      window.location.href = 'habitnotify://schedule?interval=0';
    }
  } else {
    localStorage.setItem('_notifEnabled', 'true');
    localStorage.removeItem('_notifOffUntil');
    if (window._notifReschedule) window._notifReschedule();
    const s = JSON.parse(localStorage.getItem('_notifSettings') || '{}');
    const intervalMs = (
      (s.years   || 0) * 365 * 24 * 60 * 60 * 1000 +
      (s.days    || 0) * 24 * 60 * 60 * 1000 +
      (s.hours   || 0) * 60 * 60 * 1000 +
      (s.minutes || 0) * 60 * 1000 +
      (s.seconds || 0) * 1000
    ) || 60 * 60 * 1000;
    if (window.AndroidSettings && window.AndroidSettings.scheduleRepeatingNotification) {
      window.AndroidSettings.scheduleRepeatingNotification(intervalMs);
    } else {
      window.location.href = 'habitnotify://schedule?interval=' + intervalMs;
    }
  }
  _notifUpdateToggleUI();
  _notifTickCountdown();
};

window.notifSetOffTimer = function() {
  const g = id => { const el = document.getElementById(id); return el ? (parseInt(el.value) || 0) : 0; };
  const ms = (
    g('notif-off-years') * 365 * 24 * 60 * 60 * 1000 +
    g('notif-off-days')  * 24 * 60 * 60 * 1000 +
    g('notif-off-hours') * 60 * 60 * 1000 +
    g('notif-off-mins')  * 60 * 1000 +
    g('notif-off-secs')  * 1000
  );
  if (!ms) { window.notifSetOffForever(); return; }
  localStorage.setItem('_notifOffUntil', String(Date.now() + ms));
  _notifTickCountdown();
};

window.notifSetOffForever = function() {
  localStorage.removeItem('_notifOffUntil');
  _notifTickCountdown();
};

window.notifMarkDone = function(dateKey, done) {
  if (window.AndroidSettings && window.AndroidSettings.markHabitDone) {
    window.AndroidSettings.markHabitDone(dateKey, done);
  }
};

window.notifSendTest = async function() {
  const btn = document.getElementById('notif-send-test-btn');
  if (btn) { btn.textContent = 'Sent'; btn.disabled = true; setTimeout(() => { btn.textContent = 'Send Test'; btn.disabled = false; }, 1500); }
  if (window.AndroidSettings && window.AndroidSettings.showNotification) {
    window.AndroidSettings.showNotification('Habit Tracker', 'Test notification.');
  } else {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification('Habit Tracker', { body: 'Test notification.', icon: './icon-192.png', vibrate: [200], tag: 'habit-reminder' });
    } catch(e) {}
  }
};











