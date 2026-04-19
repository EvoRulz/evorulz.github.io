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
const _vElPre=document.getElementById('app-version');
const _curVer=_vElPre?parseInt(_vElPre.textContent.replace('v',''))||0:0;
const _lastStyledVer=parseInt(localStorage.getItem('_lastStyledVersion')||'0');
if(_curVer!==_lastStyledVer){if(_btnStyles['top-version'])delete _btnStyles['top-version'].fg;_saveBtnStyles();}
fetch('./index.html').then(r=>r.text()).then(t=>{
  const el=document.getElementById('app-stats');
  if(el){
    el.innerHTML=t.split('\n').length.toLocaleString()+' lines<br>'+t.length.toLocaleString()+' chars';
    el.style.color=hex8ToCss(_btnStyleFor('top-version').fg);
    el.style.opacity='0.4';
  }
  const vEl=document.getElementById('app-version');
  if(vEl){
    const vNum=parseInt(vEl.textContent.replace('v',''))||0;
    const vColors=['#00FFFFFF','#FF00FFFF','#FFFF00FF'];
    const autoColor=vColors[vNum%3];
    if(true){
      if(_curVer!==_lastStyledVer){_btnStyles['top-version']=Object.assign({},_btnStyles['top-version']||{},{fg:autoColor});_saveBtnStyles();localStorage.setItem('_lastStyledVersion',_curVer);}
      applyBtnStyle();
    }
  }
}).catch(()=>{});
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