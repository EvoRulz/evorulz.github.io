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
  function openMyFiles() { window.location.href = "myfiles://downloads"; }

  // ── Service Worker ─────────────────────────────────────────
  if ('serviceWorker' in navigator && !location.hostname.includes('claudeusercontent.com')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then(r => console.log('SW registered', r))
        .catch(err => console.error('SW failed', err));
    });
  }

  // ── Constants ──────────────────────────────────────────────
  const MIN_DATE       = new Date("2026-03-14");
  const MAX_DATE       = new Date("2111-04-19");
  const STATUSES       = ["yes", "no", "idk", "not yet", "n/a"];
  const CHUNK          = 30;
  const SET_BAR_MAX    = 100;
  const TOTAL_BAR_MAX  = 100;
  const STREAK_BAR_MAX = 30;
  const NUM_SETS       = 10;

  // ── Status colour ──────────────────────────────────────────
  function applyStatusColor(el) {
    const v = el.value;
    if      (v === "yes") { el.style.background = "#90EE90"; el.style.color = "#000"; }
    else if (v === "no")  { el.style.background = "#cc0000"; el.style.color = "#fff"; }
    else if (v === "n/a") { el.style.background = "#228B22"; el.style.color = "#fff"; }
    else if (v === "")    { el.style.background = "transparent"; el.style.color = "#fff"; }
    else                  { el.style.background = "#FFD580"; el.style.color = "#000"; }
  }

  // ── Confirmation overlay ───────────────────────────────────
  let _confirmResolve = null;
  function confirmClear(bodyHTML) {
    return new Promise(resolve => {
      _confirmResolve = resolve;
      document.getElementById("confirm-msg").innerHTML =
        bodyHTML + '<br><br>Type <strong>Habit Tracker</strong> and press Enter to confirm.';
      const input = document.getElementById("confirm-input");
      input.value = "";
      document.getElementById("confirm-hint").textContent = "";
      input.classList.remove("shake");
      document.getElementById("confirm-overlay").classList.add("active");
      setTimeout(() => input.focus(), 60);
    });
  }
  function confirmCancel() {
    document.getElementById("confirm-overlay").classList.remove("active");
    if (_confirmResolve) { _confirmResolve(false); _confirmResolve = null; }
  }
  document.getElementById("confirm-input").addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    const input = document.getElementById("confirm-input");
    const hint  = document.getElementById("confirm-hint");
    if (input.value === "Habit Tracker") {
      document.getElementById("confirm-overlay").classList.remove("active");
      if (_confirmResolve) { _confirmResolve(true); _confirmResolve = null; }
    } else {
      hint.textContent = "Incorrect — try again.";
      input.classList.remove("shake");
      void input.offsetWidth;
      input.classList.add("shake");
    }
  });
  document.getElementById("confirm-overlay").addEventListener("click", e => {
    if (e.target === document.getElementById("confirm-overlay")) confirmCancel();
  });

  // ── Tracker configs (dynamic) ──────────────────────────────
  const CONFIG_DEFAULTS = [
    { id: "pushups", label: "Pushups", type: "sets"   },
    { id: "teeth",   label: "Teeth",   type: "simple" },
    { id: "appdev",  label: "App Dev", type: "simple" },
  ];

  function buildTrackerConfig(raw) {
    const cfg = { id: raw.id, label: raw.label, hasSets: raw.type === "sets" };
    if (raw.type === "sets") {
      cfg.hasStreak  = row => row && sum(row.sets) > 0;
      cfg.autoStatus = row => {
        if (!row || !row.sets) return null;
        return row.sets.every(s => s === null || s === undefined) ? "" : sum(row.sets) > 0 ? "yes" : "no";
      };
    } else {
      cfg.hasStreak  = row => row && row.status === "yes";
      cfg.autoStatus = null;
    }
    return cfg;
  }

  function loadRawConfigs() {
    try {
      const s = JSON.parse(localStorage.getItem("_trackerConfigs"));
      if (Array.isArray(s) && s.length) return s;
    } catch {}
    return CONFIG_DEFAULTS.slice();
  }

  function saveRawConfigs() {
    const raw = TRACKER_CONFIGS.map(c => ({ id: c.id, label: c.label, type: c.hasSets ? "sets" : "simple" }));
    localStorage.setItem("_trackerConfigs", JSON.stringify(raw));
    APP_PREFIXES = TRACKER_CONFIGS.map(c => c.id + ":");
  }

  let TRACKER_CONFIGS = loadRawConfigs().map(buildTrackerConfig);

  // ── Utils ──────────────────────────────────────────────────
  function dateStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  function exportDateStr(d) {
    return `${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getFullYear()).slice(-2)}`;
  }
  function displayDate(iso) {
    const [y,m,d] = iso.split("-");
    const dow = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(Number(y), Number(m)-1, Number(d)).getDay()];
    return `${dow}<br>${Number(d)}/${Number(m)}/${y.slice(-2)}`;
  }
  function offsetDate(base, days) {
    const d = new Date(base); d.setDate(d.getDate() + days); return d;
  }
  function clamp(d) {
    if (d < MIN_DATE) return new Date(MIN_DATE);
    if (d > MAX_DATE) return new Date(MAX_DATE);
    return d;
  }
  function sum(sets) { return (sets||[]).reduce((a,b) => a + (b??0), 0); }

  // ── Global dispatch ────────────────────────────────────────
  const trackers = {};
  function onSelectChange(id,ds,el) { trackers[id].onSelectChange(ds,el); }
  function onReasonInput(id,ds,el)  { trackers[id].onReasonInput(ds,el); }
  function onSetInput(id,ds)         { trackers[id].onInput(ds); }
  function onHeaderClick(id,key)     { trackers[id].onHeaderClick(key); }
  function onFilterChange(id,val)   { trackers[id].onFilterChange(val); }
  function jumpToToday(id)           { trackers[id].jumpToToday(); }
  function exportData(id)             { trackers[id].exportData(); }
  function importData(id,el)          { trackers[id].importData(el); }
  function clearData(id)              { trackers[id].clearData(); }

  // ── Tracker factory ────────────────────────────────────────
  function createTracker(config) {
    const { id, label, hasSets, hasStreak, autoStatus } = config;
    const prefix = id + ":";
    const store = {};
    let sortKey="date", sortDir=1, filterStatus="", viewDates=null, topDate, bottomDate;

    function sel(q)    { return document.querySelector(`#section-${id} ${q}`); }
    function selAll(q) { return document.querySelectorAll(`#section-${id} ${q}`); }

    function loadAll() {
      for (let i=0;i<localStorage.length;i++) {
        const key=localStorage.key(i);
        if (!key.startsWith(prefix)) continue;
        const ds=key.slice(prefix.length);
        try { store[ds]=JSON.parse(localStorage.getItem(key)); } catch {}
      }
    }
    function save(ds) { localStorage.setItem(prefix+ds, JSON.stringify(store[ds])); }
    function getRow(ds) {
      if (hasSets) return store[ds] || { status:"", reason:"", sets:Array(NUM_SETS).fill(null) };
      return store[ds] || { status:"", reason:"" };
    }
    function setRowFromDOM(ds) {
      const row=sel(`tr[data-date="${ds}"]`); if (!row) return;
      const cells=row.querySelectorAll("td");
      const status=cells[1].querySelector("select").value;
      const reason=cells[2].querySelector("textarea").value;
      if (hasSets) {
        const sets=[...cells].slice(5).map(c => {
          const inp=c.querySelector("input"); if (!inp) return null;
          const v=inp.value;
          return (v===""||v===null||v===undefined) ? null : Number(v);
        });
        store[ds]={status,reason,sets};
      } else {
        store[ds]={status,reason};
      }
      save(ds);
    }

    function computeStreak(ds) {
      let n=0, curr=new Date(ds);
      while (curr>=MIN_DATE) {
        const data=store[dateStr(curr)];
        if (hasStreak(data)) { n++; curr.setDate(curr.getDate()-1); } else break;
      }
      return n;
    }

    function buildView() {
      if (filterStatus==="") { viewDates=null; return; }
      viewDates=Object.entries(store).filter(([,v])=>v.status===filterStatus).map(([k])=>k);
      if (sortKey==="date") viewDates.sort((a,b)=>sortDir*a.localeCompare(b));
      else if (sortKey==="total"&&hasSets) viewDates.sort((a,b)=>sortDir*(sum(store[a]?.sets)-sum(store[b]?.sets)));
      else if (sortKey==="status") viewDates.sort((a,b)=>sortDir*(store[a]?.status||"").localeCompare(store[b]?.status||""));
      else if (sortKey.startsWith("set")&&hasSets) {
        const idx=parseInt(sortKey.slice(3))-1;
        viewDates.sort((a,b)=>sortDir*((store[a]?.sets?.[idx]??0)-(store[b]?.sets?.[idx]??0)));
      }
    }

    function makeRow(ds) {
      const saved=getRow(ds);
      const streak=computeStreak(ds);
      const streakPct=Math.min(streak,STREAK_BAR_MAX)/STREAK_BAR_MAX*100;
      const statusOpts=`<option value=""></option>`+
        STATUSES.map(s=>`<option value="${s}"${saved.status===s?" selected":""}>${s}</option>`).join("");

      const tr=document.createElement("tr");
      tr.dataset.date=ds;
      let html=`
        <td>${displayDate(ds)}</td>
        <td style="padding:0"><select onchange="onSelectChange('${id}','${ds}',this)">${statusOpts}</select></td>
        <td style="padding:0"><textarea oninput="onReasonInput('${id}','${ds}',this)">${saved.reason||""}</textarea></td>
        <td class="set-cell">
          <div style="text-align:center;font-size:12px;line-height:18px">${streak||""}</div>
          <div class="bar-container"><div class="bar-streak" style="width:${streakPct}%"></div></div>
        </td>`;
      if (hasSets) {
        const total=sum(saved.sets);
        const totalPct=Math.min(total,TOTAL_BAR_MAX)/TOTAL_BAR_MAX*100;
        html+=`<td class="set-cell">
          <div style="text-align:center;font-size:12px;line-height:18px">${total||""}</div>
          <div class="bar-container"><div class="bar-total" style="width:${totalPct}%"></div></div>
        </td>`;
        for (let s=0;s<NUM_SETS;s++) {
          const val=saved.sets[s];
          const displayVal=(val===null||val===undefined)?"":val;
          const numVal=val??0;
          const pct=Math.min(numVal,SET_BAR_MAX)/SET_BAR_MAX*100;
          html+=`<td class="set-cell">
            <input type="number" min="0" value="${displayVal}" placeholder=""
              oninput="onSetInput('${id}','${ds}')">
            <div class="bar-container"><div class="bar" style="width:${pct}%"></div></div>
          </td>`;
        }
      }
      tr.innerHTML=html;
      const ss=tr.querySelector("select");
      if (ss) applyStatusColor(ss);
      return tr;
    }

    function updateBars() {
      const tbody=sel("tbody"); if (!tbody) return;
      if (hasSets) {
        for (let col=0;col<NUM_SETS;col++) {
          [...tbody.querySelectorAll(`tr td:nth-child(${col+6}) input`)].forEach(i=>{
            const pct=Math.min(Number(i.value||0),SET_BAR_MAX)/SET_BAR_MAX*100;
            const bar=i.parentElement.querySelector(".bar");
            if (bar) bar.style.width=pct+"%";
          });
        }
      }
    }
    function updateStreakAndTotal() {
      const tbody=sel("tbody"); if (!tbody) return;
      [...tbody.querySelectorAll("tr")].forEach(row=>{
        const ds=row.dataset.date;
        const cells=row.querySelectorAll("td");
        const streak=computeStreak(ds);
        const sp=Math.min(streak,STREAK_BAR_MAX)/STREAK_BAR_MAX*100;
        cells[3].querySelector("div").textContent=streak||"";
        cells[3].querySelector(".bar-streak").style.width=sp+"%";
        if (hasSets) {
          const total=sum(store[ds]?.sets||[]);
          const tp=Math.min(total,TOTAL_BAR_MAX)/TOTAL_BAR_MAX*100;
          cells[4].querySelector("div").textContent=total||"";
          cells[4].querySelector(".bar-total").style.width=tp+"%";
        }
      });
    }
    function updateStats() {
      const el=sel(".stats"); if (!el) return;
      const entries=Object.values(store);
      if (hasSets) {
        el.textContent=`${entries.length} days logged · ${entries.reduce((t,r)=>t+sum(r.sets),0)} total reps`;
      } else {
        el.textContent=`${entries.length} days logged`;
      }
    }

    function onSelectChange(ds,el) {
      if (!store[ds]) store[ds]=getRow(ds);
      store[ds].status=el.value; save(ds);
      applyStatusColor(el);
      updateStreakAndTotal(); updateStats();
    }
    function onReasonInput(ds,el) {
      if (!store[ds]) store[ds]=getRow(ds);
      store[ds].reason=el.value; save(ds);
    }
    function onInput(ds) {
      setRowFromDOM(ds);
      if (autoStatus) {
        const ns=autoStatus(store[ds]);
        if (ns!==null) {
          store[ds].status=ns; save(ds);
          const row=sel(`tr[data-date="${ds}"]`);
          if (row) {
            const ss=row.querySelectorAll("td")[1].querySelector("select");
            if (ss) { ss.value=ns; applyStatusColor(ss); }
          }
        }
      }
      updateStreakAndTotal(); updateBars(); updateStats();
    }
    function onHeaderClick(key) {
      if (sortKey===key) sortDir*=-1; else { sortKey=key; sortDir=1; }
      buildView(); rerenderTable(); updateHeaderClasses();
    }
    function updateHeaderClasses() {
      selAll("th[data-sort]").forEach(th=>{
        th.classList.remove("sorted-asc","sorted-desc");
        if (th.dataset.sort===sortKey) th.classList.add(sortDir===1?"sorted-asc":"sorted-desc");
      });
    }
    function onFilterChange(val) { filterStatus=val; buildView(); rerenderTable(); }

    async function clearData() {
      const ok=await confirmClear(`This will permanently delete all saved data for <strong>${label}</strong>.`);
      if (!ok) return;
      const keys=[];
      for (let i=0;i<localStorage.length;i++) {
        const k=localStorage.key(i); if (k.startsWith(prefix)) keys.push(k);
      }
      keys.forEach(k=>localStorage.removeItem(k));
      for (const ds in store) delete store[ds];
      buildView(); rerenderTable(); updateStats();
    }

    function scrollToDate(ds) {
      const container=sel(".scroll-container");
      const row=sel(`tr[data-date="${ds}"]`);
      if (!container||!row) return;
      const thead=container.querySelector("thead");
      const th=thead?thead.getBoundingClientRect().height:0;
      container.scrollTop+=row.getBoundingClientRect().top-container.getBoundingClientRect().top-th;
    }
    function jumpToToday() {
      filterStatus="";
      const fs=sel(".filter-select"); if (fs) fs.value="";
      buildView(); rerenderTable();
      setTimeout(()=>scrollToDate(dateStr(new Date())),50);
    }

    function buildHeader() {
      const sh=hasSets
        ?`<th data-sort="total" onclick="onHeaderClick('${id}','total')">Total</th>`+
          Array.from({length:NUM_SETS},(_,i)=>
            `<th data-sort="set${i+1}" onclick="onHeaderClick('${id}','set${i+1}')">Set ${i+1}</th>`
          ).join("")
        :"";
      return `<thead><tr>
        <th data-sort="date"   onclick="onHeaderClick('${id}','date')">Date</th>
        <th data-sort="status" onclick="onHeaderClick('${id}','status')">Status</th>
        <th>Reason</th><th>Streak</th>${sh}
      </tr></thead>`;
    }
    function rerenderTable() {
      const tbody=sel("tbody"), st=sel(".sentinel-top"), sb=sel(".sentinel-bottom");
      tbody.innerHTML="";
      if (viewDates===null) {
        const today=new Date(); today.setHours(0,0,0,0);
        topDate=clamp(offsetDate(today,-CHUNK)); bottomDate=clamp(offsetDate(today,CHUNK));
        for (let d=new Date(topDate);d<=bottomDate;d.setDate(d.getDate()+1))
          tbody.appendChild(makeRow(dateStr(new Date(d))));
        st.style.display=""; sb.style.display="";
        scrollToDate(dateStr(new Date()));
      } else {
        st.style.display="none"; sb.style.display="none";
        viewDates.forEach(ds=>tbody.appendChild(makeRow(ds)));
      }
      updateBars();
    }
    function setupObservers() {
      const container=sel(".scroll-container");
      const opts={root:container,threshold:0};
      new IntersectionObserver(entries=>{
        if (!entries[0].isIntersecting||viewDates!==null||topDate<=MIN_DATE) return;
        const tbody=sel("tbody"), frag=document.createDocumentFragment();
        for (let i=0;i<CHUNK;i++) {
          topDate=clamp(offsetDate(topDate,-1));
          if (topDate<=MIN_DATE) break;
          frag.appendChild(makeRow(dateStr(new Date(topDate))));
        }
        tbody.prepend(frag);
        for (let i=0;i<CHUNK;i++) {
          const last=tbody.lastElementChild; if (!last) break;
          tbody.removeChild(last); bottomDate=clamp(offsetDate(bottomDate,-1));
        }
        updateBars();
      },opts).observe(sel(".sentinel-top"));
      new IntersectionObserver(entries=>{
        if (!entries[0].isIntersecting||viewDates!==null||bottomDate>=MAX_DATE) return;
        const tbody=sel("tbody"), frag=document.createDocumentFragment();
        for (let i=0;i<CHUNK;i++) {
          bottomDate=clamp(offsetDate(bottomDate,1));
          if (bottomDate>=MAX_DATE) break;
          frag.appendChild(makeRow(dateStr(new Date(bottomDate))));
        }
        tbody.append(frag);
        for (let i=0;i<CHUNK;i++) {
          const first=tbody.firstElementChild; if (!first) break;
          tbody.removeChild(first); topDate=clamp(offsetDate(topDate,1));
        }
        updateBars();
      },opts).observe(sel(".sentinel-bottom"));
    }

    function exportData() {
      const out={};
      for (let i=0;i<localStorage.length;i++) {
        const k=localStorage.key(i); if (k.startsWith(prefix)) out[k]=localStorage.getItem(k);
      }
      const blob=new Blob([JSON.stringify(out,null,2)],{type:"application/json"});
      const a=document.createElement("a");
      a.href=URL.createObjectURL(blob); a.download=`${label}-${exportDateStr(new Date())}.json`;
      a.click(); URL.revokeObjectURL(a.href);
    }
    function importData(input) {
      const file=input.files[0]; if (!file) return;
      const reader=new FileReader();
      reader.onload=e=>{
        try {
          const data=JSON.parse(e.target.result); let count=0;
          // Detect the source prefix: find the common prefix of all keys in the file
          const keys=Object.keys(data);
          if (!keys.length) { alert("No data found in file."); return; }
          const srcPrefix=keys[0].slice(0, keys[0].indexOf(":")+1);
          const allSamePrefix=keys.every(k=>k.startsWith(srcPrefix));
          if (!allSamePrefix) { alert("Invalid backup file."); return; }
          const srcName=file.name.replace(/-\d{2}-\d{2}-\d{2}\.json$/,"");
          if (srcName !== label) {
            const go=window.confirm(`This file is from "${srcName}" but you are importing into "${label}".\n\nContinue?`);
            if (!go) { input.value=""; return; }
          }
          for (const [key,val] of Object.entries(data)) {
            const ds=key.slice(srcPrefix.length);
            const remapped=prefix+ds;
            localStorage.setItem(remapped,val);
            try { store[ds]=JSON.parse(val); } catch {}
            count++;
          }
          input.value=""; buildView(); rerenderTable(); updateStats();
          alert(`Imported ${count} entries.`);
        } catch { alert("Invalid backup file."); }
      };
      reader.readAsText(file);
    }

    function init() {
      loadAll(); buildView();
      const today=new Date(); today.setHours(0,0,0,0);
      topDate=clamp(offsetDate(today,-CHUNK)); bottomDate=clamp(offsetDate(today,CHUNK));
      const section=document.getElementById(`section-${id}`);
      section.innerHTML=`
        <div class="controls">
          <label>Filter:
            <select class="filter-select" onchange="onFilterChange('${id}',this.value)">
              <option value="">All</option>
              ${STATUSES.map(s=>`<option value="${s}">${s}</option>`).join("")}
            </select>
          </label>
          <button onclick="jumpToToday('${id}')">Today</button>
          <button onclick="exportData('${id}')">Export</button>
          <button onclick="document.getElementById('import-${id}').click()">Import</button>
          <input type="file" id="import-${id}" accept=".json" style="display:none"
            onchange="importData('${id}',this)">
          <button class="btn-clear" onclick="clearData('${id}')">Clear</button>
        </div>
        <div class="stats"></div>
        <div class="scroll-container">
          <div class="sentinel sentinel-top"></div>
          <table>${buildHeader()}<tbody></tbody></table>
          <div class="sentinel sentinel-bottom"></div>
        </div>`;
      const tbody=sel("tbody");
      for (let d=new Date(topDate);d<=bottomDate;d.setDate(d.getDate()+1))
        tbody.appendChild(makeRow(dateStr(new Date(d))));
      updateBars(); updateStats(); updateHeaderClasses(); setupObservers();
      scrollToDate(dateStr(today));
    }

    function reload() { loadAll(); buildView(); rerenderTable(); updateStats(); }

    return { init, reload, onSelectChange, onReasonInput, onInput,
             onHeaderClick, onFilterChange, jumpToToday, exportData, importData, clearData };
  }

  // ── App-level export / import / clear ─────────────────────
  let APP_PREFIXES = TRACKER_CONFIGS.map(c => c.id + ":");

