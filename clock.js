// ── Live clock ─────────────────────────────────────────────
  (function() {
    const dateEl = document.getElementById("live-date");
    const timeEl = document.getElementById("live-time");
    const DOW_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const DOW_LONG  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    // Clock config: 9 tumbler indices
    // [dayName, day, month, year, hour, minute, second, ms, ampm]
    // Stored as JSON array in _clockTumbler
    const TUMBLER_DEFAULTS = [6, 1, 1, 1, 2, 1, 1, 0];
    // dayName options: 0=blank,1="",2="",3="",4="",5="Mon",6="Monday"  (indices map to DAY_OPTS below)
    // We encode choices per-column as indices into the column's options array.

    let tumblerCfg = TUMBLER_DEFAULTS.slice();
    try {
      const s = JSON.parse(localStorage.getItem("_clockTumbler"));
      if (Array.isArray(s) && s.length === 8) tumblerCfg = s;
    } catch {}

    window._clockGet = () => ({ tumblerCfg: tumblerCfg.slice() });
    window._clockSet = (cfg) => { tumblerCfg = cfg.slice(); tick(); };

    // Col definitions: [label, options[]]
    // Each option is a display string (empty string = blank/off)
    const COLS = [
      { label:"DoW",  opts:["—","F","Fr","Mon","Mond","Monda","Monday"] },
      { label:"Day",     opts:["—","d","dd"] },
      { label:"Month",     opts:["—","m","mm"] },
      { label:"Year",      opts:["—","yy","yyyy"] },
      { label:"Hour",      opts:["—","12h","12hh","24h","24hh"] },
      { label:"Minutes",   opts:["—","MM"] },
      { label:"Seconds",   opts:["—","SS"] },
      { label:"am/pm",     opts:["—","am/pm"] },
    ];
    window._CLOCK_COLS = COLS;

    function buildDateTime(now, cfg) {
      const d   = now.getDate();
      const mo  = now.getMonth() + 1;
      const y   = now.getFullYear();
      const dd  = String(d).padStart(2,"0");
      const mm  = String(mo).padStart(2,"0");
      const yy  = String(y).slice(-2);
      const yyyy= String(y);
      const dowS = DOW_SHORT[now.getDay()];
      const dowL = DOW_LONG[now.getDay()];
      const dow3 = dowL.slice(0,3);
      const dow4 = dowL.slice(0,4);
      const dow5 = dowL.slice(0,5);
      const dow6 = dowL.slice(0,6);
      const h24  = now.getHours();
      const h12  = h24 % 12 || 12;
      const mi   = String(now.getMinutes()).padStart(2,"0");
      const se   = String(now.getSeconds()).padStart(2,"0");
      const ms   = String(now.getMilliseconds()).padStart(3,"0");
      const ampm = h24 >= 12 ? "pm" : "am";

      // Day name part
      const dayNameIdx = cfg[0];
      const dayNameMap = ["",dowL.slice(0,1),dowL.slice(0,2),dow3,dow4,dow5,dowL];
      const dayNameStr = dayNameIdx === 0 ? "" : (dayNameMap[dayNameIdx] || "");

      // Day number
      const dayNumIdx = cfg[1];
      const dayNumStr = dayNumIdx === 0 ? "" : dayNumIdx === 1 ? String(d) : dd;

      // Month
      const moIdx = cfg[2];
      const moStr = moIdx === 0 ? "" : moIdx === 1 ? String(mo) : mm;

      // Year
      const yrIdx = cfg[3];
      const yrStr = yrIdx === 0 ? "" : yrIdx === 1 ? yy : yyyy;

      // Hour
      const hrIdx = cfg[4];
      let hrStr = "";
      if      (hrIdx === 1) hrStr = String(h12);
      else if (hrIdx === 2) hrStr = String(h12).padStart(2,"0");
      else if (hrIdx === 3) hrStr = String(h24);
      else if (hrIdx === 4) hrStr = String(h24).padStart(2,"0");

      // Minutes
      const minStr = cfg[5] === 0 ? "" : mi;
      // Seconds
      const secStr = cfg[6] === 0 ? "" : se;
      // Millis
      const amStr  = cfg[7] === 0 ? "" : ampm;

      // Build date line
      const dateParts = [dayNameStr, [dayNumStr, moStr, yrStr].filter(Boolean).join("/")].filter(Boolean);
      const dateLine = dateParts.join(" ");

      // Build time line
      let timeParts = [hrStr];
      if (minStr) timeParts.push(minStr);
      if (secStr) timeParts.push(secStr);
      const timeBase = timeParts.filter(Boolean).join(":");
      const timeLine = [timeBase, amStr ? " "+amStr : ""].join("").trim();

      return { dateLine, timeLine };
    }

    function tick() {
      const now = new Date();
      const { dateLine, timeLine } = buildDateTime(now, tumblerCfg);
      dateEl.innerHTML = dateLine.replace(/\s/g,"<br>");
      timeEl.textContent = timeLine;
    }

    let _dateCycleStep = 0;
dateEl.closest(".top-item").addEventListener("click", () => {
  const saved = window._clockGet().tumblerCfg;
  if (_dateCycleStep === 0) { _dateCycleStep = 1; return; }
  const cfg = saved.slice();
  if (_dateCycleStep === 1) {
    // Toggle day padding d <-> dd
    if      (cfg[1] === 1) cfg[1] = 2;
    else if (cfg[1] === 2) cfg[1] = 1;
    _dateCycleStep = 2;
  } else if (_dateCycleStep === 2) {
    // Toggle month padding m <-> mm
    if      (cfg[2] === 1) cfg[2] = 2;
    else if (cfg[2] === 2) cfg[2] = 1;
    _dateCycleStep = 3;
  } else if (_dateCycleStep === 3) {
    // Toggle year yy <-> yyyy
    if      (cfg[3] === 1) cfg[3] = 2;
    else if (cfg[3] === 2) cfg[3] = 1;
    _dateCycleStep = 0;
  }
  window._clockSet(cfg);
});
    let _timeCycleStep = 0;
    timeEl.closest(".top-item").addEventListener("click", () => {
      const saved = window._clockGet().tumblerCfg;
      // Step 0: jump back to saved (settings) state
      if (_timeCycleStep === 0) {
        _timeCycleStep = 1;
        return; // already showing saved state, just advance step
      }
      const cfg = saved.slice();
      const savedHour = saved[4]; // 0=—,1=12h,2=12hh,3=24h,4=24hh
      const is12 = savedHour === 1 || savedHour === 2;
      const isPadded = savedHour === 2 || savedHour === 4;
      if (_timeCycleStep === 1) {
        // Toggle hh<->h (flip padding, keep 12/24)
        if      (savedHour === 1) cfg[4] = 2;
        else if (savedHour === 2) cfg[4] = 1;
        else if (savedHour === 3) cfg[4] = 4;
        else if (savedHour === 4) cfg[4] = 3;
        cfg[7] = (cfg[4] === 1 || cfg[4] === 2) ? 1 : 0;
        _timeCycleStep = 2;
      } else if (_timeCycleStep === 2) {
        // Toggle 12<->24, keep original padding from saved
        if (is12) cfg[4] = isPadded ? 4 : 3;
        else      cfg[4] = isPadded ? 2 : 1;
        cfg[7] = (cfg[4] === 1 || cfg[4] === 2) ? 1 : 0;
        _timeCycleStep = 3;
      } else if (_timeCycleStep === 3) {
        // Toggle hh<->h again on the current 12/24
        const cur = cfg[4];
        if      (cur === 1) cfg[4] = 2;
        else if (cur === 2) cfg[4] = 1;
        else if (cur === 3) cfg[4] = 4;
        else if (cur === 4) cfg[4] = 3;
        cfg[7] = (cfg[4] === 1 || cfg[4] === 2) ? 1 : 0;
        _timeCycleStep = 0; // next tap resets to saved
      }
      window._clockSet(cfg);
    });

    tick();
    setInterval(tick, 1000);
  })();

  // ── My Files ───────────────────────────────────────────────
  function openMyFiles() { if (window.AndroidSettings && window.AndroidSettings.openMyFiles) { window.AndroidSettings.openMyFiles(); } else { window.location.href = 'habitnotify://myfiles'; } }
  // ── Service Worker ─────────────────────────────────────────
  if ('serviceWorker' in navigator && !location.hostname.includes('claudeusercontent.com')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then(r => {
          console.log('SW registered', r);
          navigator.serviceWorker.addEventListener('message', ev => {
            const vEl = document.getElementById('app-version');
            if (!vEl) return;
            if (ev.data.type === 'sw-installing') {
              vEl.dataset.swPrev = vEl.textContent;
              vEl.textContent = 'loading...';
              vEl.style.opacity = '0.5';
            } else if (ev.data.type === 'sw-installed') {
              vEl.textContent = vEl.dataset.swPrev || vEl.textContent;
              vEl.style.opacity = '';
            } else if (ev.data.type === 'sw-activated') {
              vEl.style.outline = '2px solid #99ff99';
              vEl.style.borderRadius = '3px';
              setTimeout(() => { vEl.style.outline = ''; vEl.style.borderRadius = ''; }, 2000);
            }
          });
        })
        .catch(err => console.error('SW failed', err));
    });
  }