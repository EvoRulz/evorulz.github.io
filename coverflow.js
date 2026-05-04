// @version 1239

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
  items.push({ id: 'top-export-all',     label: 'Export All',     isTopGrid: true });
items.push({ id: 'top-import-all',     label: 'Import All',     isTopGrid: true });
items.push({ id: 'top-export-layout',  label: 'Export Layout',  isTopGrid: true });
items.push({ id: 'top-import-layout',  label: 'Import Layout',  isTopGrid: true });
items.push({ id: 'top-clear-all',      label: 'Clear All',      isTopGrid: true });
items.push({ id: 'top-my-files',       label: 'My Files',       isTopGrid: true });
items.push({ id: 'top-hard-reload',    label: 'Hard Reload',    isTopGrid: true });
items.push({ id: 'top-date',           label: 'Date',           isTopGrid: true });
  items.push({ id: 'top-time',           label: 'Time',           isTopGrid: true });
  items.push({ id: 'top-version',        label: 'Version',        isTopGrid: true });
  items.push({ id: 'top-settings',       label: 'Settings',       isTopGrid: true });

  if (!habitsVisible) {
    return [{ id: 'top-show-habits', label: 'Show Habits', isTopGrid: true }];
  }

  items.push({ id: 'top-hide-habits', label: 'Hide Habits', isTopGrid: true });
  items.push({ id: 'top-manage-habits', label: 'Manage Habits', isTopGrid: true });
  items.push({ id: _orientLocked ? 'top-orient-lock-locked' : 'top-orient-lock', label: _orientLocked ? 'Unlock Orient' : 'Lock Orient', isTopGrid: true });
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
  if(id==='top-version'&&localStorage.getItem('_versionUpdatePending')==='1'){
    const _prev=localStorage.getItem('_versionPrevFg');
    if(_prev){_btnStyles['top-version']=Object.assign({},_btnStyles['top-version']||{},{fg:_prev});localStorage.setItem('_btnStyles',JSON.stringify(_btnStyles));applyBtnStyle();}
    localStorage.removeItem('_versionUpdatePending');
  }
  const s = _btnStyleFor(id);
  setColorValue('s-bg',       s.bg);
  if (window._cpSetGradientStops) window._cpSetGradientStops('s-bg', s.bgStops || null);
  setColorValue('s-fg',       s.fg);
  setColorValue('s-glow',     s.glow);
  setColorValue('s-activeglow', s.activeGlow || s.glow);
  setColorValue('s-activebg', s.activeBg);
  setColorValue('s-tap',      s.tap);
  document.getElementById("s-font").value = s.font;
  const _rVal = s.btnRadius ?? btnStyle.btnRadius ?? 6;
  const _rEl = document.getElementById("s-radius"); if (_rEl) _rEl.value = String(_rVal);
  const _rvEl = document.getElementById("s-radius-val"); if (_rvEl) _rvEl.textContent = _rVal + "px";
  {
    const _sbOv = document.getElementById('s-bg-swatch-overlay');
    const _builtGrad = window._cpGetGradient ? window._cpGetGradient('s-bg') : null;
    const _directGrad = typeof s.bg === 'string' && (s.bg.startsWith('linear-gradient') || s.bg.startsWith('radial-gradient')) ? s.bg : null;
    if (_sbOv && (_builtGrad || _directGrad)) {
      _sbOv.style.background = _builtGrad || _directGrad;
    } else {
      updateAlphaSliderBg('s-bg');
    }
  }
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
    const _cdrV = _btnStyles['top-date']?.btnRadius ?? btnStyle.btnRadius ?? 6;
    const _cdrEl = document.getElementById("s-clock-date-radius"); if (_cdrEl) { _cdrEl.value = String(_cdrV); const _cdrvEl = document.getElementById("s-clock-date-radius-val"); if (_cdrvEl) _cdrvEl.textContent = _cdrV + "px"; }
  } else if (id === 'top-time') {
    setColorValue('s-clock-time-color', s.fg);
    updateAlphaSliderBg('s-clock-time-color');
    setColorValue('s-clock-time-bg', s.bg);
    updateAlphaSliderBg('s-clock-time-bg');
    setColorValue('s-clock-time-glow', s.glow || '#00000000');
    updateAlphaSliderBg('s-clock-time-glow');
    document.getElementById("s-clock-time-size").value = _btnStyles['top-time']?.clockTimeSize ?? btnStyle.clockTimeSize;
    const _ctrV = _btnStyles['top-time']?.btnRadius ?? btnStyle.btnRadius ?? 6;
    const _ctrEl = document.getElementById("s-clock-time-radius"); if (_ctrEl) { _ctrEl.value = String(_ctrV); const _ctrvEl = document.getElementById("s-clock-time-radius-val"); if (_ctrvEl) _ctrvEl.textContent = _ctrV + "px"; }
  }
  
  document.querySelectorAll('.alpha-slider:not([id$="-alpha"])').forEach(s => updateSliderFill(s));
  if (window.fontPickerSync) fontPickerSync();
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
          el.style.fontFamily = _btnStyleFor(items[i].id).font || 'sans-serif';
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
          const _sr = (_ss.btnRadius ?? btnStyle.btnRadius ?? 6);
          el.style.borderRadius = _sr + 'px';
          el.innerHTML = '<div style="width:34px;height:34px;border-radius:' + _sr + 'px;background:' + _scol + ';border:1px solid ' + _sfg + ';color:' + _sfg + ';display:flex;align-items:center;justify-content:center;pointer-events:none;box-shadow:0 0 16px 5px ' + _sglow + ';"><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="width:16px;height:16px;fill:currentColor"><path d="M8.325 2.317a1.75 1.75 0 0 1 3.35 0l.07.254a1.75 1.75 0 0 0 2.494 1.08l.235-.127a1.75 1.75 0 0 1 2.369 2.369l-.127.235a1.75 1.75 0 0 0 1.08 2.494l.254.07a1.75 1.75 0 0 1 0 3.35l-.254.07a1.75 1.75 0 0 0-1.08 2.494l.127.235a1.75 1.75 0 0 1-2.369 2.369l-.235-.127a1.75 1.75 0 0 0-2.494 1.08l-.07.254a1.75 1.75 0 0 1-3.35 0l-.07-.254a1.75 1.75 0 0 0-2.494-1.08l-.235.127a1.75 1.75 0 0 1-2.369-2.369l.127-.235a1.75 1.75 0 0 0-1.08-2.494l-.254-.07a1.75 1.75 0 0 1 0-3.35l.254-.07a1.75 1.75 0 0 0 1.08-2.494l-.127-.235a1.75 1.75 0 0 1 2.369-2.369l.235.127a1.75 1.75 0 0 0 2.494-1.08l.07-.254ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg></div>';
        } else if (items[i].id === 'top-orient-lock' || items[i].id === 'top-orient-lock-locked') {
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.background = 'transparent';
          el.style.boxShadow = 'none';
          const _ols = _btnStyleFor(items[i].id);
          const _ofg = hex8ToCss(_ols.fg);
          const _obg = hex8ToCss(_ols.bg);
          const _oglow = hex8ToCss(_ols.glow);
          const _or = (_ols.btnRadius ?? btnStyle.btnRadius ?? 6);
          const _locked = typeof _orientLocked !== 'undefined' && _orientLocked;
          const _lockPath = '<path fill-rule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1zm3 8V5.5a3 3 0 1 0-6 0V9h6z" clip-rule="evenodd"/>';
          const _unlockPath = '<path fill-rule="evenodd" d="M14.5 1A4.5 4.5 0 0 0 10 5.5V9H3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1.5V5.5a3 3 0 1 1 6 0v2.75a.75.75 0 0 0 1.5 0V5.5A4.5 4.5 0 0 0 14.5 1z" clip-rule="evenodd"/>';
          el.style.width = '34px';
          el.style.height = '34px';
          el.style.borderRadius = _or + 'px';
          el.style.background = _obg;
          el.style.color = _ofg;
          el.style.border = '1px solid ' + _ofg;
          el.style.boxShadow = '0 0 16px 5px ' + _oglow;
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.padding = '0';
          el.innerHTML = '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="width:16px;height:16px;fill:currentColor">' + (_locked ? _lockPath : _unlockPath) + '</svg>';
        } else {
          const styleId = items[i].id === 'top-hide-habits' ? (habitsVisible ? 'top-hide-habits' : 'top-show-habits') : items[i].id;
        const s2 = _btnStyleFor(styleId);
        el.style.background = _bgCss(s2.bg);
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
        el.style.borderRadius = (_btnStyleFor(items[i].id).btnRadius ?? btnStyle.btnRadius ?? 6) + 'px';
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
      el.addEventListener('pointerup',     () => { const s2 = _btnStyleFor(items[i].id); el.style.background = _bgCss(s2.bg); });
      el.addEventListener('pointercancel', () => { const s2 = _btnStyleFor(items[i].id); el.style.background = _bgCss(s2.bg); });
        el.onclick = () => {
          cfIdx = i;
          if (items[i].id === 'top-settings') {
            settingsOpen();
          } else if (items[i].id === 'top-manage-habits') {
            manageOpen();
          } else if (items[i].id === 'top-hide-habits' || items[i].id === 'top-show-habits') {
            toggleHabits();
          } else if (items[i].id === 'top-orient-lock' || items[i].id === 'top-orient-lock-locked') {
            _orientLocked = !_orientLocked; document.getElementById('orient-lock-icon').innerHTML = _orientLocked ? _LOCK_PATH : _UNLOCK_PATH; cfBuild(); cfLoadPickersForId(cfActiveId());
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
          } else if (tappedItem && (tappedItem.id === 'top-orient-lock' || tappedItem.id === 'top-orient-lock-locked')) {
            _orientLocked = !_orientLocked; document.getElementById('orient-lock-icon').innerHTML = _orientLocked ? _LOCK_PATH : _UNLOCK_PATH; cfBuild(); cfLoadPickersForId(cfActiveId());
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
  if (e.target === document.getElementById("settings-overlay")) {
    _skipCancelSnapshot = true;
    settingsClose();
  }
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











