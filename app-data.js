// @version 1222

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
            const _existingImg = appStyle.imgData;
            appStyle = Object.assign({}, APP_STYLE_DEFAULTS, JSON.parse(data["_appStyle"]));
            if (!appStyle.imgData && _existingImg) appStyle.imgData = _existingImg;
            localStorage.setItem("_appStyle", data["_appStyle"]);
            if (appStyle.bgType === 'image' && !appStyle.imgData) {
              ImgDB.get("bgImage").then(img => { if (img) { appStyle.imgData = img; applyAppStyle(); } }).catch(() => {});
            }
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