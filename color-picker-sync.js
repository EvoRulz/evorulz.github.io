// @version 1558
window._cpSyncUI = function () {
  if (typeof setColorValue !== 'function') return;
  const c = window._cpCfg();
  if (c.bgMode && window._cpSetGradientMode) window._cpSetGradientMode('s-cp-bg', c.bgMode);
  if (c.borderMode && window._cpSetGradientMode) window._cpSetGradientMode('s-cp-border', c.borderMode);
  if (c.labelMode && window._cpSetGradientMode) window._cpSetGradientMode('s-cp-label', c.labelMode);
  if (c.textMode && window._cpSetGradientMode) window._cpSetGradientMode('s-cp-text', c.textMode);
  if (c.labelBorderMode && window._cpSetGradientMode) window._cpSetGradientMode('s-cp-label-outline', c.labelBorderMode);
  if (c.bgStops && window._cpSetGradientStops) {
    window._cpSetGradientStops('s-cp-bg', c.bgStops);
    if (c.bgDeg != null && window._cpSetGradientDeg) window._cpSetGradientDeg('s-cp-bg', c.bgDeg);
    const _bgOv = document.getElementById('s-cp-bg-swatch-overlay');
    if (_bgOv) { const _g = window._cpGetGradient('s-cp-bg'); if (_g) _bgOv.style.background = _g; }
  } else {
    setColorValue('s-cp-bg', c.bg);
  }
  if (c.borderStops && window._cpSetGradientStops) {
    window._cpSetGradientStops('s-cp-border', c.borderStops);
    if (c.borderDeg != null && window._cpSetGradientDeg) window._cpSetGradientDeg('s-cp-border', c.borderDeg);
    const _brOv = document.getElementById('s-cp-border-swatch-overlay');
    if (_brOv) { const _g = window._cpGetGradient('s-cp-border'); if (_g) _brOv.style.background = _g; }
  } else {
    setColorValue('s-cp-border', c.border);
  }
  if (c.text) {
    setColorValue('s-cp-text', c.text);
  }
  if (c.labelOutline) {
    setColorValue('s-cp-label-outline', c.labelOutline);
  }
  if (c.labelBorderStops && window._cpSetGradientStops) {
    window._cpSetGradientStops('s-cp-label-outline', c.labelBorderStops);
    if (c.labelBorderDeg != null && window._cpSetGradientDeg) window._cpSetGradientDeg('s-cp-label-outline', c.labelBorderDeg);
    const _lbOv = document.getElementById('s-cp-label-outline-swatch-overlay');
    if (_lbOv) { const _g = window._cpGetGradient('s-cp-label-outline'); if (_g) _lbOv.style.background = _g; }
  } else if (c.labelBorder) {
    setColorValue('s-cp-label-outline', c.labelBorder);
  }
  if (c.labelStops && window._cpSetGradientStops) {
    window._cpSetGradientStops('s-cp-label', c.labelStops);
    if (c.labelDeg != null && window._cpSetGradientDeg) window._cpSetGradientDeg('s-cp-label', c.labelDeg);
    const _lbOv = document.getElementById('s-cp-label-swatch-overlay');
    if (_lbOv) { const _g = window._cpGetGradient('s-cp-label'); if (_g) _lbOv.style.background = _g; }
  } else {
    setColorValue('s-cp-label', c.label);
  }
  if (c.textStops && window._cpSetGradientStops) {
    window._cpSetGradientStops('s-cp-text', c.textStops);
    if (c.textDeg != null && window._cpSetGradientDeg) window._cpSetGradientDeg('s-cp-text', c.textDeg);
    const _txOv = document.getElementById('s-cp-text-swatch-overlay');
    if (_txOv) { const _g = window._cpGetGradient('s-cp-text'); if (_g) _txOv.style.background = _g; }
  } else {
    setColorValue('s-cp-text', c.text);
  }
  const _szSyncEl = document.getElementById('s-cp-label-size');
  const _stSyncEl = document.getElementById('s-cp-label-stroke');
  const _szValSyncEl = document.getElementById('s-cp-label-size-val');
  const _stValSyncEl = document.getElementById('s-cp-label-stroke-val');
  const c2 = window._cpCfg();
  if (_szSyncEl) { _szSyncEl.value = c2.labelSize || 8; if (_szValSyncEl) _szValSyncEl.textContent = (c2.labelSize || 8) + 'px'; }
  if (_stSyncEl) { const _sv = Math.round((c2.labelStroke !== undefined ? c2.labelStroke : 0.5) * 10); _stSyncEl.value = _sv; if (_stValSyncEl) _stValSyncEl.textContent = (c2.labelStroke !== undefined ? c2.labelStroke : 0.5).toFixed(1) + 'px'; }
  const _lfSyncEl = document.getElementById('s-cp-label-font');
  if (_lfSyncEl && c2.labelFont) _lfSyncEl.value = c2.labelFont;
  if (window.fontPickerSwatchSync) window.fontPickerSwatchSync();
  window._applyLabelToSwatches();
};
window._cpSaveFromUI = function () {
  if (typeof getColorValue !== 'function') return;
  localStorage.setItem('_cpSettings', JSON.stringify({
    bg:          (typeof getStyleValue === 'function' ? getStyleValue('s-cp-bg') : getColorValue('s-cp-bg')),
    border:      (typeof getStyleValue === 'function' ? getStyleValue('s-cp-border') : getColorValue('s-cp-border')),
    label:       (typeof getStyleValue === 'function' ? getStyleValue('s-cp-label') : getColorValue('s-cp-label')),
    text:        (typeof getStyleValue === 'function' ? getStyleValue('s-cp-text') : getColorValue('s-cp-text')),
    bgStops:     window._cpGetGradientStops ? window._cpGetGradientStops('s-cp-bg')     : null,
    borderStops: window._cpGetGradientStops ? window._cpGetGradientStops('s-cp-border') : null,
    labelStops:  window._cpGetGradientStops ? window._cpGetGradientStops('s-cp-label')  : null,
    textStops:   window._cpGetGradientStops ? window._cpGetGradientStops('s-cp-text')   : null,
    labelOutline: getColorValue('s-cp-label-outline'),
    labelBorder: (typeof getColorValue === 'function' ? getColorValue('s-cp-label-border') : null),
    labelBorderStops: window._cpGetGradientStops ? window._cpGetGradientStops('s-cp-label-outline') : null,
    labelSize: (function(){ const el = document.getElementById('s-cp-label-size'); return el ? parseInt(el.value) : 8; })(),
    labelStroke: (function(){ const el = document.getElementById('s-cp-label-stroke'); return el ? parseFloat(el.value) / 10 : 0.5; })(),
    labelFont: (function(){ const el = document.getElementById('s-cp-label-font'); return el ? el.value : 'sans-serif'; })(),
    textMode:        window._cpGetGradientMode ? window._cpGetGradientMode('s-cp-text')          : 'solid',
    labelMode:       window._cpGetGradientMode ? window._cpGetGradientMode('s-cp-label')         : 'solid',
    bgMode:          window._cpGetGradientMode ? window._cpGetGradientMode('s-cp-bg')            : 'solid',
    borderMode:      window._cpGetGradientMode ? window._cpGetGradientMode('s-cp-border')        : 'solid',
    labelBorderMode: window._cpGetGradientMode ? window._cpGetGradientMode('s-cp-label-outline') : 'solid',
    bgDeg:          window._cpGetGradientDeg ? window._cpGetGradientDeg('s-cp-bg')            : 360,
    borderDeg:      window._cpGetGradientDeg ? window._cpGetGradientDeg('s-cp-border')        : 360,
    labelDeg:       window._cpGetGradientDeg ? window._cpGetGradientDeg('s-cp-label')         : 360,
    textDeg:        window._cpGetGradientDeg ? window._cpGetGradientDeg('s-cp-text')          : 360,
    labelBorderDeg: window._cpGetGradientDeg ? window._cpGetGradientDeg('s-cp-label-outline') : 360,
  }));
  window._applyLabelToSwatches();
};
window._applyLabelToSwatches = function _applyLabelToSwatches() {
  const c = window._cpCfg();
  const fillGrad = c.labelStops ? window._cpBuildCSS(c.labelStops, null, c.labelMode || 'linear') : (c.label && typeof c.label === 'string' && (c.label.startsWith('linear-gradient') || c.label.startsWith('radial-gradient'))) ? c.label : null;
  const outlineColor = c.labelOutline ? window._cpH8css(c.labelOutline) : 'rgba(0,0,0,1)';
  const outlineGrad = c.labelBorderStops ? window._cpBuildCSS(c.labelBorderStops) : null;
  const _szEl = document.getElementById('s-cp-label-size');
  const _stEl = document.getElementById('s-cp-label-stroke');
  const _fontSize = _szEl ? parseInt(_szEl.value) : (c.labelSize || 8);
  const _strokeW = _stEl ? (parseFloat(_stEl.value) / 10).toFixed(1) : (c.labelStroke !== undefined ? c.labelStroke : 0.5).toFixed(1);
  const _lfEl = document.getElementById('s-cp-label-font');
  const _lf = _lfEl ? _lfEl.value : (c.labelFont || 'sans-serif');
  let lbStyleTag = document.getElementById('_swatch-label-pseudo-style');
  if (!lbStyleTag) {
    lbStyleTag = document.createElement('style');
    lbStyleTag.id = '_swatch-label-pseudo-style';
    document.head.appendChild(lbStyleTag);
  }
    // ::before is now the FILL (z-index:1 in CSS, paints on top of the stroke on the main element)
  if (fillGrad) {
    lbStyleTag.textContent = `.color-swatch-label::before { background: ${fillGrad}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: transparent; -webkit-text-stroke: 0; font-size: ${_fontSize}px; font-family: ${_lf}; }`;
  } else {
    const _fc = window._cpH8css(typeof c.label === 'string' && !c.label.startsWith('linear-gradient') && !c.label.startsWith('radial-gradient') ? c.label : '#bbbbbbFF');
    lbStyleTag.textContent = `.color-swatch-label::before { -webkit-text-fill-color: ${_fc}; background: none; color: ${_fc}; -webkit-text-stroke: 0; font-size: ${_fontSize}px; font-family: ${_lf}; }`;
  }
    // Main element carries the STROKE only, fill transparent so ::before shows through
  document.querySelectorAll('.color-swatch-label').forEach(function(el) {
    el.dataset.text = el.textContent.trim();
    el.style.textShadow = '';
    el.style.paintOrder = 'stroke fill';
    el.style.webkitTextFillColor = 'transparent';
    el.style.color = 'transparent';
    el.style.display = 'inline-block';
    el.style.fontSize = _fontSize + 'px';
    el.style.fontFamily = _lf;
    if (outlineGrad) {
      el.style.webkitTextStroke = _strokeW + 'px transparent';
      el.style.background = outlineGrad;
      el.style.webkitBackgroundClip = 'text';
      el.style.backgroundClip = 'text';
    } else {
      el.style.webkitTextStroke = _strokeW + 'px ' + outlineColor;
      el.style.background = '';
      el.style.webkitBackgroundClip = '';
      el.style.backgroundClip = '';
    }
  });
};
  // ── Intercept all swatch pointerdowns ──────────────────────
