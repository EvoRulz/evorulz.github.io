// @version 1589
function _localNotifFetch(path) { fetch('http://localhost:8765' + path).catch(() => {}); }
window._notifMasterEnabled = function() {
  return localStorage.getItem('_notifEnabled') !== 'false';
};
(function() {
  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  function _notifDefaultSchedule() {
    return {
      enabled: false,
      column: 'status',
      statusValue: 'yes',
      threshold: 0,
      years: 0, days: 0, hours: 1, minutes: 0, seconds: 0,
      startOffset: { years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 },
      offUntil: 0,
      soundUri: '', soundName: 'Default',
      autoTarget: { enabled: false, step: 0, cap: 0, lastApplied: '' },
    };
  }
  function _notifGetAllSchedules() {
    try {
      const s = JSON.parse(localStorage.getItem('_notifSchedules'));
      if (s && typeof s === 'object') return s;
    } catch {}
    return {};
  }
  function getSchedule(habitId) {
    const all = _notifGetAllSchedules();
    return Object.assign({}, _notifDefaultSchedule(), all[habitId] || {});
  }
  function saveSchedule(habitId, patch) {
    const all = _notifGetAllSchedules();
    all[habitId] = Object.assign({}, _notifDefaultSchedule(), all[habitId] || {}, patch);
    localStorage.setItem('_notifSchedules', JSON.stringify(all));
    return all[habitId];
  }
  function _notifIntervalMsFor(sched) {
    return (
      (sched.years   || 0) * 365 * 24 * 60 * 60 * 1000 +
      (sched.days    || 0) * 24 * 60 * 60 * 1000 +
      (sched.hours   || 0) * 60 * 60 * 1000 +
      (sched.minutes || 0) * 60 * 1000 +
      (sched.seconds || 0) * 1000
      ) || 60 * 60 * 1000;
  }
  function _notifStartOffsetMsFor(sched) {
    const s = sched.startOffset || {};
    return (
      (s.years   || 0) * 365 * 24 * 60 * 60 * 1000 +
      (s.days    || 0) * 24 * 60 * 60 * 1000 +
      (s.hours   || 0) * 60 * 60 * 1000 +
      (s.minutes || 0) * 60 * 1000 +
      (s.seconds || 0) * 1000
    );
  }
  function isHabitDone(habitId, dateKey) {
    const cfg = typeof TRACKER_CONFIGS !== 'undefined' ? TRACKER_CONFIGS.find(c => c.id === habitId) : null;
    if (!cfg) return false;
    const sched = getSchedule(habitId);
    const raw = localStorage.getItem(habitId + ':' + dateKey);
    if (!raw) return false;
    let data;
    try { data = JSON.parse(raw); } catch { return false; }
    if (sched.column === 'status') return data.status === (sched.statusValue || 'yes');
    if (!cfg.hasSets) return false;
    const sets = Array.isArray(data.sets) ? data.sets : [];
    if (sched.column === 'total') {
      const total = sets.reduce((a, b) => a + (b || 0), 0);
      return (sched.threshold || 0) > 0 && total >= sched.threshold;
    }
    if (sched.column && sched.column.indexOf('set:') === 0) {
      const idx = parseInt(sched.column.slice(4), 10) - 1;
      const val = sets[idx] || 0;
      return (sched.threshold || 0) > 0 && val >= sched.threshold;
    }
    return false;
  }
  function _notifSyncDoneFor(habitId, dateKey) {
    const done = isHabitDone(habitId, dateKey);
    if (window.notifMarkDone) window.notifMarkDone(habitId, dateKey, done);
    return done;
  }
  function _notifSyncAllDone() {
    const ds = todayStr();
    const all = _notifGetAllSchedules();
    Object.keys(all).forEach(habitId => { _notifSyncDoneFor(habitId, ds); });
  }
  async function notifyHabit(habitId) {
    if (!window._notifMasterEnabled()) return;
    const sched = getSchedule(habitId);
    if (!sched.enabled) return;
    const ds = todayStr();
    if (isHabitDone(habitId, ds)) return;
    const _n = new Date();
    const _msFromMidnight = (_n.getHours() * 3600 + _n.getMinutes() * 60 + _n.getSeconds()) * 1000;
    if (_msFromMidnight < _notifStartOffsetMsFor(sched)) return;
    const cfg = typeof TRACKER_CONFIGS !== 'undefined' ? TRACKER_CONFIGS.find(c => c.id === habitId) : null;
    const label = cfg ? cfg.label : habitId;
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification('Habit Tracker', {
        body: label + ' not done yet today.',
        icon: './icon-192.png',
        vibrate: [200],
        requireInteraction: false,
        tag: 'habit-reminder-' + habitId
      });
    } catch(e) {
      try {
        const a = document.createElement('a');
        a.href = 'habitnotify://notify?title=' + encodeURIComponent('Habit Tracker') + '&body=' + encodeURIComponent(label + ' not done yet today.');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch(e2) {}
    }
  }
  let _notifIntervals = {};
  function scheduleHabit(habitId) {
    if (_notifIntervals[habitId]) { clearInterval(_notifIntervals[habitId]); delete _notifIntervals[habitId]; }
    if (!window._notifMasterEnabled()) return;
    const sched = getSchedule(habitId);
    if (!sched.enabled) return;
    _notifIntervals[habitId] = setInterval(() => { notifyHabit(habitId); }, _notifIntervalMsFor(sched));
  }
  function scheduleAllHabits() {
    Object.keys(_notifIntervals).forEach(hid => clearInterval(_notifIntervals[hid]));
    _notifIntervals = {};
    const all = _notifGetAllSchedules();
    Object.keys(all).forEach(habitId => { if (all[habitId].enabled) scheduleHabit(habitId); });
  }
  function _applyAutoTargetAdjustFor(habitId) {
    const sched = getSchedule(habitId);
    const at = sched.autoTarget || {};
    if (!at.enabled || !at.step) return;
    const todayKey = todayStr();
    const lastApplied = at.lastApplied || '';
    if (!lastApplied) { saveSchedule(habitId, { autoTarget: Object.assign({}, at, { lastApplied: todayKey }) }); return; }
    if (lastApplied === todayKey) return;
    const lastDate = new Date(lastApplied + 'T00:00:00');
    const todayDate = new Date(todayKey + 'T00:00:00');
    const daysMissed = Math.round((todayDate - lastDate) / 86400000);
    if (daysMissed < 1) { saveSchedule(habitId, { autoTarget: Object.assign({}, at, { lastApplied: todayKey }) }); return; }
    let current = sched.threshold || 0;
    for (let i = 0; i < daysMissed; i++) {
      if (at.step > 0 && current >= at.cap) break;
      if (at.step < 0 && current <= at.cap) break;
      current = current + at.step;
      if (at.step > 0) current = Math.min(current, at.cap);
      if (at.step < 0) current = Math.max(current, at.cap);
    }
    saveSchedule(habitId, { threshold: current, autoTarget: Object.assign({}, at, { lastApplied: todayKey }) });
    if (window._notifUIRefresh) window._notifUIRefresh(habitId);
  }
  function _applyAutoTargetAdjust() {
    Object.keys(_notifGetAllSchedules()).forEach(habitId => _applyAutoTargetAdjustFor(habitId));
  }
  window._notifSyncDone = _notifSyncAllDone;
  window._notifGetSchedule = getSchedule;
  window._notifSaveSchedule = saveSchedule;
  window._notifIsHabitDone = isHabitDone;
  window._notifSyncDoneFor = _notifSyncDoneFor;
  window._notifScheduleHabit = scheduleHabit;
  window._notifScheduleAll = scheduleAllHabits;
  window._notifGetAllSchedules = _notifGetAllSchedules;
  window._notifApplyAutoTargetFor = _applyAutoTargetAdjustFor;
  window._notifFireNow = notifyHabit;
  window.notifDebugRefresh = function(habitId) {
    const el = document.getElementById('notif-debug-output');
    if (!el) return;
    if (!habitId && window._notifCurrentHabitId) habitId = window._notifCurrentHabitId();
    if (!habitId) { el.textContent = '(no habit selected)'; return; }
    const ds = todayStr();
    const key = habitId + ':' + ds;
    const raw = localStorage.getItem(key);
    const sched = getSchedule(habitId);
    let setsStr = '(no data)';
    let statusStr = '(no data)';
    if (raw) {
      try {
        const data = JSON.parse(raw);
        statusStr = data.status || '(blank)';
        const sets = Array.isArray(data.sets) ? data.sets : null;
        if (sets) setsStr = '[' + sets.map(v => (v === null || v === undefined) ? '-' : v).join(', ') + ']';
      } catch { setsStr = '(parse error)'; }
    }
    const done = isHabitDone(habitId, ds);
    el.innerHTML = `
      <span style="color:#666;">key:</span> <span style="color:#aaa;font-family:monospace;">${key}</span><br>
      <span style="color:#666;">status:</span> <span style="color:#aaa;font-family:monospace;">${statusStr}</span><br>
      <span style="color:#666;">sets:</span> <span style="color:#aaa;font-family:monospace;">${setsStr}</span><br>
      <span style="color:#666;">column:</span> <span style="color:#aaa;">${sched.column}</span>
      <span style="color:#666;">threshold:</span> <span style="color:#aaa;">${sched.threshold}</span><br>
      <span style="color:#666;">done (JS):</span> <span style="color:${done ? '#99ff99' : '#ff9999'};">${done}</span>`;
  };
  window._notifReschedule = function(habitId) {
    if (habitId) scheduleHabit(habitId); else scheduleAllHabits();
    var ids = habitId ? [habitId] : Object.keys(_notifGetAllSchedules());
    ids.forEach(function(hid) {
      var sched = getSchedule(hid);
      var cfg = typeof TRACKER_CONFIGS !== 'undefined' ? TRACKER_CONFIGS.find(function(c){ return c.id === hid; }) : null;
      var label = cfg ? cfg.label : hid;
      var effectiveEnabled = !!sched.enabled && window._notifMasterEnabled();
      if (window.AndroidSettings && window.AndroidSettings.setHabitSchedule) {
        window.AndroidSettings.setHabitSchedule(hid, _notifIntervalMsFor(sched), effectiveEnabled, label);
      } else {
        var _shQ = '/schedulehabit?habit=' + encodeURIComponent(hid) + '&interval=' + _notifIntervalMsFor(sched) +
          '&enabled=' + (effectiveEnabled ? '1' : '0') + '&label=' + encodeURIComponent(label);
        _localNotifFetch(_shQ);
      }
    });
    if (typeof _notifRefreshNextFire === 'function') _notifRefreshNextFire();
  };
  setTimeout(() => {
    _notifSyncAllDone();
    if (window._notifReschedule) window._notifReschedule();
    const all = _notifGetAllSchedules();
    Object.keys(all).forEach(habitId => {
      if (all[habitId].autoTarget && all[habitId].autoTarget.enabled) _applyAutoTargetAdjustFor(habitId);
    });
  }, 3000);
  setTimeout(() => {
    if (!('Notification' in window)) return;
    const all = _notifGetAllSchedules();
    let anyEnabled = false;
    Object.keys(all).forEach(habitId => {
      const sched = all[habitId];
      if (sched.offUntil && Date.now() >= sched.offUntil) saveSchedule(habitId, { enabled: true, offUntil: 0 });
      if (getSchedule(habitId).enabled) anyEnabled = true;
    });
    if (!anyEnabled) return;
    if (Notification.permission === 'granted') {
      scheduleAllHabits();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(p => { if (p === 'granted') scheduleAllHabits(); });
    }
  }, 10000);
})();
// ── Per-habit notification settings UI state ──────────────
let _notifSelectedHabitId = null;
window._notifCurrentHabitId = function() { return _notifSelectedHabitId; };
function _notifHabitDotColor(habitId) {
  const sched = window._notifGetSchedule(habitId);
  const onColor = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleSwitchOn || '#99ff99FF') : '#99ff99';
  const offColor = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleSwitchOff || '#666666FF') : '#666666';
  return sched.enabled ? onColor : offColor;
}
const _NOTIF_MINI_DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
function _notifBuildMiniSchedule(habitId) {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const masterOn = window._notifMasterEnabled();
  const sched = window._notifGetSchedule(habitId);
  const info = _notifWeekTicksFor(sched);
  const active = masterOn && sched.enabled;
  const todayIdx = (new Date().getDay() + 6) % 7;
  const wrap = document.createElement('div');
  wrap.dataset.habitMini = habitId;
  wrap.style.cssText = 'display:flex;flex-direction:column;gap:1px;width:100%;';
  _NOTIF_MINI_DAY_LABELS.forEach(function(dayLabel, dayIdx) {
    const isToday = dayIdx === todayIdx;
    const dayRow = document.createElement('div');
    dayRow.style.cssText = 'display:flex;align-items:center;gap:3px;';
    const label = document.createElement('div');
    label.textContent = dayLabel;
    label.style.cssText = 'width:8px;flex-shrink:0;font-size:7px;line-height:1;text-align:center;' +
      'color:' + (isToday ? '#fff' : '#777') + ';font-weight:' + (isToday ? '600' : '400') + ';';
    dayRow.appendChild(label);
    const bar = document.createElement('div');
    bar.style.cssText = 'position:relative;flex:1;height:4px;border-radius:1px;overflow:hidden;' +
      'background:' + (active ? '#111' : '#0a0a0a') + ';border:1px solid ' + (isToday ? '#666' : '#333') + ';';
    [6, 12, 18].forEach(function(h) {
      const grid = document.createElement('div');
      grid.style.cssText = 'position:absolute;top:0;bottom:0;left:' + (h / 24 * 100) + '%;width:1px;background:rgba(255,255,255,0.08);';
      bar.appendChild(grid);
    });
    if (active) {
      if (info.dense) {
        const band = document.createElement('div');
        band.style.cssText = 'position:absolute;top:0;bottom:0;left:' + (info.offsetMs / DAY_MS * 100) + '%;right:0;' +
          'background:repeating-linear-gradient(45deg,rgba(153,204,255,0.35),rgba(153,204,255,0.35) 1px,transparent 1px,transparent 2px);';
        bar.appendChild(band);
      } else {
        info.ticks.forEach(function(ms) {
          const tick = document.createElement('div');
          tick.style.cssText = 'position:absolute;top:0;bottom:0;left:' + (ms / DAY_MS * 100) + '%;width:1px;background:#99ccff;';
          bar.appendChild(tick);
        });
      }
      const offsetMark = document.createElement('div');
      offsetMark.style.cssText = 'position:absolute;top:0;bottom:0;left:' + (info.offsetMs / DAY_MS * 100) + '%;width:1px;background:#ffcc66;';
      bar.appendChild(offsetMark);
    }
    if (isToday) {
      const now = new Date();
      const msIntoDay = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) * 1000;
      const live = document.createElement('div');
      live.style.cssText = 'position:absolute;top:-1px;bottom:-1px;left:' + (msIntoDay / DAY_MS * 100) + '%;width:1px;' +
        'background:#ff5555;box-shadow:0 0 2px 1px rgba(255,85,85,0.8);z-index:2;';
      bar.appendChild(live);
    }
    dayRow.appendChild(bar);
    wrap.appendChild(dayRow);
  });
  return wrap;
}
window._notifRefreshHabitDots = function() {
  document.querySelectorAll('#notif-habit-dropdown-list [data-habit-dot]').forEach(function(dot) {
    dot.style.background = _notifHabitDotColor(dot.dataset.habitDot);
  });
  const trigDot = document.getElementById('notif-habit-trigger-dot');
  if (trigDot && _notifSelectedHabitId) trigDot.style.background = _notifHabitDotColor(_notifSelectedHabitId);
};
function _notifBuildHabitDropdownRows() {
  const list = document.getElementById('notif-habit-dropdown-list');
  if (!list || typeof TRACKER_CONFIGS === 'undefined') return;
  list.innerHTML = '';
  TRACKER_CONFIGS.forEach(function(cfg) {
    const row = document.createElement('div');
    const isSel = cfg.id === _notifSelectedHabitId;
    const baseCss = 'display:flex;flex-direction:column;gap:5px;padding:7px 10px;cursor:pointer;font-size:13px;color:#fff;';
    row.style.cssText = baseCss + (isSel ? 'background:#232323;' : '');
    const topRow = document.createElement('div');
    topRow.style.cssText = 'display:flex;align-items:center;gap:8px;';
    const dot = document.createElement('span');
    dot.dataset.habitDot = cfg.id;
    dot.style.cssText = 'width:8px;height:8px;border-radius:50%;flex-shrink:0;background:' + _notifHabitDotColor(cfg.id) + ';';
    const nameSpan = document.createElement('span');
    nameSpan.textContent = cfg.label;
    nameSpan.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    topRow.appendChild(dot);
    topRow.appendChild(nameSpan);
    row.appendChild(topRow);
    row.appendChild(_notifBuildMiniSchedule(cfg.id));
    row.addEventListener('pointerenter', function() { row.style.background = '#2a2a2a'; });
    row.addEventListener('pointerleave', function() { row.style.background = isSel ? '#232323' : ''; });
    row.addEventListener('pointerdown', function(e) { e.preventDefault(); });
    row.addEventListener('click', function() { window.notifChooseHabit(cfg.id); });
    list.appendChild(row);
  });
}
function _notifUpdateHabitTrigger(habitId) {
  const cfg = typeof TRACKER_CONFIGS !== 'undefined' ? TRACKER_CONFIGS.find(function(c) { return c.id === habitId; }) : null;
  const labelEl = document.getElementById('notif-habit-trigger-label');
  const dotEl = document.getElementById('notif-habit-trigger-dot');
  if (labelEl) labelEl.textContent = cfg ? cfg.label : 'Select habit';
  if (dotEl && habitId) dotEl.style.background = _notifHabitDotColor(habitId);
}
function _notifHabitDropdownTapOut(e) {
  const list = document.getElementById('notif-habit-dropdown-list');
  const trigger = document.getElementById('notif-habit-trigger');
  if (!list) return;
  if (list.contains(e.target) || (trigger && trigger.contains(e.target))) return;
  list.style.display = 'none';
  document.removeEventListener('pointerdown', _notifHabitDropdownTapOut);
}
window.notifToggleHabitDropdown = function() {
  const list = document.getElementById('notif-habit-dropdown-list');
  const trigger = document.getElementById('notif-habit-trigger');
  if (!list || !trigger) return;
  if (list.style.display === 'block') {
    list.style.display = 'none';
    document.removeEventListener('pointerdown', _notifHabitDropdownTapOut);
    return;
  }
  _notifBuildHabitDropdownRows();
  const rect = trigger.getBoundingClientRect();
  list.style.left = rect.left + 'px';
  list.style.top = (rect.bottom + 2) + 'px';
  list.style.width = rect.width + 'px';
  list.style.display = 'block';
  setTimeout(function() { document.addEventListener('pointerdown', _notifHabitDropdownTapOut); }, 0);
};
window.notifChooseHabit = function(habitId) {
  const list = document.getElementById('notif-habit-dropdown-list');
  if (list) list.style.display = 'none';
  document.removeEventListener('pointerdown', _notifHabitDropdownTapOut);
  notifSelectHabit(habitId);
  _notifUpdateHabitTrigger(habitId);
};
window.notifPopulateHabitSelect = function() {
  if (typeof TRACKER_CONFIGS === 'undefined') return;
  const prevValue = _notifSelectedHabitId;
  const stillExists = TRACKER_CONFIGS.some(function(c) { return c.id === prevValue; });
  const targetId = stillExists ? prevValue : (TRACKER_CONFIGS[0] ? TRACKER_CONFIGS[0].id : null);
  _notifSelectedHabitId = targetId;
  _notifBuildHabitDropdownRows();
  _notifUpdateHabitTrigger(targetId);
};
window.notifSelectHabit = function(habitId) {
  _notifSelectedHabitId = habitId;
  window.notifLoadHabitForm(habitId);
};
window.notifLoadHabitForm = function(habitId) {
  if (!habitId) return;
  const cfg = typeof TRACKER_CONFIGS !== 'undefined' ? TRACKER_CONFIGS.find(c => c.id === habitId) : null;
  if (!cfg) return;
  const sched = window._notifGetSchedule(habitId);
  const colSel = document.getElementById('notif-column-select');
  if (colSel) {
    const totalOpt = cfg.hasSets ? '<option value="total">Total</option>' : '';
    const setOpts = cfg.hasSets
      ? Array.from({ length: NUM_SETS }, (_, i) => `<option value="set:${i + 1}">Set ${i + 1}</option>`).join('')
      : '';
    colSel.innerHTML = `<option value="status">Status</option>${totalOpt}${setOpts}`;
    colSel.value = sched.column || 'status';
  }
  const statusSel = document.getElementById('notif-status-value');
  if (statusSel) {
    statusSel.innerHTML = STATUSES.map(s => `<option value="${s}">${s}</option>`).join('');
    statusSel.value = sched.statusValue || 'yes';
  }
  const thresholdEl = document.getElementById('notif-threshold');
  if (thresholdEl) thresholdEl.value = sched.threshold || 0;
  window.notifColumnChange(true);
  if (window.notifLoadSoundName) window.notifLoadSoundName();
  const g = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  g('notif-years', sched.years);
  g('notif-days', sched.days);
  g('notif-hours', sched.hours !== undefined ? sched.hours : 1);
  g('notif-minutes', sched.minutes);
  g('notif-seconds', sched.seconds);
  const at = sched.autoTarget || { enabled: false, step: 0, cap: 0 };
  const atStepEl = document.getElementById('notif-auto-step');
  const atCapEl = document.getElementById('notif-auto-cap');
  if (atStepEl) atStepEl.value = at.step !== undefined ? at.step : 0;
  if (atCapEl) atCapEl.value = at.cap !== undefined ? at.cap : 0;
  _updateAutoTargetToggleUI();
  _notifUpdateToggleUI();
  if (window.notifDebugRefresh) window.notifDebugRefresh(habitId);
  _notifBuildWeekSchedule();
};
window.notifColumnChange = function(skipSave) {
  const colSel = document.getElementById('notif-column-select');
  const isStatus = !colSel || colSel.value === 'status';
  const statusRow = document.getElementById('notif-status-value-row');
  const thresholdRow = document.getElementById('notif-threshold-row');
  if (statusRow) statusRow.style.display = isStatus ? '' : 'none';
  if (thresholdRow) thresholdRow.style.display = isStatus ? 'none' : '';
  if (!skipSave) window.notifSaveSchedule();
};
window._notifUIRefresh = function(habitId) {
  if (habitId === _notifSelectedHabitId) window.notifLoadHabitForm(habitId);
};
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
window.notifOpenBatterySettings = function() {
  if (window.AndroidSettings && window.AndroidSettings.openBatterySettings) {
    window.AndroidSettings.openBatterySettings();
  } else {
    window.location.href = 'habitnotify://batterysettings';
  }
};
window.notifRefreshPermission = function() {
  const el = document.getElementById('notif-permission-status');
  if (!el) return;
  const webPerm = ('Notification' in window) ? Notification.permission : 'unavailable';
  const webColor = webPerm === 'granted' ? '#99ff99' : '#ff9999';
  const _renderNativePerm = (s) => {
    const exactColor = s.exactAlarm ? '#99ff99' : '#ff9999';
    const battColor = s.battery ? '#99ff99' : '#ff9999';
    el.innerHTML = `
      Web: <span style="color:${webColor}">${webPerm}</span><br>
      Notifications: <span style="color:${s.notifications ? '#99ff99' : '#ff9999'}">${s.notifications ? 'granted' : 'denied'}</span><br>
      Exact alarm: <span style="color:${exactColor}">${s.exactAlarm ? 'granted' : 'denied'}</span><br>
      <span style="font-size:11px;color:#777;">Exact alarm lets reminders fire at the precise minute they are due.
      Without it Android may delay reminders by several minutes to save battery.
      Tap Alarm Permission below to grant it.</span><br>
      Battery: <span style="color:${battColor}">${s.battery ? 'unrestricted' : 'optimized'}</span><br>
      <span style="font-size:11px;color:#777;">Optimized means Android may pause this app in the background and
      delay or drop reminders, especially after long idle periods (Doze mode, not fully handled by this app yet).
      Tap Battery Settings below and choose Unrestricted or Don't optimize.</span>
    `;
  };
  if (window.AndroidSettings && window.AndroidSettings.getPermissionStatus) {
    try {
      _renderNativePerm(JSON.parse(window.AndroidSettings.getPermissionStatus()));
    } catch {
      el.innerHTML = `Web: <span style="color:${webColor}">${webPerm}</span>`;
    }
  } else {
    el.innerHTML = `Web: <span style="color:${webColor}">${webPerm}</span>`;
    fetch('http://localhost:8765/permissionstatus')
      .then(r => r.json())
      .then(s => { if (s && s.notifications !== undefined) _renderNativePerm(s); })
      .catch(() => {});
  }
};
window.notifSaveStartOffset = function() {
  const habitId = window._notifCurrentHabitId ? window._notifCurrentHabitId() : null;
  if (!habitId) return;
  const g = id => { const el = document.getElementById(id); return el ? (parseInt(el.value) || 0) : 0; };
  const s = {
    years:   g('notif-start-years'),
    days:    g('notif-start-days'),
    hours:   g('notif-start-hours'),
    minutes: g('notif-start-minutes'),
    seconds: g('notif-start-seconds'),
  };
  window._notifSaveSchedule(habitId, { startOffset: s });
  const offsetMs =
    (s.years   || 0) * 365 * 24 * 60 * 60 * 1000 +
    (s.days    || 0) * 24 * 60 * 60 * 1000 +
    (s.hours   || 0) * 60 * 60 * 1000 +
    (s.minutes || 0) * 60 * 1000 +
    (s.seconds || 0) * 1000;
  if (window.AndroidSettings && window.AndroidSettings.setStartOffset) {
    window.AndroidSettings.setStartOffset(habitId, offsetMs);
  } else {
    _localNotifFetch('/setstartoffset?habit=' + encodeURIComponent(habitId) + '&offset=' + offsetMs);
  }
  _notifStartSavedSnap = _notifStartValues();
  _notifCheckStartBtn();
};
window.notifLoadStartOffsetUI = function() {
  const habitId = window._notifCurrentHabitId ? window._notifCurrentHabitId() : null;
  if (!habitId) return;
  const s = window._notifGetSchedule(habitId).startOffset || {};
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || 0; };
  set('notif-start-years',   s.years);
  set('notif-start-days',    s.days);
  set('notif-start-hours',   s.hours !== undefined ? s.hours : 0);
  set('notif-start-minutes', s.minutes);
  set('notif-start-seconds', s.seconds);
  _nostBuild();
  window.notifSyncStartFromFields();
};
window.notifSaveSchedule = function() {
  const habitId = window._notifCurrentHabitId ? window._notifCurrentHabitId() : null;
  if (!habitId) return;
  const g = id => { const el = document.getElementById(id); return el ? (parseInt(el.value) || 0) : 0; };
  const colSel = document.getElementById('notif-column-select');
  const statusSel = document.getElementById('notif-status-value');
  const thresholdEl = document.getElementById('notif-threshold');
  const prevSched = window._notifGetSchedule(habitId);
  const patch = {
    column:      colSel ? colSel.value : 'status',
    statusValue: statusSel ? statusSel.value : 'yes',
    threshold:   thresholdEl ? (parseInt(thresholdEl.value) || 0) : 0,
    years:       g('notif-years'),
    days:        g('notif-days'),
    hours:       g('notif-hours'),
    minutes:     g('notif-minutes'),
    seconds:     g('notif-seconds'),
    autoTarget: Object.assign({}, prevSched.autoTarget || {}, {
      step: parseInt(document.getElementById('notif-auto-step')?.value || '0') || 0,
      cap:  parseInt(document.getElementById('notif-auto-cap')?.value  || '0') || 0,
    }),
  };
  window._notifSaveSchedule(habitId, patch);
  if (window._notifSyncDoneFor) window._notifSyncDoneFor(habitId, dateStr(new Date()));
  if (window._notifApplyAutoTargetFor) window._notifApplyAutoTargetFor(habitId);
  if (window._notifReschedule) window._notifReschedule(habitId);
  const _updatedSched = window._notifGetSchedule(habitId);
  if (window.AndroidSettings && window.AndroidSettings.setHabitAutoTarget) {
    try {
      window.AndroidSettings.setHabitAutoTarget(habitId, !!_updatedSched.autoTarget.enabled,
        _updatedSched.autoTarget.step, _updatedSched.autoTarget.cap, _updatedSched.threshold);
    } catch (e) {}
  }
  _notifScheduleSavedSnap = _notifScheduleValues();
  _notifCheckScheduleBtn();
};
window.notifLoadScheduleUI = function() {
  _notifUpdateMasterToggleUI();
  window.notifPopulateHabitSelect();
  if (window._notifCurrentHabitId && window._notifCurrentHabitId()) {
    window.notifLoadHabitForm(window._notifCurrentHabitId());
  }
  _notifRefreshNextFire();
  if (window.notifLoadSoundName) window.notifLoadSoundName();
  if (window.notifLoadStartOffsetUI) window.notifLoadStartOffsetUI();
  _notifAddInputListener();
  _notifScheduleSavedSnap = _notifScheduleValues();
  _notifStartSavedSnap = _notifStartValues();
  _notifCheckScheduleBtn();
  _notifCheckStartBtn();
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
let _notifScheduleSavedSnap = null;
let _notifStartSavedSnap = null;
let _notifInputListenerAdded = false;
function _notifScheduleValues() {
  const g = id => { const el = document.getElementById(id); return el ? (parseInt(el.value) || 0) : 0; };
  return JSON.stringify({
    y: g('notif-years'), d: g('notif-days'), h: g('notif-hours'),
    m: g('notif-minutes'), s: g('notif-seconds'),
    as: g('notif-auto-step'), ac: g('notif-auto-cap'),
  });
}
function _notifStartValues() {
  const g = id => { const el = document.getElementById(id); return el ? (parseInt(el.value) || 0) : 0; };
  return JSON.stringify({
    y: g('notif-start-years'), d: g('notif-start-days'),
    h: g('notif-start-hours'), m: g('notif-start-minutes'), s: g('notif-start-seconds'),
  });
}
function _notifCheckScheduleBtn() {
  const btn = document.getElementById('notif-save-schedule-btn');
  if (!btn || _notifScheduleSavedSnap === null) return;
  const changed = _notifScheduleValues() !== _notifScheduleSavedSnap;
  btn.textContent = changed ? 'Save Schedule' : 'Saved';
  btn.style.opacity = changed ? '' : '0.45';
  btn.style.pointerEvents = changed ? '' : 'none';
}
function _notifCheckStartBtn() {
  const btn = document.getElementById('notif-save-start-offset-btn');
  if (!btn || _notifStartSavedSnap === null) return;
  const changed = _notifStartValues() !== _notifStartSavedSnap;
  btn.textContent = changed ? 'Save Start Time' : 'Saved';
  btn.style.opacity = changed ? '' : '0.45';
  btn.style.pointerEvents = changed ? '' : 'none';
}
function _notifAddInputListener() {
  if (_notifInputListenerAdded) return;
  const sg = document.getElementById('sg-notifications');
  if (!sg) return;
  _notifInputListenerAdded = true;
  sg.addEventListener('input', function(e) {
    const id = e.target && e.target.id;
    if (!id) return;
    if (['notif-years','notif-days','notif-hours','notif-minutes','notif-seconds',
         'notif-auto-step','notif-auto-cap'].includes(id)) _notifCheckScheduleBtn();
    if (['notif-start-years','notif-start-days','notif-start-hours',
         'notif-start-minutes','notif-start-seconds'].includes(id)) _notifCheckStartBtn();
  });
}
let _notifAllNextFire = {};
function _notifRefreshNextFire() {
  if (window.AndroidSettings && window.AndroidSettings.getAllNextFireTimes) {
    try { _notifAllNextFire = JSON.parse(window.AndroidSettings.getAllNextFireTimes()) || {}; } catch(e) { _notifAllNextFire = {}; }
    _notifUpdateNextFireDisplay();
    return;
  }
  fetch('http://localhost:8765/allnextfiretimes')
    .then(r => r.json())
    .then(j => { _notifAllNextFire = j || {}; _notifUpdateNextFireDisplay(); })
    .catch(() => { _notifAllNextFire = {}; _notifUpdateNextFireDisplay(); });
}
function _notifFormatRemaining(ms) {
  if (ms <= 0) return 'Firing soon...';
  const totalSec = Math.floor(ms / 1000);
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
  return parts.join(' ');
}
function _notifUpdateNextFireDisplay() {
  const el = document.getElementById('notif-next-fire-display');
  if (!el) return;
  const enabled = window._notifMasterEnabled();
  if (!enabled) { el.textContent = ''; return; }
  const entries = Object.keys(_notifAllNextFire || {}).map(hid => {
    const cfg = typeof TRACKER_CONFIGS !== 'undefined' ? TRACKER_CONFIGS.find(c => c.id === hid) : null;
    return { label: cfg ? cfg.label : hid, ms: _notifAllNextFire[hid] };
  }).filter(e => e.ms > 0).sort((a, b) => a.ms - b.ms);
  if (!entries.length) { el.textContent = 'No notifications queued.'; return; }
  el.innerHTML = entries.map(e => {
    const safeLabel = String(e.label).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return `<div>${safeLabel}: ${_notifFormatRemaining(e.ms - Date.now())}</div>`;
  }).join('');
}
function _notifWeekTicksFor(sched) {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const s = sched.startOffset || {};
  const offsetMsRaw = (s.years || 0) * 365 * DAY_MS + (s.days || 0) * DAY_MS + (s.hours || 0) * 3600000 +
    (s.minutes || 0) * 60000 + (s.seconds || 0) * 1000;
  const offsetMs = Math.max(0, Math.min(DAY_MS, offsetMsRaw));
  const intervalMs = ((sched.years || 0) * 365 * DAY_MS + (sched.days || 0) * DAY_MS + (sched.hours || 0) * 3600000 +
    (sched.minutes || 0) * 60000 + (sched.seconds || 0) * 1000) || 3600000;
  const result = { offsetMs: offsetMs, intervalMs: intervalMs, ticks: [], dense: false };
  if (!sched.enabled || intervalMs <= 0) return result;
  const span = DAY_MS - offsetMs;
  const count = Math.floor(span / intervalMs) + 1;
  if (count > 150) { result.dense = true; return result; }
  let t = offsetMs;
  while (t < DAY_MS) { result.ticks.push(t); t += intervalMs; }
  return result;
}
const _NOTIF_WEEK_DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
function _notifBuildWeekSchedule() {
  const wrap = document.getElementById('notif-week-schedule-wrap');
  if (!wrap) return;
  const overlay = document.getElementById('settings-overlay');
  if (!overlay || !overlay.classList.contains('active')) return;
  const groupEl = document.getElementById('sg-notifications');
  if (!groupEl || !groupEl.classList.contains('open')) return;
  const habitId = window._notifCurrentHabitId ? window._notifCurrentHabitId() : null;
  wrap.innerHTML = '';
  if (!habitId) return;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const masterOn = window._notifMasterEnabled();
  const sched = window._notifGetSchedule(habitId);
  const info = _notifWeekTicksFor(sched);
  const active = masterOn && sched.enabled;
  const todayIdx = (new Date().getDay() + 6) % 7;
  const title = document.createElement('div');
  title.style.cssText = 'font-size:11px;color:#666;margin-bottom:2px;';
  if (!masterOn) {
    title.textContent = 'Weekly schedule preview (all notifications off)';
  } else if (!sched.enabled) {
    title.textContent = (sched.offUntil && sched.offUntil > Date.now())
      ? 'Weekly schedule preview (off until ' + new Date(sched.offUntil).toLocaleString() + ')'
      : 'Weekly schedule preview (off)';
  } else {
    title.textContent = 'Weekly schedule preview';
  }
  wrap.appendChild(title);
  const axisRow = document.createElement('div');
  axisRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:2px;';
  const axisSpacer = document.createElement('div');
  axisSpacer.style.cssText = 'width:28px;flex-shrink:0;';
  axisRow.appendChild(axisSpacer);
  const axisBar = document.createElement('div');
  axisBar.style.cssText = 'position:relative;flex:1;height:10px;';
  [0, 6, 12, 18, 24].forEach(h => {
    const mark = document.createElement('div');
    mark.textContent = String(h);
    let tx = 'translateX(-50%)';
    if (h === 0) tx = 'translateX(0)';
    if (h === 24) tx = 'translateX(-100%)';
    mark.style.cssText = 'position:absolute;top:0;left:' + (h / 24 * 100) + '%;font-size:9px;color:#555;transform:' + tx + ';';
    axisBar.appendChild(mark);
  });
  axisRow.appendChild(axisBar);
  wrap.appendChild(axisRow);
  _NOTIF_WEEK_DAY_LABELS.forEach((dayLabel, dayIdx) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:2px;';
    const isToday = dayIdx === todayIdx;
    const label = document.createElement('div');
    label.textContent = dayLabel;
    label.style.cssText = 'width:28px;flex-shrink:0;font-size:11px;color:' + (isToday ? '#fff' : '#777') +
      ';font-weight:' + (isToday ? '600' : '400') + ';';
    row.appendChild(label);
    const bar = document.createElement('div');
    bar.style.cssText = 'position:relative;flex:1;height:14px;background:' + (active ? '#111' : '#0a0a0a') +
      ';border:1px solid ' + (isToday ? '#666' : '#333') + ';border-radius:3px;overflow:hidden;';
    [6, 12, 18].forEach(h => {
      const grid = document.createElement('div');
      grid.style.cssText = 'position:absolute;top:0;bottom:0;left:' + (h / 24 * 100) + '%;width:1px;background:rgba(255,255,255,0.08);';
      bar.appendChild(grid);
    });
    if (active) {
      if (info.dense) {
        const band = document.createElement('div');
        band.style.cssText = 'position:absolute;top:0;bottom:0;left:' + (info.offsetMs / DAY_MS * 100) + '%;right:0;' +
          'background:repeating-linear-gradient(45deg,rgba(153,204,255,0.35),rgba(153,204,255,0.35) 2px,transparent 2px,transparent 4px);';
        bar.appendChild(band);
      } else {
        info.ticks.forEach(ms => {
          const tick = document.createElement('div');
          tick.style.cssText = 'position:absolute;top:1px;bottom:1px;left:' + (ms / DAY_MS * 100) + '%;width:2px;background:#99ccff;';
          bar.appendChild(tick);
        });
      }
      const offsetMark = document.createElement('div');
      offsetMark.style.cssText = 'position:absolute;top:0;bottom:0;left:' + (info.offsetMs / DAY_MS * 100) + '%;width:2px;background:#ffcc66;';
      bar.appendChild(offsetMark);
    }
    if (isToday) {
      const now = new Date();
      const msIntoDay = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) * 1000;
      const live = document.createElement('div');
      live.style.cssText = 'position:absolute;top:-2px;bottom:-2px;left:' + (msIntoDay / DAY_MS * 100) + '%;width:2px;' +
        'background:#ff5555;box-shadow:0 0 4px 1px rgba(255,85,85,0.8);z-index:2;';
      bar.appendChild(live);
    }
    row.appendChild(bar);
    wrap.appendChild(row);
  });
  const legend = document.createElement('div');
  legend.style.cssText = 'font-size:10px;color:#555;margin-top:4px;';
  legend.textContent = 'amber = start time, blue = notification, red = now';
  wrap.appendChild(legend);
}
function _notifBuildAllHabitsSchedule() {
  const wrap = document.getElementById('notif-all-habits-schedule-wrap');
  if (!wrap) return;
  const overlay = document.getElementById('settings-overlay');
  if (!overlay || !overlay.classList.contains('active')) return;
  const groupEl = document.getElementById('sg-notifications');
  if (!groupEl || !groupEl.classList.contains('open')) return;
  wrap.innerHTML = '';
  const DAY_MS = 24 * 60 * 60 * 1000;
  const masterOn = window._notifMasterEnabled();
  const allSched = window._notifGetAllSchedules();
  const activeInfos = masterOn ? Object.keys(allSched).filter(hid => {
    const stillExists = typeof TRACKER_CONFIGS !== 'undefined' && TRACKER_CONFIGS.some(c => c.id === hid);
    return stillExists && allSched[hid].enabled;
  }).map(hid => _notifWeekTicksFor(window._notifGetSchedule(hid))) : [];
  const todayIdx = (new Date().getDay() + 6) % 7;
  const title = document.createElement('div');
  title.style.cssText = 'font-size:11px;color:#666;margin-bottom:2px;';
  title.textContent = masterOn ? 'All habits schedule preview' : 'All habits schedule preview (all notifications off)';
  wrap.appendChild(title);
  const axisRow = document.createElement('div');
  axisRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:2px;';
  const axisSpacer = document.createElement('div');
  axisSpacer.style.cssText = 'width:28px;flex-shrink:0;';
  axisRow.appendChild(axisSpacer);
  const axisBar = document.createElement('div');
  axisBar.style.cssText = 'position:relative;flex:1;height:10px;';
  [0, 6, 12, 18, 24].forEach(h => {
    const mark = document.createElement('div');
    mark.textContent = String(h);
    let tx = 'translateX(-50%)';
    if (h === 0) tx = 'translateX(0)';
    if (h === 24) tx = 'translateX(-100%)';
    mark.style.cssText = 'position:absolute;top:0;left:' + (h / 24 * 100) + '%;font-size:9px;color:#555;transform:' + tx + ';';
    axisBar.appendChild(mark);
  });
  axisRow.appendChild(axisBar);
  wrap.appendChild(axisRow);
  _NOTIF_WEEK_DAY_LABELS.forEach((dayLabel, dayIdx) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:2px;';
    const isToday = dayIdx === todayIdx;
    const label = document.createElement('div');
    label.textContent = dayLabel;
    label.style.cssText = 'width:28px;flex-shrink:0;font-size:11px;color:' + (isToday ? '#fff' : '#777') +
      ';font-weight:' + (isToday ? '600' : '400') + ';';
    row.appendChild(label);
    const bar = document.createElement('div');
    bar.style.cssText = 'position:relative;flex:1;height:14px;background:' + (activeInfos.length ? '#111' : '#0a0a0a') +
      ';border:1px solid ' + (isToday ? '#666' : '#333') + ';border-radius:3px;overflow:hidden;';
    [6, 12, 18].forEach(h => {
      const grid = document.createElement('div');
      grid.style.cssText = 'position:absolute;top:0;bottom:0;left:' + (h / 24 * 100) + '%;width:1px;background:rgba(255,255,255,0.08);';
      bar.appendChild(grid);
    });
    activeInfos.forEach(info => {
      if (info.dense) {
        const band = document.createElement('div');
        band.style.cssText = 'position:absolute;top:0;bottom:0;left:' + (info.offsetMs / DAY_MS * 100) + '%;right:0;' +
          'background:repeating-linear-gradient(45deg,rgba(153,204,255,0.35),rgba(153,204,255,0.35) 2px,transparent 2px,transparent 4px);';
        bar.appendChild(band);
      } else {
        info.ticks.forEach(ms => {
          const tick = document.createElement('div');
          tick.style.cssText = 'position:absolute;top:1px;bottom:1px;left:' + (ms / DAY_MS * 100) + '%;width:2px;background:#99ccff;';
          bar.appendChild(tick);
        });
      }
      const offsetMark = document.createElement('div');
      offsetMark.style.cssText = 'position:absolute;top:0;bottom:0;left:' + (info.offsetMs / DAY_MS * 100) + '%;width:2px;background:#ffcc66;';
      bar.appendChild(offsetMark);
    });
    if (isToday) {
      const now = new Date();
      const msIntoDay = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) * 1000;
      const live = document.createElement('div');
      live.style.cssText = 'position:absolute;top:-2px;bottom:-2px;left:' + (msIntoDay / DAY_MS * 100) + '%;width:2px;' +
        'background:#ff5555;box-shadow:0 0 4px 1px rgba(255,85,85,0.8);z-index:2;';
      bar.appendChild(live);
    }
    row.appendChild(bar);
    wrap.appendChild(row);
  });
  const legend = document.createElement('div');
  legend.style.cssText = 'font-size:10px;color:#555;margin-top:4px;';
  legend.textContent = 'amber = start time, blue = notification, red = now';
  wrap.appendChild(legend);
}
setInterval(_notifBuildWeekSchedule, 1000);
setInterval(_notifBuildAllHabitsSchedule, 1000);
function _notifUpdateToggleUI() {
  const habitId = window._notifCurrentHabitId ? window._notifCurrentHabitId() : null;
  const enabled = habitId ? window._notifGetSchedule(habitId).enabled : false;
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
function _notifUpdateMasterToggleUI() {
  const enabled = window._notifMasterEnabled();
  const wrap = document.getElementById('notif-master-toggle-wrap');
  const switchEl = document.getElementById('notif-master-toggle-switch');
  const _onBg = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleOnBg || '#1a5a1aFF') : '#1a5a1a';
  const _offBg = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleOffBg || '#333333FF') : '#333';
  const _switchOn = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleSwitchOn || '#99ff99FF') : '#99ff99';
  const _switchOff = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleSwitchOff || '#666666FF') : '#666';
  const _borderOn = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleBorderOn || '#2a7a2aFF') : '#2a7a2a';
  const _borderOff = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleBorderOff || '#555555FF') : '#555';
  if (wrap) { wrap.style.background = enabled ? _onBg : _offBg; wrap.style.borderColor = enabled ? _borderOn : _borderOff; }
  if (switchEl) { switchEl.style.left = enabled ? '27px' : '3px'; switchEl.style.background = enabled ? _switchOn : _switchOff; }
  const masterLabelEl = document.getElementById('notif-master-enabled-label');
  if (masterLabelEl) masterLabelEl.textContent = 'All Notifications: ' + (enabled ? 'ON' : 'OFF');
}
window.notifToggleMaster = function() {
  const next = !window._notifMasterEnabled();
  localStorage.setItem('_notifEnabled', next ? 'true' : 'false');
  if (window._notifScheduleAll) window._notifScheduleAll();
  if (window._notifReschedule) window._notifReschedule();
  _notifUpdateMasterToggleUI();
  if (window._notifRefreshHabitDots) window._notifRefreshHabitDots();
};
function _notifTickCountdown() {
  const el = document.getElementById('notif-countdown-display');
  if (!el) return;
  const habitId = window._notifCurrentHabitId ? window._notifCurrentHabitId() : null;
  if (!habitId) { el.textContent = ''; return; }
  const sched = window._notifGetSchedule(habitId);
  if (sched.enabled) { el.textContent = ''; return; }
  const until = sched.offUntil || 0;
  if (!until) { el.textContent = 'Off indefinitely'; return; }
  const remaining = until - Date.now();
  if (remaining <= 0) {
    window._notifSaveSchedule(habitId, { enabled: true, offUntil: 0 });
    _notifUpdateToggleUI();
    if (window._notifReschedule) window._notifReschedule(habitId);
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
  Object.keys(_notifGetAllSchedules()).forEach(hid => {
    const sched = window._notifGetSchedule(hid);
    if (sched.offUntil && Date.now() >= sched.offUntil && !sched.enabled) {
      window._notifSaveSchedule(hid, { enabled: true, offUntil: 0 });
      if (window._notifReschedule) window._notifReschedule(hid);
      if (hid === (window._notifCurrentHabitId ? window._notifCurrentHabitId() : null)) {
        _notifUpdateToggleUI();
        _notifTargetMs = 0; _notifDateSource = null;
      }
    }
  });
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
  const habitId = window._notifCurrentHabitId ? window._notifCurrentHabitId() : null;
  if (!habitId) return;
  const sched = window._notifGetSchedule(habitId);
  const enabled = !sched.enabled;
  window._notifSaveSchedule(habitId, { enabled: enabled, offUntil: 0 });
  if (window._notifReschedule) window._notifReschedule(habitId);
  if (enabled && window._notifSyncDoneFor) window._notifSyncDoneFor(habitId, dateStr(new Date()));
  if (enabled && window._notifApplyAutoTargetFor) window._notifApplyAutoTargetFor(habitId);
  if (enabled && window._notifFireNow) window._notifFireNow(habitId);
  _notifUpdateToggleUI();
  if (window._notifRefreshHabitDots) window._notifRefreshHabitDots();
};
window.notifSetOffTimer = function() {
  const habitId = window._notifCurrentHabitId ? window._notifCurrentHabitId() : null;
  if (!habitId) return;
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
  window._notifSaveSchedule(habitId, { offUntil: Date.now() + ms });
  _notifTickCountdown();
};
window.notifSetOffForever = function() {
  const habitId = window._notifCurrentHabitId ? window._notifCurrentHabitId() : null;
  if (!habitId) return;
  window._notifSaveSchedule(habitId, { offUntil: 0 });
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
  const _selColor = (_notifTargetMs > 0 && _notifTargetMs > Date.now()) ? '#fff' : '#555';
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
    elSel.style.color = _selColor;
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
  _ndtTickInterval = setInterval(() => {}, 1000);
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
// ── Start offset time-of-day tumbler ──────────────────────
let _nostTumblerBuilt = false;
const _NOST_HOURS = ['12','1','2','3','4','5','6','7','8','9','10','11'];
const _NOST_MINS  = Array.from({length:60}, (_,i) => String(i).padStart(2,'0'));
const _NOST_SECS  = Array.from({length:60}, (_,i) => String(i).padStart(2,'0'));
const _NOST_AMPM  = ['am','pm'];
const _NOST_COLS  = [
  {key:'hour', opts:_NOST_HOURS, label:'Hour'},
  {key:'min',  opts:_NOST_MINS,  label:'Min'},
  {key:'sec',  opts:_NOST_SECS,  label:'Sec'},
  {key:'ampm', opts:_NOST_AMPM,  label:''},
];
const _nostIdx = {hour:0, min:0, sec:0, ampm:0};
function _nostSetTime(totalMs) {
  const totalSec = Math.floor(totalMs / 1000);
  const secs = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const mins = totalMin % 60;
  const totalHr = Math.floor(totalMin / 60) % 24;
  const isPm = totalHr >= 12;
  let hour12 = totalHr % 12;
  if (hour12 === 0) hour12 = 12;
  const hourIdx = _NOST_HOURS.indexOf(String(hour12));
  _nostIdx.hour = hourIdx >= 0 ? hourIdx : 0;
  _nostIdx.min  = Math.max(0, Math.min(59, mins));
  _nostIdx.sec  = Math.max(0, Math.min(59, secs));
  _nostIdx.ampm = isPm ? 1 : 0;
}
function _nostGetMs() {
  const hour12 = parseInt(_NOST_HOURS[_nostIdx.hour]);
  const isPm = _nostIdx.ampm === 1;
  const hour24 = hour12 % 12 + (isPm ? 12 : 0);
  return (hour24 * 3600 + _nostIdx.min * 60 + _nostIdx.sec) * 1000;
}
function _nostSyncToFields() {
  const totalMs = _nostGetMs();
  const totalSec = Math.floor(totalMs / 1000);
  const secs = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const mins = totalMin % 60;
  const hours = Math.floor(totalMin / 60) % 24;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  set('notif-start-years', 0);
  set('notif-start-days', 0);
  set('notif-start-hours', hours);
  set('notif-start-minutes', mins);
  set('notif-start-seconds', secs);
  _notifCheckStartBtn();
}
function _nostRender() {
  const wrap = document.getElementById('notif-start-time-tumbler-wrap');
  if (!wrap) return;
  _NOST_COLS.forEach((col, ci) => {
    const win = wrap.querySelector(`.nost-col[data-ci="${ci}"] .tumb-window`);
    if (!win) return;
    win.innerHTML = '';
    const opts = col.opts;
    const sidx = _nostIdx[col.key];
    const prev = (sidx - 1 + opts.length) % opts.length;
    const next = (sidx + 1) % opts.length;
    const aUp    = document.createElement('div'); aUp.className = 'tumb-arrow'; aUp.textContent = '\u25b2';
    const elPrev = document.createElement('div'); elPrev.className = 'tumb-item tumb-adj'; elPrev.textContent = opts[prev];
    const elSel  = document.createElement('div'); elSel.className = 'tumb-item tumb-sel'; elSel.textContent = opts[sidx];
    const elNext = document.createElement('div'); elNext.className = 'tumb-item tumb-adj'; elNext.textContent = opts[next];
    const aDown  = document.createElement('div'); aDown.className = 'tumb-arrow'; aDown.textContent = '\u25bc';
    win.append(aUp, elPrev, elSel, elNext, aDown);
  });
}
function _nostSetupColDrag(win, ci, key) {
  let startY = null, lastY = null, accumY = 0, moved = false;
  const STEP = 28;
  function step(dir) {
    const opts = _NOST_COLS[ci].opts;
    _nostIdx[key] = (_nostIdx[key] + dir + opts.length) % opts.length;
    _nostRender();
    _nostSyncToFields();
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
function _nostBuild() {
  const wrap = document.getElementById('notif-start-time-tumbler-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  const lbl = document.createElement('div');
  lbl.style.cssText = 'font-size:11px;color:#666;margin-bottom:4px;';
  lbl.textContent = 'or pick time:';
  wrap.appendChild(lbl);
  const grid = document.createElement('div');
  grid.className = 'tumb-grid';
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:0;border:1px solid #444;border-radius:6px;overflow:hidden;margin:0;';
  _NOST_COLS.forEach((col, ci) => {
    const colEl = document.createElement('div');
    colEl.className = 'tumb-col nost-col'; colEl.dataset.ci = ci; colEl.dataset.key = col.key;
    const colLbl = document.createElement('div');
    colLbl.className = 'tumb-col-label'; colLbl.textContent = col.label;
    colEl.appendChild(colLbl);
    const win = document.createElement('div'); win.className = 'tumb-window';
    colEl.appendChild(win);
    grid.appendChild(colEl);
    _nostSetupColDrag(win, ci, col.key);
  });
  wrap.appendChild(grid);
  _nostTumblerBuilt = true;
  _nostRender();
}
window.notifSyncStartFromFields = function() {
  const g = id => { const el = document.getElementById(id); return el ? (parseInt(el.value) || 0) : 0; };
  const totalMs = (
    g('notif-start-hours') * 60 * 60 * 1000 +
    g('notif-start-minutes') * 60 * 1000 +
    g('notif-start-seconds') * 1000
  );
  _nostSetTime(totalMs);
  if (_nostTumblerBuilt) _nostRender();
  _notifCheckStartBtn();
};
let _notifMarkDoneLast = {};
window.notifMarkDone = function(habitId, dateKey, done) {
  if (window.AndroidSettings && window.AndroidSettings.markHabitDone) {
    try { window.AndroidSettings.markHabitDone(habitId, dateKey, done); } catch (e) {}
    return;
  }
  const _syncKey = '_nmdSync_' + habitId + '_' + dateKey;
  const _lastSynced = localStorage.getItem(_syncKey);
  const _doneVal = done ? '1' : '0';
  const _needsSync = (done && _lastSynced !== '1') || (!done && _lastSynced === '1');
  if (!_needsSync) return;
  const _last = _notifMarkDoneLast[habitId];
  if (_last && _last.date === dateKey && _last.done === done) return;
  _notifMarkDoneLast[habitId] = { date: dateKey, done: done };
  localStorage.setItem(_syncKey, _doneVal);
  _localNotifFetch('/markdone?habit=' + encodeURIComponent(habitId) + '&date=' + encodeURIComponent(dateKey) + '&done=' + _doneVal);
};
window.notifLoadSoundName = function() {
  const nameEl = document.getElementById('notif-sound-name');
  if (!nameEl) return;
  const habitId = window._notifCurrentHabitId ? window._notifCurrentHabitId() : null;
  if (!habitId) { nameEl.textContent = 'Default'; return; }
  const sched = window._notifGetSchedule(habitId);
  nameEl.textContent = sched.soundName || 'Default';
};
window.notifOpenSoundPicker = async function() {
  const habitId = window._notifCurrentHabitId ? window._notifCurrentHabitId() : null;
  if (!habitId) return;
  const sched = window._notifGetSchedule(habitId);
  let soundList;
  let currentUri = sched.soundUri || '';
  if (window.AndroidSettings && window.AndroidSettings.getNotifSoundList) {
    try { soundList = JSON.parse(window.AndroidSettings.getNotifSoundList()); }
    catch(e) { alert('Could not load sounds.'); return; }
  } else {
    try {
      const _lr = await fetch('http://localhost:8765/sounds');
      soundList = await _lr.json();
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
    window._notifSaveSchedule(habitId, { soundUri: selectedUri || '', soundName: selectedName || 'Default' });
    if (window.AndroidSettings && window.AndroidSettings.setNotifSound) {
      window.AndroidSettings.setNotifSound(habitId, selectedUri, selectedName);
    } else {
      fetch('http://localhost:8765/setsound?habit=' + encodeURIComponent(habitId) + '&uri=' + encodeURIComponent(selectedUri) + '&name=' + encodeURIComponent(selectedName)).catch(() => {});
    }
    const nameEl = document.getElementById('notif-sound-name');
    if (nameEl) nameEl.textContent = selectedName || 'Default';
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
  const habitId = window._notifCurrentHabitId ? window._notifCurrentHabitId() : null;
  if (!habitId) return;
  const cfg = typeof TRACKER_CONFIGS !== 'undefined' ? TRACKER_CONFIGS.find(c => c.id === habitId) : null;
  const label = cfg ? cfg.label : habitId;
  const btn = document.getElementById('notif-send-test-btn');
  if (btn) { btn.textContent = 'Sent'; btn.disabled = true; setTimeout(() => { btn.textContent = 'Send Test'; btn.disabled = false; }, 1500); }
  if (window.AndroidSettings && window.AndroidSettings.showNotification) {
    try { window.AndroidSettings.showNotification(habitId, 'Habit Tracker', label + ' — test notification.'); return; } catch (e) {}
  }
  fetch('http://localhost:8765/notify?habit=' + encodeURIComponent(habitId) + '&title=' + encodeURIComponent('Habit Tracker') + '&body=' + encodeURIComponent(label + ' — test notification.')).catch(() => {
    navigator.serviceWorker && navigator.serviceWorker.ready
      .then(reg => reg.showNotification('Habit Tracker', { body: label + ' — test notification.', icon: './icon-192.png', vibrate: [200], tag: 'habit-reminder-' + habitId }))
      .catch(() => {});
  });
};
// ── Auto target adjust ─────────────────────────────────────
function _updateAutoTargetToggleUI() {
  const habitId = window._notifCurrentHabitId ? window._notifCurrentHabitId() : null;
  const sched = habitId ? window._notifGetSchedule(habitId) : null;
  const at = (sched && sched.autoTarget) || { enabled: false };
  const wrap = document.getElementById('notif-auto-target-toggle');
  const sw   = document.getElementById('notif-auto-target-switch');
  const _onBg     = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleOnBg     || '#1a5a1aFF') : '#1a5a1a';
  const _offBg    = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleOffBg    || '#333333FF') : '#333333';
  const _switchOn  = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleSwitchOn  || '#99ff99FF') : '#99ff99';
  const _switchOff = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleSwitchOff || '#666666FF') : '#666666';
  const _borderOn  = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleBorderOn  || '#2a7a2aFF') : '#2a7a2a';
  const _borderOff = (typeof btnStyle !== 'undefined') ? hex8ToCss(btnStyle.toggleBorderOff || '#555555FF') : '#555555';
  if (wrap) { wrap.style.background = at.enabled ? _onBg : _offBg; wrap.style.borderColor = at.enabled ? _borderOn : _borderOff; }
  if (sw)   { sw.style.left = at.enabled ? '27px' : '3px'; sw.style.background = at.enabled ? _switchOn : _switchOff; }
}
window.notifToggleAutoTarget = function() {
  const habitId = window._notifCurrentHabitId ? window._notifCurrentHabitId() : null;
  if (!habitId) return;
  const sched = window._notifGetSchedule(habitId);
  const at = Object.assign({ enabled: false, step: 0, cap: 0 }, sched.autoTarget || {});
  at.enabled = !at.enabled;
  const _stepElT = document.getElementById('notif-auto-step');
  const _capElT  = document.getElementById('notif-auto-cap');
  if (_stepElT) at.step = parseInt(_stepElT.value || '0') || 0;
  if (_capElT)  at.cap  = parseInt(_capElT.value  || '0') || 0;
  window._notifSaveSchedule(habitId, { autoTarget: at });
  if (window.AndroidSettings && window.AndroidSettings.setHabitAutoTarget) {
    try { window.AndroidSettings.setHabitAutoTarget(habitId, at.enabled, at.step, at.cap, sched.threshold || 0); } catch (e) {}
  }
  _updateAutoTargetToggleUI();
};

