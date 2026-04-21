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
    if (Notification.permission !== 'granted') return;
    if (isPushupsDone()) return;
    const h = new Date().getHours();
    if (h < 7 || h >= 23) return;
    new Notification('Habit Tracker', {
      body: 'Pushups not done yet today.',
      icon: './icon-192.png',
      tag: 'pushups-reminder',
    });
  }
  function schedule() {
    notify();
    setInterval(notify, 60 * 60 * 1000);
  }
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    schedule();
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(p => { if (p === 'granted') schedule(); });
  }
})();