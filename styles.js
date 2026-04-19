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
    const base = { bg: btnStyle.bg, fg: btnStyle.fg, glow: btnStyle.glow, activeGlow: btnStyle.activeGlow || btnStyle.glow, activeBg: btnStyle.activeBg, font: btnStyle.font, tap: btnStyle.tap, btnRadius: btnStyle.btnRadius ?? 6 };
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
    document.documentElement.style.setProperty("--btn-radius", (btnStyle.btnRadius ?? 6) + 'px');
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
      const _btn = el.querySelector('button');
      if (_btn) _btn.style.borderRadius = (_s.btnRadius ?? btnStyle.btnRadius ?? 6) + 'px';
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
      const _habBtn = _habEl.querySelector('button');
      const _habStyleId = !skipHabitsBtn && habitsVisible ? 'top-hide-habits' : 'top-show-habits';
      const _habRadius = _btnStyles[_habStyleId]?.btnRadius ?? btnStyle.btnRadius ?? 6;
      if (_habBtn) _habBtn.style.borderRadius = _habRadius + 'px';
    }
    // Date and time spans get direct inline styles
    const _dateSpan = document.querySelector('.top-item[data-item="date"] span');
    const _timeSpan = document.querySelector('.top-item[data-item="time"] span');
    if (_dateSpan) { _dateSpan.style.color = hex8ToCss(_btnStyleFor('top-date').fg); }
    if (_timeSpan) { _timeSpan.style.color = hex8ToCss(_btnStyleFor('top-time').fg); }
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
      btn.style.borderRadius = (s.btnRadius ?? btnStyle.btnRadius ?? 6) + 'px';
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
    const _cdrOpenV = _btnStyles['top-date']?.btnRadius ?? btnStyle.btnRadius ?? 6;
    const _cdrOpenEl = document.getElementById("s-clock-date-radius"); if (_cdrOpenEl) { _cdrOpenEl.value = String(_cdrOpenV); const _cdrvOpenEl = document.getElementById("s-clock-date-radius-val"); if (_cdrvOpenEl) _cdrvOpenEl.textContent = _cdrOpenV + "px"; }
    const _ctrOpenV = _btnStyles['top-time']?.btnRadius ?? btnStyle.btnRadius ?? 6;
    const _ctrOpenEl = document.getElementById("s-clock-time-radius"); if (_ctrOpenEl) { _ctrOpenEl.value = String(_ctrOpenV); const _ctrvOpenEl = document.getElementById("s-clock-time-radius-val"); if (_ctrvOpenEl) _ctrvOpenEl.textContent = _ctrOpenV + "px"; }
    document.getElementById("s-font").value    = btnStyle.font;
    const _initRadius = (_initId && _btnStyles[_initId]?.btnRadius != null) ? _btnStyles[_initId].btnRadius : (btnStyle.btnRadius ?? 6);
document.getElementById("s-radius").value  = String(_initRadius);
const _rvVal = document.getElementById("s-radius-val"); if (_rvVal) _rvVal.textContent = _initRadius + "px";
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
    if (typeof cfSyncTuningUI !== 'undefined') if (window.cfSyncTuningUI) window.cfSyncTuningUI();
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
            if (typeof cfSyncTuningUI !== 'undefined') if (window.cfSyncTuningUI) window.cfSyncTuningUI();
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
    if (!_cfId) btnStyle.btnRadius = Number(document.getElementById("s-radius").value);
else {
  _btnStyles[_cfId] = Object.assign(_btnStyles[_cfId] || {}, {
    btnRadius: Number(document.getElementById("s-radius").value)
  });
  if (_cfId === 'top-date') { const _cdrSEl = document.getElementById("s-clock-date-radius"); if (_cdrSEl) { _cdrSEl.value = document.getElementById("s-radius").value; const _cdrsVEl = document.getElementById("s-clock-date-radius-val"); if (_cdrsVEl) _cdrsVEl.textContent = document.getElementById("s-radius").value + "px"; } }
  if (_cfId === 'top-time') { const _ctrSEl = document.getElementById("s-clock-time-radius"); if (_ctrSEl) { _ctrSEl.value = document.getElementById("s-radius").value; const _ctrsVEl = document.getElementById("s-clock-time-radius-val"); if (_ctrsVEl) _ctrsVEl.textContent = document.getElementById("s-radius").value + "px"; } }
}
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
    const _cdrIn = document.getElementById("s-clock-date-radius");
    const _ctrIn = document.getElementById("s-clock-time-radius");
    if (_cdrIn && _cfId !== 'top-date') _btnStyles['top-date'] = Object.assign(_btnStyles['top-date'] || {}, { btnRadius: Number(_cdrIn.value) });
    if (_ctrIn && _cfId !== 'top-time') _btnStyles['top-time'] = Object.assign(_btnStyles['top-time'] || {}, { btnRadius: Number(_ctrIn.value) });
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
_btnStyles = {};
    setColorValue('s-clock-date-color', _btnStyleFor('top-date').fg);
    setColorValue('s-clock-time-color', _btnStyleFor('top-time').fg);
    setColorValue('s-clock-date-bg',    _btnStyleFor('top-date').bg);
    setColorValue('s-clock-time-bg',    _btnStyleFor('top-time').bg);
    setColorValue('s-clock-bg',         btnStyle.clockBg);
    setColorValue('s-clock-date-glow',  _btnStyleFor('top-date').glow || '#00000000');
    setColorValue('s-clock-time-glow',  _btnStyleFor('top-time').glow || '#00000000');
    document.getElementById("s-clock-date-size").value = _btnStyles['top-date']?.clockDateSize ?? btnStyle.clockDateSize;
    document.getElementById("s-clock-time-size").value = _btnStyles['top-time']?.clockTimeSize ?? btnStyle.clockTimeSize;
    const _cdrREl = document.getElementById("s-clock-date-radius"); if (_cdrREl) { _cdrREl.value = "6"; const _cdrRVEl = document.getElementById("s-clock-date-radius-val"); if (_cdrRVEl) _cdrRVEl.textContent = "6px"; }
    const _ctrREl = document.getElementById("s-clock-time-radius"); if (_ctrREl) { _ctrREl.value = "6"; const _ctrRVEl = document.getElementById("s-clock-time-radius-val"); if (_ctrRVEl) _ctrRVEl.textContent = "6px"; }
    const _cdrOpenV = _btnStyles['top-date']?.btnRadius ?? btnStyle.btnRadius ?? 6;
    const _cdrOpenEl = document.getElementById("s-clock-date-radius"); if (_cdrOpenEl) { _cdrOpenEl.value = String(_cdrOpenV); const _cdrvOpenEl = document.getElementById("s-clock-date-radius-val"); if (_cdrvOpenEl) _cdrvOpenEl.textContent = _cdrOpenV + "px"; }
    const _ctrOpenV = _btnStyles['top-time']?.btnRadius ?? btnStyle.btnRadius ?? 6;
    const _ctrOpenEl = document.getElementById("s-clock-time-radius"); if (_ctrOpenEl) { _ctrOpenEl.value = String(_ctrOpenV); const _ctrvOpenEl = document.getElementById("s-clock-time-radius-val"); if (_ctrvOpenEl) _ctrvOpenEl.textContent = _ctrOpenV + "px"; }
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
    p.style.borderRadius = ((_cfId && _btnStyles[_cfId]?.btnRadius != null) ? _btnStyles[_cfId].btnRadius : (btnStyle.btnRadius ?? 6)) + 'px';
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