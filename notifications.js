// @version 1544
function _localNotifFetch(path) { fetch('http://localhost:8765' + path).catch(() => {}); }
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
  function _notifTrackerPrefix() {
    try {
      const cfg = typeof TRACKER_CONFIGS !== 'undefined' ? TRACKER_CONFIGS.find(c => c.hasSets) : null;
      return cfg ? cfg.id + ':' : 'pushups:';
    } catch { return 'pushups:'; }
  }
  function isPushupsDone() {
  try {
    const raw = localStorage.getItem(_notifTrackerPrefix() + todayStr());
    if (!raw) return false;
    const data = JSON.parse(raw);
    const target = getNotifSettings().targetReps || 0;
    if (target === 0) return false;
    const total = Array.isArray(data.sets) ? data.sets.reduce((a, b) => a + (b || 0), 0) : 0;
    return total >= target;
  } catch {}
  return false;
}
function _notifSyncDone() {
  try {
    const ds = todayStr();
    const raw = localStorage.getItem(_notifTrackerPrefix() + ds);
    const target = getNotifSettings().targetReps || 0;
    let done = false;
    if (target > 0 && raw) {
      const data = JSON.parse(raw);
      const total = Array.isArray(data.sets) ? data.sets.reduce((a, b) => a + (b || 0), 0) : 0;
      done = total >= target;
    }
    if (window.notifMarkDone) window.notifMarkDone(ds, done);
    return done;
  } catch {}
  return false;
}
  async function notify() {
    if (localStorage.getItem('_notifEnabled') !== 'true') return;
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
  window._notifSyncDone = _notifSyncDone;
  window.notifDebugRefresh = function() {
    const el = document.getElementById('notif-debug-output');
    if (!el) return;
    const ds = todayStr();
    const prefix = _notifTrackerPrefix();
    const key = prefix + ds;
    const raw = localStorage.getItem(key);
    const target = getNotifSettings().targetReps || 0;
    let total = 0;
    let setsStr = '(no data)';
    if (raw) {
      try {
        const data = JSON.parse(raw);
        const sets = Array.isArray(data.sets) ? data.sets : [];
        total = sets.reduce((a, b) => a + (b || 0), 0);
        setsStr = '[' + sets.map(v => (v === null || v === undefined) ? '-' : v).join(', ') + ']';
      } catch { setsStr = '(parse error)'; }
    }
    const done = target > 0 && total >= target;
    el.innerHTML =
      '<span style="color:#666;">key:</span> <span style="color:#aaa;font-family:monospace;">' + key + '</span><br>' +
      '<span style="color:#666;">sets:</span> <span style="color:#aaa;font-family:monospace;">' + setsStr + '</span><br>' +
      '<span style="color:#666;">total:</span> <span style="color:#aaa;">' + total +
      '</span>  <span style="color:#666;">target:</span> <span style="color:#aaa;">' + target + '</span><br>' +
      '<span style="color:#666;">done (JS):</span> <span style="color:' + (done ? '#99ff99' : '#ff9999') + ';">' + done + '</span>';
  };
  window._notifReschedule = function() {
    if (_notifInterval) clearInterval(_notifInterval);
    schedule();
  };
  setTimeout(() => { _notifSyncDone(); }, 3000);
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
  if (window._notifSyncDone) window._notifSyncDone();
  if (window._notifReschedule) window._notifReschedule();
  const intervalMs = (
    (s.years   || 0) * 365 * 24 * 60 * 60 * 1000 +
    (s.days    || 0) * 24 * 60 * 60 * 1000 +
    (s.hours   || 0) * 60 * 60 * 1000 +
    (s.minutes || 0) * 60 * 1000 +
    (s.seconds || 0) * 1000
    ) || 60 * 60 * 1000;
  if (localStorage.getItem('_notifEnabled') === 'true') {
    if (window.AndroidSettings && window.AndroidSettings.scheduleRepeatingNotification) {
      window.AndroidSettings.scheduleRepeatingNotification(intervalMs);
    } else {
      _localNotifFetch('/schedule?interval=' + intervalMs + '&enabled=1');
    }
  }
  console.log('[notif] scheduling interval ms:', intervalMs);
  setTimeout(_notifRefreshNextFire, 800);
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
  _notifRefreshNextFire();
  if (window.notifDebugRefresh) window.notifDebugRefresh();
  if (window.notifLoadSoundName) window.notifLoadSoundName();
  const btn = document.getElementById('notif-save-schedule-btn');
  if (btn) btn.textContent = 'Saved';
  const _until = parseInt(localStorage.getItem('_notifOffUntil') || '0');
  _ndtBuild();
  if (_until > Date.now()) {
    _notifTargetMs = _until;
    _notifDateSource = 'tumbler';
    _ndtSetDate(new Date(_until));
    _ndtRender();
    _ndtSyncDurationFields();
  } else {
    _notifTargetMs = 0;
    _notifDateSource = null;
    _ndtSetDate(new Date(Date.now() + 60 * 60 * 1000));
    _ndtRender();
  }
  _notifUpdateInputColors();
};
let _notifNextFireMs = 0;
function _notifRefreshNextFire() {
  if (window.AndroidSettings && window.AndroidSettings.getNextFireTime) {
    try { _notifNextFireMs = Number(window.AndroidSettings.getNextFireTime()); } catch(e) { _notifNextFireMs = 0; }
    _notifUpdateNextFireDisplay();
    return;
  }
  fetch('http://localhost:8765/nextfiretime')
    .then(r => r.text())
    .then(t => { _notifNextFireMs = Number(t) || 0; _notifUpdateNextFireDisplay(); })
    .catch(() => { _notifNextFireMs = 0; _notifUpdateNextFireDisplay(); });
}
function _notifUpdateNextFireDisplay() {
  const el = document.getElementById('notif-next-fire-display');
  if (!el) return;
  const enabled = localStorage.getItem('_notifEnabled') === 'true';
  if (!enabled || !_notifNextFireMs) { el.textContent = ''; return; }
  const remaining = _notifNextFireMs - Date.now();
  if (remaining <= 0) { el.textContent = 'Firing soon...'; return; }
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
  el.textContent = 'Next notification in: ' + parts.join(' ');
}
function _notifUpdateToggleUI() {
  const enabled = localStorage.getItem('_notifEnabled') === 'true';
  const wrap  = document.getElementById('notif-toggle-wrap');
  const switchEl  = document.getElementById('notif-toggle-switch');
  const offWrap = document.getElementById('notif-off-wrap');
  const _onBg      = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleOnBg     || '#1a5a1aFF') : '#1a5a1a';
  const _offBg     = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleOffBg    || '#333333FF') : '#333';
  const _switchOn    = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleSwitchOn   || '#99ff99FF') : '#99ff99';
  const _switchOff   = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleSwitchOff  || '#666666FF') : '#666';
  const _borderOn  = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleBorderOn || '#2a7a2aFF') : '#2a7a2a';
  const _borderOff = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleBorderOff|| '#555555FF') : '#555';
  if (wrap)    { wrap.style.background = enabled ? _onBg : _offBg; wrap.style.borderColor = enabled ? _borderOn : _borderOff; }
  if (switchEl)    { switchEl.style.left = enabled ? '27px' : '3px'; switchEl.style.background = enabled ? _switchOn : _switchOff; }
  if (offWrap) { offWrap.style.display = enabled ? 'none' : 'flex'; }
  const labelEl = document.getElementById('notif-enabled-label');
  if (labelEl) labelEl.textContent = 'Notifications: ' + (enabled ? 'ON' : 'OFF');
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
      _localNotifFetch('/schedule?interval=' + _ms + '&enabled=1');
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
      _localNotifFetch('/schedule?interval=' + _ms2 + '&enabled=1');
    }
    _notifTargetMs = 0; _notifDateSource = null;
  }
  _notifTickCountdown();
  _notifUpdateNextFireDisplay();
  if (_notifTargetMs > 0 && _notifTumblerBuilt) {
    if (_notifDateSource === 'duration') {
      const _gi = id => { const el = document.getElementById(id); return el ? (parseInt(el.value) || 0) : 0; };
      const _msi = (
        _gi('notif-off-years') * 365 * 24 * 60 * 60 * 1000 +
        _gi('notif-off-days')  * 24 * 60 * 60 * 1000 +
        _gi('notif-off-hours') * 60 * 60 * 1000 +
        _gi('notif-off-mins')  * 60 * 1000 +
        _gi('notif-off-secs')  * 1000
      );
      if (_msi > 0) { _notifTargetMs = Date.now() + _msi; _ndtSetDate(new Date(_notifTargetMs)); _ndtRender(); }
    } else if (_notifDateSource === 'tumbler') {
      _ndtSyncDurationFields();
    }
  }
}, 1000);
window.notifToggle = function() {
  const enabled = localStorage.getItem('_notifEnabled') === 'true';
  if (enabled) {
    localStorage.setItem('_notifEnabled', 'false');
    localStorage.removeItem('_notifOffUntil');
    if (window._notifReschedule) window._notifReschedule();
    if (window.AndroidSettings && window.AndroidSettings.setNotifEnabled) {
      window.AndroidSettings.setNotifEnabled(false);
    }
    if (window.AndroidSettings && window.AndroidSettings.scheduleRepeatingNotification) {
      window.AndroidSettings.scheduleRepeatingNotification(0);
    } else {
      _localNotifFetch('/schedule?interval=0&enabled=0');
    }
  } else {
    localStorage.setItem('_notifEnabled', 'true');
    localStorage.removeItem('_notifOffUntil');
    if (window._notifReschedule) window._notifReschedule();
    if (window.AndroidSettings && window.AndroidSettings.setNotifEnabled) {
      window.AndroidSettings.setNotifEnabled(true);
    }
    if (window._notifSyncDone) window._notifSyncDone();
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
      _localNotifFetch('/schedule?interval=' + intervalMs + '&enabled=1');
    }
  }
  _notifUpdateToggleUI();
  _notifTickCountdown();
  setTimeout(_notifRefreshNextFire, 800);
};
window.notifSetOffTimer = function() {
  let ms;
  if (_notifTargetMs > 0) {
    ms = _notifTargetMs - Date.now();
  } else {
    const g = id => { const el = document.getElementById(id); return el ? (parseInt(el.value) || 0) : 0; };
    ms = (
      g('notif-off-years') * 365 * 24 * 60 * 60 * 1000 +
      g('notif-off-days')  * 24 * 60 * 60 * 1000 +
      g('notif-off-hours') * 60 * 60 * 1000 +
      g('notif-off-mins')  * 60 * 1000 +
      g('notif-off-secs')  * 1000
    );
  }
  if (!ms || ms <= 0) { window.notifSetOffForever(); return; }
  localStorage.setItem('_notifOffUntil', String(Date.now() + ms));
  _notifTickCountdown();
};
window.notifSetOffForever = function() {
  localStorage.removeItem('_notifOffUntil');
  _notifTargetMs = 0;
  _notifDateSource = null;
  ['notif-off-years','notif-off-days','notif-off-hours','notif-off-mins','notif-off-secs']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = 0; });
  if (_notifTumblerBuilt) { _ndtSetDate(new Date(Date.now() + 60 * 60 * 1000)); _ndtRender(); }
  _notifUpdateInputColors();
  _notifTickCountdown();
};
function _notifUpdateInputColors() {
  const _ids = ['notif-off-years','notif-off-days','notif-off-hours','notif-off-mins','notif-off-secs'];
  const _allZero = _ids.every(id => { const el = document.getElementById(id); return !el || !(parseInt(el.value) || 0); });
  const _col = _allZero ? '#555' : '#fff';
  _ids.forEach(id => { const el = document.getElementById(id); if (el) el.style.color = _col; });
}
// ── Notification date tumbler ──────────────────────────────
let _notifTargetMs = 0;
let _notifDateSource = null;
let _notifTumblerBuilt = false;
const _NDT_DAYS   = Array.from({length:31}, (_,i) => String(i+1));
const _NDT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const _NDT_YEARS  = Array.from({length:16}, (_,i) => String(new Date().getFullYear() + i));
const _NDT_HOURS  = ['12','1','2','3','4','5','6','7','8','9','10','11'];
const _NDT_MINS   = Array.from({length:60}, (_,i) => String(i).padStart(2,'0'));
const _NDT_SECS   = Array.from({length:60}, (_,i) => String(i).padStart(2,'0'));
const _NDT_AMPM   = ['am','pm'];
const _NDT_COLS   = [
  {key:'day',   opts:_NDT_DAYS,   label:'Day'},
  {key:'month', opts:_NDT_MONTHS, label:'Month'},
  {key:'year',  opts:_NDT_YEARS,  label:'Year'},
  {key:'hour',  opts:_NDT_HOURS,  label:'Hour'},
  {key:'min',   opts:_NDT_MINS,   label:'Min'},
  {key:'sec',   opts:_NDT_SECS,   label:'Sec'},
  {key:'ampm',  opts:_NDT_AMPM,   label:''},
];
const _ndtIdx = {day:0, month:0, year:0, hour:0, min:0, sec:0, ampm:0};
function _ndtGetDate() {
  const day  = parseInt(_NDT_DAYS[_ndtIdx.day]);
  const month = _ndtIdx.month;
  const year  = parseInt(_NDT_YEARS[_ndtIdx.year]);
  let hour    = parseInt(_NDT_HOURS[_ndtIdx.hour]);
  const min   = _ndtIdx.min;
  const sec   = _ndtIdx.sec;
  const isPm  = _ndtIdx.ampm === 1;
  if (isPm && hour !== 12) hour += 12;
  if (!isPm && hour === 12) hour = 0;
  return new Date(year, month, day, hour, min, sec, 0);
}
function _ndtSetDate(date) {
  const day   = date.getDate();
  const month = date.getMonth();
  const year  = date.getFullYear();
  let hour    = date.getHours();
  const min   = date.getMinutes();
  const sec   = date.getSeconds();
  const isPm  = hour >= 12;
  let hour12  = hour % 12;
  if (hour12 === 0) hour12 = 12;
  _ndtIdx.day   = Math.max(0, Math.min(30, day - 1));
  _ndtIdx.month = month;
  const yearIdx = _NDT_YEARS.indexOf(String(year));
  _ndtIdx.year  = yearIdx >= 0 ? yearIdx : 0;
  const hourIdx = _NDT_HOURS.indexOf(String(hour12));
  _ndtIdx.hour  = hourIdx >= 0 ? hourIdx : 0;
  _ndtIdx.min   = Math.max(0, Math.min(59, min));
  _ndtIdx.sec   = Math.max(0, Math.min(59, sec));
  _ndtIdx.ampm  = isPm ? 1 : 0;
}
function _ndtRender() {
  const wrap = document.getElementById('notif-date-tumbler-wrap');
  if (!wrap) return;
  _NDT_COLS.forEach((col, ci) => {
    const win = wrap.querySelector(`.tumb-col[data-ci="${ci}"] .tumb-window`);
    if (!win) return;
    win.innerHTML = '';
    const opts = col.opts;
    const sel  = _ndtIdx[col.key];
    const prev = (sel - 1 + opts.length) % opts.length;
    const next = (sel + 1) % opts.length;
    const aUp    = document.createElement('div'); aUp.className    = 'tumb-arrow';         aUp.textContent    = '▲';
    const elPrev = document.createElement('div'); elPrev.className = 'tumb-item tumb-adj'; elPrev.textContent = opts[prev];
    const elSel  = document.createElement('div'); elSel.className  = 'tumb-item tumb-sel'; elSel.textContent  = opts[sel];
    const elNext = document.createElement('div'); elNext.className = 'tumb-item tumb-adj'; elNext.textContent = opts[next];
    const aDown  = document.createElement('div'); aDown.className  = 'tumb-arrow';         aDown.textContent  = '▼';
    win.append(aUp, elPrev, elSel, elNext, aDown);
  });
  }