let _swatchDownX = null, _swatchDownY = null, _swatchDownEl = null, _swatchGlowTimer = null;
function _resolveSwatchEl(e) {
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
  return sw;
}
document.addEventListener('pointerdown', function(e) {
  const sw = _resolveSwatchEl(e);
  if (!sw) return;
  _swatchDownX = e.clientX; _swatchDownY = e.clientY; _swatchDownEl = sw; _swatchGlowTimer = setTimeout(() => { if (_swatchDownEl === sw) sw.style.boxShadow = '0 0 10px 4px rgba(255,255,255,0.75)'; }, 380);
}, true);
document.addEventListener('pointerup', function(e) {
  if (_swatchGlowTimer) { clearTimeout(_swatchGlowTimer); _swatchGlowTimer = null; }
  if (!_swatchDownEl) return;
  const sw = _swatchDownEl;
  const moved = Math.hypot(e.clientX - (_swatchDownX || 0), e.clientY - (_swatchDownY || 0));
  _swatchDownX = null; _swatchDownY = null; _swatchDownEl = null;
  sw.style.boxShadow = '';
  if (moved > 8) return;
  if (window._settingsRowDragging) return;
  if (window._cpMod && window._cpMod.activeSwatch === sw) {
    window._cpClose();
  } else {
    window._cpOpenFor(sw);
  }
}, true);
document.addEventListener('pointercancel', function() {
  if (_swatchGlowTimer) { clearTimeout(_swatchGlowTimer); _swatchGlowTimer = null; }
  if (_swatchDownEl) _swatchDownEl.style.boxShadow = '';
  _swatchDownX = null; _swatchDownY = null; _swatchDownEl = null;
}, true);
// ── Popup render & management (moved from color-picker-core.js) ─────────────
(function () {
  function _m() { return window._cpMod; }
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
      w:       g('--slider-w')            || '100%',
      btnGap:  g('--slider-btn-gap')      || '0px',
      btnW:    g('--slider-btn-w')        || '22px',
      btnH:    g('--slider-btn-h')        || '22px',
      btnR:    g('--slider-btn-r')        || '4px',
    };
  }
  function injectThumbCSS(v) {
    const mo = _m();
    if (mo.styleTag) mo.styleTag.remove();
    const st = document.createElement('style');
    st.id = 'cp-thumb-style';
    const _holeInject = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--slider-handle-hole').trim()) || 0;
    st.textContent = `
      #cp-popup input[type=range]::-webkit-slider-thumb {
        -webkit-appearance:none; width:${v.hW}; height:${v.hH};
        border-radius:${v.hR}; background:radial-gradient(circle, transparent calc(${_holeInject} * 1%), ${v.hColor} calc(${_holeInject} * 1%));
        border:1px solid ${v.hBorder}; cursor:pointer; box-sizing:border-box; box-shadow:0 0 8px 4px ${(typeof btnStyle !== 'undefined' ? hex8ToCss(btnStyle.sliderHandleGlow || '#FFFFFF00') : 'rgba(0,0,0,0)')};
      }
      #cp-popup input[type=range]::-moz-range-thumb {
        width:${v.hW}; height:${v.hH}; border-radius:${v.hR};
        background:radial-gradient(circle, transparent calc(${_holeInject} * 1%), ${v.hColor} calc(${_holeInject} * 1%));
        border:1px solid ${v.hBorder};
        cursor:pointer; box-sizing:border-box; box-shadow:0 0 8px 4px ${(typeof btnStyle !== 'undefined' ? hex8ToCss(btnStyle.sliderHandleGlow || '#FFFFFF00') : 'rgba(0,0,0,0)')};
    }`;
    document.head.appendChild(st);
    mo.styleTag = st;
  }
  function sliderCSS(v) {
    return `width:${v.w};height:${v.height};border-radius:${v.spread}/${v.radius};` +
  `border:1px solid ${v.border};outline:none;appearance:none;-webkit-appearance:none;` +
`cursor:pointer;touch-action:none;display:block;box-sizing:border-box;`;
}
function refreshTracks() {
  const mo = _m();
  if (!mo.popup) return;
  const [hr,hg,hb] = mo.hsbToRgb(mo.H, 100, 100);
  const [cr,cg,cb] = mo.hsbToRgb(mo.H, mo.S, 100);
  const [pr,pg,pb] = mo.hsbToRgb(mo.H, mo.S, mo.B);
  mo.popup.querySelector('#cp-hue').style.background =
  'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)';
  mo.popup.querySelector('#cp-sat').style.background =
`linear-gradient(to right,#808080,rgb(${hr},${hg},${hb}))`;
mo.popup.querySelector('#cp-bri').style.background =
`linear-gradient(to right,#000,rgb(${cr},${cg},${cb}))`;
const _sw = mo.popup.querySelector('#cp-swatch');
if (_sw) _sw.style.background = `rgb(${pr},${pg},${pb})`;
}
function refreshAlphaTrack() {
  const mo = _m();
  if (!mo.popup) return;
  const alphaEl = mo.popup.querySelector('#cp-alpha');
  if (!alphaEl) return;
  const [r,g,b] = mo.hsbToRgb(mo.H, mo.S, mo.B);
  const pct = parseInt(alphaEl.value) / 255 * 100;
  alphaEl.style.background = `linear-gradient(to right, rgba(${r},${g},${b},0), rgba(${r},${g},${b},1)), repeating-conic-gradient(#444 0% 25%, #222 0% 50%) 0 0 / 8px 8px`;
}
function commitAlpha(v) {
  const mo = _m();
  if (!mo.activeSwatch) return;
  const inp = mo.activeSwatch.querySelector('input[type="color"]');
  if (!inp) return;
  if (mo._ga && mo._ga[mo._gSel] && !mo._ga[mo._gSel].isPercent) {
    const [rc,gc,bc] = mo.hsbToRgb(mo.H, mo.S, mo.B);
    const a = Math.round(Number(v));
    mo._ga[mo._gSel].hex8 = '#' + [rc,gc,bc,a].map(x => x.toString(16).padStart(2,'0').toUpperCase()).join('');
    mo._gSave();
  }
  const realAlpha = document.getElementById(inp.id + '-alpha');
  if (realAlpha) { realAlpha.value = v; realAlpha.dispatchEvent(new Event('input', {bubbles:true})); }
  const [r,g,b] = mo.hsbToRgb(mo.H, mo.S, mo.B);
  const hex = mo.rgbToHex(r,g,b);
  const aHex = Math.round(Number(v)).toString(16).padStart(2,'0').toUpperCase();
  const _hexEl = mo.popup && mo.popup.querySelector('#cp-hex');
  if (_hexEl) _hexEl.value = '#' + hex.replace('#','') + aHex;
  refreshAlphaTrack();
  mo._gRender();
}
function commitColor() {
  const mo = _m();
  const [r,g,b] = mo.hsbToRgb(mo.H, mo.S, mo.B);
  const hex = mo.rgbToHex(r,g,b);
  const _hexEl = mo.popup ? mo.popup.querySelector('#cp-hex') : null;
  if (_hexEl) {
    const alphaEl = mo.popup.querySelector('#cp-alpha');
    const aVal = alphaEl ? parseInt(alphaEl.value) : 255;
    const aHex = aVal.toString(16).padStart(2,'0').toUpperCase();
    _hexEl.value = '#' + hex.replace('#','') + aHex;
  }
  refreshTracks();
  refreshAlphaTrack();
  if (!mo.activeSwatch) return;
  const inp = mo.activeSwatch.querySelector('input[type="color"]');
  if (mo._ga && mo._ga[mo._gSel] && !mo._ga[mo._gSel].isPercent) {
    const aEl = mo.popup && mo.popup.querySelector('#cp-alpha');
    const a   = aEl ? parseInt(aEl.value) : 255;
    const [rc,gc,bc] = mo.hsbToRgb(mo.H, mo.S, mo.B);
    mo._ga[mo._gSel].hex8 = '#' + [rc,gc,bc,a].map(nv => nv.toString(16).padStart(2,'0').toUpperCase()).join('');
    mo._gSave();
  }
  if (inp) { inp.value = hex.toLowerCase(); inp.dispatchEvent(new Event('input', {bubbles:true})); }
  mo._gRender();
}
function makeDragger(slider, onVal) {
  const min = +slider.min, max = +slider.max;
  let active = false;
  let cachedRect = null;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:absolute;inset:0;z-index:1;cursor:pointer;touch-action:none;';
  const par = slider.parentElement;
  if (getComputedStyle(par).position === 'static') par.style.position = 'relative';
  par.appendChild(overlay);
  slider.style.pointerEvents = 'none';
  function update(cx) {
    const r = cachedRect;
    const v = Math.round(min + Math.max(0, Math.min(1, (cx - r.left) / r.width)) * (max - min));
    slider.value = v; onVal(v);
  }
  overlay.addEventListener('pointerdown', e => {
    active = true; cachedRect = slider.getBoundingClientRect(); overlay.setPointerCapture(e.pointerId);
    window._cpActiveDrag = true;
    update(e.clientX); e.preventDefault(); e.stopPropagation();
  });
  let _rafId = null, _pendingCx = null;
  overlay.addEventListener('pointermove', e => {
    if (!active) return;
    e.preventDefault();
    _pendingCx = e.clientX;
    if (!_rafId) {
      _rafId = requestAnimationFrame(() => {
        _rafId = null;
        if (_pendingCx !== null) { update(_pendingCx); _pendingCx = null; }
      });
    }
  });
  overlay.addEventListener('pointerup', () => {
    active = false; cachedRect = null; window._cpActiveDrag = false;
    if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
    if (_pendingCx !== null) { update(_pendingCx); _pendingCx = null; }
  });
  overlay.addEventListener('pointercancel', () => {
    active = false; cachedRect = null; window._cpActiveDrag = false;
    if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
    _pendingCx = null;
  });
}
function _updateModeToggle() {
  const mo = _m();
  if (!mo.popup || !mo.activeSwatch) return;
  const inp = mo.activeSwatch.querySelector('input[type="color"]');
  const mode = inp ? (mo._gMode[inp.id] || 'solid') : 'solid';
  ['solid','linear','radial','conic'].forEach(gm => {
    const btn = mo.popup.querySelector('#cp-mode-' + gm);
    if (!btn) return;
    btn.style.background = gm === mode ? '#555' : '#2a2a2a';
    btn.style.color = gm === mode ? '#fff' : '#aaa';
  });
}
function _updateGradVisibility() {
  const mo = _m();
  if (!mo.popup) return;
  const inp = mo.activeSwatch ? mo.activeSwatch.querySelector('input[type="color"]') : null;
  const mode = inp ? (mo._gMode[inp.id] || 'solid') : 'solid';
  const gradRow = mo.popup.querySelector('#cp-grad-row');
  const degRow  = mo.popup.querySelector('#cp-grad-deg-row');
  if (gradRow) gradRow.style.display = mode === 'solid' ? 'none' : 'flex';
  if (degRow)  degRow.style.display  = (mode === 'linear') ? 'flex' : 'none';
}
function buildPopup() {
  const mo = _m();
  const v = cssVars(), c = mo.cpCfg();
  const bgIsGrad = c.bg && typeof c.bg === 'string' && (c.bg.startsWith('linear-gradient') || c.bg.startsWith('radial-gradient'));
  const bg  = bgIsGrad ? c.bg : mo.h8css(c.bg);
  const brIsGrad = c.border && typeof c.border === 'string' && (c.border.startsWith('linear-gradient') || c.border.startsWith('radial-gradient'));
  const br = brIsGrad ? c.border : mo.h8css(c.border);
  const bgLayer = brIsGrad ? (bgIsGrad ? bg : `linear-gradient(${bg}, ${bg})`) : bg;
  const _lblGrad = c.labelStops ? mo._gBuildCSS(c.labelStops, null, c.labelMode || 'linear') : (typeof c.label === 'string' && (c.label.startsWith('linear-gradient') || c.label.startsWith('radial-gradient'))) ? c.label : null;
  const _txtGrad = c.textStops ? mo._gBuildCSS(c.textStops, null, c.textMode || 'linear') : (typeof c.text === 'string' && (c.text.startsWith('linear-gradient') || c.text.startsWith('radial-gradient'))) ? c.text : null;
  const lbl = _lblGrad || mo.h8css(typeof c.label === 'string' ? c.label : '#bbbbbbFF');
  const txt = _txtGrad || mo.h8css(typeof c.text === 'string' ? c.text : '#FFFFFFFF');
  const sb = mo.h8css((typeof btnStyle !== 'undefined' && btnStyle.sliderBorder) || '#555555FF');
  injectThumbCSS(v);
  const el = document.createElement('div');
  el.id = 'cp-popup';
  el.style.cssText =
  (brIsGrad
    ? `position:fixed;z-index:99999;background:${bgLayer} padding-box, ${br} border-box;border:1px solid transparent;border-radius:8px;`
    : `position:fixed;z-index:99999;background:${bg};border:1px solid ${br};border-radius:8px;`) +
`padding:14px 16px;width:268px;box-shadow:0 4px 24px rgba(0,0,0,0.65);` +
`display:flex;flex-direction:column;gap:10px;touch-action:none;` +
`user-select:none;-webkit-user-select:none;`;
const ss = sliderCSS(v);
const ls = _txtGrad
? `font-size:11px;background:${_txtGrad};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;color:transparent;display:inline-block;margin-bottom:2px;`
: _lblGrad
? `font-size:11px;background:${_lblGrad};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;color:transparent;display:inline-block;margin-bottom:2px;`
: `font-size:11px;color:${txt};margin-bottom:2px;`;
el.innerHTML =
`<div id="cp-mode-row" style="display:flex;gap:0;margin-bottom:6px;border-radius:4px;overflow:hidden;border:1px solid ${sb};">` +
`<button id="cp-mode-solid"  style="flex:1;padding:5px 0;font-size:11px;cursor:pointer;border:none;border-right:1px solid ${sb};background:#2a2a2a;color:#aaa;touch-action:manipulation;">Solid</button>` +
`<button id="cp-mode-linear" style="flex:1;padding:5px 0;font-size:11px;cursor:pointer;border:none;border-right:1px solid ${sb};background:#2a2a2a;color:#aaa;touch-action:manipulation;">Linear</button>` +
`<button id="cp-mode-radial" style="flex:1;padding:5px 0;font-size:11px;cursor:pointer;border:none;border-right:1px solid ${sb};background:#2a2a2a;color:#aaa;touch-action:manipulation;">Radial</button>` +
`<button id="cp-mode-conic"  style="flex:1;padding:5px 0;font-size:11px;cursor:pointer;border:none;background:#2a2a2a;color:#aaa;touch-action:manipulation;">Conic</button>` +
`</div>` +
`<div id="cp-grad-row" style="display:flex;gap:calc(var(--slider-handle-w,16px) * 1.5);align-items:center;flex-wrap:nowrap;">` +
`<button id="cp-grad-minus" style="background:var(--slider-btn-bg,#2a2a2a);border:1px solid ${sb};border-radius:var(--slider-btn-r,4px);color:var(--slider-btn-fg,#aaa);cursor:pointer;width:var(--slider-btn-w,22px);height:var(--slider-btn-h,22px);font-size:16px;line-height:1;padding:0;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">&#8722;</button>` +
`<div style="position:relative;height:${v.height};flex:1;min-width:0;">` +
`<div id="cp-grad-strip" style="position:absolute;inset:0;border-radius:${v.spread}/${v.radius};border:1px solid ${sb};background:#333;"></div>` +
`<div id="cp-grad-hw"    style="position:absolute;inset:0;overflow:visible;pointer-events:none;"></div>` +
`</div>` +
`<button id="cp-grad-plus"  style="background:var(--slider-btn-bg,#2a2a2a);border:1px solid ${sb};border-radius:var(--slider-btn-r,4px);color:var(--slider-btn-fg,#aaa);cursor:pointer;width:var(--slider-btn-w,22px);height:var(--slider-btn-h,22px);font-size:16px;line-height:1;padding:0;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">+</button>` +
`</div>` +
`<div id="cp-grad-deg-row" style="display:flex;align-items:center;gap:var(--slider-btn-gap,0px);">` +
`<span id="cp-grad-deg-val" class="cp-field-label" style="font-size:11px;${_txtGrad ? `background:${_txtGrad};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;color:transparent;display:inline-block;` : `color:${txt};`}min-width:32px;text-align:left;flex-shrink:0;">360\u00b0</span>` +
`<button id="cp-grad-deg-minus" style="background:var(--slider-btn-bg,#2a2a2a);border:1px solid ${sb};border-radius:var(--slider-btn-r,4px);color:var(--slider-btn-fg,#aaa);cursor:pointer;width:var(--slider-btn-w,22px);height:var(--slider-btn-h,22px);font-size:16px;line-height:1;padding:0;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;touch-action:manipulation;">&#8722;</button>` +
`<div style="position:relative;flex:1;min-width:0;"><input id="cp-grad-deg" type="range" min="0" max="360" value="360" style="width:100%;height:${v.height};border-radius:${v.spread}/${v.radius};border:1px solid ${sb};outline:none;appearance:none;-webkit-appearance:none;cursor:pointer;touch-action:none;box-sizing:border-box;display:block;"></div>` +
`<button id="cp-grad-deg-plus" style="background:var(--slider-btn-bg,#2a2a2a);border:1px solid ${sb};border-radius:var(--slider-btn-r,4px);color:var(--slider-btn-fg,#aaa);cursor:pointer;width:var(--slider-btn-w,22px);height:var(--slider-btn-h,22px);font-size:16px;line-height:1;padding:0;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;touch-action:manipulation;">+</button>` +
`</div>` +
`<div style="display:flex;align-items:center;gap:8px;"><div style="min-width:60px;flex-shrink:0;"><span class="cp-field-label" style="${ls}">Hue</span></div>` +
`<input id="cp-hue" type="range" min="0" max="360" value="${mo.H}" style="${ss}flex:1;"></div>` +
`<div style="display:flex;align-items:center;gap:8px;"><div style="min-width:60px;flex-shrink:0;"><span class="cp-field-label" style="${ls}">Saturation</span></div>` +
`<input id="cp-sat" type="range" min="0" max="100" value="${mo.S}" style="${ss}flex:1;"></div>` +
`<div style="display:flex;align-items:center;gap:8px;"><div style="min-width:60px;flex-shrink:0;"><span class="cp-field-label" style="${ls}">Brightness</span></div>` +
`<input id="cp-bri" type="range" min="0" max="100" value="${mo.B}" style="${ss}flex:1;"></div>` +
`<div style="display:flex;align-items:center;gap:8px;"><div style="min-width:60px;flex-shrink:0;"><span class="cp-field-label" style="${ls}">Alpha</span></div>` +
`<input id="cp-alpha" type="range" min="0" max="255" value="255" style="${ss}flex:1;"></div>` +
`<div style="display:flex;gap:6px;align-items:center;margin-top:2px;">` +
`<input id="cp-hex" type="text" maxlength="9" ` +
`style="flex:1;min-width:0;background:#111;border:1px solid ${sb};border-radius:4px;padding:4px 6px;font-size:12px;font-family:monospace;outline:none;text-transform:uppercase;letter-spacing:0.04em;${_txtGrad ? `background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-image:${_txtGrad};background-size:9ch 100%;color:transparent;` : `color:${txt};`}" ` +
`spellcheck="false" autocomplete="off">` +
`<button id="cp-copy" style="background:#2a2a2a;border:1px solid ${sb};border-radius:4px;color:#aaa;cursor:pointer;padding:4px 8px;font-size:12px;flex-shrink:0;">Copy</button>` +
`</div>`;
el.querySelectorAll('.cp-field-label').forEach(function(label) {
  const grad = c.textStops ? mo._gBuildCSS(c.textStops, null, c.textMode || 'linear') : null;
  if (grad) {
    label.style.background = grad;
    label.style.webkitBackgroundClip = 'text';
    label.style.webkitTextFillColor = 'transparent';
    label.style.backgroundClip = 'text';
    label.style.color = 'transparent';
    label.style.fontSize = '11px';
    label.style.marginBottom = '2px';
    label.style.display = 'inline-block';
  } else {
    label.style.fontSize = '11px';
    label.style.color = txt || 'rgba(255,255,255,1)';
    label.style.marginBottom = '2px';
    label.style.background = '';
    label.style.webkitBackgroundClip = '';
    label.style.backgroundClip = '';
    label.style.webkitTextFillColor = '';
  }
});
document.body.appendChild(el);
makeDragger(el.querySelector('#cp-hue'),   nv => { mo.H = nv; commitColor(); });
makeDragger(el.querySelector('#cp-sat'),   nv => { mo.S = nv; commitColor(); });
makeDragger(el.querySelector('#cp-bri'),   nv => { mo.B = nv; commitColor(); });
makeDragger(el.querySelector('#cp-alpha'), nv => { commitAlpha(nv); });
el.querySelector('#cp-hex').addEventListener('input', function() {
  let val = this.value.replace(/[^0-9a-fA-F#]/g,'');
  if (val && !val.startsWith('#')) val = '#' + val;
  const h = val.replace('#','');
  if ((h.length === 6 || h.length === 8) && /^[0-9a-fA-F]+$/.test(h)) {
    const r2 = parseInt(h.slice(0,2),16), g2 = parseInt(h.slice(2,4),16), b2 = parseInt(h.slice(4,6),16);
    const [_h,_s,_b] = mo.rgbToHsb(r2,g2,b2);
    mo.H = _h; mo.S = _s; mo.B = _b;
    if (mo.activeSwatch) {
      const inp = mo.activeSwatch.querySelector('input[type="color"]');
      if (inp) { inp.value = '#'+h.slice(0,6).toLowerCase(); inp.dispatchEvent(new Event('input',{bubbles:true})); }
      if (h.length === 8) {
        const aVal = parseInt(h.slice(6,8),16);
        const realAlpha = document.getElementById(inp.id + '-alpha');
        if (realAlpha) { realAlpha.value = aVal; realAlpha.dispatchEvent(new Event('input',{bubbles:true})); }
        const alphaEl = mo.popup.querySelector('#cp-alpha');
        if (alphaEl) { alphaEl.value = aVal; refreshAlphaTrack(); }
      }
    }
    refreshTracks();
  }
});
el.querySelector('#cp-hex').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    let val = this.value.trim().replace(/[^0-9a-fA-F#]/g, '');
    if (val && !val.startsWith('#')) val = '#' + val;
    const h = val.replace('#', '');
    let expanded = null;
    if      (h.length === 3) expanded = '#' + (h[0]+h[0]+h[1]+h[1]+h[2]+h[2]).toUpperCase() + 'FF';
    else if (h.length === 4) expanded = '#' + (h[0]+h[0]+h[1]+h[1]+h[2]+h[2]+h[3]+h[3]).toUpperCase();
    else if (h.length === 6) expanded = '#' + h.toUpperCase() + 'FF';
    else if (h.length === 8) expanded = '#' + h.toUpperCase();
    if (expanded) { this.value = expanded; this.dispatchEvent(new Event('input', {bubbles:true})); }
    this.blur();
  }
});
el.querySelector('#cp-hex').addEventListener('focus', function() { window._cpHexEditing = true; });
el.querySelector('#cp-hex').addEventListener('blur',  function() { window._cpHexEditing = false; });
const _cpCopyBtn = el.querySelector('#cp-copy');
_cpCopyBtn.addEventListener('pointerdown', e => e.stopPropagation());
_cpCopyBtn.addEventListener('click', function() {
  const hexEl = mo.popup ? mo.popup.querySelector('#cp-hex') : null;
  if (!hexEl) return;
  navigator.clipboard.writeText(hexEl.value).then(() => {
    this.textContent = 'Copied'; this.style.color = '#99ff99';
    setTimeout(() => { this.textContent = 'Copy'; this.style.color = '#aaa'; }, 1200);
  }).catch(() => {});
});
el.querySelector('#cp-grad-minus').addEventListener('pointerdown', e => e.stopPropagation());
el.querySelector('#cp-grad-minus').addEventListener('click',       e => { e.stopPropagation(); window._cpActiveDrag = true; mo._gMinus(); window._cpActiveDrag = false; _updateModeToggle(); _updateGradVisibility(); mo._gRender(); });
el.querySelector('#cp-grad-plus').addEventListener('pointerdown',  e => e.stopPropagation());
el.querySelector('#cp-grad-plus').addEventListener('click',        e => { e.stopPropagation(); window._cpActiveDrag = true; mo._gPlus(); window._cpActiveDrag = false; _updateModeToggle(); _updateGradVisibility(); mo._gRender(); requestAnimationFrame(() => { if (mo.popup) void mo.popup.offsetHeight; mo._gRender(); }); });
makeDragger(el.querySelector('#cp-grad-deg'), nv => {
  const _dv = mo.popup && mo.popup.querySelector('#cp-grad-deg-val');
  if (_dv) _dv.textContent = nv + '\u00b0';
  mo._gSave(); mo._cpRefreshSwatch();
});
el.querySelector('#cp-grad-deg-minus').addEventListener('pointerdown', e => e.stopPropagation());
el.querySelector('#cp-grad-deg-minus').addEventListener('click', e => {
  e.stopPropagation();
  const _dd = el.querySelector('#cp-grad-deg');
  _dd.value = Math.max(0, parseInt(_dd.value) - 1);
  const _dv = mo.popup && mo.popup.querySelector('#cp-grad-deg-val');
  if (_dv) _dv.textContent = _dd.value + '\u00b0';
  mo._gSave(); mo._gRender(); mo._cpRefreshSwatch();
});
el.querySelector('#cp-grad-deg-plus').addEventListener('pointerdown', e => e.stopPropagation());
el.querySelector('#cp-grad-deg-plus').addEventListener('click', e => {
  e.stopPropagation();
  const _dd = el.querySelector('#cp-grad-deg');
  _dd.value = Math.min(360, parseInt(_dd.value) + 1);
  const _dv = mo.popup && mo.popup.querySelector('#cp-grad-deg-val');
  if (_dv) _dv.textContent = _dd.value + '\u00b0';
  mo._gSave(); mo._gRender(); mo._cpRefreshSwatch();
});
['solid','linear','radial','conic'].forEach(gm => {
  const mBtn = el.querySelector('#cp-mode-' + gm);
  if (!mBtn) return;
  mBtn.addEventListener('pointerdown', e => e.stopPropagation());
  mBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (!mo.activeSwatch) return;
    const inp = mo.activeSwatch.querySelector('input[type="color"]');
    if (!inp) return;
    mo._gSave();
    mo._gMode[inp.id] = gm;
    mo._gLoad();
    mo._gSave();
    _updateModeToggle();
    _updateGradVisibility();
    mo._gRender();
    mo._cpRefreshSwatch();
  });
});
mo._gRender();
return el;
}
function position(swatch) {
  const mo = _m();
  const r = swatch.getBoundingClientRect();
  const ph = mo.popup.offsetHeight || 220;
  const pw = mo.popup.offsetWidth  || 228;
  let l = r.left;
  if (l + pw + 8 > window.innerWidth - 8) l = window.innerWidth - pw - 8;
  const _undoBtn = document.getElementById('settings-undo');
  const undoTop = _undoBtn ? _undoBtn.getBoundingClientRect().top : window.innerHeight;
  const below = r.bottom + 8;
  const above = r.top - ph - 8;
  const t = (below + ph <= undoTop - 8) ? below : above;
  mo.popup.style.left = Math.max(8, l) + 'px';
  mo.popup.style.top  = Math.max(8, t) + 'px';
}
function openFor(swatch) {
  const mo = _m();
  const wasOpen = !!mo.popup;
  const savedLeft = mo.popup ? mo.popup.style.left : null;
  const savedTop  = mo.popup ? mo.popup.style.top  : null;
  close();
  const inp = swatch.querySelector('input[type="color"]');
  if (!inp) return;
  const [r,g,b] = mo.hexToRgb(inp.value);
  const [_h,_s,_b] = mo.rgbToHsb(r,g,b);
  mo.H = _h; mo.S = _s; mo.B = _b;
  mo.activeSwatch = swatch;
  mo._gLoad();
  mo.popup = buildPopup();
  position(swatch);
  const _initDegEl = mo.popup.querySelector('#cp-grad-deg');
  if (_initDegEl && inp) {
    const _storedDeg = window._cpGetGradientDeg ? window._cpGetGradientDeg(inp.id) : 360;
    _initDegEl.value = String(_storedDeg);
    const _initDegValEl = mo.popup.querySelector('#cp-grad-deg-val');
    if (_initDegValEl) _initDegValEl.textContent = _storedDeg + '\u00b0';
  }
  const _realAlpha = document.getElementById(inp.id + '-alpha');
  const _popupAlpha = mo.popup.querySelector('#cp-alpha');
  if (_realAlpha && _popupAlpha) _popupAlpha.value = _realAlpha.value;
  const _realHex = document.getElementById(inp.id + '-hex');
  const _hexInit = mo.popup.querySelector('#cp-hex');
  if (_hexInit) {
    if (_realHex && _realHex.value) {
      _hexInit.value = _realHex.value;
    } else {
      const _aVal = _realAlpha ? parseInt(_realAlpha.value) : 255;
      _hexInit.value = '#' + inp.value.replace('#','').toUpperCase() + _aVal.toString(16).padStart(2,'0').toUpperCase();
    }
  }
  refreshTracks();
  refreshAlphaTrack();
  mo._gRender();
  _updateModeToggle();
  _updateGradVisibility();
  setTimeout(() => document.addEventListener('pointerdown', tapOut), 80);
}
function close() {
  const mo = _m();
  if (mo.popup)    { mo.popup.remove();    mo.popup    = null; }
  if (mo.styleTag) { mo.styleTag.remove(); mo.styleTag = null; }
  mo._gSave();
  mo.activeSwatch = null;
  document.removeEventListener('pointerdown', tapOut);
}
function tapOut(e) {
  const mo = _m();
  if (!mo.popup) return;
  if (!mo.popup.contains(e.target) && !e.target.closest('.color-swatch-wrap') && !e.target.closest('#settings-footer')) close();
}
window._cpCssVars = cssVars;
window._cpRefreshTracks = refreshTracks;
window._cpRefreshAlphaTrack = refreshAlphaTrack;
window._cpClose   = close;
window._cpOpenFor = openFor;
window._cpRebuild = function () {
  const mo = _m();
  if (mo.popup && mo.activeSwatch) {
    const sw = mo.activeSwatch;
    const savedSel = mo._gSel;
    close();
    openFor(sw);
    mo._gSel = savedSel;
    mo._gRender();
  }
};
window._cpRefresh = function () {
  const mo = _m();
  if (!mo.popup || !mo.activeSwatch) return;
  const inp = mo.activeSwatch.querySelector('input[type="color"]');
  if (!inp) return;
  const [r,g,b] = mo.hexToRgb(inp.value);
  const [_h,_s,_b] = mo.rgbToHsb(r,g,b);
  mo.H = _h; mo.S = _s; mo.B = _b;
  const hueEl = mo.popup.querySelector('#cp-hue');
  const satEl = mo.popup.querySelector('#cp-sat');
  const briEl = mo.popup.querySelector('#cp-bri');
  if (hueEl) hueEl.value = mo.H;
  if (satEl) satEl.value = mo.S;
  if (briEl) briEl.value = mo.B;
  const _realAlpha = document.getElementById(inp.id + '-alpha');
  const _alphaEl = mo.popup.querySelector('#cp-alpha');
  if (_realAlpha && _alphaEl) _alphaEl.value = _realAlpha.value;
  const _realHex = document.getElementById(inp.id + '-hex');
  const _hexEl2 = mo.popup.querySelector('#cp-hex');
  if (_realHex && _hexEl2) _hexEl2.value = _realHex.value;
  refreshTracks();
  refreshAlphaTrack();
};
})();

