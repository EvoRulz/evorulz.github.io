// @version 1222

// ── IndexedDB image store ──────────────────────────────────
if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }
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
    tableBg: "#111111FF",
    tableText: "#FFFFFFFF",
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
  (async function loadBgImage() {
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const img = await ImgDB.get("bgImage");
        if (img) { appStyle.imgData = img; applyAppStyle(); }
        return;
      } catch (e) {
        if (attempt < 3) await new Promise(r => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  })();

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
      document.body.style.background = _bgCss(appStyle.stops[0]);
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
    const _borderVal = _bgCss(appStyle.borderColor);
    const _isBorderGrad = _borderVal.startsWith('linear-gradient') || _borderVal.startsWith('radial-gradient');
    document.documentElement.style.setProperty("--app-border-color", _isBorderGrad ? 'transparent' : _borderVal);
    document.documentElement.style.setProperty("--app-border-image", _isBorderGrad ? _borderVal + ' 1' : 'none');
    document.documentElement.style.setProperty("--app-thead-bg",     _bgCss(appStyle.theadBg));
    document.documentElement.style.setProperty("--app-cell-bg",      _bgCss(appStyle.cellBg || "#111111FF"));
    document.documentElement.style.setProperty("--app-table-bg",      hex8ToCss(appStyle.tableBg || "#111111FF"));
    document.documentElement.style.setProperty("--app-table-text",    hex8ToCss(appStyle.tableText || "#FFFFFFFF"));
    document.documentElement.style.setProperty("--bar-set-color",    hex8ToCss(appStyle.barSet));
    document.documentElement.style.setProperty("--bar-total-color",  hex8ToCss(appStyle.barTotal));
    document.documentElement.style.setProperty("--bar-streak-color", hex8ToCss(appStyle.barStreak));
  }
  applyAppStyle();

  const BTN_STYLE_DEFAULTS = { bg: "#444444FF", fg: "#FFFFFFFF", font: "sans-serif", glow: "#9659FFFF", activeGlow: "#9659FFFF", activeBg: "#555555FF", tap: "#FFFFFF40", tapHighlight: "#0000FFFF", btnRadius: 6, sliderBorder: "#555555FF", sliderHandleBorder: "#00000000", sliderH: 8, sliderR: 4, sliderW: 100, sliderHandleW: 16, checkboxChecked: "#90EE90FF", checkboxMark: "#000000FF", checkboxBorder: "#555555FF", checkboxBg: "#111111FF", sliderHandleHole: 0, clockDateColor: "#666666FF", clockTimeColor: "#666666FF", clockDateSize: 13, clockTimeSize: 13, clockBg: "#00000000" };
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
  function updateSliderFill(slider) {
    const pct = ((slider.value - slider.min) / ((slider.max || 255) - (slider.min || 0))) * 100;
    const adjPct = `calc(${pct / 100} * (100% - var(--slider-handle-w)) + var(--slider-handle-w) / 2)`;
    const track = hex8ToCss(btnStyle.sliderTrack || '#333333FF');
    let fill;
    if (slider.id && slider.id.endsWith('-alpha')) {
      const picker = document.getElementById(slider.id.slice(0, -6));
      fill = picker ? picker.value : hex8ToCss(btnStyle.sliderFill || '#9659FFFF');
    } else {
      fill = hex8ToCss(btnStyle.sliderFill || '#9659FFFF');
    }
    slider.style.background = `linear-gradient(to right, ${fill} ${adjPct}, ${track} ${adjPct})`;
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
  function getStyleValue(id) {
  if (window._cpGetGradient) { const g = window._cpGetGradient(id); if (g) return g; }
  return getColorValue(id);
  }
  function _bgCss(val) {
    if (!val) return 'transparent';
    if (typeof val === 'string' && (val.startsWith('linear-gradient') || val.startsWith('radial-gradient'))) return val;
    return hex8ToCss(val);
  }
  function setColorValue(id, hex) {
    if (!hex || typeof hex !== 'string' || hex.startsWith('linear-gradient') || hex.startsWith('radial-gradient')) return;
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
    const pct = ((slider.value - (slider.min||0)) / ((slider.max||255) - (slider.min||0))) * 100;
    const adjPct = `calc(${pct / 100} * (100% - var(--slider-handle-w)) + var(--slider-handle-w) / 2)`;
    const track = hex8ToCss(btnStyle.sliderTrack || '#333333FF');
    const a = (parseInt(slider.value) / 255).toFixed(3);
    const r2 = parseInt(picker.value.slice(1,3),16), g2 = parseInt(picker.value.slice(3,5),16), b2 = parseInt(picker.value.slice(5,7),16);
    const fill = `rgba(${r2},${g2},${b2},${a})`;
    slider.style.background = `linear-gradient(to right, ${fill} ${adjPct}, ${track} ${adjPct})`;
    // Update swatch overlay to show color+alpha
    const overlay = document.getElementById(id+'-swatch-overlay');
    if (overlay) {
      const gradCSS = window._cpGetGradient && window._cpGetGradient(id);
      if (gradCSS) {
        overlay.style.background = gradCSS;
      } else {
        const a = parseInt(slider.value) / 255;
        const hex = picker.value;
        const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
        overlay.style.background = `rgba(${r},${g},${b},${a})`;
      }
    }
  }

  // ── Per-button style store ─────────────────────────────────
  let _btnStyles = {};
  try {
    const _s = JSON.parse(localStorage.getItem("_btnStyles"));
    if (_s && typeof _s === "object") _btnStyles = _s;
  } catch {}
  function _btnStyleFor(id) {
    const base = { bg: btnStyle.bg, fg: btnStyle.fg, glow: btnStyle.glow, activeGlow: btnStyle.activeGlow || btnStyle.glow, activeBg: btnStyle.activeBg, font: btnStyle.font, tap: btnStyle.tap, btnRadius: btnStyle.btnRadius ?? 6 };
    const TOP_GRID_DEFAULTS = {
      'top-clear-all':     { bg: '#5a1a1aFF', fg: '#ff9999FF' },
      'top-settings':      { bg: '#2a2a2aFF', fg: '#999999FF' },
      'top-date':          { bg: '#00000000', fg: '#666666FF', glow: '#00000000' },
      'top-time':          { bg: '#00000000', fg: '#666666FF', glow: '#00000000' },
      'top-manage-habits': { bg: '#444444FF', fg: '#FFFFFFFF' },
      'top-orient-lock':        { bg: '#2a2a2aFF', fg: '#999999FF', glow: '#00000000' },
      'top-orient-lock-locked': { bg: '#2a2a2aFF', fg: '#99ff99FF', glow: '#00000000' },
      'top-version':       { bg: '#444444FF', fg: '#FFFFFFFF' },
      };
    return Object.assign({}, base, TOP_GRID_DEFAULTS[id] || {}, _btnStyles[id] || {});
  }
  function _saveBtnStyles() { localStorage.setItem("_btnStyles", JSON.stringify(_btnStyles)); }

  function applyBtnStyle(skipHabitsBtn) {
    buttonsEl.style.setProperty("--btn-bg",        _bgCss(btnStyle.bg));
    buttonsEl.style.setProperty("--btn-fg",        hex8ToCss(btnStyle.fg));
    buttonsEl.style.setProperty("--btn-font",      btnStyle.font);
    buttonsEl.style.setProperty("--btn-glow",      hex8ToCss(btnStyle.glow));
    buttonsEl.style.setProperty("--btn-active-glow", hex8ToCss(btnStyle.activeGlow || btnStyle.glow));
    buttonsEl.style.setProperty("--btn-active-bg", _bgCss(btnStyle.activeBg));
    document.documentElement.style.setProperty("--btn-radius", (btnStyle.btnRadius ?? 6) + 'px');
    document.documentElement.style.setProperty("--slider-border-color",  hex8ToCss(btnStyle.sliderBorder));
    document.documentElement.style.setProperty("--slider-h",             btnStyle.sliderH + "px");
    document.documentElement.style.setProperty("--slider-r",             btnStyle.sliderR + "%");
    document.documentElement.style.setProperty("--slider-spread",        (btnStyle.sliderSpread ?? 4) + "px");
    document.documentElement.style.setProperty("--slider-handle-h",      (btnStyle.sliderHandleH ?? 16) + "px");
    document.documentElement.style.setProperty("--slider-handle-w",      (btnStyle.sliderHandleW ?? 16) + "px");
    document.documentElement.style.setProperty("--slider-w",             (btnStyle.sliderW ?? 100) + "%");
    document.documentElement.style.setProperty("--slider-handle-r",      (btnStyle.sliderHandleR ?? 3) + "%");
    document.documentElement.style.setProperty("--slider-handle-hole",  (btnStyle.sliderHandleHole ?? 0));
    document.documentElement.style.setProperty("--slider-fill-color",    _bgCss(btnStyle.sliderFill   || '#9659FFFF'));
    document.documentElement.style.setProperty("--slider-track-bg",      _bgCss(btnStyle.sliderTrack  || '#333333FF'));
    document.documentElement.style.setProperty("--slider-handle-color",  _bgCss(btnStyle.sliderHandle || '#FFFFFFFF'));
    document.documentElement.style.setProperty("--slider-handle-border", _bgCss(btnStyle.sliderHandleBorder || '#00000000'));
    document.querySelectorAll('.alpha-slider').forEach(s => {
      if (s.id && s.id.endsWith('-alpha')) updateAlphaSliderBg(s.id.slice(0, -6));
      else updateSliderFill(s);
    });
    document.documentElement.style.setProperty("--checkbox-checked",     hex8ToCss(btnStyle.checkboxChecked));
    document.documentElement.style.setProperty("--checkbox-mark",        hex8ToCss(btnStyle.checkboxMark));
    document.documentElement.style.setProperty("--checkbox-border",      hex8ToCss(btnStyle.checkboxBorder));
    document.documentElement.style.setProperty("--checkbox-bg",          hex8ToCss(btnStyle.checkboxBg));
    document.documentElement.style.setProperty("--clock-date-color",     hex8ToCss(_btnStyleFor('top-date').fg));
    document.documentElement.style.setProperty("--clock-time-color",     hex8ToCss(_btnStyleFor('top-time').fg));
    document.documentElement.style.setProperty("--clock-date-size",      (_btnStyles['top-date']?.clockDateSize ?? btnStyle.clockDateSize) + "px");
    document.documentElement.style.setProperty("--clock-time-size",      (_btnStyles['top-time']?.clockTimeSize ?? btnStyle.clockTimeSize) + "px");
    document.documentElement.style.setProperty("--clock-bg",             hex8ToCss(btnStyle.clockBg));
    document.documentElement.style.setProperty("--clock-date-bg",        _bgCss(_btnStyleFor('top-date').bg));
    document.documentElement.style.setProperty("--clock-time-bg",        _bgCss(_btnStyleFor('top-time').bg));
    const topGridMap = [
      { id: 'top-export-all',    el: '.top-item[data-item="export-all"]',    prefix: '--export-all' },
      { id: 'top-import-all',    el: '.top-item[data-item="import-all"]',    prefix: '--import-all' },
      { id: 'top-export-layout', el: '.top-item[data-item="export-layout"]', prefix: '--export-layout' },
      { id: 'top-import-layout', el: '.top-item[data-item="import-layout"]', prefix: '--import-layout' },
      { id: 'top-clear-all',     el: '.top-item[data-item="clear-all"]',     prefix: '--clear-all' },
      { id: 'top-my-files',      el: '.top-item[data-item="my-files"]',      prefix: '--my-files' },
      { id: 'top-hard-reload',   el: '.top-item[data-item="hard-reload"]',   prefix: '--hard-reload' },
      { id: 'top-manage-habits', el: '.top-item[data-item="manage-habits"]', prefix: '--manage-habits' },
      { id: 'top-orient-lock',    el: '.top-item[data-item="orient-lock"]',    prefix: '--orient-lock' },
      { id: 'top-settings',      el: '.top-item[data-item="settings"]',      prefix: '--settings' },
    ];
    topGridMap.forEach(({ id, el: sel, prefix }) => {
      const el = document.querySelector(sel);
      if (!el) return;
      const _s = _btnStyleFor(id);
      el.style.setProperty(prefix + '-bg',   _bgCss(_s.bg));
      el.style.setProperty(prefix + '-fg',   hex8ToCss(_s.fg));
      el.style.setProperty(prefix + '-font', _s.font);
      el.style.setProperty(prefix + '-glow', hex8ToCss(_s.glow));
      const _btn = el.querySelector('button');
      if (_btn) _btn.style.borderRadius = (_s.btnRadius ?? btnStyle.btnRadius ?? 6) + 'px';
    });
    const _olBtn = document.getElementById('orient-lock-btn');
    if (_olBtn) {
      const _olId = (typeof _orientLocked !== 'undefined' && _orientLocked) ? 'top-orient-lock-locked' : 'top-orient-lock';
      const _ols = _btnStyleFor(_olId);
      _olBtn.style.background = _bgCss(_ols.bg);
      _olBtn.style.color = hex8ToCss(_ols.fg);
      _olBtn.style.borderColor = hex8ToCss(_ols.fg);
      _olBtn.style.boxShadow = `0 0 16px 5px ${hex8ToCss(_ols.glow)}`;
    }
    const _cogEl = document.getElementById('settings-cog');
    if (_cogEl) {
      const _ss = _btnStyleFor('top-settings');
      _cogEl.style.background   = _bgCss(_ss.bg);
      _cogEl.style.color        = hex8ToCss(_ss.fg);
      _cogEl.style.borderColor  = hex8ToCss(_ss.fg);
      _cogEl.style.boxShadow    = `0 0 16px 5px ${hex8ToCss(_ss.glow)}`;
    }
    const _habEl = document.querySelector('.top-item[data-item="hide-habits"]');
    if (_habEl) {
      const _hs = _btnStyleFor(!skipHabitsBtn && habitsVisible ? 'top-hide-habits' : 'top-show-habits');
      _habEl.style.setProperty('--hide-habits-bg',   _bgCss(_hs.bg));
      _habEl.style.setProperty('--hide-habits-fg',   hex8ToCss(_hs.fg));
      _habEl.style.setProperty('--hide-habits-font', _hs.font);
      _habEl.style.setProperty('--hide-habits-glow', hex8ToCss(_hs.glow || '#00000000'));
      const _habBtn = _habEl.querySelector('button');
      const _habStyleId = !skipHabitsBtn && habitsVisible ? 'top-hide-habits' : 'top-show-habits';
      const _habRadius = _btnStyles[_habStyleId]?.btnRadius ?? btnStyle.btnRadius ?? 6;
      if (_habBtn) _habBtn.style.borderRadius = _habRadius + 'px';
    }
    const _dateSpan = document.querySelector('.top-item[data-item="date"] span');
    const _timeSpan = document.querySelector('.top-item[data-item="time"] span');
    if (_dateSpan) { _dateSpan.style.color = hex8ToCss(_btnStyleFor('top-date').fg); _dateSpan.style.fontFamily = _btnStyleFor('top-date').font; }
    if (_timeSpan) { _timeSpan.style.color = hex8ToCss(_btnStyleFor('top-time').fg); _timeSpan.style.fontFamily = _btnStyleFor('top-time').font; }
    const _dateTopItem = document.querySelector('.top-item[data-item="date"]');
    const _timeTopItem = document.querySelector('.top-item[data-item="time"]');
    if (_dateTopItem) _dateTopItem.style.borderRadius = (_btnStyles['top-date']?.btnRadius ?? btnStyle.btnRadius ?? 6) + 'px';
    if (_timeTopItem) _timeTopItem.style.borderRadius = (_btnStyles['top-time']?.btnRadius ?? btnStyle.btnRadius ?? 6) + 'px';
    const _dateItemGlow = document.querySelector('.top-item[data-item="date"]');
    const _timeItemGlow = document.querySelector('.top-item[data-item="time"]');
    if (_dateItemGlow) _dateItemGlow.style.setProperty('--btn-glow', hex8ToCss(_btnStyleFor('top-date').glow || '#00000000'));
    if (_timeItemGlow) _timeItemGlow.style.setProperty('--btn-glow', hex8ToCss(_btnStyleFor('top-time').glow || '#00000000'));
    const _versionColor = hex8ToCss(_btnStyleFor('top-version').fg);
    const _versionItem = document.querySelector('.top-item[data-item="version"]');
    if (_versionItem) {
      _versionItem.style.borderRadius = (_btnStyles['top-version']?.btnRadius ?? btnStyle.btnRadius ?? 6) + 'px';
      _versionItem.style.setProperty('--btn-glow', hex8ToCss(_btnStyleFor('top-version').glow));
      _versionItem.style.background = _bgCss(_btnStyleFor('top-version').bg);
      const _vBtn = _versionItem.querySelector('div');
      const _vNumSpan = document.getElementById('app-version');
      if (_vNumSpan) _vNumSpan.style.fontFamily = _btnStyleFor('top-version').font;
    if (_vBtn) {
      _vBtn.onpointerdown = () => { _versionItem.style.background = hex8ToCss(_btnStyleFor('top-version').tap); };
      _vBtn.onpointerup = () => {
        _versionItem.style.background = _bgCss(_btnStyleFor('top-version').bg);
        if(localStorage.getItem('_versionUpdatePending')==='1'){
          const _prev=localStorage.getItem('_versionPrevFg');
          if(_prev){_btnStyles['top-version']=Object.assign({},_btnStyles['top-version']||{},{fg:_prev});localStorage.setItem('_btnStyles',JSON.stringify(_btnStyles));applyBtnStyle();}
          localStorage.removeItem('_versionUpdatePending');
      return;
    }
    if (window._versionCheckState === 'synced') {
          const _statsEl = document.getElementById('app-stats');
          if (_statsEl && _statsEl.dataset.swOrig) {
            _statsEl.innerHTML = _statsEl.dataset.swOrig;
            _statsEl.style.color = _statsEl.dataset.swOrigColor || '';
            _statsEl.style.opacity = '0.4';
            delete _statsEl.dataset.swOrig;
            delete _statsEl.dataset.swOrigColor;
          }
          window._versionCheckState = 'idle';
        } else {
          if (window._verifyDeployedVersion) window._verifyDeployedVersion();
        }
      };
      _vBtn.onpointercancel = () => { _versionItem.style.background = _bgCss(_btnStyleFor('top-version').bg); };
    }
    }
    const _versionNumSpan = document.getElementById('app-version');
    const _versionStatsSpan = document.getElementById('app-stats');
    if (_versionNumSpan) _versionNumSpan.style.color = _versionColor;
    if (_versionStatsSpan) { _versionStatsSpan.style.color = _versionColor; _versionStatsSpan.style.opacity = '0.4'; }

    buttonsEl.querySelectorAll(".tracker-btn[data-id]").forEach(btn => {
      const s = _btnStyleFor(btn.dataset.id);
      btn.style.setProperty("--btn-bg",        _bgCss(s.bg));
      btn.style.setProperty("--btn-fg",        hex8ToCss(s.fg));
      btn.style.setProperty("--btn-glow",      hex8ToCss(s.glow));
      btn.style.setProperty("--btn-active-glow", hex8ToCss(s.activeGlow || s.glow));
      btn.style.setProperty("--btn-active-bg", _bgCss(s.activeBg));
      btn.style.setProperty("--btn-font",      s.font);
      btn.style.cssText += `;font-family:${s.font} !important`;
      btn.style.borderRadius = (s.btnRadius ?? btnStyle.btnRadius ?? 6) + 'px';
    });
  }
  // ── Wrap all color pickers in swatch containers ────────────
  document.querySelectorAll('.color-picker-row input[type="color"]').forEach(picker => {
    const id = picker.id;
    const wrap = document.createElement('div');
    wrap.className = 'color-swatch-wrap';
    picker.parentNode.insertBefore(wrap, picker);
    wrap.appendChild(picker);
    const overlay = document.createElement('div');
    overlay.className = 'color-swatch-overlay';
    overlay.id = id + '-swatch-overlay';
    const labelEl = wrap.closest('.color-settings-row') && wrap.closest('.color-settings-row').querySelector(':scope > label');
    if (labelEl) {
      const labelSpan = document.createElement('span');
      labelSpan.className = 'color-swatch-label';
      labelSpan.textContent = labelEl.textContent.trim();
      overlay.appendChild(labelSpan);
    }
    wrap.appendChild(overlay);
  });
  applyBtnStyle(true);