// @version 1402
  const BTN_STYLE_DEFAULTS = { bg: "#444444FF", fg: "#FFFFFFFF", font: "sans-serif", glow: "#9659FFFF", activeGlow: "#9659FFFF", activeBg: "#555555FF", tap: "#FFFFFF40", tapHighlight: "#0000FFFF", btnRadius: 6, sliderBorder: "#555555FF", sliderHandleBorder: "#00000000", sliderH: 8, sliderR: 4, sliderW: 100, sliderHandleW: 16, checkboxChecked: "#90EE90FF", checkboxMark: "#000000FF", checkboxBorder: "#555555FF", checkboxBg: "#111111FF", sliderHandleHole: 0, sliderBtnGap: 0, sliderBtnBg: "#2a2a2aFF", sliderBtnFg: "#aaaaaaFF", sliderBtnBorder: "#555555FF", sliderBtnW: 22, sliderBtnH: 22, sliderBtnR: 4, clockDateColor: "#666666FF", clockTimeColor: "#666666FF", clockDateSize: 13, clockTimeSize: 13, clockBg: "#00000000", sliderHandleGlow: "#FFFFFF00", sliderHandleActiveGlow: "#FFFFFFD9", toggleOffBg: "#333333FF", toggleOnBg: "#1a5a1aFF", toggleSwitchOff: "#666666FF", toggleSwitchOn: "#99ff99FF", toggleBorderOff: "#555555FF", toggleBorderOn: "#2a7a2aFF", toggleW: 44, toggleH: 24, toggleSwitchSize: 16, fgStroke: '#00000000', fgStrokeW: 0, fontSize: 16, fontWeight: 400, fontScaleX: 100, border: '#00000000', activeBorder: '#00000000' };
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
    if (typeof val === 'string' && (val.startsWith('linear-gradient') || val.startsWith('radial-gradient') || val.startsWith('conic-gradient'))) return val;
    return hex8ToCss(val);
  }
  function setColorValue(id, hex) {
    if (!hex || typeof hex !== 'string' || hex.startsWith('linear-gradient') || hex.startsWith('radial-gradient') || hex.startsWith('conic-gradient')) return;
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
    slider.style.background = `linear-gradient(to right, rgb(${r2},${g2},${b2}) ${adjPct}, transparent ${adjPct}), repeating-conic-gradient(#444 0% 25%, #222 0% 50%) 0 0 / 8px 8px`;
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
    const base = { bg: btnStyle.bg, fg: btnStyle.fg, glow: btnStyle.glow, activeGlow: btnStyle.activeGlow || btnStyle.glow, activeBg: btnStyle.activeBg, font: btnStyle.font, tap: btnStyle.tap, btnRadius: btnStyle.btnRadius ?? 6, fgStroke: btnStyle.fgStroke || '#00000000', fgStrokeW: btnStyle.fgStrokeW ?? 0, fontSize: btnStyle.fontSize ?? 16, fontWeight: btnStyle.fontWeight ?? 400, fontScaleX: btnStyle.fontScaleX ?? 100, border: btnStyle.border || '#00000000', activeBorder: btnStyle.activeBorder || '#00000000' };
    const _cachedVersionColor = localStorage.getItem('_versionColor');
    const TOP_GRID_DEFAULTS = {
      'top-clear-all':     { bg: '#5a1a1aFF', fg: '#ff9999FF' },
      'top-settings':      { bg: '#2a2a2aFF', fg: '#999999FF' },
      'top-date':          { bg: '#00000000', fg: '#666666FF', glow: '#00000000' },
      'top-time':          { bg: '#00000000', fg: '#666666FF', glow: '#00000000' },
      'top-manage-habits': { bg: '#444444FF', fg: '#FFFFFFFF' },
      'top-orient-lock':        { bg: '#2a2a2aFF', fg: '#999999FF', glow: '#00000000' },
      'top-orient-lock-locked': { bg: '#2a2a2aFF', fg: '#99ff99FF', glow: '#00000000' },
      'sg-buttons':       { bg: '#2a2a2aFF', fg: '#aaaaaaFF', glow: '#00000000', border: '#444444FF' },
      'sg-sliders':       { bg: '#2a2a2aFF', fg: '#aaaaaaFF', glow: '#00000000', border: '#444444FF' },
      'sg-clock':         { bg: '#2a2a2aFF', fg: '#aaaaaaFF', glow: '#00000000', border: '#444444FF' },
      'sg-checkboxes':    { bg: '#2a2a2aFF', fg: '#aaaaaaFF', glow: '#00000000', border: '#444444FF' },
      'sg-app':           { bg: '#2a2a2aFF', fg: '#aaaaaaFF', glow: '#00000000', border: '#444444FF' },
      'sg-tables':        { bg: '#2a2a2aFF', fg: '#aaaaaaFF', glow: '#00000000', border: '#444444FF' },
      'sg-notifications': { bg: '#2a2a2aFF', fg: '#aaaaaaFF', glow: '#00000000', border: '#444444FF' },
      'sg-swatches':      { bg: '#2a2a2aFF', fg: '#aaaaaaFF', glow: '#00000000', border: '#444444FF' },
      'sg-toggles':       { bg: '#2a2a2aFF', fg: '#aaaaaaFF', glow: '#00000000', border: '#444444FF' },
      'top-version':       { bg: '#444444FF', fg: _cachedVersionColor || '#FFFFFFFF' },
      };
    return Object.assign({}, base, TOP_GRID_DEFAULTS[id] || {}, _btnStyles[id] || {});
  }
  function _saveBtnStyles() { localStorage.setItem("_btnStyles", JSON.stringify(_btnStyles)); }
  function _applyTextStyle(el, s) {
  if (!el) return;
  const fgStops = s.fgStops;
  const hasFgGrad = fgStops && fgStops.length >= 2;
  const strokeW = s.fgStrokeW ?? btnStyle.fgStrokeW ?? 0;
  const _fgSv = s.fgStroke ?? btnStyle.fgStroke ?? '#00000000';
  const _strokeIsGrad = s.fgStrokeStops && s.fgStrokeStops.length >= 2;
  const strokeGrad = _strokeIsGrad
    ? 'linear-gradient(to right,' + s.fgStrokeStops.map(st => hex8ToCss(st.hex8) + ' ' + (st.pos * 100).toFixed(1) + '%').join(',') + ')'
    : null;
  const strokeC = _strokeIsGrad
    ? 'transparent'
    : (typeof _fgSv === 'string' && (_fgSv.startsWith('linear-gradient') || _fgSv.startsWith('radial-gradient')))
      ? (s.fgStrokeStops && s.fgStrokeStops[0] ? hex8ToCss(s.fgStrokeStops[0].hex8) : 'transparent')
      : hex8ToCss(_fgSv);
  el.classList.remove('has-stroke');
  el.style.removeProperty('--_btn-fg');
  el.style.removeProperty('--_btn-fg-grad');
  el.style.removeProperty('--_btn-fg-fill');
  if (strokeW > 0) {
    el.classList.add('has-stroke');
    el.style.webkitTextFillColor = 'transparent';
    el.style.color = 'transparent';
    el.style.paintOrder = 'stroke fill';
    if (_strokeIsGrad) {
      el.style.webkitTextStroke = strokeW + 'px transparent';
      el.style.background = strokeGrad;
      el.style.webkitBackgroundClip = 'text';
      el.style.backgroundClip = 'text';
    } else {
      el.style.webkitTextStroke = strokeW + 'px ' + strokeC;
      el.style.background = '';
      el.style.webkitBackgroundClip = '';
      el.style.backgroundClip = '';
    }
    if (hasFgGrad) {
      const grad = 'linear-gradient(to right,' + fgStops.map(st => hex8ToCss(st.hex8) + ' ' + (st.pos * 100).toFixed(1) + '%').join(',') + ')';
      el.style.setProperty('--_btn-fg-grad', grad);
      el.style.setProperty('--_btn-fg-fill', 'transparent');
    } else {
      el.style.setProperty('--_btn-fg', hex8ToCss(s.fg));
    }
  } else {
    el.style.webkitTextStroke = '';
    el.style.paintOrder = '';
    if (hasFgGrad) {
      const grad = 'linear-gradient(to right,' + fgStops.map(st => hex8ToCss(st.hex8) + ' ' + (st.pos * 100).toFixed(1) + '%').join(',') + ')';
      el.style.background = grad;
      el.style.webkitBackgroundClip = 'text';
      el.style.backgroundClip = 'text';
      el.style.webkitTextFillColor = 'transparent';
      el.style.color = 'transparent';
    } else {
      el.style.background = '';
      el.style.webkitBackgroundClip = '';
      el.style.backgroundClip = '';
      el.style.webkitTextFillColor = hex8ToCss(s.fg);
      el.style.color = hex8ToCss(s.fg);
    }
  }
  el.style.fontWeight = String(s.fontWeight ?? btnStyle.fontWeight ?? 400);
  el.style.transform = 'scaleX(' + ((s.fontScaleX ?? btnStyle.fontScaleX ?? 100) / 100) + ')';
}
window._applyTextStyle = _applyTextStyle;
  function applyBtnStyle(skipHabitsBtn) {
    buttonsEl.style.setProperty("--btn-bg",        _bgCss(btnStyle.bg));
    buttonsEl.style.setProperty("--btn-fg",        hex8ToCss(btnStyle.fg));
    buttonsEl.style.setProperty("--btn-font",      btnStyle.font);
    buttonsEl.style.setProperty("--btn-glow",      hex8ToCss(btnStyle.glow));
    buttonsEl.style.setProperty("--btn-active-glow", hex8ToCss(btnStyle.activeGlow || btnStyle.glow));
    buttonsEl.style.setProperty("--btn-active-bg", _bgCss(btnStyle.activeBg));
    buttonsEl.style.setProperty("--btn-border", hex8ToCss(btnStyle.border || '#00000000'));
    buttonsEl.style.setProperty("--btn-active-border", hex8ToCss(btnStyle.activeBorder || '#00000000'));
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
    document.documentElement.style.setProperty("--slider-btn-gap",      (btnStyle.sliderBtnGap ?? 0) + "px");
    const _sbGap = (btnStyle.sliderBtnGap ?? 0) + 'px';
    document.querySelectorAll('.slider-step-minus').forEach(b => b.style.marginRight = _sbGap);
    document.querySelectorAll('.slider-step-plus').forEach(b => b.style.marginLeft = _sbGap);
    document.documentElement.style.setProperty("--slider-btn-bg",     hex8ToCss(btnStyle.sliderBtnBg     || '#2a2a2aFF'));
    document.documentElement.style.setProperty("--slider-btn-fg",     hex8ToCss(btnStyle.sliderBtnFg     || '#aaaaaaFF'));
    document.documentElement.style.setProperty("--slider-btn-border", hex8ToCss(btnStyle.sliderBtnBorder || '#555555FF'));
    document.documentElement.style.setProperty("--slider-btn-w",      (btnStyle.sliderBtnW ?? 22) + "px");
    document.documentElement.style.setProperty("--slider-btn-h",      (btnStyle.sliderBtnH ?? 22) + "px");
    document.documentElement.style.setProperty("--slider-btn-r",      (btnStyle.sliderBtnR ?? 4)  + "px");
    document.querySelectorAll('.slider-step-minus, .slider-step-plus').forEach(b => {
      b.style.width        = (btnStyle.sliderBtnW ?? 22) + 'px';
      b.style.height       = (btnStyle.sliderBtnH ?? 22) + 'px';
      b.style.borderRadius = (btnStyle.sliderBtnR ?? 4)  + 'px';
    });
    document.documentElement.style.setProperty("--slider-fill-color",    _bgCss(btnStyle.sliderFill   || '#9659FFFF'));
    document.documentElement.style.setProperty("--slider-track-bg",      _bgCss(btnStyle.sliderTrack  || '#333333FF'));
    document.documentElement.style.setProperty("--slider-handle-color",  _bgCss(btnStyle.sliderHandle || '#FFFFFFFF'));
    document.documentElement.style.setProperty("--slider-handle-border", _bgCss(btnStyle.sliderHandleBorder || '#00000000'));
    let _sliderGlowStyle = document.getElementById('_slider-glow-style');
    if (!_sliderGlowStyle) { _sliderGlowStyle = document.createElement('style'); _sliderGlowStyle.id = '_slider-glow-style'; document.head.appendChild(_sliderGlowStyle); }
    const _hGlow = hex8ToCss(btnStyle.sliderHandleGlow || '#FFFFFF00');
    const _haGlow = hex8ToCss(btnStyle.sliderHandleActiveGlow || '#FFFFFFD9');
    _sliderGlowStyle.textContent =
      '.alpha-slider::-webkit-slider-thumb, #zoom-slider::-webkit-slider-thumb, #cp-popup input[type=range]::-webkit-slider-thumb { box-shadow: 0 0 8px 4px ' + _hGlow + ' !important; }\n' +
      '.alpha-slider::-moz-range-thumb, #zoom-slider::-moz-range-thumb, #cp-popup input[type=range]::-moz-range-thumb { box-shadow: 0 0 8px 4px ' + _hGlow + ' !important; }\n' +
      '.alpha-slider.handle-active::-webkit-slider-thumb, #zoom-slider.handle-active::-webkit-slider-thumb { box-shadow: 0 0 8px 4px ' + _haGlow + ' !important; }\n' +
      '.alpha-slider.handle-active::-moz-range-thumb, #zoom-slider.handle-active::-moz-range-thumb { box-shadow: 0 0 8px 4px ' + _haGlow + ' !important; }';
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
    document.documentElement.style.setProperty("--toggle-off-bg",     hex8ToCss(btnStyle.toggleOffBg    || '#333333FF'));
    document.documentElement.style.setProperty("--toggle-on-bg",      hex8ToCss(btnStyle.toggleOnBg     || '#1a5a1aFF'));
    document.documentElement.style.setProperty("--toggle-switch-off",   hex8ToCss(btnStyle.toggleSwitchOff  || '#666666FF'));
    document.documentElement.style.setProperty("--toggle-switch-on",    hex8ToCss(btnStyle.toggleSwitchOn   || '#99ff99FF'));
    document.documentElement.style.setProperty("--toggle-border-off", hex8ToCss(btnStyle.toggleBorderOff|| '#555555FF'));
    document.documentElement.style.setProperty("--toggle-border-on",  hex8ToCss(btnStyle.toggleBorderOn || '#2a7a2aFF'));
    document.documentElement.style.setProperty("--toggle-w",          (btnStyle.toggleW        ?? 44) + 'px');
    document.documentElement.style.setProperty("--toggle-h",          (btnStyle.toggleH        ?? 24) + 'px');
    document.documentElement.style.setProperty("--toggle-switch-size",  (btnStyle.toggleSwitchSize ?? 16) + 'px');
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
  if (_btn) {
    _btn.style.borderRadius = (_s.btnRadius ?? btnStyle.btnRadius ?? 6) + 'px';
    _btn.style.fontSize = (_s.fontSize ?? btnStyle.fontSize ?? 16) + 'px';
    _btn.style.borderWidth = '1px';
    _btn.style.borderStyle = 'solid';
    _btn.style.borderColor = hex8ToCss(_s.border || '#00000000');
    let _tspan = _btn.querySelector('.btn-text-label');
    if (!_tspan && _btn.textContent.trim() && !_btn.querySelector('svg')) {
      _tspan = document.createElement('span');
      _tspan.className = 'btn-text-label';
      _tspan.dataset.text = _btn.textContent.trim();
      _tspan.textContent = _btn.textContent.trim();
      _btn.textContent = '';
      _btn.appendChild(_tspan);
    }
    if (_tspan) _applyTextStyle(_tspan, _s);
  }
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
      if (_habBtn) {
  _habBtn.style.borderRadius = _habRadius + 'px';
  _habBtn.style.fontSize = (_hs.fontSize ?? btnStyle.fontSize ?? 16) + 'px';
  _habBtn.style.borderWidth = '1px';
  _habBtn.style.borderStyle = 'solid';
  _habBtn.style.borderColor = hex8ToCss(_hs.border || '#00000000');
  let _htspan = _habBtn.querySelector('.btn-text-label');
  if (!_htspan) {
    const _htxt = _habBtn.textContent.trim();
    if (_htxt) {
      _htspan = document.createElement('span');
      _htspan.className = 'btn-text-label';
      _htspan.dataset.text = _htxt;
      _htspan.textContent = _htxt;
      _habBtn.textContent = '';
      _habBtn.appendChild(_htspan);
    }
  } else {
    _htspan.dataset.text = _htspan.textContent.trim();
  }
  if (_htspan) _applyTextStyle(_htspan, _hs);
}
    }
    const _dateSpan = document.querySelector('.top-item[data-item="date"] span');
    const _timeSpan = document.querySelector('.top-item[data-item="time"] span');
    if (_dateSpan) { _dateSpan.classList.add('btn-text-label'); _dateSpan.style.fontFamily = _btnStyleFor('top-date').font; _dateSpan.style.fontSize = (_btnStyles['top-date']?.clockDateSize ?? _btnStyles['top-date']?.fontSize ?? btnStyle.fontSize ?? 16) + 'px'; _applyTextStyle(_dateSpan, _btnStyleFor('top-date')); }