function _ndtSyncDurationFields() {
  const remaining = _notifTargetMs - Date.now();
  const _ids = ['notif-off-years','notif-off-days','notif-off-hours','notif-off-mins','notif-off-secs'];
  if (remaining <= 0) {
    _ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = 0; });
    _notifUpdateInputColors(); return;
  }
  let rem    = Math.floor(remaining / 1000);
  const secs  = rem % 60;  rem = Math.floor(rem / 60);
  const mins  = rem % 60;  rem = Math.floor(rem / 60);
  const hours = rem % 24;  rem = Math.floor(rem / 24);
  const years = Math.floor(rem / 365);
  const days  = rem % 365;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  set('notif-off-years', years); set('notif-off-days', days);
  set('notif-off-hours', hours); set('notif-off-mins', mins); set('notif-off-secs', secs);
  _notifUpdateInputColors();
}
function _ndtSetupColDrag(win, ci, key) {
  let startY = null, lastY = null, accumY = 0, moved = false;
  const STEP = 28;
  function step(dir) {
    const opts = _NDT_COLS[ci].opts;
    _ndtIdx[key] = (_ndtIdx[key] + dir + opts.length) % opts.length;
    _ndtRender();
    _notifDateSource = 'tumbler';
    _notifTargetMs = _ndtGetDate().getTime();
    _ndtSyncDurationFields();
  }
  win.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation();
    win.setPointerCapture(e.pointerId);
    startY = e.clientY; lastY = e.clientY; accumY = 0; moved = false;
  });
  win.addEventListener('pointermove', e => {
    if (startY === null) return;
    const dy = lastY - e.clientY;
    if (Math.abs(e.clientY - startY) > 4) moved = true;
    accumY += dy; lastY = e.clientY;
    while (accumY >= STEP)  { accumY -= STEP; step(1); }
    while (accumY <= -STEP) { accumY += STEP; step(-1); }
  });
  win.addEventListener('pointerup', e => {
    if (!moved) { const rect = win.getBoundingClientRect(); step(e.clientY < rect.top + rect.height / 2 ? -1 : 1); }
    startY = null; lastY = null; accumY = 0; moved = false;
  });
  win.addEventListener('pointercancel', () => { startY = null; lastY = null; accumY = 0; moved = false; });
}
let _ndtTickInterval = null;
function _ndtBuild() {
  const wrap = document.getElementById('notif-date-tumbler-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  if (_ndtTickInterval) { clearInterval(_ndtTickInterval); _ndtTickInterval = null; }
  const lbl = document.createElement('div');
  lbl.style.cssText = 'font-size:11px;color:#666;margin-bottom:4px;';
  lbl.textContent = 'or pick date/time:';
  wrap.appendChild(lbl);
  const grid = document.createElement('div');
  grid.className = 'tumb-grid';
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:0;' +
    'border:1px solid #444;border-radius:6px;overflow:hidden;margin:0;';
  _NDT_COLS.forEach((col, ci) => {
    const colEl = document.createElement('div');
    colEl.className = 'tumb-col'; colEl.dataset.ci = ci; colEl.dataset.key = col.key;
    const colLbl = document.createElement('div');
    colLbl.className = 'tumb-col-label'; colLbl.textContent = col.label;
    colEl.appendChild(colLbl);
    const win = document.createElement('div'); win.className = 'tumb-window';
    colEl.appendChild(win);
    grid.appendChild(colEl);
    _ndtSetupColDrag(win, ci, col.key);
  });
  wrap.appendChild(grid);
  _notifTumblerBuilt = true;
  _ndtRender();
  _ndtTickInterval = setInterval(() => {
    if (_notifDateSource === 'duration') return;
    _ndtIdx.sec = (_ndtIdx.sec + 1) % 60;
    if (_ndtIdx.sec === 0) {
      _ndtIdx.min = (_ndtIdx.min + 1) % 60;
      if (_ndtIdx.min === 0) {
        _ndtIdx.hour = (_ndtIdx.hour + 1) % 12;
        if (_ndtIdx.hour === 0) _ndtIdx.ampm = (_ndtIdx.ampm + 1) % 2;
      }
    }
    if (_notifDateSource === 'tumbler') {
      _notifTargetMs = _ndtGetDate().getTime();
      _ndtSyncDurationFields();
    }
    _ndtRender();
  }, 1000);
}
window.notifSyncDateFromDuration = function() {
  _notifDateSource = 'duration';
  _notifUpdateInputColors();
  const g = id => { const el = document.getElementById(id); return el ? (parseInt(el.value) || 0) : 0; };
  const ms = (
    g('notif-off-years') * 365 * 24 * 60 * 60 * 1000 +
    g('notif-off-days')  * 24 * 60 * 60 * 1000 +
    g('notif-off-hours') * 60 * 60 * 1000 +
    g('notif-off-mins')  * 60 * 1000 +
    g('notif-off-secs')  * 1000
  );
  if (ms <= 0) { _notifTargetMs = 0; return; }
  _notifTargetMs = Date.now() + ms;
  if (_notifTumblerBuilt) { _ndtSetDate(new Date(_notifTargetMs)); _ndtRender(); }
};
window.notifSyncDurationFromDate = function() {};
let _notifMarkDoneLast = { date: null, done: null };
window.notifMarkDone = function(dateKey, done) {
  if (window.AndroidSettings && window.AndroidSettings.markHabitDone) {
    try { window.AndroidSettings.markHabitDone(dateKey, done); } catch (e) {}
    return;
  }
  const _syncKey = '_nmdSync_' + dateKey;
  const _lastSynced = localStorage.getItem(_syncKey);
  const _doneVal = done ? '1' : '0';
  const _needsSync = (done && _lastSynced !== '1') || (!done && _lastSynced === '1');
  if (!_needsSync) return;
  if (dateKey === _notifMarkDoneLast.date && done === _notifMarkDoneLast.done) return;
  _notifMarkDoneLast = { date: dateKey, done: done };
  localStorage.setItem(_syncKey, _doneVal);
  _localNotifFetch('/markdone?date=' + encodeURIComponent(dateKey) + '&done=' + _doneVal);
};
window.notifLoadSoundName = function() {
  const nameEl = document.getElementById('notif-sound-name');
  if (!nameEl) return;
  if (window.AndroidSettings && window.AndroidSettings.getNotifSound) {
    try {
      const s = JSON.parse(window.AndroidSettings.getNotifSound());
      nameEl.textContent = s.name || 'Default';
    } catch(e) { nameEl.textContent = 'Default'; }
  } else {
    fetch('http://localhost:8765/currentsound')
      .then(r => r.json())
      .then(s => { nameEl.textContent = s.name || 'Default'; })
      .catch(() => { nameEl.textContent = 'Default'; });
  }
};
window.notifOpenSoundPicker = async function() {
  let soundList;
  let currentUri = '';
  if (window.AndroidSettings && window.AndroidSettings.getNotifSoundList) {
    try { soundList = JSON.parse(window.AndroidSettings.getNotifSoundList()); }
    catch(e) { alert('Could not load sounds.'); return; }
    try { const _cur = JSON.parse(window.AndroidSettings.getNotifSound()); currentUri = _cur.uri || ''; } catch(e) {}
  } else {
    try {
      const [_lr, _cr] = await Promise.all([
        fetch('http://localhost:8765/sounds'),
        fetch('http://localhost:8765/currentsound')
      ]);
      soundList = await _lr.json();
      const _cur = await _cr.json();
      currentUri = _cur.uri || '';
    } catch(e) { alert('Could not load sounds.'); return; }
  }
  let selectedUri = currentUri;
  let selectedName = 'None';
  soundList.forEach(function(s) { if (s.uri === currentUri) selectedName = s.name; });
  const overlay = document.createElement('div');
  overlay.style.cssText =
    'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:99999;display:flex;align-items:center;justify-content:center;';
  const box = document.createElement('div');
  box.style.cssText =
    'background:#1c1c1c;border:1px solid #555;border-radius:10px;padding:20px;width:90%;max-width:400px;' +
    'display:flex;flex-direction:column;gap:12px;box-sizing:border-box;max-height:80vh;';
  const titleEl = document.createElement('div');
  titleEl.textContent = 'Notification Sound';
  titleEl.style.cssText = 'font-size:15px;color:#fff;font-weight:600;flex-shrink:0;';
  const list = document.createElement('div');
  list.style.cssText = 'overflow-y:auto;display:flex;flex-direction:column;gap:2px;flex:1;min-height:0;';
  soundList.forEach(function(sound) {
    const isSelected = sound.uri === currentUri;
    const item = document.createElement('div');
    item.dataset.uri = sound.uri;
    item.dataset.name = sound.name;
    item.style.cssText =
      'padding:10px 12px;border-radius:6px;cursor:pointer;font-size:13px;color:#fff;' +
      'display:flex;align-items:center;gap:10px;' +
      'background:' + (isSelected ? '#1a2a3a' : 'transparent') + ';' +
      'border:1px solid ' + (isSelected ? '#4488cc' : 'transparent') + ';';
    const dot = document.createElement('div');
    dot.style.cssText =
      'width:8px;height:8px;border-radius:50%;flex-shrink:0;background:' + (isSelected ? '#99ccff' : '#555') + ';';
    const nameSpan = document.createElement('span');
    nameSpan.textContent = sound.name;
    nameSpan.style.flex = '1';
    item.appendChild(dot);
    item.appendChild(nameSpan);
    item.addEventListener('click', function() {
      Array.from(list.children).forEach(function(el) {
        el.style.background = 'transparent';
        el.style.borderColor = 'transparent';
        const d = el.querySelector('div');
        if (d) d.style.background = '#555';
      });
      item.style.background = '#1a2a3a';
      item.style.borderColor = '#4488cc';
      dot.style.background = '#99ccff';
      selectedUri = sound.uri;
      selectedName = sound.name;
      if (window.AndroidSettings && window.AndroidSettings.previewNotifSound) {
        window.AndroidSettings.previewNotifSound(sound.uri);
      } else {
        fetch('http://localhost:8765/previewsound?uri=' + encodeURIComponent(sound.uri)).catch(() => {});
      }
    });
    list.appendChild(item);
  });
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:8px;flex-shrink:0;';
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText =
    'flex:1;padding:9px 0;background:#333;color:#ccc;border:none;border-radius:4px;cursor:pointer;font-size:13px;';
  cancelBtn.onclick = function() {
    if (window.AndroidSettings && window.AndroidSettings.stopNotifSoundPreview) {
      window.AndroidSettings.stopNotifSoundPreview();
    } else {
      fetch('http://localhost:8765/stoppreview').catch(() => {});
    }
    document.body.removeChild(overlay);
  };
  const selectBtn = document.createElement('button');
  selectBtn.textContent = 'Select';
  selectBtn.style.cssText =
    'flex:1;padding:9px 0;background:#1a3a1a;color:#99ff99;border:none;border-radius:4px;cursor:pointer;font-size:13px;';
  selectBtn.onclick = function() {
    if (window.AndroidSettings && window.AndroidSettings.stopNotifSoundPreview) {
      window.AndroidSettings.stopNotifSoundPreview();
    } else {
      fetch('http://localhost:8765/stoppreview').catch(() => {});
    }
    if (window.AndroidSettings && window.AndroidSettings.setNotifSound) {
      window.AndroidSettings.setNotifSound(selectedUri, selectedName);
    } else {
      fetch('http://localhost:8765/setsound?uri=' + encodeURIComponent(selectedUri) + '&name=' + encodeURIComponent(selectedName)).catch(() => {});
    }
    const nameEl = document.getElementById('notif-sound-name');
    if (nameEl) nameEl.textContent = selectedName || 'None';
    document.body.removeChild(overlay);
  };
  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(selectBtn);
  box.appendChild(titleEl);
  box.appendChild(list);
  box.appendChild(btnRow);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  let _found = null;
  Array.from(list.children).forEach(function(el) { if (el.dataset.uri === currentUri) _found = el; });
  if (_found) setTimeout(function() { _found.scrollIntoView({ block: 'center', behavior: 'instant' }); }, 80);
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

