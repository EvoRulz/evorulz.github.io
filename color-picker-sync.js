// @version 1399

window._cpSyncUI = function () {
  if (typeof setColorValue !== 'function') return;
  const c = window._cpCfg();
  if (c.bgStops && window._cpSetGradientStops) {
    window._cpSetGradientStops('s-cp-bg', c.bgStops);
    const _bgOv = document.getElementById('s-cp-bg-swatch-overlay');
    if (_bgOv) { const _g = window._cpGetGradient('s-cp-bg'); if (_g) _bgOv.style.background = _g; }
  } else {
    setColorValue('s-cp-bg', c.bg);
  }
  if (c.borderStops && window._cpSetGradientStops) {
    window._cpSetGradientStops('s-cp-border', c.borderStops);
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
    const _lbOv = document.getElementById('s-cp-label-outline-swatch-overlay');
    if (_lbOv) { const _g = window._cpGetGradient('s-cp-label-outline'); if (_g) _lbOv.style.background = _g; }
  } else if (c.labelBorder) {
    setColorValue('s-cp-label-outline', c.labelBorder);
  }
  if (c.labelStops && window._cpSetGradientStops) {
    window._cpSetGradientStops('s-cp-label', c.labelStops);
    const _lbOv = document.getElementById('s-cp-label-swatch-overlay');
    if (_lbOv) { const _g = window._cpGetGradient('s-cp-label'); if (_g) _lbOv.style.background = _g; }
  } else {
    setColorValue('s-cp-label', c.label);
  }
  if (c.textStops && window._cpSetGradientStops) {
    window._cpSetGradientStops('s-cp-text', c.textStops);
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
  }));
  window._applyLabelToSwatches();
};

window._applyLabelToSwatches = function _applyLabelToSwatches() {
  const c = window._cpCfg();
  const fillGrad = c.labelStops ? window._cpBuildCSS(c.labelStops) : (c.label && typeof c.label === 'string' && (c.label.startsWith('linear-gradient') || c.label.startsWith('radial-gradient'))) ? c.label : null;
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
  e.preventDefault();
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
  window._cpOpenFor(sw);
}, true);

document.addEventListener('pointercancel', function() {
  if (_swatchGlowTimer) { clearTimeout(_swatchGlowTimer); _swatchGlowTimer = null; }
  if (_swatchDownEl) _swatchDownEl.style.boxShadow = '';
  _swatchDownX = null; _swatchDownY = null; _swatchDownEl = null;
}, true);
