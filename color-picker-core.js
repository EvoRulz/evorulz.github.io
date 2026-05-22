// @version 1506
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
  function _cpRefreshSwatch() {
    if (!activeSwatch) return;
    const inp = activeSwatch.querySelector('input[type="color"]');
    if (!inp) return;
    if (typeof updateAlphaSliderBg === 'function') updateAlphaSliderBg(inp.id);
    if (window._cpSaveFromUI) window._cpSaveFromUI();
    if (typeof settingsChange === 'function') settingsChange();
  }
  const _gd   = {};   // stored gradient per swatch: { [inputId]: stops[] | null }
  let   _gdeg  = {};   // stored gradient degree per swatch
  let   _gdRadial = {};
  let   _gdConic  = {};
  let   _gMode    = {};
  let   _ga   = null; // active stops for open popup (null = solid)
  let   _gSel = 0;    // selected handle index
  let   _gRenderTime = 0; // timestamp of last _gRender call
  let H = 0, S = 100, B = 100;
  const CP_DEFAULTS = { bg: '#1c1c1cFF', border: '#555555FF', label: '#bbbbbbFF', text: '#FFFFFFFF', labelOutline: '#000000FF' }
  function cpCfg() {
    try { const s = JSON.parse(localStorage.getItem('_cpSettings')); if (s) return Object.assign({}, CP_DEFAULTS, s); } catch {}
    return Object.assign({}, CP_DEFAULTS);
  }
  function _gHex8() {
    const [r,g,b] = hsbToRgb(H,S,B);
    const aEl = popup && popup.querySelector('#cp-alpha');
    const a   = aEl ? parseInt(aEl.value) : 255;
    return '#' + [r,g,b,a].map(v => v.toString(16).padStart(2,'0').toUpperCase()).join('');
  }
  function _gInterp(ha, hb, t) {
    const p = h => { const s = h.replace('#',''); return [0,2,4,6].map(i => parseInt(s.slice(i,i+2),16)||0); };
    const a = p(ha), b = p(hb);
    return '#' + a.map((v,i) => Math.round(v+(b[i]-v)*t).toString(16).padStart(2,'0').toUpperCase()).join('');
  }
  function _gBuildCSS(stops, deg, mode) {
    if (!stops || stops.length < 2) return null;
    if (mode === 'radial') {
      return 'radial-gradient(circle,' + stops.map(s => h8css(s.hex8)+' '+(s.pos*100).toFixed(1)+'%').join(',') + ')';
    }
    if (mode === 'conic') {
      return 'conic-gradient(from 0deg,' + stops.map(s => h8css(s.hex8)+' '+(s.pos*100).toFixed(1)+'%').join(',') + ')';
    }
    const dir = (deg != null) ? deg + 'deg' : 'to right';
    return 'linear-gradient(' + dir + ',' + stops.map(s => h8css(s.hex8)+' '+(s.pos*100).toFixed(1)+'%').join(',') + ')';
  }
  function _gLoad() {
    if (!activeSwatch) { _ga = null; _gSel = 0; return; }
    const inp = activeSwatch.querySelector('input[type="color"]');
    if (inp && !_gMode[inp.id] && _gd[inp.id]) _gMode[inp.id] = 'linear';
    const mode = inp ? (_gMode[inp.id] || 'solid') : 'solid';
    function _fallbackStops(skip) {
      if (!inp) return null;
      if (skip !== 'linear' && _gd[inp.id] && _gd[inp.id].length >= 2) return _gd[inp.id].map(s => ({...s}));
      if (skip !== 'radial' && _gdRadial[inp.id] && _gdRadial[inp.id].length >= 2) return _gdRadial[inp.id].map(s => ({...s}));
      if (skip !== 'conic' && _gdConic[inp.id] && _gdConic[inp.id].length >= 2) return _gdConic[inp.id].map(s => ({...s}));
      return null;
    }
    if (mode === 'radial') {
      _ga = inp && _gdRadial[inp.id] ? _gdRadial[inp.id].map(s => ({...s})) : _fallbackStops('radial');
    } else if (mode === 'conic') {
      _ga = inp && _gdConic[inp.id] ? _gdConic[inp.id].map(s => ({...s})) : _fallbackStops('conic');
    } else if (mode === 'linear') {
      _ga = inp && _gd[inp.id] ? _gd[inp.id].map(s => ({...s})) : _fallbackStops('linear');
    } else {
      _ga = null;
    }
    _gSel = 0;
    const _degLoadEl = popup && popup.querySelector('#cp-grad-deg');
    const _storedDeg = inp ? (_gdeg[inp.id] ?? 360) : 360;
    if (_degLoadEl) { _degLoadEl.value = _storedDeg; const _dv = popup && popup.querySelector('#cp-grad-deg-val'); if (_dv) _dv.textContent = _storedDeg + '\u00b0'; }
  }
  function _gSave() {
    if (!activeSwatch) return;
    const inp = activeSwatch.querySelector('input[type="color"]');
    const mode = inp ? (_gMode[inp.id] || 'solid') : 'solid';
    if (inp) {
      if (mode === 'radial') {
        _gdRadial[inp.id] = _ga ? _ga.map(s => ({...s})) : null;
      } else if (mode === 'conic') {
        _gdConic[inp.id] = _ga ? _ga.map(s => ({...s})) : null;
      } else if (mode === 'linear') {
        _gd[inp.id] = _ga ? _ga.map(s => ({...s})) : null;
      }
    }
    const _degSaveEl = popup && popup.querySelector('#cp-grad-deg');
    if (inp && _degSaveEl) { const _d = parseInt(_degSaveEl.value, 10); _gdeg[inp.id] = isNaN(_d) ? 360 : _d; }
  }
  function _gLoadHandle(i) {
    if (!_ga || !_ga[i] || _ga[i].isPercent) return;
    const [r,g,b] = hexToRgb(_ga[i].hex8.slice(0,7));
    [H,S,B] = rgbToHsb(r,g,b);
    const aEl = popup && popup.querySelector('#cp-alpha');
    if (aEl) aEl.value = parseInt(_ga[i].hex8.slice(7,9)||'ff',16);
    if (window._cpRefreshTracks) window._cpRefreshTracks();
    if (window._cpRefreshAlphaTrack) window._cpRefreshAlphaTrack();
    const hexEl = popup && popup.querySelector('#cp-hex');
    if (hexEl) hexEl.value = _ga[i].hex8;
  }
  function _gRender() {
    if (!popup) return;
    _gRenderTime = Date.now();
    const strip  = popup.querySelector('#cp-grad-strip');
    const hw     = popup.querySelector('#cp-grad-hw');
    const minBtn = popup.querySelector('#cp-grad-minus');
    const plsBtn = popup.querySelector('#cp-grad-plus');
    if (!strip || !hw) return;
    const solid = _gHex8();
    strip.style.background = _ga
    ? (function() {
      const hw = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--slider-handle-w').trim()) || 16;
      const stripEl = popup && popup.querySelector('#cp-grad-strip');
      const stripW = stripEl ? stripEl.offsetWidth : 200;
      const halfPct = stripW > 0 ? (hw / 2 / stripW * 100) : 0;
      const stops = [];
      _ga.forEach((s, i) => {
        if (!s.isPercent) { stops.push(h8css(s.hex8) + ' ' + (s.pos * 100).toFixed(1) + '%'); return; }
        const prev = _ga[i - 1], next = _ga[i + 1];
        const centerPct = s.pos * 100;
        const leftPct = centerPct - halfPct;
        const rightPct = centerPct + halfPct;
        const trueCenterPct = stripW > 0 ? (hw / 2 + s.pos * (stripW - hw)) / stripW * 100 : centerPct;
        const _prevPos = prev ? prev.pos : 0;
        const _nextPos = next ? next.pos : 1;
        const _denom = _nextPos - _prevPos;
        const _t = _denom > 0 ? (s.pos - _prevPos) / _denom : 0.5;
        stops.push(h8css(_gInterp(prev ? prev.hex8 : next.hex8, next ? next.hex8 : prev.hex8, _t)) + ' ' + trueCenterPct.toFixed(2) + '%');
      });
      return 'linear-gradient(to right,' + stops.join(',') + ')';
    })()
    : h8css(solid);
    hw.innerHTML = '';
    const stops = _ga || [
      {pos:0, hex8:solid, isEnd:true,  isPercent:false},
      {pos:1, hex8:solid, isEnd:true,  isPercent:false},
    ];
    stops.forEach((s, i) => {
      const isL = i===0, isR = i===stops.length-1, isSel = !!_ga && i===_gSel;
      const h = document.createElement('div');
      h.dataset.gi = i;
      if (s.isPercent) h.dataset.isPercent = '1';
      const _cv = window._cpCssVars ? window._cpCssVars() : {hW:'16px',hH:'16px',hR:'3%',hColor:'rgba(255,255,255,1)',hBorder:'transparent',w:'100%',height:'8px',radius:'4%',spread:'4px',border:'#555'};
      const _hw = Math.round(parseFloat(_cv.hW || '16') * 1) + 'px';
      const _hh = Math.round(parseFloat(_cv.hH || '16') * 1) + 'px';
      const _bw = Math.max(1, Math.round(parseFloat(_hw) * 0.10)) + 'px';
      h.style.cssText = [
        'position:absolute','top:50%','transform:translate(-50%,-50%)',
        'width:' + _hw,'height:' + _hh,'border-radius:' + _cv.hR,'box-sizing:border-box',
        'pointer-events:auto','touch-action:none',
        'cursor:' + (isL||isR ? 'pointer' : 'grab'),
        'left:' + (s.pos*100) + '%',
        'z-index:' + (isSel ? 10 : isL||isR ? 3 : 6),
      ].join(';');
      if (s.isPercent) {
        const _holeGrad = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--slider-handle-hole').trim()) || 0;
        h.style.background = 'radial-gradient(circle, transparent calc(' + _holeGrad + ' * 1%), ' + _cv.hColor + ' calc(' + _holeGrad + ' * 1%))';
        h.style.border = '1px solid ' + _cv.hBorder;
        h.style.boxShadow = isSel ? '0 0 8px 4px rgba(255,255,255,0.85)' : '';
        h.innerHTML = '<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:7px;font-weight:bold;pointer-events:none;mix-blend-mode:difference;color:#fff;">%</span>';
      } else {
        const _holeGrad = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--slider-handle-hole').trim()) || 0;
        h.style.background = 'radial-gradient(circle, transparent calc(' + _holeGrad + ' * 1%), ' + _cv.hColor + ' calc(' + _holeGrad + ' * 1%))';
        h.style.border = '1px solid ' + _cv.hBorder;
        h.style.boxShadow = isSel ? '0 0 8px 4px rgba(255,255,255,0.85)' : '';
      }
      let _ghdrag = false, _ghdragMoved = false;
      h.addEventListener('pointerdown', e => {
        if (Date.now() - _gRenderTime < 50) return;
        e.stopPropagation(); e.preventDefault();
        _gSel = i;
        hw.querySelectorAll('[data-gi]').forEach((hh, ii) => {
          const sel = ii===i;
          hh.style.zIndex = sel ? 10 : (ii===0||ii===stops.length-1 ? 3 : 6);
          if (hh.dataset.isPercent === '1') {
            hh.style.borderColor = sel ? '#fff' : '#888';
            hh.style.boxShadow = '0 0 0 1px #000' + (sel ? ',0 0 0 3px rgba(255,255,255,0.4)' : '');
          } else {
            hh.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.7),0 0 0 1px rgba(0,0,0,0.7)' + (sel ? ',0 0 0 3px rgba(255,255,255,0.5)' : '');
          }
        });
        if (!s.isPercent && _ga) {
          _gLoadHandle(i);
        }
        _ghdragMoved = false;
        if (!isL && !isR && _ga) {
          _ghdrag = true;
          h.setPointerCapture(e.pointerId);
        }
      });
      h.addEventListener('pointermove', e => {
        if (!_ghdrag) return;
        _ghdragMoved = true;
        const rect = hw.getBoundingClientRect();
        const p0 = i > 0            ? _ga[i-1].pos + 0.005 : 0.005;
        const p1 = i < _ga.length-1 ? _ga[i+1].pos - 0.005 : 0.995;
        _ga[i].pos = Math.max(p0, Math.min(p1, (e.clientX - rect.left)/rect.width));
        h.style.left = (_ga[i].pos*100) + '%';
        strip.style.background = 'linear-gradient(to right,' +
        _ga.map(s2 => h8css(s2.hex8)+' '+(s2.pos*100).toFixed(1)+'%').join(',') + ')';
      });
      h.addEventListener('pointerup', () => {
        if (_ghdrag) {
          _ghdrag = false;
          if (!_ghdragMoved && s.isPercent && _ga) {
            const _prev = _ga[i - 1], _next = _ga[i + 1];
            const _denom = (_next ? _next.pos : 1) - (_prev ? _prev.pos : 0);
            const _t = _denom > 0 ? (_ga[i].pos - (_prev ? _prev.pos : 0)) / _denom : 0.5;
            _ga[i] = { ..._ga[i], isPercent: false, hex8: _gInterp(_prev ? _prev.hex8 : _next.hex8, _next ? _next.hex8 : _prev.hex8, _t) };
            _gSave();
            _gRender();
            _gLoadHandle(i);
            return;
          }
          _gRender();
          if (_ghdragMoved) { _gSave(); _cpRefreshSwatch(); }
        }
      });
      h.addEventListener('pointercancel', () => { if (_ghdrag) { _ghdrag=false; _ghdragMoved=false; _gRender(); } });
      hw.appendChild(h);
    });
