 // @version 1578
  // ── Constants ──────────────────────────────────────────────
const MIN_DATE       = new Date("2026-03-14");
const MAX_DATE       = new Date("2111-04-19");
const STATUSES       = ["yes", "no", "idk", "not yet", "n/a"];
const CHUNK          = 30;
const SET_BAR_MAX    = 100;
const TOTAL_BAR_MAX  = 100;
const STREAK_BAR_MAX = 30;
const NUM_SETS       = 10;
  // ── Status colour ──────────────────────────────────────────
function applyStatusColor(el) {
  const v = el.value;
  if      (v === "yes") { el.style.background = "#90EE90"; el.style.color = "#000"; }
  else if (v === "no")  { el.style.background = "#cc0000"; el.style.color = "#fff"; }
  else if (v === "n/a") { el.style.background = "#228B22"; el.style.color = "#fff"; }
  else if (v === "")    { el.style.background = "transparent"; el.style.color = "#fff"; }
  else                  { el.style.background = "#FFD580"; el.style.color = "#000"; }
}
  // ── Confirmation overlay ───────────────────────────────────
let _confirmResolve = null;
function confirmClear(bodyHTML) {
  return new Promise(resolve => {
    _confirmResolve = resolve;
    document.getElementById("confirm-msg").innerHTML =
    bodyHTML + '<br><br>Type <strong>Habit Tracker</strong> and press Enter to confirm.';
    const input = document.getElementById("confirm-input");
    input.value = "";
    document.getElementById("confirm-hint").textContent = "";
    input.classList.remove("shake");
    document.getElementById("confirm-overlay").classList.add("active");
    setTimeout(() => input.focus(), 60);
  });
}
function confirmCancel() {
  document.getElementById("confirm-overlay").classList.remove("active");
  if (_confirmResolve) { _confirmResolve(false); _confirmResolve = null; }
}
document.getElementById("confirm-input").addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  const input = document.getElementById("confirm-input");
  const hint  = document.getElementById("confirm-hint");
  if (input.value === "Habit Tracker") {
    document.getElementById("confirm-overlay").classList.remove("active");
    if (_confirmResolve) { _confirmResolve(true); _confirmResolve = null; }
  } else {
    hint.textContent = "Incorrect — try again.";
    input.classList.remove("shake");
    void input.offsetWidth;
    input.classList.add("shake");
  }
});
document.getElementById("confirm-overlay").addEventListener("click", e => {
  if (e.target === document.getElementById("confirm-overlay")) confirmCancel();
});
  // ── Orientation lock ───────────────────────────────────────
