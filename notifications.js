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
    window.location.href = 'habitnotify://pushups-not-done';
}
  function schedule() {
    notify();
    setInterval(notify, 60 * 60 * 1000);
  }
  window.notifyTest = function() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.78);z-index:99999;display:flex;align-items:center;justify-content:center;';
    const box = document.createElement('div');
    box.style.cssText = 'background:#1c1c1c;border:1px solid #555;border-radius:10px;padding:24px 28px;max-width:380px;width:90%;display:flex;flex-direction:column;gap:12px;';
    const p = document.createElement('p');
    p.style.cssText = 'margin:0;font-size:13px;color:#ccc;line-height:1.6;';
    p.textContent = 'Permission: ' + Notification.permission;
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    const settingsBtn = document.createElement('button');
    settingsBtn.textContent = 'Open Settings';
    settingsBtn.style.cssText = 'padding:7px 16px;background:#1a2a3a;color:#99ccff;border:none;border-radius:4px;cursor:pointer;font-size:13px;';
    settingsBtn.onclick = () => {
      if (window.AndroidSettings) {
        window.AndroidSettings.openAppSettings();
      } else {
        window.location.href = 'appsettings://open';
      }
    };
    const testBtn = document.createElement('button');
    testBtn.textContent = 'Send Test';
    testBtn.style.cssText = 'padding:7px 16px;background:#1a3a1a;color:#99ff99;border:none;border-radius:4px;cursor:pointer;font-size:13px;';
    testBtn.onclick = async () => {
      testBtn.textContent = 'Sending...';
      testBtn.disabled = true;
      try {
        if (Notification.permission !== 'granted') {
          const result = await Notification.requestPermission();
          p.textContent = 'Permission: ' + result;
          if (result !== 'granted') { testBtn.textContent = 'No Permission'; testBtn.disabled = false; return; }
        }
        const reg = await navigator.serviceWorker.ready;
        p.textContent = 'SW: ' + (reg.active ? reg.active.state : 'none') + ' | ctrl: ' + (navigator.serviceWorker.controller ? 'yes' : 'no');
        try {
          if (window.AndroidSettings && window.AndroidSettings.showNotification) {
            window.AndroidSettings.showNotification('Habit Tracker', 'Pushups not done yet today.');
          } else {
            window.location.href = 'habitnotify://pushups-not-done';
          }
          await reg.showNotification('Habit Tracker', { body: 'Test notification.', icon: './icon-192.png', tag: 'test', vibrate: [200], requireInteraction: false });
          testBtn.textContent = 'Sent';
        } catch(e2) {
          new Notification('Habit Tracker', { body: 'Test notification.', icon: './icon-192.png', tag: 'test' });
          testBtn.textContent = 'Sent (direct)';
        }
        testBtn.disabled = false;
      } catch(e) {
        p.textContent = 'Error: ' + e.message;
        testBtn.textContent = 'Failed';
        testBtn.disabled = false;
      }
    };
    const okBtn = document.createElement('button');
    okBtn.textContent = 'Cancel';
    okBtn.style.cssText = 'padding:7px 16px;background:#333;color:#ccc;border:none;border-radius:4px;cursor:pointer;font-size:13px;';
    okBtn.onclick = () => document.body.removeChild(overlay);
    row.append(settingsBtn, testBtn, okBtn);
    box.append(p, row);
    overlay.appendChild(box);
    overlay.addEventListener('click', e => { if (e.target === overlay) document.body.removeChild(overlay); });
    document.body.appendChild(overlay);
  };
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    schedule();
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(p => { if (p === 'granted') schedule(); });
  }
})();