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
  function _gBuildCSS(stops) {
    if (!stops || stops.length < 2) return null;
    return 'linear-gradient(to right,' + stops.map(s => h8css(s.hex8)+' '+(s.pos*100).toFixed(1)+'%').join(',') + ')';
  }
  function _gLoad() {
    if (!activeSwatch) { _ga = null; _gSel = 0; return; }
    const inp = activeSwatch.querySelector('input[type="color"]');
    _ga   = inp && _gd[inp.id] ? _gd[inp.id].map(s => ({...s})) : null;
    _gSel = 0;
  }
  function _gSave() {
    if (!activeSwatch) return;
    const inp = activeSwatch.querySelector('input[type="color"]');
    if (inp) _gd[inp.id] = _ga ? _ga.map(s => ({...s})) : null;
  }
  function _gLoadHandle(i) {
    if (!_ga || !_ga[i] || _ga[i].isPercent) return;
    const [r,g,b] = hexToRgb(_ga[i].hex8.slice(0,7));
    [H,S,B] = rgbToHsb(r,g,b);
    const aEl = popup && popup.querySelector('#cp-alpha');
    if (aEl) aEl.value = parseInt(_ga[i].hex8.slice(7,9)||'ff',16);
    refreshTracks(); refreshAlphaTrack();
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
      const _cv = cssVars();
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
        if (Date.now() - _gRenderTime < 150) return;
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
        _gSave(); _cpRefreshSwatch();
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
    _gSave(); _cpRefreshSwatch();
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
      w:       g('--slider-w')            || '100%',
    };
  }

  function injectThumbCSS(v) {
    if (styleTag) styleTag.remove();
    styleTag = document.createElement('style');
    styleTag.id = 'cp-thumb-style';
    const _holeInject = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--slider-handle-hole').trim()) || 0;
    styleTag.textContent = `
      #cp-popup input[type=range]::-webkit-slider-thumb {
        -webkit-appearance:none; width:${v.hW}; height:${v.hH};
        border-radius:${v.hR}; background:radial-gradient(circle, transparent calc(${_holeInject} * 1%), ${v.hColor} calc(${_holeInject} * 1%));
        border:1px solid ${v.hBorder}; cursor:pointer; box-sizing:border-box;
      }
      #cp-popup input[type=range]::-moz-range-thumb {
        width:${v.hW}; height:${v.hH}; border-radius:${v.hR};
        background:radial-gradient(circle, transparent calc(${_holeInject} * 1%), ${v.hColor} calc(${_holeInject} * 1%));
        border:1px solid ${v.hBorder};
        cursor:pointer; box-sizing:border-box;
      }`;
    document.head.appendChild(styleTag);
  }

  function sliderCSS(v) {
    return `width:${v.w};height:${v.height};border-radius:${v.spread}/${v.radius};` +
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

  function refreshAlphaTrack() {
    if (!popup) return;
    const alphaEl = popup.querySelector('#cp-alpha');
    if (!alphaEl) return;
    const [r,g,b] = hsbToRgb(H, S, B);
    const pct = parseInt(alphaEl.value) / 255 * 100;
    const adjPct = `calc(${pct/100} * (100% - var(--slider-handle-w,16px)) + var(--slider-handle-w,16px) / 2)`;
    const a = (parseInt(alphaEl.value) / 255).toFixed(3);
    alphaEl.style.background = `linear-gradient(to right, rgba(${r},${g},${b},0), rgba(${r},${g},${b},1))`;
  }

  function commitAlpha(v) {
    if (!activeSwatch) return;
    const inp = activeSwatch.querySelector('input[type="color"]');
    if (!inp) return;
    if (_ga && _ga[_gSel] && !_ga[_gSel].isPercent) {
      const [rc,gc,bc] = hsbToRgb(H,S,B);
      const a = Math.round(Number(v));
      _ga[_gSel].hex8 = '#' + [rc,gc,bc,a].map(x => x.toString(16).padStart(2,'0').toUpperCase()).join('');
      _gSave();
    }
    const realAlpha = document.getElementById(inp.id + '-alpha');
    if (realAlpha) { realAlpha.value = v; realAlpha.dispatchEvent(new Event('input', {bubbles:true})); }
    const [r,g,b] = hsbToRgb(H, S, B);
    const hex = rgbToHex(r,g,b);
    const aHex = Math.round(Number(v)).toString(16).padStart(2,'0').toUpperCase();
    const _hexEl = popup && popup.querySelector('#cp-hex');
    if (_hexEl) _hexEl.value = '#' + hex.replace('#','') + aHex;
    refreshAlphaTrack();
    _gRender();
  }

  function commitColor() {
    const [r,g,b] = hsbToRgb(H, S, B);
    const hex = rgbToHex(r,g,b);
    const _hexEl = popup ? popup.querySelector('#cp-hex') : null;
    if (_hexEl) {
      const alphaEl = popup.querySelector('#cp-alpha');
      const aVal = alphaEl ? parseInt(alphaEl.value) : 255;
      const aHex = aVal.toString(16).padStart(2,'0').toUpperCase();
      _hexEl.value = '#' + hex.replace('#','') + aHex;
    }
    refreshTracks();
    refreshAlphaTrack();
    if (!activeSwatch) return;
    const inp = activeSwatch.querySelector('input[type="color"]');
    if (_ga && _ga[_gSel] && !_ga[_gSel].isPercent) {
      const aEl = popup && popup.querySelector('#cp-alpha');
      const a   = aEl ? parseInt(aEl.value) : 255;
      const [rc,gc,bc] = hsbToRgb(H,S,B);
      _ga[_gSel].hex8 = '#' + [rc,gc,bc,a].map(v => v.toString(16).padStart(2,'0').toUpperCase()).join('');
      _gSave();
    }
    if (inp) { inp.value = hex.toLowerCase(); inp.dispatchEvent(new Event('input', {bubbles:true})); }
    _gRender();
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
    overlay.addEventListener('pointermove', e => { if (active) { update(e.clientX); e.preventDefault(); } });
    overlay.addEventListener('pointerup',     () => { active = false; cachedRect = null; window._cpActiveDrag = false; });
    overlay.addEventListener('pointercancel', () => { active = false; cachedRect = null; window._cpActiveDrag = false; });
  }

  function buildPopup() {
    const v = cssVars(), c = cpCfg();
    const bgIsGrad = c.bg && typeof c.bg === 'string' && (c.bg.startsWith('linear-gradient') || c.bg.startsWith('radial-gradient'));
    const bg  = bgIsGrad ? c.bg : h8css(c.bg);
    const brIsGrad = c.border && typeof c.border === 'string' && (c.border.startsWith('linear-gradient') || c.border.startsWith('radial-gradient'));
    const br = brIsGrad ? c.border : h8css(c.border);
    const bgLayer = brIsGrad ? (bgIsGrad ? bg : `linear-gradient(${bg}, ${bg})`) : bg;
    const _lblGrad = c.labelStops ? _gBuildCSS(c.labelStops) : (typeof c.label === 'string' && (c.label.startsWith('linear-gradient') || c.label.startsWith('radial-gradient'))) ? c.label : null;
    const lbl = _lblGrad || h8css(typeof c.label === 'string' ? c.label : '#bbbbbbFF');
    const _txtGrad = c.textStops ? _gBuildCSS(c.textStops) : (typeof c.text === 'string' && (c.text.startsWith('linear-gradient') || c.text.startsWith('radial-gradient'))) ? c.text : null;
    const txt = _txtGrad || h8css(typeof c.text === 'string' ? c.text : '#FFFFFFFF');
    const sb = h8css((typeof btnStyle !== 'undefined' && btnStyle.sliderBorder) || '#555555FF');
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
  `<div style="display:flex;gap:calc(${v.hW} * 1.5);align-items:center;">` +
    `<button id="cp-grad-minus" style="background:#2a2a2a;border:1px solid ${sb};border-radius:4px;color:#aaa;cursor:pointer;width:22px;height:22px;font-size:16px;line-height:1;padding:0;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">&#8722;</button>` +
    `<div style="position:relative;height:${v.height};flex:1;max-width:${v.w};">` +
  `<div id="cp-grad-strip" style="position:absolute;inset:0;border-radius:${v.spread}/${v.radius};border:1px solid ${sb};background:#333;"></div>` +
      `<div id="cp-grad-hw"    style="position:absolute;inset:0;overflow:visible;pointer-events:none;"></div>` +
    `</div>` +
    `<button id="cp-grad-plus"  style="background:#2a2a2a;border:1px solid ${sb};border-radius:4px;color:#aaa;cursor:pointer;width:22px;height:22px;font-size:16px;line-height:1;padding:0;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">+</button>` +
  `</div>` +
  `<div><div class="cp-field-label" style="${ls}">Hue</div>` +
    `<input id="cp-hue" type="range" min="0" max="360" value="${H}" style="${ss}"></div>` +
  `<div><div class="cp-field-label" style="${ls}">Saturation</div>` +
    `<input id="cp-sat" type="range" min="0" max="100" value="${S}" style="${ss}"></div>` +
  `<div><div class="cp-field-label" style="${ls}">Brightness</div>` +
    `<input id="cp-bri" type="range" min="0" max="100" value="${B}" style="${ss}"></div>` +
`<div><div class="cp-field-label" style="${ls}">Alpha</div>` +
  `<input id="cp-alpha" type="range" min="0" max="255" value="255" style="${ss}"></div>` +
`<div style="display:flex;gap:6px;align-items:center;margin-top:2px;">` +
  `<input id="cp-hex" type="text" maxlength="9" ` +
    `style="flex:1;min-width:0;background:#111;border:1px solid ${sb};border-radius:4px;padding:4px 6px;font-size:12px;font-family:monospace;outline:none;text-transform:uppercase;letter-spacing:0.04em;${_txtGrad ? `background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-image:${_txtGrad};color:transparent;` : `color:${txt};`}" ` +
    `spellcheck="false" autocomplete="off">` +
  `<button id="cp-copy" style="background:#2a2a2a;border:1px solid ${sb};border-radius:4px;color:#aaa;cursor:pointer;padding:4px 8px;font-size:12px;flex-shrink:0;">Copy</button>` +
`</div>`;
el.querySelectorAll('.cp-field-label').forEach(function(label) {
    const grad = c.textStops ? _gBuildCSS(c.textStops) : null;
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
      label.style.cssText = 'font-size:11px;color:' + (txt || 'rgba(255,255,255,1)') + ';margin-bottom:2px;';
    }
  });
  document.body.appendChild(el);

  makeDragger(el.querySelector('#cp-hue'), v => { H = v; commitColor(); });
  makeDragger(el.querySelector('#cp-sat'), v => { S = v; commitColor(); });
  makeDragger(el.querySelector('#cp-bri'), v => { B = v; commitColor(); });
  makeDragger(el.querySelector('#cp-alpha'), v => { commitAlpha(v); });

  el.querySelector('#cp-hex').addEventListener('input', function() {
    let val = this.value.replace(/[^0-9a-fA-F#]/g,'');
    if (val && !val.startsWith('#')) val = '#' + val;
    const h = val.replace('#','');
    if ((h.length === 6 || h.length === 8) && /^[0-9a-fA-F]+$/.test(h)) {
      const r2 = parseInt(h.slice(0,2),16), g2 = parseInt(h.slice(2,4),16), b2 = parseInt(h.slice(4,6),16);
      [H,S,B] = rgbToHsb(r2,g2,b2);
      if (activeSwatch) {
        const inp = activeSwatch.querySelector('input[type="color"]');
        if (inp) { inp.value = '#'+h.slice(0,6).toLowerCase(); inp.dispatchEvent(new Event('input',{bubbles:true})); }
        if (h.length === 8) {
          const aVal = parseInt(h.slice(6,8),16);
          const realAlpha = document.getElementById(inp.id + '-alpha');
          if (realAlpha) { realAlpha.value = aVal; realAlpha.dispatchEvent(new Event('input',{bubbles:true})); }
          const alphaEl = popup.querySelector('#cp-alpha');
          if (alphaEl) { alphaEl.value = aVal; refreshAlphaTrack(); }
        }
      }
      refreshTracks();
    }
  });
  el.querySelector('#cp-hex').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); this.blur(); }
  });

  const _cpCopyBtn = el.querySelector('#cp-copy');
  _cpCopyBtn.addEventListener('pointerdown', e => e.stopPropagation());
  _cpCopyBtn.addEventListener('click', function() {
    const hexEl = popup ? popup.querySelector('#cp-hex') : null;
    if (!hexEl) return;
    navigator.clipboard.writeText(hexEl.value).then(() => {
      this.textContent = 'Copied'; this.style.color = '#99ff99';
      setTimeout(() => { this.textContent = 'Copy'; this.style.color = '#aaa'; }, 1200);
    }).catch(() => {});
  });

  el.querySelector('#cp-grad-minus').addEventListener('pointerdown', e => e.stopPropagation());
  el.querySelector('#cp-grad-minus').addEventListener('click',       e => { e.stopPropagation(); _gMinus(); });
  el.querySelector('#cp-grad-plus').addEventListener('pointerdown',  e => e.stopPropagation());
  el.querySelector('#cp-grad-plus').addEventListener('click',        e => { e.stopPropagation(); _gPlus(); });
  _gRender();

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
    const wasOpen = !!popup;
    const savedLeft = popup ? popup.style.left : null;
    const savedTop  = popup ? popup.style.top  : null;
    close();
    const inp = swatch.querySelector('input[type="color"]');
    if (!inp) return;
    [H,S,B] = rgbToHsb(...hexToRgb(inp.value));
    activeSwatch = swatch;
    _gLoad();
    popup = buildPopup();
    if (wasOpen && savedLeft && savedTop) {
      popup.style.left = savedLeft;
      popup.style.top  = savedTop;
    } else {
      position(swatch);
    }
    const _realAlpha = document.getElementById(inp.id + '-alpha');
    const _popupAlpha = popup.querySelector('#cp-alpha');
    if (_realAlpha && _popupAlpha) _popupAlpha.value = _realAlpha.value;
    const _realHex = document.getElementById(inp.id + '-hex');
    const _hexInit = popup.querySelector('#cp-hex');
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
    _gRender();
    setTimeout(() => document.addEventListener('pointerdown', tapOut), 80);
  }

  function close() {
    if (popup)    { popup.remove();    popup    = null; }
    if (styleTag) { styleTag.remove(); styleTag = null; }
    _gSave();
    activeSwatch = null;
    document.removeEventListener('pointerdown', tapOut);
  }

  function tapOut(e) {
    if (!popup) return;
    if (!popup.contains(e.target) && !e.target.closest('.color-swatch-wrap') && !e.target.closest('#settings-footer')) close();
  }

  // ── Intercept all swatch pointerdowns ──────────────────────
  let _swatchDownX = null, _swatchDownY = null, _swatchDownEl = null;

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
    _swatchDownX = e.clientX; _swatchDownY = e.clientY; _swatchDownEl = sw;
  }, true);

  document.addEventListener('pointerup', function(e) {
    if (!_swatchDownEl) return;
    const sw = _swatchDownEl;
    const moved = Math.hypot(e.clientX - (_swatchDownX || 0), e.clientY - (_swatchDownY || 0));
    _swatchDownX = null; _swatchDownY = null; _swatchDownEl = null;
    if (moved > 8) return;
    activeSwatch === sw ? close() : openFor(sw);
  }, true);

  document.addEventListener('pointercancel', function() {
    _swatchDownX = null; _swatchDownY = null; _swatchDownEl = null;
  }, true);

  // ── Public API ─────────────────────────────────────────────
  window._cpClose = close;
  window._cpSyncUI = function () {
    if (typeof setColorValue !== 'function') return;
    const c = cpCfg();
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
    _applyLabelToSwatches();
  };
  function _applyLabelToSwatches() {
    const c = cpCfg();
    const fillGrad = c.labelStops ? _gBuildCSS(c.labelStops) : (c.label && typeof c.label === 'string' && (c.label.startsWith('linear-gradient') || c.label.startsWith('radial-gradient'))) ? c.label : null;
    const outlineColor = c.labelOutline ? h8css(c.labelOutline) : 'rgba(0,0,0,1)';
    const outlineGrad = c.labelBorderStops ? _gBuildCSS(c.labelBorderStops) : null;
    let lbStyleTag = document.getElementById('_swatch-label-pseudo-style');
    if (!lbStyleTag) {
      lbStyleTag = document.createElement('style');
      lbStyleTag.id = '_swatch-label-pseudo-style';
      document.head.appendChild(lbStyleTag);
    }
    // ::before is now the FILL (z-index:1 in CSS, paints on top of the stroke on the main element)
    if (fillGrad) {
      lbStyleTag.textContent = `.color-swatch-label::before { background: ${fillGrad}; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; -webkit-text-stroke: 0; }`;
    } else {
      const _fc = h8css(typeof c.label === 'string' && !c.label.startsWith('linear-gradient') && !c.label.startsWith('radial-gradient') ? c.label : '#bbbbbbFF');
      lbStyleTag.textContent = `.color-swatch-label::before { -webkit-text-fill-color: ${_fc}; background: none; color: ${_fc}; -webkit-text-stroke: 0; }`;
    }
    // Main element carries the STROKE only, fill transparent so ::before shows through
    document.querySelectorAll('.color-swatch-label').forEach(function(el) {
      el.dataset.text = el.textContent.trim();
      el.style.textShadow = '';
      el.style.paintOrder = 'stroke fill';
      el.style.webkitTextFillColor = 'transparent';
      el.style.color = 'transparent';
      el.style.display = 'inline-block';
      if (outlineGrad) {
        el.style.webkitTextStroke = '3px transparent';
        el.style.background = outlineGrad;
        el.style.webkitBackgroundClip = 'text';
        el.style.backgroundClip = 'text';
      } else {
        el.style.webkitTextStroke = '0.5px ' + outlineColor;
        el.style.background = '';
        el.style.webkitBackgroundClip = '';
        el.style.backgroundClip = '';
      }
    });
  }
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
    }));
    _applyLabelToSwatches();
  };
  window._cpRebuild = function () {
    if (popup && activeSwatch) { const sw = activeSwatch; const savedSel = _gSel; close(); openFor(sw); _gSel = savedSel; _gRender(); }
  };
  window._cpGetGradient      = id => { const s = _gd[id]; return s ? _gBuildCSS(s) : null; };
  window._cpGetGradientStops = id => { const s = _gd[id]; return s ? s.map(x => ({...x})) : null; };
  window._cpSetGradientStops = function(id, stops) { _gd[id] = stops ? stops.map(s => ({...s})) : null; };
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
  const _realAlpha = document.getElementById(inp.id + '-alpha');
  const _alphaEl = popup.querySelector('#cp-alpha');
  if (_realAlpha && _alphaEl) _alphaEl.value = _realAlpha.value;
  const _realHex = document.getElementById(inp.id + '-hex');
  const _hexEl2 = popup.querySelector('#cp-hex');
  if (_realHex && _hexEl2) _hexEl2.value = _realHex.value;
  refreshTracks();
  refreshAlphaTrack();
  };
})();