if (minBtn) { minBtn.disabled = !_ga; minBtn.style.opacity = _ga ? '' : '0.4'; }
if (plsBtn) { plsBtn.disabled = !!(_ga&&_ga.length>=10); plsBtn.style.opacity = (_ga&&_ga.length>=10) ? '0.4' : ''; }
}
function _gPlus() {
  const solid = _gHex8();
  if (!_ga) {
    if (activeSwatch) { const _inp = activeSwatch.querySelector('input[type="color"]'); if (_inp && (!_gMode[_inp.id] || _gMode[_inp.id] === 'solid')) _gMode[_inp.id] = 'linear'; }
    _ga = [
      {pos:0,   hex8:solid, isEnd:true,  isPercent:false},
      {pos:0.5, hex8:solid, isEnd:false, isPercent:true },
      {pos:1,   hex8:solid, isEnd:true,  isPercent:false},
    ];
    _gSel = 0;
  } else {
    const pctI = _ga.findIndex((s,j) => j>0 && j<_ga.length-1 && s.isPercent);
    if (pctI !== -1) {
      const denom = _ga[pctI+1].pos - _ga[pctI-1].pos;
      const t = denom > 0 ? (_ga[pctI].pos - _ga[pctI-1].pos)/denom : 0.5;
      _ga[pctI] = { ..._ga[pctI], isPercent:false, hex8: _gInterp(_ga[pctI-1].hex8, _ga[pctI+1].hex8, t) };
      _gSel = pctI;
      _gLoadHandle(pctI);
    } else if (_ga.length < 10) {
      const n = _ga.length + 1;
      const colors = [];
      for (let j=0; j<n; j++) {
        const pos = j/(n-1);
        let c = _ga[0].hex8;
        for (let k=0; k<_ga.length-1; k++) {
          if (pos >= _ga[k].pos && pos <= _ga[k+1].pos) {
            const td = _ga[k+1].pos - _ga[k].pos;
            c = _gInterp(_ga[k].hex8, _ga[k+1].hex8, td>0 ? (pos-_ga[k].pos)/td : 0);
            break;
          }
        }
        colors.push(c);
      }
      _ga = colors.map((hex8,j) => ({pos:j/(n-1), hex8, isEnd:j===0||j===n-1, isPercent:false}));
      _gSel = Math.floor(n/2);
      _gLoadHandle(_gSel);
    }
  }
  _gRender();
  _gSave();
  _cpRefreshSwatch();
}
function _gMinus() {
  if (!_ga) return;
  const mids = [];
  for (let i=1; i<_ga.length-1; i++) mids.push(i);
    if (!mids.length) return;
  if (mids.length > 1) {
    _ga.splice(mids[mids.length-1], 1);
    _ga[0].isEnd = true; _ga[_ga.length-1].isEnd = true;
    if (_gSel >= _ga.length) _gSel = _ga.length-1;
  } else {
    if (_ga[mids[0]].isPercent) { _ga = null; _gSel = 0; }
    else { _ga[mids[0]].isPercent = true; _gSel = 0; }
  }
  _gRender();
  _gSave();
  _cpRefreshSwatch();
}
window._cpMod = {
    get H()           { return H; },           set H(v)           { H = v; },
    get S()           { return S; },           set S(v)           { S = v; },
    get B()           { return B; },           set B(v)           { B = v; },
    get popup()       { return popup; },       set popup(v)       { popup = v; },
    get styleTag()    { return styleTag; },    set styleTag(v)    { styleTag = v; },
    get activeSwatch(){ return activeSwatch; },set activeSwatch(v){ activeSwatch = v; },
    get _ga()         { return _ga; },         set _ga(v)         { _ga = v; },
    get _gSel()       { return _gSel; },       set _gSel(v)       { _gSel = v; },
    get _gRenderTime(){ return _gRenderTime; },
    get _gMode()      { return _gMode; },
    get _gdeg()       { return _gdeg; },
    hsbToRgb:         (...a) => hsbToRgb(...a),
    rgbToHsb:         (...a) => rgbToHsb(...a),
    hexToRgb:         (...a) => hexToRgb(...a),
    rgbToHex:         (...a) => rgbToHex(...a),
    h8css:            (...a) => h8css(...a),
    cpCfg:            ()     => cpCfg(),
    _gHex8:           ()     => _gHex8(),
    _gInterp:         (...a) => _gInterp(...a),
    _gBuildCSS:       (...a) => _gBuildCSS(...a),
    _gLoad:           ()     => _gLoad(),
    _gSave:           ()     => _gSave(),
    _gLoadHandle:     (i)    => _gLoadHandle(i),
    _gRender:         ()     => _gRender(),
    _gPlus:           ()     => _gPlus(),
    _gMinus:          ()     => _gMinus(),
    _cpRefreshSwatch: ()     => _cpRefreshSwatch(),
  };
  window._cpClearGradient    = function(id) { _gd[id] = null; _gdRadial[id] = null; _gdConic[id] = null; _gMode[id] = 'solid'; };
  window._cpH8css            = h8css;
  window._cpBuildCSS         = _gBuildCSS;
  window._cpCfg              = cpCfg;
  window._cpGetGradient      = id => { const mode = _gMode[id]; if (mode === 'solid') return null; if (mode === 'radial') { const s = _gdRadial[id]; return s ? _gBuildCSS(s, null, 'radial') : null; } if (mode === 'conic') { const s = _gdConic[id]; return s ? _gBuildCSS(s, null, 'conic') : null; } const s = _gd[id]; return s ? _gBuildCSS(s, _gdeg[id] ?? 360, 'linear') : null; };
  window._cpGetGradientDeg   = id => _gdeg[id] ?? 360;
  window._cpSetGradientDeg   = (id, deg) => { _gdeg[id] = deg; };
  window._cpGetGradientStops = id => { const mode = _gMode[id]; if (mode === 'solid') return null; const s = mode === 'radial' ? _gdRadial[id] : mode === 'conic' ? _gdConic[id] : _gd[id]; return s ? s.map(x => ({...x})) : null; };
  window._cpSetGradientStops = function(id, stops, mode) {
    if (mode !== undefined) _gMode[id] = mode;
    const m = _gMode[id] || (stops ? 'linear' : 'solid');
    if (m === 'radial') {
      _gdRadial[id] = stops ? stops.map(s => ({...s})) : null;
    } else if (m === 'conic') {
      _gdConic[id] = stops ? stops.map(s => ({...s})) : null;
    } else {
      _gd[id] = stops ? stops.map(s => ({...s})) : null;
      if (stops && stops.length >= 2) { if (_gMode[id] !== 'radial' && _gMode[id] !== 'conic') _gMode[id] = 'linear'; }
      else if (!stops && mode === undefined) { if (_gMode[id] !== 'radial' && _gMode[id] !== 'conic') _gMode[id] = 'solid'; }
    }
  };
  window._cpGetGradientMode  = id => _gMode[id] || 'solid';
  window._cpSetGradientMode  = (id, mode) => { _gMode[id] = mode; };
})();

