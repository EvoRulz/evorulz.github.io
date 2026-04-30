// ── color-picker.js ────────────────────────────────────────
(function () {
  function hsbToRgb(h, s, b) {
    s /= 100; b /= 100;
    const k = n => (n + h / 60) % 6;
    const f = n => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
    return [Math.round(f(5)*255), Math.round(f(3)*255), Math.round(f(1)*255)];
  }
  function rgbToHsb(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r,g,b), d = max - Math.min(r,g,b);
    let h = 0;
    if (d) {
      if      (max === r) h = ((g - b) / d + 6) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else                h = (r - g) / d + 4;
    }
    return [Math.round(h * 60), max ? Math.round(d / max * 100) : 0, Math.round(max * 100)];
  }
  function hexToRgb(hex) {
    const h = hex.replace('#','');
    return [parseInt(h.slice(0,2),16)||0, parseInt(h.slice(2,4),16)||0, parseInt(h.slice(4,6),16)||0];
  }
  function rgbToHex(r, g, b) {
    return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0').toUpperCase()).join('');
  }
  function h8css(hex) {
    const h = hex.replace('#','');
    const r = parseInt(h.slice(0,2),16)||0, g = parseInt(h.slice(2,4),16)||0, b = parseInt(h.slice(4,6),16)||0;
    const a = h.length === 8 ? parseInt(h.slice(6,8),16) : 255;
    return `rgba(${r},${g},${b},${(a/255).toFixed(3)})`;
  }

  let popup = null, styleTag = null, activeSwatch = null;
  let H = 0, S = 100, B = 100;

  const CP_DEFAULTS = { bg: '#1c1c1cFF', border: '#555555FF', label: '#bbbbbbFF' };
  function cpCfg() {
    try { const s = JSON.parse(localStorage.getItem('_cpSettings')); if (s) return Object.assign({}, CP_DEFAULTS, s); } catch {}
    return Object.assign({}, CP_DEFAULTS);
  }

  function cssVars() {
    const g = k => getComputedStyle(document.documentElement).getPropertyValue(k).trim();
    return {
      border:  g('--slider-border-color') || '#555',
      height:  g('--slider-h')            || '8px',
      radius:  g('--slider-r')            || '4%',
      spread:  g('--slider-spread')       || '4px',
      hColor:  g('--slider-handle-color') || '#fff',
      hW:      g('--slider-handle-w')     || '16px',
      hH:      g('--slider-handle-h')     || '16px',
      hR:      g('--slider-handle-r')     || '3%',
      hBorder: g('--slider-handle-border')|| 'transparent',
    };
  }

  function injectThumbCSS(v) {
    if (styleTag) styleTag.remove();
    styleTag = document.createElement('style');
    styleTag.id = 'cp-thumb-style';
    styleTag.textContent = `
      #cp-popup input[type=range]::-webkit-slider-thumb {
        -webkit-appearance:none; width:${v.hW}; height:${v.hH};
        border-radius:${v.hR}; background:${v.hColor};
        border:1px solid ${v.hBorder}; cursor:pointer; box-sizing:border-box;
      }
      #cp-popup input[type=range]::-moz-range-thumb {
        width:${v.hW}; height:${v.hH}; border-radius:${v.hR};
        background:${v.hColor}; border:1px solid ${v.hBorder};
        cursor:pointer; box-sizing:border-box;
      }`;
    document.head.appendChild(styleTag);
  }

  function sliderCSS(v) {
    return `width:100%;height:${v.height};border-radius:${v.spread}/${v.radius};` +
           `border:1px solid ${v.border};outline:none;appearance:none;-webkit-appearance:none;` +
           `cursor:pointer;touch-action:none;display:block;box-sizing:border-box;`;
  }

  function refreshTracks() {
    if (!popup) return;
    const [hr,hg,hb] = hsbToRgb(H, 100, 100);
    const [cr,cg,cb] = hsbToRgb(H, S,   100);
    const [pr,pg,pb] = hsbToRgb(H, S,   B  );
    popup.querySelector('#cp-hue').style.background =
      'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)';
    popup.querySelector('#cp-sat').style.background =
      `linear-gradient(to right,#808080,rgb(${hr},${hg},${hb}))`;
    popup.querySelector('#cp-bri').style.background =
      `linear-gradient(to right,#000,rgb(${cr},${cg},${cb}))`;
    const _sw = popup.querySelector('#cp-swatch');
    if (_sw) _sw.style.background = `rgb(${pr},${pg},${pb})`;
  }

  function commitColor() {
    const [r,g,b] = hsbToRgb(H, S, B);
    const hex = rgbToHex(r,g,b);
    const _hexEl = popup ? popup.querySelector('#cp-hex') : null;
    if (_hexEl) _hexEl.value = hex;
    refreshTracks();
    if (!activeSwatch) return;
    const inp = activeSwatch.querySelector('input[type="color"]');
    if (inp) { inp.value = hex.toLowerCase(); inp.dispatchEvent(new Event('input', {bubbles:true})); }
  }

  function makeDragger(slider, onVal) {
    const min = +slider.min, max = +slider.max;
    let active = false;
    function update(cx) {
      const r = slider.getBoundingClientRect();
      const v = Math.round(min + Math.max(0, Math.min(1, (cx - r.left) / r.width)) * (max - min));
      slider.value = v; onVal(v);
    }
    slider.addEventListener('pointerdown', e => {
      active = true; slider.setPointerCapture(e.pointerId);
      update(e.clientX); e.preventDefault(); e.stopPropagation();
    });
    slider.addEventListener('pointermove', e => { if (active) { update(e.clientX); e.preventDefault(); } });
    slider.addEventListener('pointerup',     () => { active = false; });
    slider.addEventListener('pointercancel', () => { active = false; });
  }

  function buildPopup() {
    const v = cssVars(), c = cpCfg();
    const bg  = h8css(c.bg), br = h8css(c.border), lbl = h8css(c.label);
    injectThumbCSS(v);
    const el = document.createElement('div');
    el.id = 'cp-popup';
    el.style.cssText =
      `position:fixed;z-index:99999;background:${bg};border:1px solid ${br};border-radius:8px;` +
      `padding:14px 16px;width:220px;box-shadow:0 4px 24px rgba(0,0,0,0.65);` +
      `display:flex;flex-direction:column;gap:10px;touch-action:none;` +
      `user-select:none;-webkit-user-select:none;`;
    const ss = sliderCSS(v);
    const ls = `font-size:11px;color:${lbl};margin-bottom:2px;`;
    el.innerHTML =
      `<div><div style="${ls}">Hue</div>` +
        `<input id="cp-hue" type="range" min="0" max="360" value="${H}" style="${ss}"></div>` +
      `<div><div style="${ls}">Saturation</div>` +
        `<input id="cp-sat" type="range" min="0" max="100" value="${S}" style="${ss}"></div>` +
      `<div><div style="${ls}">Brightness</div>` +
        `<input id="cp-bri" type="range" min="0" max="100" value="${B}" style="${ss}"></div>`;
    document.body.appendChild(el);

    makeDragger(el.querySelector('#cp-hue'), v => { H = v; commitColor(); });
    makeDragger(el.querySelector('#cp-sat'), v => { S = v; commitColor(); });
    makeDragger(el.querySelector('#cp-bri'), v => { B = v; commitColor(); });

    let dg = null;
    el.addEventListener('pointerdown', e => {
      if (e.target.tagName === 'INPUT') return;
      dg = { x: e.clientX - el.offsetLeft, y: e.clientY - el.offsetTop };
      el.setPointerCapture(e.pointerId); e.stopPropagation();
    });
    el.addEventListener('pointermove', e => {
      if (!dg) return;
      el.style.left = (e.clientX - dg.x) + 'px';
      el.style.top  = (e.clientY - dg.y) + 'px';
      el.style.right = 'auto'; el.style.bottom = 'auto';
    });
    el.addEventListener('pointerup',     () => { dg = null; });
    el.addEventListener('pointercancel', () => { dg = null; });
    return el;
  }

  function position(swatch) {
    const r = swatch.getBoundingClientRect();
    const ph = popup.offsetHeight || 220;
    const pw = popup.offsetWidth  || 228;
    let l = r.left;
    if (l + pw + 8 > window.innerWidth - 8) l = window.innerWidth - pw - 8;
    const _undoBtn = document.getElementById('settings-undo');
    const undoTop = _undoBtn ? _undoBtn.getBoundingClientRect().top : window.innerHeight;
    const below = r.bottom + 8;
    const above = r.top - ph - 8;
    const t = (below + ph <= undoTop - 8) ? below : above;
    popup.style.left = Math.max(8, l) + 'px';
    popup.style.top  = Math.max(8, t) + 'px';
  }

  function openFor(swatch) {
    close();
    const inp = swatch.querySelector('input[type="color"]');
    if (!inp) return;
    [H,S,B] = rgbToHsb(...hexToRgb(inp.value));
    activeSwatch = swatch;
    popup = buildPopup();
    position(swatch);
    const _hexInit = popup.querySelector('#cp-hex'); if (_hexInit) _hexInit.value = inp.value.replace('#','').toUpperCase();
    refreshTracks();
    setTimeout(() => document.addEventListener('pointerdown', tapOut), 80);
  }

  function close() {
    if (popup)    { popup.remove();    popup    = null; }
    if (styleTag) { styleTag.remove(); styleTag = null; }
    activeSwatch = null;
    document.removeEventListener('pointerdown', tapOut);
  }

  function tapOut(e) {
    if (!popup) return;
    if (!popup.contains(e.target) && !e.target.closest('.color-swatch-wrap') && !e.target.closest('#settings-footer')) close();
  }

  // ── Intercept all swatch pointerdowns ──────────────────────
  document.addEventListener('pointerdown', function (e) {
    let sw = e.target.closest('.color-swatch-wrap');
    if (!sw) {
      const row = e.target.closest('.color-picker-row');
      if (row) {
        const swInRow = row.querySelector('.color-swatch-wrap');
        if (swInRow) {
          const r = swInRow.getBoundingClientRect();
          if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
            sw = swInRow;
          }
        }
      }
    }
    if (!sw) return;
    e.preventDefault(); e.stopPropagation();
    activeSwatch === sw ? close() : openFor(sw);
  }, true);

  // ── Public API ─────────────────────────────────────────────
  window._cpClose = close;
  window._cpSyncUI = function () {
    if (typeof setColorValue !== 'function') return;
    const c = cpCfg();
    setColorValue('s-cp-bg',     c.bg);
    setColorValue('s-cp-border', c.border);
    setColorValue('s-cp-label',  c.label);
  };
  window._cpSaveFromUI = function () {
    if (typeof getColorValue !== 'function') return;
    localStorage.setItem('_cpSettings', JSON.stringify({
      bg:     getColorValue('s-cp-bg'),
      border: getColorValue('s-cp-border'),
      label:  getColorValue('s-cp-label'),
    }));
  };
  window._cpRebuild = function () {
    if (popup && activeSwatch) { const sw = activeSwatch; close(); openFor(sw); }
  };
  window._cpRefresh = function () {
  if (!popup || !activeSwatch) return;
  const inp = activeSwatch.querySelector('input[type="color"]');
  if (!inp) return;
  [H, S, B] = rgbToHsb(...hexToRgb(inp.value));
  const hueEl = popup.querySelector('#cp-hue');
  const satEl = popup.querySelector('#cp-sat');
  const briEl = popup.querySelector('#cp-bri');
  if (hueEl) hueEl.value = H;
  if (satEl) satEl.value = S;
  if (briEl) briEl.value = B;
  refreshTracks();
  };
})();