let _orientLocked = false;
const _LOCK_PATH   = '<path fill-rule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1zm3 8V5.5a3 3 0 1 0-6 0V9h6z" clip-rule="evenodd"/>';
const _UNLOCK_PATH = '<path fill-rule="evenodd" d="M14.5 1A4.5 4.5 0 0 0 10 5.5V9H3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1.5V5.5a3 3 0 1 1 6 0v2.75a.75.75 0 0 0 1.5 0V5.5A4.5 4.5 0 0 0 14.5 1z" clip-rule="evenodd"/>';
function _updateOrientBtn() {
  const icon = document.getElementById('orient-lock-icon');
  if (!icon) return;
  icon.innerHTML = _orientLocked ? _LOCK_PATH : _UNLOCK_PATH;
  if (typeof applyBtnStyle === 'function') applyBtnStyle();
}
document.addEventListener('DOMContentLoaded', _updateOrientBtn);
async function toggleOrientLockNoFullscreen() {
  if (_orientLocked) {
    try { await screen.orientation.unlock(); } catch(e) {}
    _orientLocked = false;
    _updateOrientBtn();
    if (window._cfRender) window._cfRender();
    return;
  }
  const t = (screen.orientation && screen.orientation.type) || 'portrait-primary';
  const target = t.startsWith('landscape') ? 'landscape' : 'portrait';
  let locked = false;
  try { await screen.orientation.lock(target); locked = true; } catch(e) {}
  if (!locked && window.AndroidOrientation) {
    try { window.AndroidOrientation.lock(target); locked = true; } catch(e) {}
  }
  _orientLocked = locked;
  _updateOrientBtn();
  if (window._cfRender) window._cfRender();
}
async function toggleOrientLock() {
  if (_orientLocked) {
    try { await screen.orientation.unlock(); } catch(e) {}
    try { document.exitFullscreen && document.exitFullscreen(); } catch(e) {}
    _orientLocked = false;
    _updateOrientBtn();
    if (window._cfRender) window._cfRender();
    return;
  }
  const t = (screen.orientation && screen.orientation.type) || 'portrait-primary';
  const target = t.startsWith('landscape') ? 'landscape' : 'portrait';
  let locked = false;
  try {
    const el = document.documentElement;
    if (el.requestFullscreen) await el.requestFullscreen();
    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
  } catch(e) {}
  try {
    await screen.orientation.lock(target);
    locked = true;
  } catch(e) {}
  if (!locked && window.AndroidOrientation) {
    try { window.AndroidOrientation.lock(target); locked = true; } catch(e) {}
  }
  _orientLocked = locked;
  _updateOrientBtn();
  if (window._cfRender) window._cfRender();
}
(function() {
  const saved = localStorage.getItem('_zoomMain') || localStorage.getItem('_zoom');
  if (saved) {
    const zoom = parseInt(saved);
    const sliderVal = Math.round(zoomToSlider(zoom));
    const content = document.getElementById('zoom-content');
    if (content) {
      if (zoom === 100) {
        content.style.transform = '';
        content.style.transformOrigin = '';
        content.style.height = '';
      } else {
        const scale = zoom / 100;
        content.style.transformOrigin = 'top center';
        content.style.transform = 'scale(' + scale + ')';
        content.style.height = (content.scrollHeight * scale) + 'px';
      }
    }
    const sl = document.getElementById('zoom-slider');
    const lb = document.getElementById('zoom-label');
    if (sl) sl.value = sliderVal;
    if (lb) lb.textContent = zoom + '%';
  }
})();
function sliderToZoom(s) {
  s = Number(s);
  if (s <= 175) return 50 + (s - 50) * 50 / 125;
  return 100 + (s - 175) * 200 / 125;
}
function zoomToSlider(z) {
  z = Number(z);
  if (z <= 100) return 50 + (z - 50) * 125 / 50;
  return 175 + (z - 100) * 125 / 200;
}
function _getActiveZoomCtx() {
  if (document.getElementById('cp-popup')) return 'popup';
  const _so = document.getElementById('settings-overlay');
  if (_so && _so.classList.contains('active')) return 'settings';
  return 'main';
}
function _zoomKey(ctx) {
  return ctx === 'popup' ? '_zoomPopup' : ctx === 'settings' ? '_zoomSettings' : '_zoomMain';
}
function _applyZoom(ctx, zoom, preserveAnchor) {
  const scale = zoom / 100;
  if (ctx === 'popup') {
    const p = document.getElementById('cp-popup');
    if (!p) return;
    if (zoom === 100) { p.style.transform = ''; p.style.transformOrigin = ''; }
    else { p.style.transformOrigin = 'top center'; p.style.transform = 'scale(' + scale + ')'; }
  } else if (ctx === 'settings') {
    const p = document.getElementById('settings-panel');
    const ov = document.getElementById('settings-overlay');
    if (!p) return;
    let wrap = document.getElementById('settings-zoom-wrap');
    let _sFrac = 0;
    if (preserveAnchor && ov) {
      const _maxST = ov.scrollHeight - ov.clientHeight;
      _sFrac = _maxST > 0 ? ov.scrollTop / _maxST : 0;
    }
    if (zoom <= 100) {
      p.style.width = '';
      p.style.marginLeft = '';
      if (zoom === 100) {
        p.style.transform = '';
        p.style.transformOrigin = '';
        p.style.width = '';
        if (wrap && wrap.parentNode) {
          wrap.parentNode.insertBefore(p, wrap);
          wrap.parentNode.removeChild(wrap);
        }
      } else {
        p.style.transformOrigin = 'top center';
        p.style.transform = 'scale(' + scale + ')';
        if (wrap) wrap.style.cssText = 'width:100%;';
      }
      if (ov) { ov.style.overflowX = 'hidden'; ov.scrollLeft = 0; }
      p.style.cursor = '';
    } else {
      const ovW = ov ? ov.clientWidth : window.innerWidth;
      const scaledW = Math.round(ovW * scale);
      const _prevScaleM = p.style.transform.match(/scale\(([^)]+)\)/);
      const prevScaledW = _prevScaleM ? Math.round(ovW * parseFloat(_prevScaleM[1])) : ovW;
      const _savedSL = ov ? ov.scrollLeft : 0;
      let newScrollLeft;
      if (prevScaledW > ovW && ov) {
        const cxFrac = (_savedSL + ovW / 2) / prevScaledW;
        newScrollLeft = Math.round(cxFrac * scaledW - ovW / 2);
        newScrollLeft = Math.max(0, Math.min(newScrollLeft, scaledW - ovW));
      } else {
        newScrollLeft = Math.round((scaledW - ovW) / 2);
      }
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'settings-zoom-wrap';
        p.parentNode.insertBefore(wrap, p);
        wrap.appendChild(p);
      }
      wrap.style.cssText = 'width:' + scaledW + 'px;';
      p.style.width = ovW + 'px';
      p.style.marginLeft = '';
      p.style.transformOrigin = 'top left';
      p.style.transform = 'scale(' + scale + ')';
      if (ov) {
        ov.style.overflowX = 'auto';
        void ov.scrollWidth;
        ov.scrollLeft = newScrollLeft;
        const _slFix = newScrollLeft;
        requestAnimationFrame(() => { if (ov.scrollLeft !== _slFix) ov.scrollLeft = _slFix; });
      }
      p.style.cursor = 'grab';
    }
    if (preserveAnchor && ov) {
      requestAnimationFrame(() => {
        const _newMax = ov.scrollHeight - ov.clientHeight;
        if (_newMax > 0) ov.scrollTop = Math.round(_sFrac * _newMax);
      });
    }
  } else {
    const wrapper = document.getElementById('zoom-wrapper');
    const c = document.getElementById('zoom-content');
    if (!c || !wrapper) return;
    let _anchorTop = null, _anchorLeft = null;
    if (preserveAnchor) {
      const _om = c.style.transform.match(/scale\(([^)]+)\)/);
      const _os = _om ? parseFloat(_om[1]) : 1;
      if (_os > 0) {
        const _vh = wrapper.clientHeight;
        const _vw = wrapper.clientWidth;
        _anchorTop = (wrapper.scrollTop + _vh / 2) * scale / _os - _vh / 2;
        _anchorLeft = (wrapper.scrollLeft + _vw / 2) * scale / _os - _vw / 2;
      }
    }
    c.style.height = '';
    const _naturalH = c.scrollHeight;
    if (zoom === 100) {
      c.style.transform = '';
      c.style.transformOrigin = '';
    } else {
      c.style.transformOrigin = 'top center';
      c.style.transform = 'scale(' + scale + ')';
      c.style.height = (_naturalH * scale) + 'px';
    }
    if (_anchorTop !== null) {
      wrapper.scrollTop = Math.max(0, _anchorTop);
      wrapper.scrollLeft = Math.max(0, _anchorLeft);
    }
  }
}
function _syncSlider(ctx) {
  const saved = parseInt(localStorage.getItem(_zoomKey(ctx))) || 100;
  const sliderVal = Math.round(zoomToSlider(saved));
  const sl = document.getElementById('zoom-slider');
  const lb = document.getElementById('zoom-label');
  if (sl) sl.value = sliderVal;
  if (lb) lb.textContent = saved + '%';
  _applyZoom(ctx, saved);
}
function ctrlZoom(sliderVal, snap = true) {
  sliderVal = Number(sliderVal);
  if (snap && Math.abs(sliderVal - 175) <= 8) sliderVal = 175;
  const zoom = Math.round(sliderToZoom(sliderVal));
  const sl = document.getElementById('zoom-slider');
  if (sl) sl.value = sliderVal;
  const lb = document.getElementById('zoom-label');
  if (lb) lb.textContent = zoom + '%';
  const ctx = _getActiveZoomCtx();
  localStorage.setItem(_zoomKey(ctx), zoom);
  if (ctx === 'main') localStorage.setItem('_zoom', zoom);
  _applyZoom(ctx, zoom, true);
}
new MutationObserver(function(muts) {
  muts.forEach(function(m) {
    if (m.type !== 'attributes') return;
    const overlay = document.getElementById('settings-overlay');
    if (!overlay) return;
    if (overlay.classList.contains('active')) {
      _syncSlider('settings');
    } else if (!document.getElementById('cp-popup')) {
      _syncSlider('main');
    }
  });
}).observe(document.getElementById('settings-overlay'), { attributes: true, attributeFilter: ['class'] });
new MutationObserver(function(muts) {
  muts.forEach(function(m) {
    m.addedNodes.forEach(function(node) {
      if (node.nodeType === 1 && node.id === 'cp-popup') _syncSlider('popup');
    });
    m.removedNodes.forEach(function(node) {
      if (node.nodeType === 1 && node.id === 'cp-popup') {
        const _so = document.getElementById('settings-overlay');
        _syncSlider(_so && _so.classList.contains('active') ? 'settings' : 'main');
      }
    });
  });
}).observe(document.body, { childList: true });
window._dragEnabled = true;
window._interactEnabled = true;
function ctrlToggleDrag() {
  window._dragEnabled = !window._dragEnabled;
  const t = document.getElementById('drag-toggle');
  if (t) t.classList.toggle('on', window._dragEnabled);
}
async function hardReload() {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) await r.unregister();
    }
  } catch(e) {}
  try {
    const keys = await caches.keys();
    for (const k of keys) await caches.delete(k);
  } catch(e) {}
  window.location.href = location.href.replace(/[?#].*$/, '') + '?t=' + Date.now();
}
(function() {
  const _zs = document.getElementById('zoom-slider');
  if (!_zs) return;
  var _zsOverlay = document.createElement('div');
  _zsOverlay.style.cssText = 'position:absolute;inset:0;z-index:10;cursor:pointer;touch-action:none;';
  var _zsPar = _zs.parentElement;
  if (getComputedStyle(_zsPar).position === 'static') _zsPar.style.position = 'relative';
  var _zsWrap = document.createElement('div');
  _zsWrap.style.cssText = 'position:relative;flex:1;min-width:0;';
  _zsPar.insertBefore(_zsWrap, _zs);
  _zsWrap.appendChild(_zs);
  _zs.style.width = '100%';
  _zsWrap.appendChild(_zsOverlay);
  _zs.style.pointerEvents = 'none';
  let _zsActive = false, _zsRect = null, _zsHW = 16;
  _zsOverlay.addEventListener('pointerdown', function(e) {
    _zsRect = _zs.getBoundingClientRect();
    _zsHW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--slider-handle-w'))||16;
    var min = parseFloat(_zs.min), max = parseFloat(_zs.max);
    var ratio = (parseFloat(_zs.value)-min)/(max-min);
    var thumbCX = _zsRect.left + ratio*(_zsRect.width-_zsHW) + _zsHW/2;
    if (Math.abs(e.clientX - thumbCX) > Math.max(_zsHW, 28)) return;
    e.preventDefault(); e.stopPropagation();
    _zsActive = true;
    _zs.classList.add('handle-active');
    _zsOverlay.setPointerCapture(e.pointerId);
    ratio = (e.clientX - (_zsRect.left + _zsHW/2)) / (_zsRect.width - _zsHW);
    _zs.value = Math.max(min, Math.min(max, min + ratio*(max-min)));
    _zs.dispatchEvent(new InputEvent('input', {bubbles:true}));
  });
  _zsOverlay.addEventListener('pointermove', function(e) {
    if (!_zsActive) return;
    e.preventDefault();
    var min = parseFloat(_zs.min), max = parseFloat(_zs.max);
    var ratio = (e.clientX - (_zsRect.left + _zsHW/2)) / (_zsRect.width - _zsHW);
    _zs.value = Math.max(min, Math.min(max, min + ratio*(max-min)));
    _zs.dispatchEvent(new InputEvent('input', {bubbles:true}));
  });
  _zsOverlay.addEventListener('pointerup', function() { _zsActive = false; _zs.classList.remove('handle-active'); });
  _zsOverlay.addEventListener('pointercancel', function() { _zsActive = false; _zs.classList.remove('handle-active'); });
})();
function ctrlToggleInteract() {
  window._interactEnabled = !window._interactEnabled;
  const t = document.getElementById('interact-toggle');
  if (t) t.classList.toggle('on', window._interactEnabled);
  document.body.classList.toggle('interact-locked', !window._interactEnabled);
}
(function() {
  let _pinchStart = null;
  let _pinchStartZoom = 100;
  function _zoomApply(zoom) {
    zoom = Math.max(50, Math.min(300, Math.round(zoom)));
    const ctx = _getActiveZoomCtx();
    localStorage.setItem(_zoomKey(ctx), zoom);
    if (ctx === 'main') localStorage.setItem('_zoom', zoom);
    _applyZoom(ctx, zoom, true);
    const sl = document.getElementById('zoom-slider');
    const lb = document.getElementById('zoom-label');
    if (sl) sl.value = Math.round(zoomToSlider(zoom));
    if (lb) lb.textContent = zoom + '%';
  }
  document.addEventListener('touchstart', function(e) {
    if (e.touches.length === 2) {
      const t0 = e.touches[0], t1 = e.touches[1];
      _pinchStart = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      _pinchStartZoom = parseInt(localStorage.getItem(_zoomKey(_getActiveZoomCtx()))) || 100;
    } else {
      _pinchStart = null;
    }
  }, { passive: true });
  document.addEventListener('touchmove', function(e) {
    if (e.touches.length === 2 && _pinchStart !== null) {
      e.preventDefault();
      const t0 = e.touches[0], t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      _zoomApply(_pinchStartZoom * (dist / _pinchStart));
    }
  }, { passive: false });
  document.addEventListener('touchend', function(e) {
    if (e.touches.length < 2) _pinchStart = null;
  }, { passive: true });
  document.addEventListener('wheel', function(e) {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const ctx = _getActiveZoomCtx();
    const cur = parseInt(localStorage.getItem(_zoomKey(ctx))) || 100;
    const delta = Math.max(-15, Math.min(15, -e.deltaY * 0.5));
    _zoomApply(cur + delta);
  }, { passive: false });
})();

