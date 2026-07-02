// @version 1567
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
  barAntiStreak: "#8B0000FF",
  todayBg: "#333333FF",
  todayText: "#FFD700FF",
  streakText: "#FFFFFFFF",
  antiStreakText: "#8B0000FF",
  setValueText: "#FFFFFFFF",
  statusBarMode: 'auto',
  statusBarColor: '#111111FF',
  statusBarStops: null,
  statusBarIconStyle: 'auto',
  padding: 20,
};
function _blendHexStops(hexArr, gradDir) {
  if (!hexArr || !hexArr.length) return '#111111';
  if (hexArr.length === 1) return hexArr[0].slice(0, 7);
  const weights = hexArr.map((_, i) =>
    gradDir === 'to bottom' ? 1 - (i / hexArr.length) : 1
    );
  const tw = weights.reduce((a, b) => a + b, 0);
  let r = 0, g = 0, b = 0;
  hexArr.forEach((hex, i) => {
    const c = hex8ToComponents(hex);
    const w = weights[i] / tw;
    r += c.r * w; g += c.g * w; b += c.b * w;
  });
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}
function _blendStopObjects(stops) {
  if (!stops || !stops.length) return '#111111';
  if (stops.length === 1) return stops[0].hex8.slice(0, 7);
  let r = 0, g = 0, b = 0;
  stops.forEach(s => {
    const c = hex8ToComponents(s.hex8);
    r += c.r / stops.length; g += c.g / stops.length; b += c.b / stops.length;
  });
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}
function _statusBarLuminance(hex) {
  const {r, g, b} = hex8ToComponents(hex.length < 8 ? hex + 'FF' : hex);
  const toL = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * toL(r) + 0.7152 * toL(g) + 0.0722 * toL(b);
}
function _applyStatusBarIcons(hex) {
  const style = appStyle.statusBarIconStyle || 'auto';
  let lightIcons;
  if (style === 'light') lightIcons = true;
  else if (style === 'dark') lightIcons = false;
  else lightIcons = _statusBarLuminance(hex) <= 0.179;
  if (window.AndroidSettings && window.AndroidSettings.setStatusBarIconColor) {
    window.AndroidSettings.setStatusBarIconColor(lightIcons);
  }
}
let _imgSampledColor = '#111111';
function _applyStatusBarColor() {
  const _m = document.querySelector('meta[name="theme-color"]');
  if (!_m) return;
  let _tc = '#111111';
  if (appStyle.bgType === 'image') {
    const mode = appStyle.statusBarMode || 'auto';
    if (mode === 'solid') {
      _tc = appStyle.statusBarColor?.slice(0, 7) || '#111111';
    } else if (mode === 'gradient') {
      const stops = appStyle.statusBarStops;
      _tc = stops && stops.length > 1
      ? _blendStopObjects(stops)
      : (stops && stops[0] ? stops[0].hex8.slice(0, 7) : (appStyle.statusBarColor?.slice(0, 7) || '#111111'));
    } else {
      _tc = _imgSampledColor;
    }
  } else if (appStyle.bgType === 'solid') {
    _tc = appStyle.stops[0]?.slice(0, 7) || '#111111';
  } else if (appStyle.bgType.startsWith('gradient')) {
    _tc = _blendHexStops(appStyle.stops, appStyle.gradDir);
  } else if (appStyle.bgType.startsWith('pattern')) {
    _tc = appStyle.patBg?.slice(0, 7) || '#111111';
  }
  _m.setAttribute('content', _tc);
  _applyStatusBarIcons(_tc);
}
let appStyle = Object.assign({}, APP_STYLE_DEFAULTS);
try {
  const saved = JSON.parse(localStorage.getItem("_appStyle"));
  if (saved) appStyle = Object.assign({}, APP_STYLE_DEFAULTS, saved);
} catch {}
function _sampleImgTopColor(imgData) {
  if (!imgData) { _imgSampledColor = '#111111'; return; }
  const img = new Image();
  img.onload = function() {
    try {
      const c = document.createElement('canvas');
      c.width = 50; c.height = 10;
      const ctx = c.getContext('2d');
      const posMap = { top: 0, center: 0.5, bottom: 1, left: 0, right: 0.5 };
      const yFrac = posMap[appStyle.imgPos] ?? 0;
      const srcY = Math.floor((img.height - 10) * yFrac);
      ctx.drawImage(img, 0, srcY, img.width, 10, 0, 0, 50, 10);
      const px = ctx.getImageData(0, 0, 50, 10).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < px.length; i += 4) { r += px[i]; g += px[i+1]; b += px[i+2]; n++; }
        r = Math.round(r/n); g = Math.round(g/n); b = Math.round(b/n);
      const {r: tr, g: tg, b: tb, a: ta} = hex8ToComponents(appStyle.imgTint || '#00000000');
      const tA = ta / 255;
      r = Math.round(r * (1 - tA) + tr * tA);
      g = Math.round(g * (1 - tA) + tg * tA);
      b = Math.round(b * (1 - tA) + tb * tA);
      _imgSampledColor = '#' + [r, g, b].map(v => v.toString(16).padStart(2,'0')).join('');
      _applyStatusBarColor();
    } catch(e) { _imgSampledColor = '#111111'; }
  };
  img.src = imgData;
}
(async function loadBgImage() {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const img = await ImgDB.get("bgImage");
      if (img) { appStyle.imgData = img; _sampleImgTopColor(img); applyAppStyle(); }
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
  buildAppBg();
  document.documentElement.style.background = document.body.style.background;
  document.documentElement.style.backgroundImage = document.body.style.backgroundImage;
  document.documentElement.style.backgroundSize = document.body.style.backgroundSize;
  document.documentElement.style.backgroundPosition = document.body.style.backgroundPosition;
  document.documentElement.style.backgroundRepeat = document.body.style.backgroundRepeat;
  document.documentElement.style.backgroundAttachment = document.body.style.backgroundAttachment;
  document.body.style.color   = hex8ToCss(appStyle.textColor);
  document.body.style.padding = appStyle.padding + "px";
  document.body.style.paddingTop = `calc(${appStyle.padding}px + env(safe-area-inset-top, 0px))`;
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
  document.documentElement.style.setProperty("--bar-anti-streak-color", hex8ToCss(appStyle.barAntiStreak || "#8B0000FF"));
  document.documentElement.style.setProperty("--streak-text-color",     hex8ToCss(appStyle.streakText    || "#FFFFFFFF"));
  document.documentElement.style.setProperty("--anti-streak-text-color", hex8ToCss(appStyle.antiStreakText || "#8B0000FF"));
  document.documentElement.style.setProperty("--set-value-text-color",  hex8ToCss(appStyle.setValueText  || "#FFFFFFFF"));
  document.documentElement.style.setProperty("--today-bg",   hex8ToCss(appStyle.todayBg   || "#333333FF"));
  document.documentElement.style.setProperty("--today-text", hex8ToCss(appStyle.todayText || "#FFD700FF"));
  _applyStatusBarColor();
}
applyAppStyle();

