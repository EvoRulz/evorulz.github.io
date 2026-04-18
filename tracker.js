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