if (_timeSpan) { _timeSpan.classList.add('btn-text-label'); _timeSpan.style.fontFamily = _btnStyleFor('top-time').font; _timeSpan.style.fontSize = (_btnStyles['top-time']?.clockTimeSize ?? _btnStyles['top-time']?.fontSize ?? btnStyle.fontSize ?? 16) + 'px'; _applyTextStyle(_timeSpan, _btnStyleFor('top-time')); }
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
      if (_vNumSpan) { _vNumSpan.style.fontFamily = _btnStyleFor('top-version').font; _vNumSpan.style.fontSize = (_btnStyleFor('top-version').fontSize ?? btnStyle.fontSize ?? 16) + 'px'; }
    if (_vBtn) {
      let _vTapX = 0, _vTapY = 0;
_vBtn.onpointerdown = (e) => { _vTapX = e.clientX; _vTapY = e.clientY; _versionItem.style.background = hex8ToCss(_btnStyleFor('top-version').tap); };
_vBtn.onpointermove = (e) => { if (Math.hypot(e.clientX - _vTapX, e.clientY - _vTapY) > 6) _versionItem.style.background = _bgCss(_btnStyleFor('top-version').bg); };
      _vBtn.onpointerleave = () => { _versionItem.style.background = _bgCss(_btnStyleFor('top-version').bg); };
      _vBtn.onpointerup = () => {
        _versionItem.style.background = _bgCss(_btnStyleFor('top-version').bg);
        if(localStorage.getItem('_versionUpdatePending')==='1'){
          const _prevStyle=localStorage.getItem('_versionPrevStyle');
          if(_prevStyle){try{const _ps=JSON.parse(_prevStyle);_btnStyles['top-version']=Object.assign({},_btnStyles['top-version']||{},_ps);localStorage.setItem('_btnStyles',JSON.stringify(_btnStyles));applyBtnStyle();}catch{}}
          else{const _prev=localStorage.getItem('_versionPrevFg');if(_prev){_btnStyles['top-version']=Object.assign({},_btnStyles['top-version']||{},{fg:_prev});localStorage.setItem('_btnStyles',JSON.stringify(_btnStyles));applyBtnStyle();}}
          localStorage.removeItem('_versionUpdatePending');
          localStorage.removeItem('_versionPrevStyle');
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
    if (_versionNumSpan) { _versionNumSpan.style.visibility = ''; _versionNumSpan.classList.add('btn-text-label'); _versionNumSpan.dataset.text = _versionNumSpan.textContent.trim(); _applyTextStyle(_versionNumSpan, _btnStyleFor('top-version')); }
    if (_versionStatsSpan) { _versionStatsSpan.style.color = _versionColor; _versionStatsSpan.style.opacity = '0.4'; }
    ['sg-buttons','sg-sliders','sg-clock','sg-checkboxes','sg-app','sg-tables','sg-notifications','sg-swatches','sg-toggles'].forEach(id => {
      const el = document.querySelector(`.settings-group-item[data-group="${id}"]`);
      if (!el) return;
      const _s = _btnStyleFor(id);
      el.style.background = _bgCss(_s.bg);
      el.style.color = hex8ToCss(_s.fg);
      el.style.fontFamily = _s.font;
      el.style.fontSize = (_s.fontSize ?? btnStyle.fontSize ?? 16) + 'px';
      el.style.borderRadius = (_s.btnRadius ?? btnStyle.btnRadius ?? 6) + 'px';
      el.style.boxShadow = `0 0 8px 3px ${hex8ToCss(_s.glow)}`;
      el.style.border = '1px solid ' + hex8ToCss(_s.border || '#444444FF');
      el.style.setProperty('--sg-active-glow', hex8ToCss(_s.activeGlow || _s.glow));
      let _sgspan = el.querySelector('.btn-text-label');
      if (!_sgspan) {
        const _sgtxt = el.textContent.trim();
        _sgspan = document.createElement('span');
        _sgspan.className = 'btn-text-label';
        _sgspan.dataset.text = _sgtxt;
        _sgspan.textContent = _sgtxt;
        el.textContent = '';
        el.appendChild(_sgspan);
      } else {
        _sgspan.dataset.text = _sgspan.textContent.trim();
      }
      if (_sgspan) _applyTextStyle(_sgspan, _s);
    });
    buttonsEl.querySelectorAll(".tracker-btn[data-id]").forEach(btn => {
      const s = _btnStyleFor(btn.dataset.id);
      btn.style.setProperty("--btn-bg",        _bgCss(s.bg));
      btn.style.setProperty("--btn-fg",        hex8ToCss(s.fg));
      btn.style.setProperty("--btn-glow",      hex8ToCss(s.glow));
      btn.style.setProperty("--btn-active-glow", hex8ToCss(s.activeGlow || s.glow));
      btn.style.setProperty("--btn-active-bg", _bgCss(s.activeBg));
      btn.style.setProperty("--btn-border", hex8ToCss(s.border || '#00000000'));
      btn.style.setProperty("--btn-active-border", hex8ToCss(s.activeBorder || s.border || '#00000000'));
      btn.style.setProperty("--btn-font",      s.font);
      btn.style.fontFamily = s.font;
      btn.style.borderRadius = (s.btnRadius ?? btnStyle.btnRadius ?? 6) + 'px';
      btn.style.fontSize = (s.fontSize ?? btnStyle.fontSize ?? 16) + 'px';
      const _tspan = btn.querySelector('.btn-text-label'); if (_tspan) _applyTextStyle(_tspan, s);
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