function appExport() {
    const out={};
    for (let i=0;i<localStorage.length;i++) {
      const k=localStorage.key(i);
      if (APP_PREFIXES.some(p=>k.startsWith(p))) out[k]=localStorage.getItem(k);
    }
    const clk = window._clockGet();
    const saveStyle = Object.assign({}, appStyle, { imgData: null });
    [
      "_buttonOrder","_widgetOrder","_topGridOrder","_habitsVisible",
      "_trackerConfigs",
      "_btnStyle","_btnStyles",
      "_appStyle","_cfTuning","_settingsGroupOrder",
      "_clockTumbler",
    ].forEach(k=>{ const v=localStorage.getItem(k); if (v!=null) out[k]=v; });
    out["_clockTumbler"] = JSON.stringify(clk.tumblerCfg);
    out["_appStyle"]     = JSON.stringify(saveStyle);
    out["_btnStyles"]    = JSON.stringify(_btnStyles);
    const blob=new Blob([JSON.stringify(out,null,2)],{type:"application/json"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob); a.download=`all-${exportDateStr(new Date())}.json`;
    a.click(); URL.revokeObjectURL(a.href);
  }
  function appImport(input) {
    const file=input.files[0]; if (!file) return;
    const reader=new FileReader();
    reader.onload=e=>{
      try {
        const data=JSON.parse(e.target.result); let count=0;
        for (const [key,val] of Object.entries(data)) {
          if (APP_PREFIXES.some(p=>key.startsWith(p))) { localStorage.setItem(key,val); count++; }
        }
        if (data["_buttonOrder"])  { localStorage.setItem("_buttonOrder",  data["_buttonOrder"]);  applyButtonOrder(); }
        if (data["_widgetOrder"])  { localStorage.setItem("_widgetOrder",  data["_widgetOrder"]);  applyWidgetOrder(); }
        if (data["_topGridOrder"]) { localStorage.setItem("_topGridOrder", data["_topGridOrder"]); applyTopGridOrder(); }
        if (data["_btnStyle"])     { localStorage.setItem("_btnStyle",     data["_btnStyle"]);
                                     try { btnStyle = Object.assign({}, BTN_STYLE_DEFAULTS, JSON.parse(data["_btnStyle"])); applyBtnStyle(); } catch {} }
        if (data["_habitsVisible"] != null) {
          habitsVisible = data["_habitsVisible"] !== "false" && data["_habitsVisible"] !== false;
          buttonsEl.style.display = habitsVisible ? "" : "none";
          document.getElementById("hide-habits-btn").textContent = habitsVisible ? "Hide Habits" : "Show Habits";
          localStorage.setItem("_habitsVisible", habitsVisible);
        }
        if (data["_trackerConfigs"]) {
          try {
            const rawCfgs = JSON.parse(data["_trackerConfigs"]);
            if (Array.isArray(rawCfgs) && rawCfgs.length) {
              localStorage.setItem("_trackerConfigs", data["_trackerConfigs"]);
              TRACKER_CONFIGS.length = 0;
              rawCfgs.forEach(r => TRACKER_CONFIGS.push(buildTrackerConfig(r)));
              APP_PREFIXES = TRACKER_CONFIGS.map(c => c.id + ":");
              TRACKER_CONFIGS.forEach(cfg => {
                if (!sectionEls[cfg.id]) {
                  const section = document.createElement("div");
                  section.id = `section-${cfg.id}`;
                  section.className = "tracker-section";
                  sectionsEl.appendChild(section);
                  sectionEls[cfg.id] = section;
                }
              });
            }
          } catch {}
        }
        if (data["_btnStyles"]) {
          try {
            _btnStyles = Object.assign({}, JSON.parse(data["_btnStyles"]));
            _saveBtnStyles();
          } catch {}
        }
        if (data["_appStyle"]) {
          try {
            appStyle = Object.assign({}, APP_STYLE_DEFAULTS, JSON.parse(data["_appStyle"]));
            localStorage.setItem("_appStyle", data["_appStyle"]);
            applyAppStyle();
          } catch {}
        }
        if (data["_cfTuning"]) {
          try {
            Object.assign(cfTuning, JSON.parse(data["_cfTuning"]));
            localStorage.setItem("_cfTuning", data["_cfTuning"]);
          } catch {}
        }
        if (data["_settingsGroupOrder"]) {
          try {
            localStorage.setItem("_settingsGroupOrder", data["_settingsGroupOrder"]);
            applySettingsGroupOrder();
          } catch {}
        }
        if (data["_clockTumbler"]) {
          try {
            const cfg = JSON.parse(data["_clockTumbler"]);
            if (Array.isArray(cfg) && cfg.length === 8) {
              localStorage.setItem("_clockTumbler", data["_clockTumbler"]);
              window._clockSet(cfg);
              if (window._tumblerRefresh) window._tumblerRefresh();
            }
          } catch {}
        }
        input.value="";
        applyButtonOrder();
        applyBtnStyle();
        Object.values(trackers).forEach(t=>{ if (t.reload) t.reload(); });
        showAlert(`Imported ${count} entries across all trackers.`);
      } catch { showAlert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  }
  function exportLayout() {
    const order=localStorage.getItem("_buttonOrder");
    const out={ "_buttonOrder": order || JSON.stringify(TRACKER_CONFIGS.map(c=>c.id)), "_widgetOrder": localStorage.getItem("_widgetOrder")||"", "_topGridOrder": localStorage.getItem("_topGridOrder")||"", "_habitsVisible": localStorage.getItem("_habitsVisible")||"true" };
    const blob=new Blob([JSON.stringify(out,null,2)],{type:"application/json"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob); a.download=`layout-${exportDateStr(new Date())}.json`;
    a.click(); URL.revokeObjectURL(a.href);
  }
  function importLayout(input) {
    const file=input.files[0]; if (!file) return;
    const reader=new FileReader();
    reader.onload=e=>{
      try {
        const data=JSON.parse(e.target.result);
        if (!data["_buttonOrder"]) { alert("No layout data found in file."); return; }
        localStorage.setItem("_buttonOrder", data["_buttonOrder"]);
          applyButtonOrder();
        if (data["_widgetOrder"]) { localStorage.setItem("_widgetOrder", data["_widgetOrder"]); applyWidgetOrder(); }
        if (data["_topGridOrder"]) { localStorage.setItem("_topGridOrder", data["_topGridOrder"]); applyTopGridOrder(); }
        if (data["_habitsVisible"] != null) {
          habitsVisible = data["_habitsVisible"] !== "false" && data["_habitsVisible"] !== false;
          buttonsEl.style.display = habitsVisible ? "" : "none";
          document.getElementById("hide-habits-btn").textContent = habitsVisible ? "Hide Habits" : "Show Habits";
          localStorage.setItem("_habitsVisible", habitsVisible);
        }
        input.value="";
        alert("Layout imported.");
      } catch { alert("Invalid layout file."); }
    };
    reader.readAsText(file);
  }
  function applyButtonOrder() {
    const order=loadButtonOrder();
    // Remove all current children
    while (buttonsEl.firstChild) buttonsEl.removeChild(buttonsEl.firstChild);
    order.forEach(id => {
      if (!id) {
        const slot=document.createElement("div"); slot.className="empty-slot"; buttonsEl.appendChild(slot);
      } else {
        const config=TRACKER_CONFIGS.find(c=>c.id===id);
        if (config) buttonsEl.appendChild(makeTrackerBtn(config));
      }
    });
    padEmptySlots();
    applyBtnStyle();
    equalizeButtonSizes();
  }
  async function appClear() {
    const ok=await confirmClear("This will permanently delete <strong>all data across every tracker</strong>.");
    if (!ok) return;
    const keys=[];
    for (let i=0;i<localStorage.length;i++) {
      const k=localStorage.key(i);
      if (APP_PREFIXES.some(p=>k.startsWith(p))) keys.push(k);
    }
    keys.forEach(k=>localStorage.removeItem(k));
    Object.values(trackers).forEach(t=>{ if (t.reload) t.reload(); });
  }

  // ── Bootstrap ──────────────────────────────────────────────
  const buttonsEl  = document.getElementById("buttons");
  const sectionsEl = document.getElementById("sections");

  // Pre-create all section divs (always present in DOM so open state survives reorder)
  const sectionEls = {};
  TRACKER_CONFIGS.forEach(config => {
    const section = document.createElement("div");
    section.id        = `section-${config.id}`;
    section.className = "tracker-section";
    sectionsEl.appendChild(section);
    sectionEls[config.id] = section;
  });

  // Track which trackers have been lazy-initialised
  const initializedSet = new Set();

  // ── Active section management ──────────────────────────────
  // Only one section open at a time; button glows when its section is open.
  function getActiveSectionId() {
    return TRACKER_CONFIGS.map(c=>c.id).find(id => sectionEls[id].style.display === "block") || null;
  }

  function setActiveSection(targetId) {
    // Close all sections and unglow all buttons
    TRACKER_CONFIGS.forEach(c => {
      sectionEls[c.id].style.display = "none";
      const btn = buttonsEl.querySelector(`.tracker-btn[data-id="${c.id}"]`);
      if (btn) btn.classList.remove("active");
    });

    if (!targetId) return; // just close everything

    // Open target and glow its button
    sectionEls[targetId].style.display = "block";
    const btn = buttonsEl.querySelector(`.tracker-btn[data-id="${targetId}"]`);
    if (btn) btn.classList.add("active");

    // Lazy-init tracker
    if (!initializedSet.has(targetId)) {
      const config = TRACKER_CONFIGS.find(c => c.id === targetId);
      trackers[targetId] = createTracker(config);
      trackers[targetId].init();
      initializedSet.add(targetId);
    }
  }

  // ── Button order persistence ───────────────────────────────
  function loadButtonOrder() {
    try {
      const saved = JSON.parse(localStorage.getItem("_buttonOrder"));
      if (Array.isArray(saved)) {
        const knownIds = new Set(TRACKER_CONFIGS.map(c => c.id));
        // Filter out deleted habits, keep nulls (empty slots) and known ids
        const filtered = saved.filter(id => !id || knownIds.has(id));
        // Append any newly added habits not yet in the saved order
        const presentIds = new Set(filtered.filter(Boolean));
        TRACKER_CONFIGS.forEach(c => { if (!presentIds.has(c.id)) filtered.push(c.id); });
        return filtered;
      }
    } catch {}
    return TRACKER_CONFIGS.map(c => c.id);
  }
  function saveButtonOrder() {
    // Save full slot layout — null for empty slots so positions persist
    const order = [...buttonsEl.children].map(el => el.dataset.id || null);
    localStorage.setItem("_buttonOrder", JSON.stringify(order));
  }

  // ── Create a tracker toggle button element ─────────────────
  function makeTrackerBtn(config) {
    const btn = document.createElement("button");
    btn.className   = "tracker-btn";
    btn.dataset.id  = config.id;
    btn.textContent = config.label;
    btn.addEventListener('pointerdown', () => {
      const _s = _btnStyleFor(config.id);
      btn.style.background = hex8ToCss(_s.tap || btnStyle.tap);
    });
    btn.addEventListener('pointerup',     () => { const _s = _btnStyleFor(config.id); btn.style.background = hex8ToCss(_s.bg); });
    btn.addEventListener('pointercancel', () => { const _s = _btnStyleFor(config.id); btn.style.background = hex8ToCss(_s.bg); });
    return btn;
  }

  // Total grid slots: 3 cols × 3 rows = 9, giving 3 buttons room to spread out
  const TOTAL_SLOTS = 9;

  function padEmptySlots() {
    const total = buttonsEl.children.length;
    for (let i = total; i < TOTAL_SLOTS; i++) {
      const slot = document.createElement("div");
      slot.className = "empty-slot";
      buttonsEl.appendChild(slot);
    }
  }

  // Initial button render in saved order (supports id or null for empty slots)
  loadButtonOrder().forEach(id => {
    if (!id) {
      const slot = document.createElement("div");
      slot.className = "empty-slot";
      buttonsEl.appendChild(slot);
    } else {
      const config = TRACKER_CONFIGS.find(c => c.id === id);
      if (config) buttonsEl.appendChild(makeTrackerBtn(config));
    }
  });
  padEmptySlots(); // fill any remaining slots up to TOTAL_SLOTS

  let _eqFrame = null;
  function equalizeButtonSizes() {
    if (_eqFrame) cancelAnimationFrame(_eqFrame);
    _eqFrame = requestAnimationFrame(() => {
      const btns = [...buttonsEl.querySelectorAll('.tracker-btn')];
      if (!btns.length) return;
      buttonsEl.style.gridAutoRows = '';
      const maxH = Math.max(...btns.map(b => b.offsetHeight));
      buttonsEl.style.gridAutoRows = maxH + 'px';
    });
  }
  equalizeButtonSizes();
  new ResizeObserver(equalizeButtonSizes).observe(buttonsEl);
  function equalizeTopGrid() {
    const items = [...topGrid.querySelectorAll('.top-item')];
    if (!items.length) return;
    topGrid.style.gridAutoRows = '';
    const maxH = Math.max(...items.map(i => i.offsetHeight));
    topGrid.style.gridAutoRows = maxH + 'px';
  }
  requestAnimationFrame(equalizeTopGrid);

  // ── Button style settings ──────────────────────────────────
  // ── IndexedDB image store ──────────────────────────────────
  const ImgDB = (() => {
    let db = null;
    function open() {
      return new Promise((res, rej) => {
        if (db) return res(db);
        const req = indexedDB.open("habitTrackerDB", 1);
        req.onupgradeneeded = e => e.target.result.createObjectStore("kv");
        req.onsuccess = e => { db = e.target.result; res(db); };
        req.onerror   = e => rej(e);
      });
    }
    async function set(key, val) {
      const d = await open();
      return new Promise((res, rej) => {
        const tx = d.transaction("kv", "readwrite");
        tx.objectStore("kv").put(val, key);
        tx.oncomplete = res; tx.onerror = rej;
      });
    }
    async function get(key) {
      const d = await open();
      return new Promise((res, rej) => {
        const tx = d.transaction("kv", "readonly");
        const req = tx.objectStore("kv").get(key);
        req.onsuccess = () => res(req.result ?? null);
        req.onerror   = rej;
      });
    }
    async function del(key) {
      const d = await open();
      return new Promise((res, rej) => {
        const tx = d.transaction("kv", "readwrite");
        tx.objectStore("kv").delete(key);
        tx.oncomplete = res; tx.onerror = rej;
      });
    }
    return { set, get, del };
  })();

  // ── Custom alert with copy button ─────────────────────────
  function showAlert(msg) {
    return new Promise(res => {
      const overlay = document.createElement("div");
      overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.78);z-index:99999;display:flex;align-items:center;justify-content:center;";
      const box = document.createElement("div");
      box.style.cssText = "background:#1c1c1c;border:1px solid #555;border-radius:10px;padding:24px 28px;max-width:380px;width:90%;display:flex;flex-direction:column;gap:12px;";
      const p = document.createElement("p");
      p.style.cssText = "margin:0;font-size:13px;color:#ccc;line-height:1.6;white-space:pre-wrap;word-break:break-word;";
      p.textContent = msg;
      const row = document.createElement("div");
      row.style.cssText = "display:flex;gap:8px;";
      const copyBtn = document.createElement("button");
      copyBtn.textContent = "Copy";
      copyBtn.style.cssText = "padding:7px 16px;background:#1a2a3a;color:#99ccff;border:none;border-radius:4px;cursor:pointer;font-size:13px;";
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(msg).then(() => {
          copyBtn.textContent = "Copied ✓";
          setTimeout(() => copyBtn.textContent = "Copy", 1500);
        });
      };
      const okBtn = document.createElement("button");
      okBtn.textContent = "OK";
      okBtn.style.cssText = "padding:7px 16px;background:#333;color:#ccc;border:none;border-radius:4px;cursor:pointer;font-size:13px;";
      okBtn.onclick = () => { document.body.removeChild(overlay); res(); };
      row.append(copyBtn, okBtn);
      box.append(p, row);
      overlay.appendChild(box);
      overlay.addEventListener("click", e => { if (e.target === overlay) { document.body.removeChild(overlay); res(); } });
      document.body.appendChild(overlay);
    });
  }

  // ── App style ──────────────────────────────────────────────
  const APP_STYLE_DEFAULTS = {
    bgType: "solid",
    stops: ["#111111FF"],
    cellBg: "#111111FF",
    gradDir: "to bottom",
    patColor: "#FFFFFF33",
    patBg: "#111111FF",
    patSize: 16,
    imgData: null,
    imgSize: "cover",
    imgPos: "center",
    imgRepeat: "no-repeat",
    imgAttach: "scroll",
    imgTint: "#00000000",
    textColor: "#FFFFFFFF",
    borderColor: "#333333FF",
    theadBg: "#000000FF",
    barSet: "#7030A0FF",
    barTotal: "#8000FFFF",
    barStreak: "#375623FF",
    padding: 20,
  };
  let appStyle = Object.assign({}, APP_STYLE_DEFAULTS);
  try {
    const saved = JSON.parse(localStorage.getItem("_appStyle"));
    if (saved) appStyle = Object.assign({}, APP_STYLE_DEFAULTS, saved);
  } catch {}
  ImgDB.get("bgImage").then(img => {
    if (img) { appStyle.imgData = img; applyAppStyle(); }
  }).catch(() => {});

  function buildAppBg() {
    const t = appStyle.bgType;
    if (t === "image") {
      document.body.style.background = "";
      if (!appStyle.imgData) { document.body.style.background = "#111"; return; }
      const tint = hex8ToCss(appStyle.imgTint);
      document.body.style.backgroundImage  = `linear-gradient(${tint},${tint}), url(${appStyle.imgData})`;
      document.body.style.backgroundSize   = `auto, ${appStyle.imgSize}`;
      document.body.style.backgroundPosition = `center, ${appStyle.imgPos}`;
      document.body.style.backgroundRepeat   = `no-repeat, ${appStyle.imgRepeat}`;
      document.body.style.backgroundAttachment = `scroll, ${appStyle.imgAttach}`;
      return;
    }
    document.body.style.backgroundImage = "";
    document.body.style.backgroundSize = "";
    document.body.style.backgroundPosition = "";
    document.body.style.backgroundRepeat = "";
    document.body.style.backgroundAttachment = "";
    if (t === "solid") {
      document.body.style.background = hex8ToCss(appStyle.stops[0]);
      return;
    }
    if (t.startsWith("gradient")) {
      const stops = appStyle.stops.map(s => hex8ToCss(s)).join(", ");
      document.body.style.background = `linear-gradient(${appStyle.gradDir}, ${stops})`;
      return;
    }
    // Patterns
    const c  = hex8ToCss(appStyle.patColor);
    const bg = hex8ToCss(appStyle.patBg);
    const sz = appStyle.patSize;
    const h  = sz / 2;
    if (t === "pattern-dots") {
      document.body.style.background = bg;
      document.body.style.backgroundImage = `radial-gradient(circle, ${c} ${sz*0.15}px, transparent ${sz*0.15}px)`;
      document.body.style.backgroundSize = `${sz}px ${sz}px`;
    } else if (t === "pattern-grid") {
      document.body.style.background = bg;
      document.body.style.backgroundImage =
        `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`;
      document.body.style.backgroundSize = `${sz}px ${sz}px`;
    } else if (t === "pattern-stripes") {
      document.body.style.background =
        `repeating-linear-gradient(0deg, ${c}, ${c} 1px, ${bg} 1px, ${bg} ${sz}px)`;
    } else if (t === "pattern-diagonal") {
      document.body.style.background =
        `repeating-linear-gradient(45deg, ${c} 0, ${c} 1px, ${bg} 0, ${bg} ${h}px)`;
    } else if (t === "pattern-crosshatch") {
      document.body.style.background = bg;
      document.body.style.backgroundImage =
        `repeating-linear-gradient(45deg, ${c} 0, ${c} 1px, transparent 0, transparent 50%),` +
        `repeating-linear-gradient(-45deg, ${c} 0, ${c} 1px, transparent 0, transparent 50%)`;
      document.body.style.backgroundSize = `${sz}px ${sz}px`;
    }
  }

  function applyAppStyle() {
    buildAppBg();
    document.body.style.color   = hex8ToCss(appStyle.textColor);
    document.body.style.padding = appStyle.padding + "px";
    document.documentElement.style.setProperty("--app-border-color", hex8ToCss(appStyle.borderColor));
    document.documentElement.style.setProperty("--app-thead-bg",     hex8ToCss(appStyle.theadBg));
    document.documentElement.style.setProperty("--app-cell-bg",      hex8ToCss(appStyle.cellBg || "#111111FF"));
    document.documentElement.style.setProperty("--bar-set-color",    hex8ToCss(appStyle.barSet));
    document.documentElement.style.setProperty("--bar-total-color",  hex8ToCss(appStyle.barTotal));
    document.documentElement.style.setProperty("--bar-streak-color", hex8ToCss(appStyle.barStreak));
  }
  applyAppStyle();

  // Build/destroy the gradient stop colour pickers dynamically
  function buildStopPickers() {
    const wrap = document.getElementById("s-app-stops-wrap");
    wrap.innerHTML = "";
    const t = appStyle.bgType;
    const numStops = t === "solid" ? 1 : t === "gradient2" ? 2 : t === "gradient3" ? 3 : t === "gradient4" ? 4 : 0;
    if (numStops === 0) return;
    // Ensure stops array is right length
    while (appStyle.stops.length < numStops) appStyle.stops.push("#111111FF");
    for (let i = 0; i < numStops; i++) {
      const label = numStops === 1 ? "Background colour" : `Stop ${i+1}`;
      const pid = `s-app-stop-${i}`;
      const div = document.createElement("div");
      div.className = "color-settings-row";
      div.style.marginBottom = "4px";
      div.innerHTML = `
        <label>${label}</label>
        <div class="color-picker-row">
          <input type="color" id="${pid}" oninput="onColorPickerChange('${pid}')">
          <input type="range" class="alpha-slider" id="${pid}-alpha" min="0" max="255" value="255" oninput="onAlphaChange('${pid}')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="${pid}-hex" maxlength="9" oninput="onHexInput('${pid}')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('${pid}',this)">Copy</button>
        </div>`;
      wrap.appendChild(div);
      setColorValue(pid, appStyle.stops[i] || "#111111FF");
      // Hook dynamic pickers into settingsChange via a shared handler
      document.getElementById(pid).addEventListener("input", () => collectAppStops());
      document.getElementById(pid+"-alpha").addEventListener("input", () => collectAppStops());
    }
  }
  function collectAppStops() {
    const t = appStyle.bgType;
    const numStops = t === "solid" ? 1 : t === "gradient2" ? 2 : t === "gradient3" ? 3 : t === "gradient4" ? 4 : 0;
    appStyle.stops = [];
    for (let i = 0; i < numStops; i++) {
      appStyle.stops.push(getColorValue(`s-app-stop-${i}`));
    }
    buildAppBg();
  }

  function appBgTypeChange() {
    appStyle.bgType = document.getElementById("s-app-bg-type").value;
    const isGrad    = appStyle.bgType.startsWith("gradient");
    const isPat     = appStyle.bgType.startsWith("pattern");
    const isImg     = appStyle.bgType === "image";
    document.getElementById("s-app-grad-dir-row").style.display  = isGrad ? "" : "none";
    document.getElementById("s-app-pattern-wrap").style.display  = isPat  ? "" : "none";
    document.getElementById("s-app-image-wrap").style.display    = isImg  ? "flex" : "none";
    buildStopPickers();
    buildAppBg();
  }
  function settingsAppChange() {
    appStyle.bgType   = document.getElementById("s-app-bg-type").value;
    appStyle.gradDir  = document.getElementById("s-app-grad-dir").value;
    appStyle.patColor = getColorValue("s-app-pat-color");
    appStyle.patBg    = getColorValue("s-app-pat-bg");
    appStyle.patSize  = Number(document.getElementById("s-app-pat-size").value);
    appStyle.imgSize  = document.getElementById("s-app-img-size").value;
    appStyle.imgPos   = document.getElementById("s-app-img-pos").value;
    appStyle.imgRepeat   = document.getElementById("s-app-img-repeat").value;
    appStyle.imgAttach   = document.getElementById("s-app-img-attach").value;
    appStyle.imgTint     = getColorValue("s-app-img-tint");
    appStyle.textColor   = getColorValue("s-app-text");
    appStyle.borderColor = getColorValue("s-app-border");
    appStyle.theadBg     = getColorValue("s-app-thead");
    appStyle.cellBg      = getColorValue("s-app-cell-bg");
    appStyle.barSet      = getColorValue("s-app-bar-set");
    appStyle.barTotal    = getColorValue("s-app-bar-total");
    appStyle.barStreak   = getColorValue("s-app-bar-streak");
    appStyle.padding     = Number(document.getElementById("s-app-padding").value);
    collectAppStops();
    applyAppStyle();
  }
  function appLoadImage(input) {
    const file = input.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      appStyle.imgData = e.target.result;
      appStyle.bgType  = "image";
      appStyle.imgSize   = document.getElementById("s-app-img-size").value   || appStyle.imgSize;
      appStyle.imgPos    = document.getElementById("s-app-img-pos").value    || appStyle.imgPos;
      appStyle.imgRepeat = document.getElementById("s-app-img-repeat").value || appStyle.imgRepeat;
      appStyle.imgAttach = document.getElementById("s-app-img-attach").value || appStyle.imgAttach;
      appStyle.imgTint   = getColorValue("s-app-img-tint");
      document.getElementById("s-app-bg-type").value = "image";
      appBgTypeChange();
      const thumb = document.getElementById("s-app-img-thumb");
      const prev  = document.getElementById("s-app-img-preview");
      if (thumb) { thumb.src = appStyle.imgData; prev.style.display = ""; }
      buildAppBg();
      input.value = "";
    };
    reader.readAsDataURL(file);
  }
  function appClearImage() {
    appStyle.imgData = null;
    const thumb = document.getElementById("s-app-img-thumb");
    const prev  = document.getElementById("s-app-img-preview");
    if (thumb) { thumb.src = ""; prev.style.display = "none"; }
    buildAppBg();
  }

  const BTN_STYLE_DEFAULTS = { bg: "#444444FF", fg: "#FFFFFFFF", font: "sans-serif", glow: "#9659FFFF", activeGlow: "#9659FFFF", activeBg: "#555555FF", tap: "#FFFFFF40", tapHighlight: "#0000FFFF", btnRadius: 6, sliderBorder: "#555555FF", sliderH: 8, sliderR: 4, checkboxChecked: "#90EE90FF", checkboxMark: "#000000FF", checkboxBorder: "#555555FF", checkboxBg: "#111111FF", clockDateColor: "#666666FF", clockTimeColor: "#666666FF", clockDateSize: 13, clockTimeSize: 13, clockBg: "#00000000" };
  let btnStyle = Object.assign({}, BTN_STYLE_DEFAULTS);
  try {
    const saved = JSON.parse(localStorage.getItem("_btnStyle"));
    if (saved) btnStyle = Object.assign({}, BTN_STYLE_DEFAULTS, saved);
  } catch {}
  function hex8ToComponents(hex) {
    const h = hex.replace('#','');
    const r = parseInt(h.slice(0,2),16)||0, g = parseInt(h.slice(2,4),16)||0, b = parseInt(h.slice(4,6),16)||0;
    const a = h.length === 8 ? parseInt(h.slice(6,8),16) : 255;
    return {r,g,b,a};
  }
  function componentsToHex8({r,g,b,a}) {
    return '#'+[r,g,b,a].map(v=>Math.round(v).toString(16).padStart(2,'0').toUpperCase()).join('');
  }
  function hex8ToCss(hex) {
    const {r,g,b,a} = hex8ToComponents(hex);
    return `rgba(${r},${g},${b},${(a/255).toFixed(3)})`;
  }
  function getColorValue(id) {
    const picker = document.getElementById(id);
    const alpha  = document.getElementById(id+'-alpha');
    if (!picker) return '#444444FF';
    const h = picker.value.replace('#','').toUpperCase();
    const a = alpha ? parseInt(alpha.value).toString(16).padStart(2,'0').toUpperCase() : 'FF';
    return '#'+h+a;
  }
  function setColorValue(id, hex) {
    const {r,g,b,a} = hex8ToComponents(hex);
    const picker = document.getElementById(id);
    const slider = document.getElementById(id+'-alpha');
    const hexEl  = document.getElementById(id+'-hex');
    if (picker) picker.value = '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
    if (slider) { slider.value = a; updateAlphaSliderBg(id); }
    if (hexEl)  hexEl.value = componentsToHex8({r,g,b,a});
  }
  function updateAlphaSliderBg(id) {
    const picker = document.getElementById(id);
    const slider = document.getElementById(id+'-alpha');
    if (!picker||!slider) return;
    slider.style.background = `linear-gradient(to right, transparent, ${picker.value})`;
  }
  function onColorPickerChange(id) {
    const picker = document.getElementById(id);
    const slider = document.getElementById(id+'-alpha');
    const hexEl  = document.getElementById(id+'-hex');
    const h = picker.value.replace('#','').toUpperCase();
    const a = slider ? parseInt(slider.value).toString(16).padStart(2,'0').toUpperCase() : 'FF';
    if (hexEl) hexEl.value = '#'+h+a;
    updateAlphaSliderBg(id);
    const _cfId = window._cfActiveId ? window._cfActiveId() : null;
    if (id === 's-clock-date-bg' && _cfId === 'top-date') {
      document.getElementById('s-bg').value = picker.value;
      document.getElementById('s-bg-alpha').value = slider ? slider.value : 255;
      updateAlphaSliderBg('s-bg');
    } else if (id === 's-clock-time-bg' && _cfId === 'top-time') {
      document.getElementById('s-bg').value = picker.value;
      document.getElementById('s-bg-alpha').value = slider ? slider.value : 255;
      updateAlphaSliderBg('s-bg');
    } else if (id === 's-clock-date-color' && _cfId === 'top-date') {
      document.getElementById('s-fg').value = picker.value;
      document.getElementById('s-fg-alpha').value = slider ? slider.value : 255;
      updateAlphaSliderBg('s-fg');
    } else if (id === 's-clock-time-color' && _cfId === 'top-time') {
      document.getElementById('s-fg').value = picker.value;
      document.getElementById('s-fg-alpha').value = slider ? slider.value : 255;
      updateAlphaSliderBg('s-fg');
    } else if (id === 's-clock-date-glow' && _cfId === 'top-date') {
      document.getElementById('s-glow').value = picker.value;
      document.getElementById('s-glow-alpha').value = slider ? slider.value : 255;
      updateAlphaSliderBg('s-glow');
    } else if (id === 's-clock-time-glow' && _cfId === 'top-time') {
      document.getElementById('s-glow').value = picker.value;
      document.getElementById('s-glow-alpha').value = slider ? slider.value : 255;
      updateAlphaSliderBg('s-glow');
    } else if (id === 's-glow' && _cfId === 'top-date') {
      const _dg = document.getElementById('s-clock-date-glow');
      const _dga = document.getElementById('s-clock-date-glow-alpha');
      if (_dg) { _dg.value = picker.value; updateAlphaSliderBg('s-clock-date-glow'); }
      if (_dga) _dga.value = slider ? slider.value : 255;
    } else if (id === 's-glow' && _cfId === 'top-time') {
      const _tg = document.getElementById('s-clock-time-glow');
      const _tga = document.getElementById('s-clock-time-glow-alpha');
      if (_tg) { _tg.value = picker.value; updateAlphaSliderBg('s-clock-time-glow'); }
      if (_tga) _tga.value = slider ? slider.value : 255;
    }
    settingsChange();
}
function onAlphaChange(id) {
    const picker = document.getElementById(id);
    const slider = document.getElementById(id+'-alpha');
    const hexEl  = document.getElementById(id+'-hex');
    const h = picker ? picker.value.replace('#','').toUpperCase() : '444444';
    const a = parseInt(slider.value).toString(16).padStart(2,'0').toUpperCase();
    if (hexEl) hexEl.value = '#'+h+a;
    updateAlphaSliderBg(id);
    const _cfId = window._cfActiveId ? window._cfActiveId() : null;
    if (id === 's-clock-date-color' && _cfId === 'top-date') {
      document.getElementById('s-fg').value = document.getElementById('s-clock-date-color').value;
      document.getElementById('s-fg-alpha').value = document.getElementById('s-clock-date-color-alpha').value;
      updateAlphaSliderBg('s-fg');
    } else if (id === 's-clock-time-color' && _cfId === 'top-time') {
      document.getElementById('s-fg').value = document.getElementById('s-clock-time-color').value;
      document.getElementById('s-fg-alpha').value = document.getElementById('s-clock-time-color-alpha').value;
      updateAlphaSliderBg('s-fg');
    } else if (id === 's-clock-date-bg' && _cfId === 'top-date') {
      document.getElementById('s-bg').value = document.getElementById('s-clock-date-bg').value;
      document.getElementById('s-bg-alpha').value = document.getElementById('s-clock-date-bg-alpha').value;
      updateAlphaSliderBg('s-bg');
    } else if (id === 's-clock-time-bg' && _cfId === 'top-time') {
      document.getElementById('s-bg').value = document.getElementById('s-clock-time-bg').value;
      document.getElementById('s-bg-alpha').value = document.getElementById('s-clock-time-bg-alpha').value;
      updateAlphaSliderBg('s-bg');
    } else if (id === 's-clock-date-glow' && _cfId === 'top-date') {
      document.getElementById('s-glow').value = document.getElementById('s-clock-date-glow').value;
      document.getElementById('s-glow-alpha').value = document.getElementById('s-clock-date-glow-alpha').value;
      updateAlphaSliderBg('s-glow');
    } else if (id === 's-clock-time-glow' && _cfId === 'top-time') {
      document.getElementById('s-glow').value = document.getElementById('s-clock-time-glow').value;
      document.getElementById('s-glow-alpha').value = document.getElementById('s-clock-time-glow-alpha').value;
      updateAlphaSliderBg('s-glow');
    } else if (id === 's-glow' && _cfId === 'top-date') {
      const _dg = document.getElementById('s-clock-date-glow');
      const _dga = document.getElementById('s-clock-date-glow-alpha');
      if (_dg) { _dg.value = document.getElementById('s-glow').value; updateAlphaSliderBg('s-clock-date-glow'); }
      if (_dga) _dga.value = slider.value;
    } else if (id === 's-glow' && _cfId === 'top-time') {
      const _tg = document.getElementById('s-clock-time-glow');
      const _tga = document.getElementById('s-clock-time-glow-alpha');
      if (_tg) { _tg.value = document.getElementById('s-glow').value; updateAlphaSliderBg('s-clock-time-glow'); }
      if (_tga) _tga.value = slider.value;
    }
    settingsChange();
}
function onHexInput(id) {
    const hexEl = document.getElementById(id+'-hex');
    let val = hexEl.value.trim().replace(/[^0-9a-fA-F#]/g, '');
    if (val && !val.startsWith('#')) val = '#'+val;
    const h = val.replace('#','');
    if ((h.length === 6 || h.length === 8) && /^[0-9a-fA-F]+$/.test(h)) {
      hexEl.value = '#' + h.toUpperCase();
      const {r,g,b,a} = hex8ToComponents(h.length === 6 ? '#'+h+'FF' : '#'+h);
      const picker = document.getElementById(id);
      const slider = document.getElementById(id+'-alpha');
      if (picker) picker.value = '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
      if (slider) { slider.value = a; updateAlphaSliderBg(id); }
      settingsChange();
    }
  }
  document.addEventListener('focus', e => {
    if (e.target.classList.contains('hex-input')) e.target.select();
  }, true);

  function copyHex(id, btn) {
    const val = getColorValue(id);
    navigator.clipboard.writeText(val).then(() => {
      btn.textContent = 'Copied';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1200);
    }).catch(() => {});
  }
  // ── Per-button style store ─────────────────────────────────
  // Keys: tracker id → {bg, fg, glow, activeBg, font}
  // Falls back to global btnStyle for any missing key.
  let _btnStyles = {};
  try {
    const _s = JSON.parse(localStorage.getItem("_btnStyles"));
    if (_s && typeof _s === "object") _btnStyles = _s;
  } catch {}
  function _btnStyleFor(id) {
    const base = { bg: btnStyle.bg, fg: btnStyle.fg, glow: btnStyle.glow, activeGlow: btnStyle.activeGlow || btnStyle.glow, activeBg: btnStyle.activeBg, font: btnStyle.font, tap: btnStyle.tap };
    const TOP_GRID_DEFAULTS = {
      'top-clear-all':     { bg: '#5a1a1aFF', fg: '#ff9999FF' },
      'top-settings':      { bg: '#2a2a2aFF', fg: '#999999FF' },
      'top-date':          { bg: '#00000000', fg: '#666666FF', glow: '#00000000' },
      'top-time':          { bg: '#00000000', fg: '#666666FF', glow: '#00000000' },
      'top-manage-habits': { bg: '#444444FF', fg: '#FFFFFFFF' },
      'top-version':       { bg: '#00000000', fg: '#FFFFFFFF' },
      };
    return Object.assign({}, base, TOP_GRID_DEFAULTS[id] || {}, _btnStyles[id] || {});
  }
  function _saveBtnStyles() { localStorage.setItem("_btnStyles", JSON.stringify(_btnStyles)); }

  function applyBtnStyle(skipHabitsBtn) {
    // Global CSS vars (used as fallback / for non-per-button props)
    buttonsEl.style.setProperty("--btn-bg",        hex8ToCss(btnStyle.bg));
    buttonsEl.style.setProperty("--btn-fg",        hex8ToCss(btnStyle.fg));
    buttonsEl.style.setProperty("--btn-font",      btnStyle.font);
    buttonsEl.style.setProperty("--btn-glow",      hex8ToCss(btnStyle.glow));
    buttonsEl.style.setProperty("--btn-active-glow", hex8ToCss(btnStyle.activeGlow || btnStyle.glow));
    buttonsEl.style.setProperty("--btn-active-bg", hex8ToCss(btnStyle.activeBg));
    document.documentElement.style.setProperty("--btn-radius",           (btnStyle.btnRadius ?? 6) + 'px');
    document.documentElement.style.setProperty("--slider-border-color",  hex8ToCss(btnStyle.sliderBorder));
    document.documentElement.style.setProperty("--slider-h",             btnStyle.sliderH + "px");
    document.documentElement.style.setProperty("--slider-r",             btnStyle.sliderR + "px");
    document.documentElement.style.setProperty("--checkbox-checked",     hex8ToCss(btnStyle.checkboxChecked));
    document.documentElement.style.setProperty("--checkbox-mark",        hex8ToCss(btnStyle.checkboxMark));
    document.documentElement.style.setProperty("--checkbox-border",      hex8ToCss(btnStyle.checkboxBorder));
    document.documentElement.style.setProperty("--checkbox-bg",          hex8ToCss(btnStyle.checkboxBg));
    document.documentElement.style.setProperty("--clock-date-color",     hex8ToCss(_btnStyleFor('top-date').fg));
    document.documentElement.style.setProperty("--clock-time-color",     hex8ToCss(_btnStyleFor('top-time').fg));
    document.documentElement.style.setProperty("--clock-date-size",      (_btnStyles['top-date']?.clockDateSize ?? btnStyle.clockDateSize) + "px");
    document.documentElement.style.setProperty("--clock-time-size",      (_btnStyles['top-time']?.clockTimeSize ?? btnStyle.clockTimeSize) + "px");
    document.documentElement.style.setProperty("--clock-bg",             hex8ToCss(btnStyle.clockBg));
    document.documentElement.style.setProperty("--clock-date-bg",        hex8ToCss(_btnStyleFor('top-date').bg));
    document.documentElement.style.setProperty("--clock-time-bg",        hex8ToCss(_btnStyleFor('top-time').bg));
    // Per-button overrides for top-grid buttons
    const topGridMap = [
      { id: 'top-export-all',    el: '.top-item[data-item="export-all"]',    prefix: '--export-all' },
      { id: 'top-import-all',    el: '.top-item[data-item="import-all"]',    prefix: '--import-all' },
      { id: 'top-export-layout', el: '.top-item[data-item="export-layout"]', prefix: '--export-layout' },
      { id: 'top-import-layout', el: '.top-item[data-item="import-layout"]', prefix: '--import-layout' },
      { id: 'top-clear-all',     el: '.top-item[data-item="clear-all"]',     prefix: '--clear-all' },
      { id: 'top-my-files',      el: '.top-item[data-item="my-files"]',      prefix: '--my-files' },
      { id: 'top-manage-habits', el: '.top-item[data-item="manage-habits"]', prefix: '--manage-habits' },
      { id: 'top-settings',      el: '.top-item[data-item="settings"]',      prefix: '--settings' },
    ];
    topGridMap.forEach(({ id, el: sel, prefix }) => {
      const el = document.querySelector(sel);
      if (!el) return;
      const _s = _btnStyleFor(id);
      el.style.setProperty(prefix + '-bg',   hex8ToCss(_s.bg));
      el.style.setProperty(prefix + '-fg',   hex8ToCss(_s.fg));
      el.style.setProperty(prefix + '-font', _s.font);
      el.style.setProperty(prefix + '-glow', hex8ToCss(_s.glow));
    });
    const _cogEl = document.getElementById('settings-cog');
    if (_cogEl) {
      const _ss = _btnStyleFor('top-settings');
      _cogEl.style.background   = hex8ToCss(_ss.bg);
      _cogEl.style.color        = hex8ToCss(_ss.fg);
      _cogEl.style.borderColor  = hex8ToCss(_ss.fg);
      _cogEl.style.boxShadow    = `0 0 16px 5px ${hex8ToCss(_ss.glow)}`;
    }
    // Hide habits button: style depends on current visibility state
    const _habEl = document.querySelector('.top-item[data-item="hide-habits"]');
    if (_habEl) {
      const _hs = _btnStyleFor(!skipHabitsBtn && habitsVisible ? 'top-hide-habits' : 'top-show-habits');
      _habEl.style.setProperty('--hide-habits-bg',   hex8ToCss(_hs.bg));
      _habEl.style.setProperty('--hide-habits-fg',   hex8ToCss(_hs.fg));
      _habEl.style.setProperty('--hide-habits-font', _hs.font);
      _habEl.style.setProperty('--hide-habits-glow', hex8ToCss(_hs.glow || '#00000000'));
    }
    // Date and time spans get direct inline styles
    const _dateSpan = document.querySelector('.top-item[data-item="date"] span');
    const _timeSpan = document.querySelector('.top-item[data-item="time"] span');
    if (_dateSpan) { _dateSpan.style.color = hex8ToCss(_btnStyleFor('top-date').fg); }
    if (_timeSpan) { _timeSpan.style.color = hex8ToCss(_btnStyleFor('top-time').fg); }
    const _dateItemGlow = document.querySelector('.top-item[data-item="date"]');
    const _timeItemGlow = document.querySelector('.top-item[data-item="time"]');
    if (_dateItemGlow) _dateItemGlow.style.setProperty('--btn-glow', hex8ToCss(_btnStyleFor('top-date').glow || '#00000000'));
    if (_timeItemGlow) _timeItemGlow.style.setProperty('--btn-glow', hex8ToCss(_btnStyleFor('top-time').glow || '#00000000'));
    const _versionColor = hex8ToCss(_btnStyleFor('top-version').fg);
    const _versionItem = document.querySelector('.top-item[data-item="version"]');
    if (_versionItem) {
      _versionItem.style.background = hex8ToCss(_btnStyleFor('top-version').bg);
      _versionItem.style.setProperty('--btn-glow', hex8ToCss(_btnStyleFor('top-version').glow));
      const _vBtn = _versionItem.querySelector('div');
      if (_vBtn) {
        _vBtn.addEventListener('pointerdown', () => { _versionItem.style.background = hex8ToCss(_btnStyleFor('top-version').tap); }, { once: true });
        _vBtn.addEventListener('pointerup', () => { _versionItem.style.background = hex8ToCss(_btnStyleFor('top-version').bg); }, { once: true });
        _vBtn.addEventListener('pointercancel', () => { _versionItem.style.background = hex8ToCss(_btnStyleFor('top-version').bg); }, { once: true });
      }
    }
    const _versionNumSpan = document.getElementById('app-version');
    const _versionStatsSpan = document.getElementById('app-stats');
    if (_versionNumSpan) _versionNumSpan.style.color = _versionColor;
    if (_versionStatsSpan) { _versionStatsSpan.style.color = _versionColor; _versionStatsSpan.style.opacity = '0.4'; }

    // Per-button overrides — applied as inline styles on each .tracker-btn
    buttonsEl.querySelectorAll(".tracker-btn[data-id]").forEach(btn => {
      const s = _btnStyleFor(btn.dataset.id);
      btn.style.setProperty("--btn-bg",        hex8ToCss(s.bg));
      btn.style.setProperty("--btn-fg",        hex8ToCss(s.fg));
      btn.style.setProperty("--btn-glow",      hex8ToCss(s.glow));
      btn.style.setProperty("--btn-active-glow", hex8ToCss(s.activeGlow || s.glow));
      btn.style.setProperty("--btn-active-bg", hex8ToCss(s.activeBg));
      btn.style.setProperty("--btn-font",      s.font);
      btn.style.fontFamily = s.font;
    });
  }
  applyBtnStyle(true);
  let _appStyleSnapshot = null;
  let _clockSnapshot    = null;
  function toggleSettingsGroup(groupId) {
    document.querySelectorAll('.settings-group-content').forEach(el => {
      if (el.id !== groupId) {
        el.classList.remove('open');
        const btn = document.querySelector(`#settings-groups-grid [data-group="${el.id}"]`);
        if (btn) btn.classList.remove('sg-active');
      }
    });
    const c = document.getElementById(groupId);
    const isOpen = c.classList.toggle('open');
    if (groupId === 'sg-clock' && isOpen) {
  setColorValue('s-clock-date-color', _btnStyles['top-date']?.fg || btnStyle.clockDateColor);
  updateAlphaSliderBg('s-clock-date-color');
}
    const item = document.querySelector(`#settings-groups-grid [data-group="${groupId}"]`);
    if (item) item.classList.toggle('sg-active', isOpen);
    if (groupId === 'sg-buttons' && isOpen) {
      const stage = document.getElementById('cf-stage');
      if (stage) stage.style.visibility = 'hidden';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (window._cfBuild) window._cfBuild();
          if (stage) stage.style.visibility = '';
        });
      });
    }
  }
  function settingsOpen() {
    try {
    _settingsJustOpened = true;
    _btnStyleSnapshot  = Object.assign({}, btnStyle);
    _btnStylesSnapshot = JSON.parse(JSON.stringify(_btnStyles));
    _appStyleSnapshot  = Object.assign({}, appStyle, { stops: appStyle.stops.slice() });
    const clk = window._clockGet();
    _clockSnapshot = { tumblerCfg: clk.tumblerCfg.slice() };
    const _initId = window._cfActiveId ? window._cfActiveId() : null;
    const _initS  = _initId ? _btnStyleFor(_initId) : btnStyle;
    setColorValue('s-bg',           _initS.bg);
    setColorValue('s-fg',           _initS.fg);
    setColorValue('s-glow',         _initS.glow);
    setColorValue('s-activeglow',   _initS.activeGlow || _initS.glow);
    setColorValue('s-activebg',     _initS.activeBg);
    setColorValue('s-tap',          _initS.tap || btnStyle.tap);
    setColorValue('s-taphighlight', btnStyle.tapHighlight);
    setColorValue('s-checkbox-checked', btnStyle.checkboxChecked);
    setColorValue('s-checkbox-mark',    btnStyle.checkboxMark);
    setColorValue('s-checkbox-border',  btnStyle.checkboxBorder);
    setColorValue('s-checkbox-bg', btnStyle.checkboxBg);
    setColorValue('s-clock-date-color', _btnStyleFor('top-date').fg);
    setColorValue('s-clock-time-color', _btnStyleFor('top-time').fg);
    setColorValue('s-clock-date-bg',    _btnStyleFor('top-date').bg);
    setColorValue('s-clock-time-bg',    _btnStyleFor('top-time').bg);
    setColorValue('s-clock-bg',         btnStyle.clockBg);
    setColorValue('s-clock-date-glow',  _btnStyleFor('top-date').glow || '#00000000');
    setColorValue('s-clock-time-glow',  _btnStyleFor('top-time').glow || '#00000000');
    document.getElementById("s-clock-date-size").value = _btnStyles['top-date']?.clockDateSize ?? btnStyle.clockDateSize;
    document.getElementById("s-clock-time-size").value = _btnStyles['top-time']?.clockTimeSize ?? btnStyle.clockTimeSize;
    document.getElementById("s-font").value    = btnStyle.font;
    document.getElementById("s-radius").value  = String(btnStyle.btnRadius ?? 6);
    const _rvVal = document.getElementById("s-radius-val"); if (_rvVal) _rvVal.textContent = (btnStyle.btnRadius ?? 6) + "px";
    // Populate App panel
    const _s = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    _s("s-app-bg-type",    appStyle.bgType);
    _s("s-app-grad-dir",   appStyle.gradDir);
    _s("s-app-pat-size",   appStyle.patSize);
    _s("s-app-img-size",   appStyle.imgSize);
    _s("s-app-img-pos",    appStyle.imgPos);
    _s("s-app-img-repeat", appStyle.imgRepeat);
    _s("s-app-img-attach", appStyle.imgAttach);
    _s("s-app-padding",    appStyle.padding);
    setColorValue("s-app-pat-color",  appStyle.patColor);
    setColorValue("s-app-pat-bg",     appStyle.patBg);
    setColorValue("s-app-img-tint",   appStyle.imgTint);
    setColorValue("s-app-text",       appStyle.textColor);
    setColorValue("s-app-border",     appStyle.borderColor);
    setColorValue("s-app-thead",      appStyle.theadBg);
    setColorValue("s-app-cell-bg",    appStyle.cellBg || "#111111FF");
    setColorValue("s-app-bar-set",    appStyle.barSet);
    setColorValue("s-app-bar-total",  appStyle.barTotal);
    setColorValue("s-app-bar-streak", appStyle.barStreak);
    const isGrad = appStyle.bgType.startsWith("gradient");
    const isPat  = appStyle.bgType.startsWith("pattern");
    const isImg  = appStyle.bgType === "image";
    document.getElementById("s-app-grad-dir-row").style.display = isGrad ? "" : "none";
    document.getElementById("s-app-pattern-wrap").style.display = isPat  ? "" : "none";
    document.getElementById("s-app-image-wrap").style.display   = isImg  ? "flex" : "none";
    if (appStyle.imgData) {
      const thumb = document.getElementById("s-app-img-thumb");
      const prev  = document.getElementById("s-app-img-preview");
      if (thumb) { thumb.src = appStyle.imgData; prev.style.display = ""; }
    }
    buildStopPickers();
    settingsUpdatePreview();
    document.getElementById("settings-overlay").classList.add("active");
    cfSyncTuningUI();
    if (window._cfBuild) {
      window._cfBuild();
      const _cfId = window._cfActiveId ? window._cfActiveId() : null;
      if (_cfId) {
        const _s2 = _btnStyleFor(_cfId);
        setColorValue('s-bg',       _s2.bg);
        setColorValue('s-fg',       _s2.fg);
        setColorValue('s-glow',     _s2.glow);
        setColorValue('s-activebg', _s2.activeBg);
        document.getElementById("s-font").value = _s2.font;
        // Keep btnStyle in sync so settingsChange() reads correct baseline
        btnStyle.bg = _s2.bg; btnStyle.fg = _s2.fg;
        btnStyle.glow = _s2.glow; btnStyle.activeBg = _s2.activeBg;
        btnStyle.font = _s2.font;
      }
    }
    } catch(e) { alert("settingsOpen error: " + e.message + "\n" + e.stack); }
  }
  function settingsClose() {
    document.getElementById("settings-overlay").classList.remove("active");
  }
  async function settingsSave() {
    localStorage.setItem("_btnStyle",   JSON.stringify(btnStyle));
    localStorage.setItem("_btnStyles",  JSON.stringify(_btnStyles));
    try {
      const saveStyle = Object.assign({}, appStyle, { imgData: null });
      localStorage.setItem("_appStyle", JSON.stringify(saveStyle));
    } catch(e) {
      await showAlert("Settings could not be saved: " + e.message);
      return;
    }
    if (appStyle.imgData) {
      try { await ImgDB.set("bgImage", appStyle.imgData); }
      catch(e) { await showAlert("Image could not be saved:\n" + e.message); }
    } else {
      try { await ImgDB.del("bgImage"); } catch {}
    }
    localStorage.setItem("_clockTumbler", JSON.stringify(window._clockGet().tumblerCfg));
    settingsClose();
  }
  function settingsCancel() {
    if (_btnStyleSnapshot)  { btnStyle   = Object.assign({}, _btnStyleSnapshot); }
    if (_btnStylesSnapshot) { _btnStyles = JSON.parse(JSON.stringify(_btnStylesSnapshot)); }
    if (_btnStyleSnapshot || _btnStylesSnapshot) applyBtnStyle();
    if (_appStyleSnapshot)  { appStyle   = Object.assign({}, _appStyleSnapshot); applyAppStyle(); }
    if (_clockSnapshot) window._clockSet(_clockSnapshot.tumblerCfg);
    settingsClose();
  }
  function settingsExport() {
    const clk = window._clockGet();
    const out = {
      "_btnStyle":           JSON.stringify(btnStyle),
      "_btnStyles":          JSON.stringify(_btnStyles),
      "_clockTumbler":       JSON.stringify(clk.tumblerCfg),
      "_cfTuning":           localStorage.getItem("_cfTuning") || "{}",
      "_settingsGroupOrder": localStorage.getItem("_settingsGroupOrder") || "[]",
    };
    const saveStyle = Object.assign({}, appStyle, { imgData: null });
    out["_appStyle"] = JSON.stringify(saveStyle);
    const blob = new Blob([JSON.stringify(out, null, 2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `settings-${exportDateStr(new Date())}.json`;
    a.click(); URL.revokeObjectURL(a.href);
  }
  function settingsImport(input) {
    const file = input.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (data["_btnStyle"]) {
          btnStyle = Object.assign({}, BTN_STYLE_DEFAULTS, JSON.parse(data["_btnStyle"]));
          applyBtnStyle();
          document.getElementById("s-bg").value       = btnStyle.bg;
          document.getElementById("s-fg").value       = btnStyle.fg;
          document.getElementById("s-font").value     = btnStyle.font;
          document.getElementById("s-glow").value     = btnStyle.glow;
          document.getElementById("s-activebg").value = btnStyle.activeBg;
          settingsUpdatePreview();
        }
        if (data["_clockTumbler"] !== undefined) {
          try {
            const cfg = JSON.parse(data["_clockTumbler"]);
            if (Array.isArray(cfg) && cfg.length === 8) {
              localStorage.setItem("_clockTumbler", data["_clockTumbler"]);
              window._clockSet(cfg);
              if (window._tumblerRefresh) window._tumblerRefresh();
            }
          } catch {}
        }
        if (data["_btnStyles"]) {
          try {
            _btnStyles = Object.assign({}, JSON.parse(data["_btnStyles"]));
            _saveBtnStyles();
          } catch {}
        }
        if (data["_appStyle"]) {
          try {
            appStyle = Object.assign({}, APP_STYLE_DEFAULTS, JSON.parse(data["_appStyle"]));
            localStorage.setItem("_appStyle", data["_appStyle"]);
            applyAppStyle();
          } catch {}
        }
        if (data["_cfTuning"]) {
          try {
            Object.assign(cfTuning, JSON.parse(data["_cfTuning"]));
            localStorage.setItem("_cfTuning", data["_cfTuning"]);
            cfSyncTuningUI();
          } catch {}
        }
        if (data["_settingsGroupOrder"]) {
          try {
            localStorage.setItem("_settingsGroupOrder", data["_settingsGroupOrder"]);
            applySettingsGroupOrder();
          } catch {}
        }
        input.value = "";
      } catch { alert("Invalid settings file."); }
    };
    reader.readAsText(file);
  }
  function settingsChange() {
    if (!document.getElementById('s-bg')) return;
    const _cfId = window._cfActiveId ? window._cfActiveId() : null;
    if (_cfId === 'top-date' || _cfId === 'top-time') { console.log('settingsChange START', _cfId, 's-fg', getColorValue('s-fg'), 's-clock-date-color', getColorValue('s-clock-date-color')); }
    // Only update per-button colours/font — never touch global btnStyle for these
    if (_cfId) {
      if (_cfId === 'top-date') {
        // s-fg is the date color; keep clock picker in sync
        const dateColor = getColorValue('s-fg');
        _btnStyles['top-date'] = Object.assign(_btnStyles['top-date'] || {}, {
          bg: getColorValue('s-bg'), fg: dateColor,
          glow: getColorValue('s-glow'), activeGlow: getColorValue('s-activeglow'),
          activeBg: getColorValue('s-activebg'),
          tap: getColorValue('s-tap'), font: document.getElementById("s-font").value,
          clockDateSize: Number(document.getElementById("s-clock-date-size").value),
        });
        setColorValue('s-clock-date-color', dateColor);
        updateAlphaSliderBg('s-clock-date-color');
        setColorValue('s-clock-date-glow', getColorValue('s-glow'));
        updateAlphaSliderBg('s-clock-date-glow');
      } else if (_cfId === 'top-time') {
        // s-fg is the time color; keep clock picker in sync
        const timeColor = getColorValue('s-fg');
        _btnStyles['top-time'] = Object.assign(_btnStyles['top-time'] || {}, {
          bg: getColorValue('s-bg'), fg: timeColor,
          glow: getColorValue('s-glow'), activeGlow: getColorValue('s-activeglow'),
          activeBg: getColorValue('s-activebg'),
          tap: getColorValue('s-tap'), font: document.getElementById("s-font").value,
          clockTimeSize: Number(document.getElementById("s-clock-time-size").value),
        });
        setColorValue('s-clock-time-color', timeColor);
        updateAlphaSliderBg('s-clock-time-color');
        setColorValue('s-clock-time-glow', getColorValue('s-glow'));
        updateAlphaSliderBg('s-clock-time-glow');
      } else {
        _btnStyles[_cfId] = {
          bg: getColorValue('s-bg'), fg: getColorValue('s-fg'),
          glow: getColorValue('s-glow'), activeGlow: getColorValue('s-activeglow'),
          activeBg: getColorValue('s-activebg'),
          tap: getColorValue('s-tap'), font: document.getElementById("s-font").value,
        };
      }
      _saveBtnStyles();
    }
    // Non-per-button properties always update globally
    btnStyle.btnRadius      = Number(document.getElementById("s-radius").value);
    btnStyle.tap            = getColorValue('s-tap');
    btnStyle.glow           = getColorValue('s-glow');
    btnStyle.activeGlow     = getColorValue('s-activeglow');
    btnStyle.tapHighlight   = getColorValue('s-taphighlight');
    btnStyle.sliderBorder   = getColorValue('s-sliderborder');
    btnStyle.sliderH        = Number(document.getElementById("s-sliderh").value);
    btnStyle.sliderR        = Number(document.getElementById("s-sliderr").value);
    btnStyle.checkboxChecked = getColorValue('s-checkbox-checked');
    btnStyle.checkboxMark    = getColorValue('s-checkbox-mark');
    btnStyle.checkboxBorder  = getColorValue('s-checkbox-border');
    btnStyle.checkboxBg      = getColorValue('s-checkbox-bg');
    btnStyle.clockBg         = getColorValue('s-clock-bg');
    // clock date/time colors always saved directly to their cf counterparts
    if (_cfId !== 'top-date') {
      _btnStyles['top-date'] = Object.assign(_btnStyles['top-date'] || {}, {
        bg: getColorValue('s-clock-date-bg'),
        fg: getColorValue('s-clock-date-color'),
        glow: getColorValue('s-clock-date-glow'),
        clockDateSize: Number(document.getElementById("s-clock-date-size").value),
      });
    }
    if (_cfId !== 'top-time') {
      _btnStyles['top-time'] = Object.assign(_btnStyles['top-time'] || {}, {
        bg: getColorValue('s-clock-time-bg'),
        fg: getColorValue('s-clock-time-color'),
        glow: getColorValue('s-clock-time-glow'),
        clockTimeSize: Number(document.getElementById("s-clock-time-size").value),
      });
    }
    // Always sync clock colors with coverflow stored values
if (_cfId !== 'top-date') {
const cfDateColor = getColorValue('s-clock-date-color');
_btnStyles['top-date'] = Object.assign(_btnStyles['top-date'] || {}, {
  bg: getColorValue('s-clock-date-bg'),
  fg: cfDateColor,
  glow: getColorValue('s-clock-date-glow'),
  clockDateSize: Number(document.getElementById("s-clock-date-size").value),
});
}
    if (_cfId === 'top-date') {
      const _newDateFg = getColorValue('s-fg');
      _btnStyles['top-date'] = Object.assign(_btnStyles['top-date'] || {}, { fg: _newDateFg, clockDateSize: Number(document.getElementById("s-clock-date-size").value) });
      document.getElementById('s-clock-date-color').value = document.getElementById('s-fg').value;
      document.getElementById('s-clock-date-color-alpha').value = document.getElementById('s-fg-alpha').value;
      updateAlphaSliderBg('s-clock-date-color');
      const _hexDateEl = document.getElementById('s-clock-date-color-hex'); if (_hexDateEl) _hexDateEl.value = getColorValue('s-fg');
    }
    if (_cfId === 'top-time') {
      const _newTimeFg = getColorValue('s-fg');
      _btnStyles['top-time'] = Object.assign(_btnStyles['top-time'] || {}, { fg: _newTimeFg, clockTimeSize: Number(document.getElementById("s-clock-time-size").value) });
      document.getElementById('s-clock-time-color').value = document.getElementById('s-fg').value;
      document.getElementById('s-clock-time-color-alpha').value = document.getElementById('s-fg-alpha').value;
      updateAlphaSliderBg('s-clock-time-color');
      const _hexTimeEl = document.getElementById('s-clock-time-color-hex'); if (_hexTimeEl) _hexTimeEl.value = getColorValue('s-fg');
    }
    _saveBtnStyles();
    applyBtnStyle();
    if (window._cfRender) window._cfRender();
    if (window._tumblerRenderPreviews) window._tumblerRenderPreviews();
    settingsUpdatePreview();
  }
  function settingsReset() {
    btnStyle  = Object.assign({}, BTN_STYLE_DEFAULTS);
    appStyle  = Object.assign({}, APP_STYLE_DEFAULTS);
    localStorage.removeItem("_btnStyle");
    localStorage.removeItem("_btnStyles");
    localStorage.removeItem("_appStyle");
    localStorage.removeItem("_clockTumbler");
    _btnStyles = {};
    window._clockSet([6, 1, 1, 1, 2, 1, 1, 0]);
    if (window._tumblerRefresh) window._tumblerRefresh();
    setColorValue('s-bg',              btnStyle.bg);
    setColorValue('s-fg',              btnStyle.fg);
    setColorValue('s-glow',            btnStyle.glow);
    setColorValue('s-activeglow',      btnStyle.activeGlow);
    setColorValue('s-activebg',        btnStyle.activeBg);
    setColorValue('s-tap',             btnStyle.tap);
    setColorValue('s-taphighlight',    btnStyle.tapHighlight);
    setColorValue('s-sliderborder',    btnStyle.sliderBorder);
    setColorValue('s-checkbox-checked', btnStyle.checkboxChecked);
    setColorValue('s-checkbox-mark',    btnStyle.checkboxMark);
    setColorValue('s-checkbox-border',  btnStyle.checkboxBorder);
    setColorValue('s-checkbox-bg',      btnStyle.checkboxBg);
    document.getElementById("s-sliderh").value = btnStyle.sliderH;
    document.getElementById("s-sliderr").value = btnStyle.sliderR;
    setColorValue('s-sliderborder', btnStyle.sliderBorder);
    document.getElementById("s-sliderh").value = btnStyle.sliderH;
    document.getElementById("s-sliderr").value = btnStyle.sliderR;
    document.getElementById("s-font").value    = btnStyle.font;
    document.getElementById("s-radius").value  = String(BTN_STYLE_DEFAULTS.btnRadius ?? 6);
    const _rvDef = document.getElementById("s-radius-val"); if (_rvDef) _rvDef.textContent = (BTN_STYLE_DEFAULTS.btnRadius ?? 6) + "px";
    setColorValue('s-clock-date-color', _btnStyleFor('top-date').fg);
    setColorValue('s-clock-time-color', _btnStyleFor('top-time').fg);
    setColorValue('s-clock-date-bg',    _btnStyleFor('top-date').bg);
    setColorValue('s-clock-time-bg',    _btnStyleFor('top-time').bg);
    setColorValue('s-clock-bg',         btnStyle.clockBg);
    setColorValue('s-clock-date-glow',  _btnStyleFor('top-date').glow || '#00000000');
    setColorValue('s-clock-time-glow',  _btnStyleFor('top-time').glow || '#00000000');
    document.getElementById("s-clock-date-size").value = _btnStyles['top-date']?.clockDateSize ?? btnStyle.clockDateSize;
    document.getElementById("s-clock-time-size").value = _btnStyles['top-time']?.clockTimeSize ?? btnStyle.clockTimeSize;
    applyBtnStyle();
    window._clockSet([6, 1, 1, 1, 2, 1, 1, 0]);
    settingsUpdatePreview();
  }
  function settingsUpdatePreview() {
    const p = document.getElementById("settings-btn-preview");
    if (!p) return;
    const _cfId = window._cfActiveId ? window._cfActiveId() : null;
    const s = _cfId ? _btnStyleFor(_cfId) : btnStyle;
    p.style.background = hex8ToCss(s.bg);
    p.style.color      = hex8ToCss(s.fg);
    p.style.fontFamily = s.font;
    const items = window._cfItems ? window._cfItems() : [];
    const activeItem = items.find(it => it.id === _cfId);
    p.textContent = activeItem ? activeItem.label : document.getElementById("s-font").selectedOptions[0].text;
    p.style.setProperty("--preview-glow",      hex8ToCss(s.glow));
    p.style.setProperty("--preview-active-bg", hex8ToCss(s.activeBg));
    p.style.borderRadius = (btnStyle.btnRadius ?? 6) + 'px';
    p.style.padding = '12px 20px';
    p.style.border = 'none';
    p.style.cursor = 'pointer';
    p.style.fontSize = '16px';
    p.style.width = '100%';
    p.style.boxShadow = `0 0 16px 5px ${hex8ToCss(s.glow)}`;
    // Sync settings cog visual when top-settings is selected
    const _cogEl2 = document.getElementById('settings-cog');
    if (_cogEl2 && _cfId === 'top-settings') {
      _cogEl2.style.background  = hex8ToCss(s.bg);
      _cogEl2.style.color       = hex8ToCss(s.fg);
      _cogEl2.style.borderColor = hex8ToCss(s.fg);
      _cogEl2.style.boxShadow   = `0 0 16px 5px ${hex8ToCss(s.glow)}`;
    }
  }
  // ── Coverflow tuning params ────────────────────────────────
  const cfTuning = { stepTx: 0.55, maxAngle: 89, scaleFalloff: 0.05, opacityFalloff: 0.10, duration: 20, cardW: 0.36, shape: 6 };
  try { const _ct = JSON.parse(localStorage.getItem("_cfTuning")); if (_ct) Object.assign(cfTuning, _ct); } catch {}
  function cfApplyTuning() {
    const _get = id => document.getElementById(id);
    if (!_get("cf-step-tx")) return;
    cfTuning.stepTx        = Number(_get("cf-step-tx").value) / 100;
    cfTuning.maxAngle      = Number(_get("cf-max-angle").value);
    cfTuning.scaleFalloff  = Number(_get("cf-scale").value) / 100;
    cfTuning.opacityFalloff= Number(_get("cf-opacity").value) / 100;
    cfTuning.duration      = Number(_get("cf-duration").value);
    cfTuning.cardW         = Number(_get("cf-card-w").value) / 100;
    cfTuning.shape         = Number(_get("cf-shape").value);
    const _vt = id => { const el = _get(id); if (el) el.textContent = cfTuning[id.replace("cf-","").replace("-val","")]; };
    if (_get("cf-step-tx-val"))    _get("cf-step-tx-val").textContent    = cfTuning.stepTx.toFixed(2).replace("0.","") + "%";
    if (_get("cf-max-angle-val"))  _get("cf-max-angle-val").textContent  = cfTuning.maxAngle + "°";
    if (_get("cf-scale-val"))      _get("cf-scale-val").textContent      = cfTuning.scaleFalloff.toFixed(2);
    if (_get("cf-opacity-val"))    _get("cf-opacity-val").textContent    = cfTuning.opacityFalloff.toFixed(2);
    if (_get("cf-duration-val"))   _get("cf-duration-val").textContent   = cfTuning.duration;
    if (_get("cf-card-w-val"))     _get("cf-card-w-val").textContent     = cfTuning.cardW.toFixed(2).replace("0.","") + "%";
    localStorage.setItem("_cfTuning", JSON.stringify(cfTuning));
    if (window._cfBuild) window._cfBuild();
  }
  function cfSyncTuningUI() {
    const _sv = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    _sv("cf-step-tx",    Math.round(cfTuning.stepTx * 100));
    _sv("cf-max-angle",  cfTuning.maxAngle);
    _sv("cf-scale",      Math.round(cfTuning.scaleFalloff * 100));
    _sv("cf-opacity",    Math.round(cfTuning.opacityFalloff * 100));
    _sv("cf-duration",   cfTuning.duration);
    _sv("cf-card-w",     Math.round(cfTuning.cardW * 100));
    _sv("cf-shape",      cfTuning.shape ?? 6);
    const _csVal = document.getElementById("cf-shape-val"); if (_csVal) _csVal.textContent = (cfTuning.shape ?? 6) + "px";
    cfApplyTuning();
  }

  // ── Coverflow button selector ──────────────────────────────
  (function() {
    let cfIdx = 0;
    window._cfItems = function cfItems() {
  const items = [];
  // Add top-grid buttons
  const topItems = [
    { selector: '#settings-cog', id: 'settings-cog', label: 'Settings' },
    { selector: '.app-btn', id: null, getAllWithClass: true, labels: ['Export All', 'Import All', 'Export Layout', 'Import Layout', 'Clear All', 'My Files', 'Hide/Show Habits', 'Manage Habits'] }
  ];  
  // Add Export All top-grid button
  items.push({ id: 'top-settings',       label: 'Settings',       isTopGrid: true });
  items.push({ id: 'top-export-all',     label: 'Export All',     isTopGrid: true });
items.push({ id: 'top-import-all',     label: 'Import All',     isTopGrid: true });
items.push({ id: 'top-export-layout',  label: 'Export Layout',  isTopGrid: true });
items.push({ id: 'top-import-layout',  label: 'Import Layout',  isTopGrid: true });
items.push({ id: 'top-clear-all',      label: 'Clear All',      isTopGrid: true });
items.push({ id: 'top-my-files',       label: 'My Files',       isTopGrid: true });
items.push({ id: 'top-date',           label: 'Date',           isTopGrid: true });
  items.push({ id: 'top-time',           label: 'Time',           isTopGrid: true });
  items.push({ id: 'top-version',        label: 'Version',        isTopGrid: true });
  items.push({ id: 'top-settings',       label: 'Settings',       isTopGrid: true });

  if (!habitsVisible) {
    return [{ id: 'top-show-habits', label: 'Show Habits', isTopGrid: true }];
  }

  items.push({ id: 'top-hide-habits', label: 'Hide Habits', isTopGrid: true });
  items.push({ id: 'top-manage-habits', label: 'Manage Habits', isTopGrid: true });
  // Add habit buttons
  [...buttonsEl.querySelectorAll('.tracker-btn[data-id]')].forEach(b => {
    items.push({ id: b.dataset.id, label: b.textContent.trim(), isHabit: true });
  });
  
  return items;
}
    function cfActiveId() {
      const items = window._cfItems();
      return items[cfIdx]?.id || null;
    }
    window._cfActiveId = cfActiveId;

    function cfLoadPickersForId(id) {
  const s = _btnStyleFor(id);
  setColorValue('s-bg',       s.bg);
  setColorValue('s-fg',       s.fg);
  setColorValue('s-glow',     s.glow);
  setColorValue('s-activeglow', s.activeGlow || s.glow);
  setColorValue('s-activebg', s.activeBg);
  setColorValue('s-tap',      s.tap);
  document.getElementById("s-font").value = s.font;
  updateAlphaSliderBg('s-bg');
  updateAlphaSliderBg('s-fg');
  updateAlphaSliderBg('s-glow');
  updateAlphaSliderBg('s-activebg');
  updateAlphaSliderBg('s-tap');
  if (id === 'top-date') {
    setColorValue('s-clock-date-color', s.fg);
    updateAlphaSliderBg('s-clock-date-color');
    setColorValue('s-clock-date-bg', s.bg);
    updateAlphaSliderBg('s-clock-date-bg');
    setColorValue('s-clock-date-glow', s.glow || '#00000000');
    updateAlphaSliderBg('s-clock-date-glow');
    document.getElementById("s-clock-date-size").value = _btnStyles['top-date']?.clockDateSize ?? btnStyle.clockDateSize;
  } else if (id === 'top-time') {
    setColorValue('s-clock-time-color', s.fg);
    updateAlphaSliderBg('s-clock-time-color');
    setColorValue('s-clock-time-bg', s.bg);
    updateAlphaSliderBg('s-clock-time-bg');
    setColorValue('s-clock-time-glow', s.glow || '#00000000');
    updateAlphaSliderBg('s-clock-time-glow');
    document.getElementById("s-clock-time-size").value = _btnStyles['top-time']?.clockTimeSize ?? btnStyle.clockTimeSize;
  }
  settingsUpdatePreview();
}

    function cfRenderAt(idx) {
      const _saved = cfIdx;
      cfIdx = idx;
      cfRender();
      cfIdx = _saved;
    }
    function cfRender() {
  const stage = document.getElementById('cf-stage');
  const label = document.getElementById('cf-label');
  if (!stage) return;
  const items = window._cfItems();
  if (!items.length) { stage.innerHTML = ''; if (label) label.textContent = ''; return; }
      const els = [...stage.querySelectorAll('.cf-item')];
      if (els.length !== items.length) { cfBuild(); return; }
     const W  = stage.offsetWidth || 300;
      const iW = Math.min(150, Math.max(70, Math.floor(W * cfTuning.cardW)));
      const cx = W / 2;
      const STEP_TX = (W / 2) * cfTuning.stepTx * 0.38;

        function cfKeyframe(d) {
        const sign = d < 0 ? -1 : 1;
        const abs  = Math.abs(d);
        const MAX_ANGLE = cfTuning.maxAngle;
        const ry  = -sign * Math.min((abs > 1 ? abs * 72 : abs * 42), MAX_ANGLE);
        const sc  = Math.max(0.80, 1 - Math.min(abs, 1) * cfTuning.scaleFalloff * 0.5 - Math.max(0, abs - 1) * cfTuning.scaleFalloff * 0.1);
        const op  = Math.max(0.15, 1 - abs * cfTuning.opacityFalloff) * (abs > 2.5 ? Math.max(0.4, 1 - (abs - 2.5) * 0.25) : 1);
        const zi  = Math.max(1, 20 - Math.floor(abs * 2));
        const tx  = cx + sign * (1 - Math.exp(-abs * 0.9)) * (W * 0.46) - iW * 0.5;
        return { tx, ry, sc, op, zi };
        }

      function cfInterp(a, b, t) {
        return {
          tx: a.tx + (b.tx - a.tx) * t,
          ry: a.ry + (b.ry - a.ry) * t,
          sc: a.sc + (b.sc - a.sc) * t,
          op: a.op + (b.op - a.op) * t,
          zi: Math.round(a.zi + (b.zi - a.zi) * t),
        };
      }

      els.forEach((el, i) => {
        const d  = i - cfIdx;
        const d0 = Math.floor(d), d1 = Math.ceil(d);
        const t  = d - d0;
        const kf = t === 0 ? cfKeyframe(d0) : cfInterp(cfKeyframe(d0), cfKeyframe(d1), t);
        const s  = _btnStyleFor(items[i].id);
        const isClockItem = items[i].id === 'top-date' || items[i].id === 'top-time';
        if (isClockItem) {
          const _cs = _btnStyleFor(items[i].id);
          el.style.background = hex8ToCss(_cs.bg);
          el.style.color      = hex8ToCss(_cs.fg);
          el.style.fontSize   = (items[i].id === 'top-date' ? btnStyle.clockDateSize : btnStyle.clockTimeSize) + 'px';
          el.style.fontFamily = 'sans-serif';
          const now = new Date();
          const cfg = window._clockGet().tumblerCfg;
          // Build a live value string for this clock item
          const DOW_LONG = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
          const dowL = DOW_LONG[now.getDay()];
          const d = now.getDate(), mo = now.getMonth()+1, y = now.getFullYear();
          const dd = String(d).padStart(2,"0"), mm = String(mo).padStart(2,"0");
          const h24 = now.getHours(), h12 = h24%12||12;
          const mi = String(now.getMinutes()).padStart(2,"0");
          const se = String(now.getSeconds()).padStart(2,"0");
          const ampm = h24>=12?"pm":"am";
          const dayNameMap = ["",dowL.slice(0,1),dowL.slice(0,2),dowL.slice(0,3),dowL.slice(0,4),dowL.slice(0,5),dowL];
          const dayNameStr = cfg[0]===0?"":dayNameMap[cfg[0]]||"";
          const dayNumStr  = cfg[1]===0?"":cfg[1]===1?String(d):dd;
          const moStr      = cfg[2]===0?"":cfg[2]===1?String(mo):mm;
          const yrStr      = cfg[3]===0?"":cfg[3]===1?String(y).slice(-2):String(y);
          let hrStr="";
          if(cfg[4]===1)hrStr=String(h12);
          else if(cfg[4]===2)hrStr=String(h12).padStart(2,"0");
          else if(cfg[4]===3)hrStr=String(h24);
          else if(cfg[4]===4)hrStr=String(h24).padStart(2,"0");
          const minStr=cfg[5]===0?"":mi;
          const secStr=cfg[6]===0?"":se;
          const amStr =cfg[7]===0?"":ampm;
          const dateParts=[dayNameStr,[dayNumStr,moStr,yrStr].filter(Boolean).join("/")].filter(Boolean);
          const dateLine=dateParts.join(" ");
          let timeParts=[hrStr];
          if(minStr)timeParts.push(minStr);
          if(secStr)timeParts.push(secStr);
          const timeLine=[timeParts.filter(Boolean).join(":"),amStr?" "+amStr:""].join("").trim();
          el.innerHTML = items[i].id==='top-date'
            ? (dateLine||"(date)").replace(/\s/g,"<br>")
            : (timeLine||"(time)");
        } else if (items[i].id === 'top-settings') {
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.background = 'transparent';
          el.style.boxShadow = 'none';
          const _ss = _btnStyleFor('top-settings');
          const _scol = hex8ToCss(_ss.bg);
          const _sfg = hex8ToCss(_ss.fg);
          const _sglow = hex8ToCss(_ss.glow);
          el.innerHTML = '<div style="width:34px;height:34px;border-radius:' + (btnStyle.btnRadius ?? 6) + 'px;background:' + _scol + ';border:1px solid ' + _sfg + ';color:' + _sfg + ';display:flex;align-items:center;justify-content:center;pointer-events:none;box-shadow:0 0 16px 5px ' + _sglow + ';"><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="width:16px;height:16px;fill:currentColor"><path d="M8.325 2.317a1.75 1.75 0 0 1 3.35 0l.07.254a1.75 1.75 0 0 0 2.494 1.08l.235-.127a1.75 1.75 0 0 1 2.369 2.369l-.127.235a1.75 1.75 0 0 0 1.08 2.494l.254.07a1.75 1.75 0 0 1 0 3.35l-.254.07a1.75 1.75 0 0 0-1.08 2.494l.127.235a1.75 1.75 0 0 1-2.369 2.369l-.235-.127a1.75 1.75 0 0 0-2.494 1.08l-.07.254a1.75 1.75 0 0 1-3.35 0l-.07-.254a1.75 1.75 0 0 0-2.494-1.08l-.235.127a1.75 1.75 0 0 1-2.369-2.369l.127-.235a1.75 1.75 0 0 0-1.08-2.494l-.254-.07a1.75 1.75 0 0 1 0-3.35l.254-.07a1.75 1.75 0 0 0 1.08-2.494l-.127-.235a1.75 1.75 0 0 1 2.369-2.369l.235.127a1.75 1.75 0 0 0 2.494-1.08l.07-.254ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg></div>';
        } else {
          const styleId = items[i].id === 'top-hide-habits' ? (habitsVisible ? 'top-hide-habits' : 'top-show-habits') : items[i].id;
        const s2 = _btnStyleFor(styleId);
        el.style.background = hex8ToCss(s2.bg);
        el.style.color      = hex8ToCss(s2.fg);
        el.style.fontSize   = '';
        el.style.fontFamily = s2.font;
        if (items[i].id === 'top-version') {
          const vNum = document.getElementById('app-version');
          const vStats = document.getElementById('app-stats');
          el.style.display = 'flex';
          el.style.flexDirection = 'column';
          el.style.alignItems = 'center';
          el.style.gap = '2px';
          el.innerHTML = '<span style="font-size:14px;color:' + hex8ToCss(s2.fg) + '">' + (vNum ? vNum.textContent : '') + '</span><span style="font-size:9px;color:' + hex8ToCss(s2.fg) + ';line-height:1.4;text-align:center;opacity:0.4">' + (vStats ? vStats.innerHTML : '') + '</span>';
        } else {
          el.style.display = '';
          el.style.flexDirection = '';
          el.style.alignItems = '';
          el.style.gap = '';
          el.textContent = items[i].label;
        }
        }
        el.style.left      = kf.tx + 'px';
        el.style.transform = `translateY(-50%) rotateY(${kf.ry}deg) scale(${kf.sc})`;
        el.style.opacity   = kf.op;
        el.style.zIndex    = kf.zi;
        el.style.borderRadius = (btnStyle.btnRadius ?? 6) + 'px';
        if (items[i].id !== 'top-settings') el.style.boxShadow = Math.abs(d) < 0.5 ? `0 0 22px 6px ${hex8ToCss(s.glow)}` : `0 0 10px 3px ${hex8ToCss(s.glow)}`;
      });
      if (label) label.textContent = items[cfIdx]?.label || '';
    }
    window._cfRender = cfRender;
    let _cfPointerAC = null;
    let _cfAnimId = null;
    function cfBuild(){
      const stage = document.getElementById('cf-stage');
      if (!stage) return;
      const items = window._cfItems();
      stage.innerHTML = '';
      if (!items.length) return;
      const hideIdx = items.findIndex(it => it.id === 'top-hide-habits');
      if (cfIdx >= items.length) cfIdx = Math.max(0, items.length - 1);
      cfIdx = Math.max(0, Math.min(cfIdx, items.length - 1));
      const W  = stage.offsetWidth || 300;
      const iW = Math.min(150, Math.max(70, Math.floor(W * cfTuning.cardW)));
      items.forEach((item, i) => {
        const el = document.createElement('button');
        el.className   = 'cf-item';
        el.dataset.cfI = i;
        el.textContent = item.label;
        el.style.width = iW + 'px';
        el.style.pointerEvents = 'none';
        el.style.webkitTapHighlightColor = 'transparent';
      el.addEventListener('pointerdown', () => {
        const s2 = _btnStyleFor(items[i].id);
        el.style.background = hex8ToCss(s2.tap || btnStyle.tapHighlight);
      });
      el.addEventListener('pointerup',     () => { const s2 = _btnStyleFor(items[i].id); el.style.background = hex8ToCss(s2.bg); });
      el.addEventListener('pointercancel', () => { const s2 = _btnStyleFor(items[i].id); el.style.background = hex8ToCss(s2.bg); });
        el.onclick = () => {
          cfIdx = i;
          if (items[i].id === 'top-settings') {
            settingsOpen();
          } else if (items[i].id === 'top-manage-habits') {
            manageOpen();
          } else if (items[i].id === 'top-hide-habits' || items[i].id === 'top-show-habits') {
            toggleHabits();
          } else {
            cfRender();
            cfLoadPickersForId(cfActiveId());
          }
        };
        stage.appendChild(el);
      });

      cfRender();
      stage.style.touchAction = 'none';

      if (_cfAnimId) { cancelAnimationFrame(_cfAnimId); _cfAnimId = null; }
      if (_cfPointerAC) _cfPointerAC.abort();
      _cfPointerAC = new AbortController();
      const sig = _cfPointerAC.signal;

      let dragStartX = null;
      let dragStartIdx = null;
      let displayIdx = cfIdx;
      let didDrag = false;

      function springTo(target) {
        if (_cfAnimId) cancelAnimationFrame(_cfAnimId);
        const startIdx = displayIdx;
        const startTime = performance.now();
        const duration = cfTuning.duration;
        function step(now) {
          const t = Math.min((now - startTime) / duration, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          displayIdx = startIdx + (target - startIdx) * ease;
          cfRenderAt(displayIdx);
          if (t < 1) {
            _cfAnimId = requestAnimationFrame(step);
          } else {
            displayIdx = target;
            cfIdx = target;
            cfRenderAt(displayIdx);
            _cfAnimId = null;
            cfLoadPickersForId(cfActiveId());
          }
        }
        _cfAnimId = requestAnimationFrame(step);
      }

      stage.addEventListener('pointerdown', e => {
        dragStartX = e.clientX;
        dragStartIdx = displayIdx;
        didDrag = false;
        if (_cfAnimId) { cancelAnimationFrame(_cfAnimId); _cfAnimId = null; }
        stage.setPointerCapture(e.pointerId);
        e.preventDefault();
        // flash the card closest to the tap point
        const stageRect = stage.getBoundingClientRect();
        const tapX = e.clientX - stageRect.left;
        const cardEls = [...stage.querySelectorAll('.cf-item')];
        let closest = null, closestDist = Infinity;
        cardEls.forEach((el) => {
          const r = el.getBoundingClientRect();
          const cardCx = r.left - stageRect.left + r.width / 2;
          const dist = Math.abs(tapX - cardCx);
          if (dist < closestDist) { closestDist = dist; closest = el; }
        });
        if (closest) {
          const _id = closest.dataset.cfI !== undefined ? window._cfItems()[parseInt(closest.dataset.cfI)]?.id : null;
          if (_id) { const _s = _btnStyleFor(_id); closest.style.background = hex8ToCss(_s.tap || btnStyle.tap); }
        }
      }, { signal: sig });

      stage.addEventListener('pointermove', e => {
        if (dragStartX === null) return;
        const dx = e.clientX - dragStartX;
        if (Math.abs(dx) > 4) didDrag = true;
        if (!didDrag) return;
        e.preventDefault();
        const n = window._cfItems().length;
        displayIdx = Math.max(0, Math.min(dragStartIdx + (-dx / 80), n - 1));
        cfIdx = displayIdx;
        cfRenderAt(displayIdx);
      }, { signal: sig });

      stage.addEventListener('pointerup', e => {
        if (dragStartX === null) return;
        // reset any tapped card background
        [...stage.querySelectorAll('.cf-item')].forEach(el => {
          const _id = window._cfItems()[parseInt(el.dataset.cfI)]?.id;
          if (_id) { const _s = _btnStyleFor(_id); el.style.background = hex8ToCss(_s.bg); }
        });
        const wasDrag = didDrag;
        const upX = e.clientX;
        dragStartX = null;
        didDrag = false;
        const n = window._cfItems().length;
        const target = Math.max(0, Math.min(Math.round(displayIdx), n - 1));
        cfIdx = target;
        if (!wasDrag) {
          const stageRect = stage.getBoundingClientRect();
          const tapX = upX - stageRect.left;
          const cardEls = [...stage.querySelectorAll('.cf-item')];
          let closestDist = Infinity;
          let closest = target;
          cardEls.forEach((el, i) => {
            const r = el.getBoundingClientRect();
            const cardCx = r.left - stageRect.left + r.width / 2;
            const dist = Math.abs(tapX - cardCx);
            if (dist < closestDist) { closestDist = dist; closest = i; }
          });
          cfIdx = closest;
          displayIdx = closest;
          const tappedItem = window._cfItems()[closest];
          if (tappedItem && tappedItem.id === 'top-settings') {
            settingsOpen();
            cfLoadPickersForId(cfActiveId());
          } else if (tappedItem && tappedItem.id === 'top-manage-habits') {
            manageOpen();
            cfLoadPickersForId(cfActiveId());
          } else if (tappedItem && (tappedItem.id === 'top-hide-habits' || tappedItem.id === 'top-show-habits')) {
            toggleHabits();
            cfLoadPickersForId(cfActiveId());
          } else {
            springTo(closest);
            cfLoadPickersForId(cfActiveId());
          }
        } else {
          springTo(target);
          dragStartIdx = null;
        }
      }, { signal: sig });

      stage.addEventListener('pointercancel', () => {
        if (dragStartX === null) return;
        const n = window._cfItems().length;
        const target = Math.max(0, Math.min(Math.round(displayIdx), n - 1));
        cfIdx = target;
        springTo(target);
        dragStartX = null; didDrag = false; dragStartIdx = null;
      }, { signal: sig });
    }
    window._cfBuild = function() { cfBuild(); cfLoadPickersForId(cfActiveId()); };
    window._cfSetIdx = function(i) { cfIdx = i; };
    new ResizeObserver(() => { if (window._cfBuild) { const saved = cfIdx; window._cfBuild(); cfIdx = saved; cfRender(); cfLoadPickersForId(cfActiveId()); } }).observe(document.getElementById('cf-stage'));

    function cfPrev() { if (cfIdx > 0) { cfIdx--; cfRender(); cfLoadPickersForId(cfActiveId()); } }
    function cfNext() { const n = cfItems().length; if (cfIdx < n-1) { cfIdx++; cfRender(); cfLoadPickersForId(cfActiveId()); } }
  })();
  let _settingsJustOpened = false;
    document.getElementById("settings-overlay").addEventListener("click", e => {
  if (_settingsJustOpened) { _settingsJustOpened = false; return; }
  if (e.target === document.getElementById("settings-overlay")) settingsCancel();
  });
  document.getElementById("settings-save").addEventListener("click", e => {
  e.stopPropagation();
  });
  document.getElementById("settings-cancel").addEventListener("click", e => {
  e.stopPropagation();
  });
  document.getElementById("settings-reset").addEventListener("click", e => {
  e.stopPropagation();
  });

/// ── Drag-to-reorder — HABIT BUTTONS ──────────────────────
  const DRAG_THRESHOLD = 6;
  let drag = null;

  buttonsEl.addEventListener("pointerdown", e => {
    const btn = e.target.closest(".tracker-btn[data-id]");
    if (!btn) return;
    if (drag) return;
    e.preventDefault();
    const rect = btn.getBoundingClientRect();
    drag = {
      id: btn.dataset.id, btn,
      startX: e.clientX, startY: e.clientY,
      offX: e.clientX - rect.left, offY: e.clientY - rect.top,
      btnW: rect.width, btnH: rect.height,
      ghost: null, lastOver: null, active: false,
    };
  });

  document.addEventListener("pointermove", e => {
    if (!drag) return;
    if (!drag.active) {
      if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < DRAG_THRESHOLD) return;
      drag.active = true;
      const rect = drag.btn.getBoundingClientRect();
      drag.ghost = drag.btn.cloneNode(true);
      drag.ghost.classList.add("drag-ghost");
      Object.assign(drag.ghost.style, {
        position: "fixed", left: rect.left+"px", top: rect.top+"px",
        width: rect.width+"px", height: rect.height+"px",
        pointerEvents: "none", opacity: "0.75", zIndex: "9000",
        margin: "0", boxSizing: "border-box",
      });
      document.body.appendChild(drag.ghost);
      drag.btn.style.visibility = "hidden";
      document.body.classList.add("is-dragging");
    }
    drag.ghost.style.left = (e.clientX - drag.offX) + "px";
    drag.ghost.style.top  = (e.clientY - drag.offY) + "px";
    const gcx = e.clientX - drag.offX + drag.btnW / 2;
    const gcy = e.clientY - drag.offY + drag.btnH / 2;
    let over = null;
    for (const t of buttonsEl.children) {
      if (t === drag.btn) continue;
      const r = t.getBoundingClientRect();
      if (gcx >= r.left && gcx <= r.right && gcy >= r.top && gcy <= r.bottom) { over = t; break; }
    }
    if (!over) { drag.lastOver = null; return; }
    if (over === drag.lastOver) return;
    drag.lastOver = over;
    const overNext = over.nextSibling, btnNext = drag.btn.nextSibling;
    if (btnNext === over)              buttonsEl.insertBefore(over, drag.btn);
    else if (overNext === drag.btn)    buttonsEl.insertBefore(drag.btn, over);
    else {
      buttonsEl.insertBefore(drag.btn, overNext || null);
      buttonsEl.insertBefore(over, btnNext || null);
    }
  });

  document.addEventListener("pointerup", () => {
    if (!drag) return;
    if (drag.active) {
      drag.btn.style.visibility = "";
      drag.ghost.remove();
      document.body.classList.remove("is-dragging");
      saveButtonOrder();
    } else {
      const currentlyOpen = getActiveSectionId();
      setActiveSection(currentlyOpen === drag.id ? null : drag.id);
    }
    drag = null;
  });

  document.addEventListener("pointercancel", () => {
    if (!drag) return;
    if (drag.active) {
      drag.btn.style.visibility = "";
      if (drag.ghost) drag.ghost.remove();
      document.body.classList.remove("is-dragging");
    }
    drag = null;
  });

  // ── Show / Hide Habits ─────────────────────────────────────
  let habitsVisible = localStorage.getItem("_habitsVisible") !== "false";
  buttonsEl.style.display = habitsVisible ? "" : "none";
  document.getElementById("hide-habits-btn").textContent = habitsVisible ? "Hide Habits" : "Show Habits";
  applyBtnStyle();
  function toggleHabits() {
    habitsVisible = !habitsVisible;
    if (!habitsVisible) setActiveSection(null);
    buttonsEl.style.display = habitsVisible ? "" : "none";
    document.getElementById("hide-habits-btn").textContent = habitsVisible ? "Hide Habits" : "Show Habits";
    localStorage.setItem("_habitsVisible", habitsVisible);
    applyBtnStyle();
    if (window._cfBuild) {
      const newItems = window._cfItems();
      const targetId = habitsVisible ? 'top-hide-habits' : 'top-show-habits';
      const newIdx = newItems.findIndex(it => it.id === targetId);
      if (newIdx !== -1 && window._cfSetIdx) window._cfSetIdx(newIdx);
      window._cfBuild();
    }
  }
  // ── Top grid drag-to-reorder ───────────────────────────────
  const topGrid = document.getElementById("top-grid");
  let tdrag = null;

  topGrid.addEventListener("pointerdown", e => {
    const item = e.target.closest(".top-item");
    if (!item) return;
    if (tdrag) return;
    e.preventDefault();
    const rect = item.getBoundingClientRect();
    tdrag = {
      item, startX: e.clientX, startY: e.clientY,
      offX: e.clientX - rect.left, offY: e.clientY - rect.top,
      w: rect.width, h: rect.height,
      ghost: null, lastOver: null, active: false,
    };
  });

  topGrid.addEventListener("pointermove", e => {
    if (!tdrag) return;
    if (!tdrag.active) {
      if (Math.hypot(e.clientX - tdrag.startX, e.clientY - tdrag.startY) < DRAG_THRESHOLD) return;
      tdrag.active = true;
      const rect = tdrag.item.getBoundingClientRect();
      tdrag.ghost = tdrag.item.cloneNode(true);
      Object.assign(tdrag.ghost.style, {
        position: "fixed", left: rect.left+"px", top: rect.top+"px",
        width: rect.width+"px", height: rect.height+"px",
        pointerEvents: "none", opacity: "0.75", zIndex: "8999",
        margin: "0", boxSizing: "border-box",
      });
      document.body.appendChild(tdrag.ghost);
      tdrag.item.style.visibility = "hidden";
    }
    tdrag.ghost.style.left = (e.clientX - tdrag.offX) + "px";
    tdrag.ghost.style.top  = (e.clientY - tdrag.offY) + "px";
    const gcx = e.clientX - tdrag.offX + tdrag.w / 2;
    const gcy = e.clientY - tdrag.offY + tdrag.h / 2;
    let over = null;
    for (const t of topGrid.children) {
      if (t === tdrag.item) continue;
      const r = t.getBoundingClientRect();
      if (gcx >= r.left && gcx <= r.right && gcy >= r.top && gcy <= r.bottom) { over = t; break; }
    }
    if (!over) { tdrag.lastOver = null; return; }
    if (over === tdrag.lastOver) return;
    tdrag.lastOver = over;
    const overNext = over.nextSibling, iNext = tdrag.item.nextSibling;
    if (iNext === over)                topGrid.insertBefore(over, tdrag.item);
    else if (overNext === tdrag.item)  topGrid.insertBefore(tdrag.item, over);
    else {
      topGrid.insertBefore(tdrag.item, overNext || null);
      topGrid.insertBefore(over, iNext || null);
    }
  });

  document.addEventListener("pointerup", () => {
    if (!tdrag) return;
    if (tdrag.active) {
      tdrag.item.style.visibility = "";
      if (tdrag.ghost) tdrag.ghost.remove();
      saveTopGridOrder();
    } else {
      const btn = tdrag.item.querySelector("button");
      // Skip re-triggering for manage-habits since it already fires directly
      if (btn && tdrag.item.dataset.item !== "manage-habits") btn.click();
    }
    tdrag = null;
  });

  document.addEventListener("pointercancel", () => {
    if (!tdrag) return;
    tdrag.item.style.visibility = "";
    if (tdrag.ghost) tdrag.ghost.remove();
    tdrag = null;
  });

  function saveTopGridOrder() {
    const order = [...topGrid.children].map(w => w.dataset.item).filter(Boolean);
    localStorage.setItem("_topGridOrder", JSON.stringify(order));
  }
  function applyTopGridOrder() {
    try {
      const saved = JSON.parse(localStorage.getItem("_topGridOrder"));
      if (!Array.isArray(saved)) return;
      saved.forEach(id => {
        const w = topGrid.querySelector(`.top-item[data-item="${id}"]`);
        if (w) topGrid.appendChild(w);
      });
    } catch {}
  }
  applyTopGridOrder();
  // ── Settings group grid drag-to-reorder ───────────────────
  const sgGrid = document.getElementById('settings-groups-grid');
  let sgDrag = null;

  sgGrid.addEventListener('pointerdown', e => {
    const item = e.target.closest('.settings-group-item');
    if (!item || sgDrag) return;
    e.preventDefault();
    const rect = item.getBoundingClientRect();
    sgDrag = {
      item, startX: e.clientX, startY: e.clientY,
      offX: e.clientX - rect.left, offY: e.clientY - rect.top,
      w: rect.width, h: rect.height,
      ghost: null, lastOver: null, active: false,
    };
  });

  document.addEventListener('pointermove', e => {
    if (!sgDrag) return;
    if (!sgDrag.active) {
      if (Math.hypot(e.clientX - sgDrag.startX, e.clientY - sgDrag.startY) < DRAG_THRESHOLD) return;
      sgDrag.active = true;
      const rect = sgDrag.item.getBoundingClientRect();
      sgDrag.ghost = sgDrag.item.cloneNode(true);
      Object.assign(sgDrag.ghost.style, {
        position:'fixed', left:rect.left+'px', top:rect.top+'px',
        width:rect.width+'px', height:rect.height+'px',
        pointerEvents:'none', opacity:'0.75', zIndex:'9001',
        margin:'0', boxSizing:'border-box',
      });
      document.body.appendChild(sgDrag.ghost);
      sgDrag.item.style.visibility = 'hidden';
    }
    sgDrag.ghost.style.left = (e.clientX - sgDrag.offX) + 'px';
    sgDrag.ghost.style.top  = (e.clientY - sgDrag.offY) + 'px';
    const gcx = e.clientX - sgDrag.offX + sgDrag.w / 2;
    const gcy = e.clientY - sgDrag.offY + sgDrag.h / 2;
    let over = null;
    for (const t of sgGrid.children) {
      if (t === sgDrag.item) continue;
      const r = t.getBoundingClientRect();
      if (gcx >= r.left && gcx <= r.right && gcy >= r.top && gcy <= r.bottom) { over = t; break; }
    }
    if (!over) { sgDrag.lastOver = null; return; }
    if (over === sgDrag.lastOver) return;
    sgDrag.lastOver = over;
    const overNext = over.nextSibling, iNext = sgDrag.item.nextSibling;
    if (iNext === over)                sgGrid.insertBefore(over, sgDrag.item);
    else if (overNext === sgDrag.item) sgGrid.insertBefore(sgDrag.item, over);
    else {
      sgGrid.insertBefore(sgDrag.item, overNext || null);
      sgGrid.insertBefore(over, iNext || null);
    }
  });

  document.addEventListener('pointerup', () => {
    if (!sgDrag) return;
    if (sgDrag.active) {
      sgDrag.item.style.visibility = '';
      if (sgDrag.ghost) sgDrag.ghost.remove();
      saveSettingsGroupOrder();
    } else {
      toggleSettingsGroup(sgDrag.item.dataset.group);
    }
    sgDrag = null;
  });

  document.addEventListener('pointercancel', () => {
    if (!sgDrag) return;
    sgDrag.item.style.visibility = '';
    if (sgDrag.ghost) sgDrag.ghost.remove();
    sgDrag = null;
  });

  function saveSettingsGroupOrder() {
    const order = [...sgGrid.children].map(el => el.dataset.group).filter(Boolean);
    localStorage.setItem('_settingsGroupOrder', JSON.stringify(order));
  }
  function applySettingsGroupOrder() {
    try {
      const saved = JSON.parse(localStorage.getItem('_settingsGroupOrder'));
      if (!Array.isArray(saved)) return;
      // Append known saved items in order
      saved.forEach(id => {
        const item = sgGrid.querySelector(`[data-group="${id}"]`);
        if (item) sgGrid.appendChild(item);
      });
      // Append any new group items not present in the saved order
      sgGrid.querySelectorAll('.settings-group-item').forEach(item => {
        if (!saved.includes(item.dataset.group)) sgGrid.appendChild(item);
      });
    } catch {}
  }
  applySettingsGroupOrder();
  // ── Manage Habits ──────────────────────────────────────────
  function manageOpen() {
    manageRenderList();
    document.getElementById("manage-overlay").classList.add("active");
  }
  function manageClose() {
    document.getElementById("manage-overlay").classList.remove("active");
  }
  function manageRenderList() {
    const list = document.getElementById("manage-list");
    list.innerHTML = "";
    TRACKER_CONFIGS.forEach(cfg => {
      const row = document.createElement("div");
      row.className = "manage-habit-row";
      const safeName = cfg.label.replace(/&/g,"&amp;").replace(/"/g,"&quot;");
      row.innerHTML = `
        <input type="checkbox" class="manage-habit-checkbox" data-id="${cfg.id}" onchange="manageUpdateSelectAll()">
        <input class="manage-habit-name" type="text" value="${safeName}" data-id="${cfg.id}" autocomplete="off" spellcheck="false">
        <button class="manage-rename-btn" onclick="manageRename('${cfg.id}',this)">Rename</button>
        <button class="manage-delete-btn" onclick="manageDelete('${cfg.id}')">Delete</button>`;
      list.appendChild(row);
    });
    document.getElementById("manage-select-all").checked = false;
  }
  function manageRename(id, btn) {
    const input = btn.closest(".manage-habit-row").querySelector(".manage-habit-name");
    const newLabel = input.value.trim();
    if (!newLabel) return;
    const cfg = TRACKER_CONFIGS.find(c => c.id === id);
    if (!cfg) return;
    cfg.label = newLabel;
    saveRawConfigs();
    const domBtn = buttonsEl.querySelector(`.tracker-btn[data-id="${id}"]`);
    if (domBtn) domBtn.textContent = newLabel;
    equalizeButtonSizes();
    const orig = btn.textContent;
    btn.textContent = "✓";
    setTimeout(() => { btn.textContent = orig; }, 1000);
  }
  async function manageDelete(id) {
    const cfg = TRACKER_CONFIGS.find(c => c.id === id);
    if (!cfg) return;
    const ok = await confirmClear(`This will permanently delete the habit <strong>${cfg.label}</strong> and all its data.`);
    if (!ok) return;
    performHabitDelete(id);
    applyButtonOrder();
    manageRenderList();
  }
  function manageUpdateSelectAll() {
    const allChecked = [...document.querySelectorAll('.manage-habit-checkbox')].every(c => c.checked);
    const anyChecked = [...document.querySelectorAll('.manage-habit-checkbox')].some(c => c.checked);
    document.getElementById("manage-select-all").checked = allChecked;
    document.getElementById("manage-delete-selected").style.display = anyChecked ? "" : "none";
  }
  function manageToggleSelectAll() {
    const isChecked = document.getElementById("manage-select-all").checked;
    document.querySelectorAll('.manage-habit-checkbox').forEach(c => c.checked = isChecked);
    document.getElementById("manage-delete-selected").style.display = isChecked ? "" : "none";
  }
  function manageBulkDelete() {
    const selected = [...document.querySelectorAll('.manage-habit-checkbox:checked')];
    if (!selected.length) return;
    const selectedIds = selected.map(c => c.dataset.id);
    const selectedNames = selectedIds.map(id => TRACKER_CONFIGS.find(c => c.id === id)?.label).filter(Boolean);
    
    // Check if any selected habits have data
    const hasData = selectedIds.some(id => {
      const prefix = id + ":";
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith(prefix)) return true;
      }
      return false;
    });
    
    const msg = `This will permanently delete ${selectedNames.length} habit${selectedNames.length === 1 ? '' : 's'}:<br><strong>${selectedNames.join(', ')}</strong>`;
    
    // If no data, use simple confirm; if data exists, use confirmClear with password
    const confirmPromise = hasData ? confirmClear(msg) : Promise.resolve(window.confirm(`Delete ${selectedNames.length} habit${selectedNames.length === 1 ? '' : 's'}?\n\n${selectedNames.join(', ')}`));
    
    confirmPromise.then(ok => {
      if (!ok) return;
      selectedIds.forEach(id => performHabitDelete(id));
      document.getElementById("manage-select-all").checked = false;
      document.getElementById("manage-delete-selected").style.display = "none";
      manageRenderList();
    });
  }
  function performHabitDelete(id) {
    // Wipe all localStorage entries for this habit
    const prefix = id + ":";
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i); if (k.startsWith(prefix)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
    // Close & remove its section if open
    const section = document.getElementById(`section-${id}`);
    if (section) section.remove();
    delete sectionEls[id];
    initializedSet.delete(id);
    delete trackers[id];
    // Remove from config list and persist
    const idx = TRACKER_CONFIGS.findIndex(c => c.id === id);
    if (idx !== -1) TRACKER_CONFIGS.splice(idx, 1);
    saveRawConfigs();
  }
  function manageAddHabit() {
    const input = document.getElementById("manage-new-name");
    const label = input.value.trim();
    if (!label) return;
    const id = "habit_" + Date.now();
    const cfg = buildTrackerConfig({ id, label, type: "simple" });
    TRACKER_CONFIGS.push(cfg);
    saveRawConfigs();
    // Create section element
    const section = document.createElement("div");
    section.id = `section-${id}`;
    section.className = "tracker-section";
    sectionsEl.appendChild(section);
    sectionEls[id] = section;
    // Add button — replace first empty slot, or append
    const emptySlot = buttonsEl.querySelector(".empty-slot");
    const btn = makeTrackerBtn(cfg);
    if (emptySlot) {
      buttonsEl.replaceChild(btn, emptySlot);
    } else {
      buttonsEl.appendChild(btn);
    }
    applyBtnStyle();
    saveButtonOrder();
    input.value = "";
    manageRenderList();
  }
  document.getElementById("manage-overlay").addEventListener("click", e => {
  if (e.target === document.getElementById("manage-overlay")) manageClose();
});

  // ── Clock tumbler ──────────────────────────────────────────
  (function() {
    const COLS = window._CLOCK_COLS;
    const wrap = document.getElementById("clock-tumbler-wrap");

    function getCfg() { return window._clockGet().tumblerCfg; }
    function setCfg(cfg) { window._clockSet(cfg); resetPreviewCycle(); renderPreviews(); }

    function renderPreviews() {
      const cfg = getCfg();
      const previewDateEl = wrap.querySelector("#tumb-preview-date");
      const previewTimeEl = wrap.querySelector("#tumb-preview-time");
      const now = new Date();
      const DOW_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      const DOW_LONG  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      const d = now.getDate(), mo = now.getMonth()+1, y = now.getFullYear();
      const dd = String(d).padStart(2,"0"), mm = String(mo).padStart(2,"0");
      const yy = String(y).slice(-2);
      const dowL = DOW_LONG[now.getDay()];
      const dayNameMap = ["",dowL.slice(0,1),dowL.slice(0,2),dowL.slice(0,3),dowL.slice(0,4),dowL.slice(0,5),dowL];
      const dayNameStr = cfg[0] === 0 ? "" : (dayNameMap[cfg[0]] || "");
      const dayNumStr  = cfg[1] === 0 ? "" : cfg[1] === 1 ? String(d) : dd;
      const moStr      = cfg[2] === 0 ? "" : cfg[2] === 1 ? String(mo) : mm;
      const yrStr      = cfg[3] === 0 ? "" : cfg[3] === 1 ? yy : String(y);
      const h24 = now.getHours(), h12 = h24 % 12 || 12;
      const mi = String(now.getMinutes()).padStart(2,"0");
      const se = String(now.getSeconds()).padStart(2,"0");
      const ms = String(now.getMilliseconds()).padStart(3,"0");
      const ampm = h24 >= 12 ? "pm" : "am";
      let hrStr = "";
      if      (cfg[4]===1) hrStr = String(h12);
      else if (cfg[4]===2) hrStr = String(h12).padStart(2,"0");
      else if (cfg[4]===3) hrStr = String(h24);
      else if (cfg[4]===4) hrStr = String(h24).padStart(2,"0");
      const minStr = cfg[5] === 0 ? "" : mi;
      const secStr = cfg[6] === 0 ? "" : se;
      const amStr  = cfg[7] === 0 ? "" : ampm;
      const dateParts = [dayNameStr, [dayNumStr, moStr, yrStr].filter(Boolean).join("/")].filter(Boolean);
      const dateLine = dateParts.join(" ");
      let timeParts = [hrStr];
      if (minStr) timeParts.push(minStr);
      if (secStr) timeParts.push(secStr);
      const timeBase = timeParts.filter(Boolean).join(":");
      const timeLine = [timeBase, amStr ? " "+amStr : ""].join("").trim();
      const fullStr = [dateLine, timeLine].filter(Boolean).join("\n");
      if (previewDateEl) previewDateEl.innerHTML = dateLine ? dateLine.replace(/\s/g,"<br>") : "(date)";
      if (previewTimeEl) previewTimeEl.textContent = timeLine || "(time)";
      COLS.forEach((col, ci) => renderCol(ci));
    }

    function liveVal(ci, optIdx, now) {
      if (optIdx === 0) return "—";
      const DOW_LONG = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      const dowL = DOW_LONG[now.getDay()];
      const d   = now.getDate(),  mo = now.getMonth() + 1, y = now.getFullYear();
      const h24 = now.getHours(), h12 = h24 % 12 || 12;
      const mi  = String(now.getMinutes()).padStart(2,"0");
      const se  = String(now.getSeconds()).padStart(2,"0");
      const ms  = String(now.getMilliseconds()).padStart(3,"0");
      const ampm = h24 >= 12 ? "pm" : "am";
      if (ci === 0) return dowL.slice(0, optIdx) || "—";           // 1→F, 2→Fr, 3→Fri …
      if (ci === 1) return optIdx === 1 ? String(d) : String(d).padStart(2,"0");
      if (ci === 2) return optIdx === 1 ? String(mo) : String(mo).padStart(2,"0");
      if (ci === 3) return optIdx === 1 ? String(y).slice(-2) : String(y);
      if (ci === 4) {
        if (optIdx === 1) return String(h12);
        if (optIdx === 2) return String(h12).padStart(2,"0");
        if (optIdx === 3) return String(h24);
        if (optIdx === 4) return String(h24).padStart(2,"0");
      }
      if (ci === 5) return mi;
      if (ci === 6) return se;
      if (ci === 7) return ampm;
      return "—";
    }

    function renderCol(ci) {
      const cfg  = getCfg();
      const col  = wrap.querySelector(`.tumb-col[data-ci="${ci}"]`);
      if (!col) return;
      const win  = col.querySelector(".tumb-window");
      win.innerHTML = "";
      const opts = COLS[ci].opts;
      const sel  = cfg[ci];
      const prev = (sel - 1 + opts.length) % opts.length;
      const next = (sel + 1) % opts.length;
      const now  = new Date();
      const aUp = document.createElement("div");
      aUp.className = "tumb-arrow"; aUp.textContent = "▲";
      const elPrev = document.createElement("div");
      elPrev.className = "tumb-item tumb-adj";
      elPrev.textContent = liveVal(ci, prev, now);
      const elSel = document.createElement("div");
      elSel.className = "tumb-item tumb-sel";
      elSel.textContent = liveVal(ci, sel, now);
      const elNext = document.createElement("div");
      elNext.className = "tumb-item tumb-adj";
      elNext.textContent = liveVal(ci, next, now);
      const aDown = document.createElement("div");
      aDown.className = "tumb-arrow"; aDown.textContent = "▼";
      win.append(aUp, elPrev, elSel, elNext, aDown);
    }

    function buildTumbler() {
      wrap.innerHTML = "";
      const previewRow = document.createElement("div");
      previewRow.style.cssText = "display:flex;justify-content:center;gap:8px;margin-bottom:8px;";

      // ── preview date button ──
      const previewDate = document.createElement("div");
      previewDate.className = "top-item";
      previewDate.dataset.previewItem = "date";
      previewDate.style.cssText = "background:var(--clock-date-bg,transparent);display:flex;align-items:center;justify-content:center;min-height:44px;box-sizing:border-box;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;";
      const previewDateSpan = document.createElement("span");
      previewDateSpan.id = "tumb-preview-date";
      previewDateSpan.style.cssText = "font-size:var(--clock-date-size,13px);color:var(--clock-date-color,#666);letter-spacing:0.02em;line-height:1.3;text-align:center;pointer-events:none;";
      previewDate.appendChild(previewDateSpan);

      // ── preview time button ──
      const previewTime = document.createElement("div");
      previewTime.className = "top-item";
      previewTime.dataset.previewItem = "time";
      previewTime.style.cssText = "background:var(--clock-time-bg,transparent);display:flex;align-items:center;justify-content:center;min-height:44px;box-sizing:border-box;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;";
      const previewTimeSpan = document.createElement("span");
      previewTimeSpan.id = "tumb-preview-time";
      previewTimeSpan.style.cssText = "font-size:var(--clock-time-size,13px);color:var(--clock-time-color,#666);letter-spacing:0.02em;line-height:1.3;text-align:center;pointer-events:none;";
      previewTime.appendChild(previewTimeSpan);

      previewRow.appendChild(previewDate);
      previewRow.appendChild(previewTime);
      wrap.appendChild(previewRow);

      // ── preview grid drag-to-reorder ──
      const PREVIEW_DRAG_THRESHOLD = 6;
      let pdrag = null;
      previewRow.addEventListener("pointerdown", e => {
        const item = e.target.closest(".top-item[data-preview-item]");
        if (!item || pdrag) return;
        e.preventDefault();
        e.stopPropagation();
        const rect = item.getBoundingClientRect();
        pdrag = {
          item, startX: e.clientX, startY: e.clientY,
          offX: e.clientX - rect.left, offY: e.clientY - rect.top,
          w: rect.width, h: rect.height,
          ghost: null, lastOver: null, active: false,
        };
      });
      document.addEventListener("pointermove", eP => {
        if (!pdrag) return;
        if (!pdrag.active) {
          if (Math.hypot(eP.clientX - pdrag.startX, eP.clientY - pdrag.startY) < PREVIEW_DRAG_THRESHOLD) return;
          pdrag.active = true;
          const rect = pdrag.item.getBoundingClientRect();
          pdrag.ghost = pdrag.item.cloneNode(true);
          Object.assign(pdrag.ghost.style, {
            position:"fixed", left:rect.left+"px", top:rect.top+"px",
            width:rect.width+"px", height:rect.height+"px",
            pointerEvents:"none", opacity:"0.75", zIndex:"9002",
            margin:"0", boxSizing:"border-box", cursor:"grabbing",
          });
          document.body.appendChild(pdrag.ghost);
          pdrag.item.style.visibility = "hidden";
        }
        pdrag.ghost.style.left = (eP.clientX - pdrag.offX) + "px";
        pdrag.ghost.style.top  = (eP.clientY - pdrag.offY) + "px";
        const gcx = eP.clientX - pdrag.offX + pdrag.w / 2;
        const gcy = eP.clientY - pdrag.offY + pdrag.h / 2;
        let over = null;
        for (const t of previewRow.children) {
          if (t === pdrag.item) continue;
          const r = t.getBoundingClientRect();
          if (gcx >= r.left && gcx <= r.right && gcy >= r.top && gcy <= r.bottom) { over = t; break; }
        }
        if (!over) { pdrag.lastOver = null; return; }
        if (over === pdrag.lastOver) return;
        pdrag.lastOver = over;
        const overNext = over.nextSibling, iNext = pdrag.item.nextSibling;
        if (iNext === over)               previewRow.insertBefore(over, pdrag.item);
        else if (overNext === pdrag.item) previewRow.insertBefore(pdrag.item, over);
        else {
          previewRow.insertBefore(pdrag.item, overNext || null);
          previewRow.insertBefore(over, iNext || null);
        }
      });
      document.addEventListener("pointerup", eP => {
        if (!pdrag) return;
        if (pdrag.active) {
          pdrag.item.style.visibility = "";
          if (pdrag.ghost) pdrag.ghost.remove();
        } else {
          // tap — run the same cycle as the live top-grid buttons
          const which = pdrag.item.dataset.previewItem;
          if (which === "time") {
            const saved = window._clockGet().tumblerCfg;
            if (_previewTimeCycleStep === 0) {
              _previewTimeCycleStep = 1; pdrag = null; return;
            }
            const cfg = saved.slice();
            const savedHour = saved[4];
            const is12 = savedHour === 1 || savedHour === 2;
            const isPadded = savedHour === 2 || savedHour === 4;
            if (_previewTimeCycleStep === 1) {
              if      (savedHour === 1) cfg[4] = 2;
              else if (savedHour === 2) cfg[4] = 1;
              else if (savedHour === 3) cfg[4] = 4;
              else if (savedHour === 4) cfg[4] = 3;
              cfg[7] = (cfg[4] === 1 || cfg[4] === 2) ? 1 : 0;
              _previewTimeCycleStep = 2;
            } else if (_previewTimeCycleStep === 2) {
              if (is12) cfg[4] = isPadded ? 4 : 3;
              else      cfg[4] = isPadded ? 2 : 1;
              cfg[7] = (cfg[4] === 1 || cfg[4] === 2) ? 1 : 0;
              _previewTimeCycleStep = 3;
            } else if (_previewTimeCycleStep === 3) {
              const cur = cfg[4];
              if      (cur === 1) cfg[4] = 2;
              else if (cur === 2) cfg[4] = 1;
              else if (cur === 3) cfg[4] = 4;
              else if (cur === 4) cfg[4] = 3;
              cfg[7] = (cfg[4] === 1 || cfg[4] === 2) ? 1 : 0;
              _previewTimeCycleStep = 0;
            }
            window._clockSet(cfg);
          }
          // date button tap cycle
          if (which === "date") {
            const saved = window._clockGet().tumblerCfg;
            if (_previewDateCycleStep === 0) {
              _previewDateCycleStep = 1; pdrag = null; return;
            }
            const cfg = saved.slice();
            if (_previewDateCycleStep === 1) {
              if      (cfg[1] === 1) cfg[1] = 2;
              else if (cfg[1] === 2) cfg[1] = 1;
              _previewDateCycleStep = 2;
            } else if (_previewDateCycleStep === 2) {
              if      (cfg[2] === 1) cfg[2] = 2;
              else if (cfg[2] === 2) cfg[2] = 1;
              _previewDateCycleStep = 3;
            } else if (_previewDateCycleStep === 3) {
              if      (cfg[3] === 1) cfg[3] = 2;
              else if (cfg[3] === 2) cfg[3] = 1;
              _previewDateCycleStep = 0;
            }
            window._clockSet(cfg);
          }
        }
        pdrag = null;
      });
      document.addEventListener("pointercancel", () => {
        if (!pdrag) return;
        pdrag.item.style.visibility = "";
        if (pdrag.ghost) pdrag.ghost.remove();
        pdrag = null;
      });
      const grid = document.createElement("div");
      grid.className = "tumb-grid";
      COLS.forEach((col, ci) => {
        const colEl = document.createElement("div");
        colEl.className = "tumb-col";
        colEl.dataset.ci = ci;
        const lbl = document.createElement("div");
        lbl.className = "tumb-col-label";
        lbl.textContent = col.label;
        colEl.appendChild(lbl);
        const win = document.createElement("div");
        win.className = "tumb-window";
        colEl.appendChild(win);
        grid.appendChild(colEl);
        setupDrag(win, ci);
      });
      wrap.appendChild(grid);
      renderPreviews();
    }

    let activeCol = 0;
    function setActiveCol(ci) {
      activeCol = ci;
      wrap.querySelectorAll('.tumb-col').forEach((c, i) => {
        c.style.background = i === ci ? '#2a2a2a' : '';
        c.style.borderRadius = i === ci ? '4px' : '';
      });
    }

    function setupDrag(win, ci) {
      let startX = null, startY = null, lastY = null;
      let accumY = 0, accumX = 0;
      let axis = null; // 'x' or 'y', locked after threshold
      const STEP_Y = 28, STEP_X = 40, AXIS_LOCK = 8;

      function stepY(dir) {
        const cfg = getCfg().slice();
        cfg[ci] = (cfg[ci] + dir + COLS[ci].opts.length) % COLS[ci].opts.length;
        setCfg(cfg);
      }
      function stepX(dir) {
        const next = ci + dir;
        if (next >= 0 && next < COLS.length) setActiveCol(next);
      }

      win.addEventListener("pointerdown", e => {
        e.preventDefault();
        e.stopPropagation();
        win.setPointerCapture(e.pointerId);
        setActiveCol(ci);
        startX = e.clientX; startY = e.clientY;
        lastY = e.clientY;
        accumY = 0; accumX = 0; axis = null;
      });
      win.addEventListener("pointermove", e => {
        if (startY === null) return;
        const dx = e.clientX - startX;
        const dy = lastY - e.clientY;
        // Lock axis after moving past threshold
        if (!axis) {
          if (Math.abs(e.clientX - startX) > AXIS_LOCK || Math.abs(e.clientY - startY) > AXIS_LOCK) {
            axis = Math.abs(e.clientX - startX) > Math.abs(e.clientY - startY) ? 'x' : 'y';
          }
        }
        if (axis === 'y') {
          accumY += dy;
          lastY = e.clientY;
          while (accumY >= STEP_Y)  { accumY -= STEP_Y; stepY(1); }
          while (accumY <= -STEP_Y) { accumY += STEP_Y; stepY(-1); }
        } else if (axis === 'x') {
          accumX = e.clientX - startX;
          if (accumX > STEP_X)       { startX = e.clientX; accumX = 0; stepX(1); }
          else if (accumX < -STEP_X) { startX = e.clientX; accumX = 0; stepX(-1); }
        }
      });
      win.addEventListener("pointerup", e => {
        if (startY !== null && !axis) {
          // Pure tap — spin based on top/bottom half
          const rect = win.getBoundingClientRect();
          const mid  = rect.top + rect.height / 2;
          stepY(e.clientY < mid ? -1 : 1);
        }
        startX = null; startY = null; lastY = null;
        accumY = 0; accumX = 0; axis = null;
      });
      win.addEventListener("pointercancel", () => {
        startX = null; startY = null; lastY = null;
        accumY = 0; accumX = 0; axis = null;
      });
    }

    let _previewTimeCycleStep = 0;
    let _previewDateCycleStep = 0;
    function resetPreviewCycle() { _previewTimeCycleStep = 0; _previewDateCycleStep = 0; }
    // Hook into setCfg so any tumbler change resets the preview cycle
    const _origSetCfg = setCfg;

    function syncPreviewSizes() {
      const liveDateItem = document.getElementById("live-date")?.closest(".top-item");
      const liveTimeItem = document.getElementById("live-time")?.closest(".top-item");
      const previewDateItem = wrap.querySelector("#tumb-preview-date")?.closest(".top-item");
      const previewTimeItem = wrap.querySelector("#tumb-preview-time")?.closest(".top-item");
      if (liveDateItem && previewDateItem) {
        const r = liveDateItem.getBoundingClientRect();
        previewDateItem.style.width  = r.width + "px";
        previewDateItem.style.minHeight = r.height + "px";
        previewDateItem.style.flex = "none";
      }
      if (liveTimeItem && previewTimeItem) {
        const r = liveTimeItem.getBoundingClientRect();
        previewTimeItem.style.width  = r.width + "px";
        previewTimeItem.style.minHeight = r.height + "px";
        previewTimeItem.style.flex = "none";
      }
    }
    window._tumblerRefresh = () => { buildTumbler(); requestAnimationFrame(syncPreviewSizes); };
    window._tumblerRenderPreviews = renderPreviews;
    // Re-sync sizes whenever the settings overlay becomes visible
    const _settingsOverlayEl = document.getElementById("settings-overlay");
    new MutationObserver(() => {
      if (_settingsOverlayEl.classList.contains("active")) {
        requestAnimationFrame(() => requestAnimationFrame(syncPreviewSizes));
      }
    }).observe(_settingsOverlayEl, { attributes: true, attributeFilter: ["class"] });
fetch('./index.html').then(r=>r.text()).then(t=>{const el=document.getElementById('app-stats');if(el){el.innerHTML=t.split('\n').length.toLocaleString()+' lines<br>'+t.length.toLocaleString()+' chars';el.style.color=hex8ToCss(_btnStyleFor('top-version').fg);el.style.opacity='0.4';}}).catch(()=>{});
    buildTumbler();
    requestAnimationFrame(syncPreviewSizes);
    new ResizeObserver(() => syncPreviewSizes()).observe(document.getElementById("top-grid"));
    setInterval(() => {
  renderPreviews();
  if (document.getElementById('settings-overlay').classList.contains('active') && window._cfRender) {
    window._cfRender();
  }
}, 1000);
  })();