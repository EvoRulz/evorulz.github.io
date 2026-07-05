// @version 1578
var _srGlowStyle = document.createElement('style');
_srGlowStyle.textContent = '.sr-drag-ready { box-shadow: 0 0 12px 4px rgba(255,255,255,0.7) !important; transition: box-shadow 0.2s; }';
document.head.appendChild(_srGlowStyle);
function saveSliderRowOrder() {
  const grid = document.getElementById('sg-sliders');
  if (!grid) return;
  const order = [...grid.querySelectorAll('[data-slider-row]')].map(el => el.dataset.sliderRow);
  localStorage.setItem('_sliderRowOrder', JSON.stringify(order));
}
function applySliderRowOrder() {
  try {
    const saved = JSON.parse(localStorage.getItem('_sliderRowOrder'));
    if (!Array.isArray(saved)) return;
    const grid = document.getElementById('sg-sliders');
    if (!grid) return;
    saved.forEach(id => {
      const item = grid.querySelector(`[data-slider-row="${id}"]`);
      if (item) grid.appendChild(item);
    });
    grid.querySelectorAll('[data-slider-row]').forEach(item => {
      if (!saved.includes(item.dataset.sliderRow)) grid.appendChild(item);
    });
  } catch {}
}
(function() {
  let srDrag = null;
  let srHoldTimer = null;
  let srReady = false;
  const grid = document.getElementById('sg-sliders');
  if (!grid) return;
  function srCancel() {
    clearTimeout(srHoldTimer); srHoldTimer = null; srReady = false;
    grid.style.touchAction = '';
    const _so = document.getElementById('settings-overlay'); if (_so) _so.style.overflowY = '';
    if (srDrag) {
      srDrag.item.style.boxShadow = '';
      srDrag.item.style.opacity = '';
      if (srDrag.ghost) { srDrag.ghost.remove(); srDrag.ghost = null; }
    }
    srDrag = null;
  }
  grid.addEventListener('pointerdown', e => {
    const item = e.target.closest('[data-slider-row]');
    if (!item || srDrag) return;
    const rect = item.getBoundingClientRect();
    srDrag = {
      item, startX: e.clientX, startY: e.clientY,
      offX: e.clientX - rect.left, offY: e.clientY - rect.top,
      w: rect.width, h: rect.height,
      ghost: null, lastOver: null, active: false,
      pointerId: e.pointerId,
    };
    srReady = false;
    if (e.target.closest('.slider-row-handle')) {
      srReady = true;
      srDrag.item.style.boxShadow = '0 0 14px 5px rgba(255,255,255,0.85)';
      grid.style.touchAction = 'none';
      return;
    }
    srHoldTimer = setTimeout(() => {
      if (srDrag) {
        srReady = true;
        srDrag.item.style.boxShadow = '0 0 14px 5px rgba(255,255,255,0.85)';
        grid.style.touchAction = 'none';
        const _so = document.getElementById('settings-overlay'); if (_so) _so.style.overflowY = 'hidden';
        try { srDrag.item.setPointerCapture(srDrag.pointerId); } catch {}
      }
    }, 500);
  });
  grid.addEventListener('pointermove', e => {
    if (!srDrag) return;
    const moved = Math.hypot(e.clientX - srDrag.startX, e.clientY - srDrag.startY);
    if (!srReady) {
      if (moved > 76) srCancel();
      return;
    }
    e.preventDefault();
    if (!srDrag.active) {
      if (moved < 4) return;
      srDrag.active = true;
      srDrag.item.style.boxShadow = '';
      grid.setPointerCapture(srDrag.pointerId);
      const rect = srDrag.item.getBoundingClientRect();
      srDrag.offX = srDrag.startX - rect.left;
      srDrag.offY = srDrag.startY - rect.top;
      srDrag.ghost = srDrag.item.cloneNode(true);
      Object.assign(srDrag.ghost.style, {
        position: 'fixed', left: rect.left + 'px', top: rect.top + 'px',
        width: rect.width + 'px', height: rect.height + 'px',
        pointerEvents: 'none', opacity: '0.75', zIndex: '99999',
        margin: '0', boxSizing: 'border-box',
      });
      (document.getElementById('settings-overlay') || document.body).appendChild(srDrag.ghost);
      srDrag.item.style.opacity = '0.3';
    }
    e.preventDefault();
    srDrag.ghost.style.left = (e.clientX - srDrag.offX) + 'px';
    srDrag.ghost.style.top  = (e.clientY - srDrag.offY) + 'px';
    const gcx = e.clientX - srDrag.offX + srDrag.w / 2;
    const gcy = e.clientY - srDrag.offY + srDrag.h / 2;
    let over = null;
    for (const t of grid.querySelectorAll('[data-slider-row]')) {
      if (t === srDrag.item) continue;
      const r = t.getBoundingClientRect();
      if (gcx >= r.left && gcx <= r.right && gcy >= r.top && gcy <= r.bottom) { over = t; break; }
    }
    if (!over) return;
    if (over === srDrag.lastOver) return;
    srDrag.lastOver = over;
    const overNext = over.nextSibling, iNext = srDrag.item.nextSibling;
    if (iNext === over)                grid.insertBefore(over, srDrag.item);
    else if (overNext === srDrag.item) grid.insertBefore(srDrag.item, over);
    else {
      grid.insertBefore(srDrag.item, overNext || null);
      grid.insertBefore(over, iNext || null);
    }
  }, { passive: false });
  const srUp = () => {
    if (!srDrag) return;
    const wasActive = srDrag.active;
    srCancel();
    if (wasActive) saveSliderRowOrder();
  };
  grid.addEventListener('pointerup', srUp);
  grid.addEventListener('pointercancel', srCancel);
  document.addEventListener('touchmove', function(e) {
    if (srReady) e.preventDefault();
  }, { passive: false });
  applySliderRowOrder();
})();
function makeRowsDraggable(containerId, itemAttr, saveKey) {
  const DRAG_THRESHOLD = 6;
  let rDrag = null;
  let rHoldTimer = null;
  let rReady = false;
  const grid = document.getElementById(containerId);
  if (!grid) return;
  function saveOrder() {
    const order = [...grid.querySelectorAll('[' + itemAttr + ']')].map(el => el.getAttribute(itemAttr));
    localStorage.setItem(saveKey, JSON.stringify(order));
  }
  function applyOrder() {
    try {
      const saved = JSON.parse(localStorage.getItem(saveKey));
      if (!Array.isArray(saved)) return;
      saved.forEach(id => {
        const item = grid.querySelector('[' + itemAttr + '="' + id + '"]');
        if (item) grid.appendChild(item);
      });
      grid.querySelectorAll('[' + itemAttr + ']').forEach(item => {
        if (!saved.includes(item.getAttribute(itemAttr))) grid.appendChild(item);
      });
    } catch {}
  }
  function rCancel() {
    clearTimeout(rHoldTimer); rHoldTimer = null; rReady = false;
    grid.style.touchAction = '';
    const _so = document.getElementById('settings-overlay');
    if (_so) {
      _so.style.overflowY = '';
      _so.style.touchAction = '';
      _so.style.overflowX = (parseInt(localStorage.getItem('_zoomSettings')) || 100) > 100 ? 'auto' : '';
    }
    if (rDrag) {
      rDrag.item.style.opacity = '';
      rDrag.item.style.boxShadow = '';
      if (rDrag.ghost) { rDrag.ghost.remove(); rDrag.ghost = null; }
      try { rDrag.item.releasePointerCapture(rDrag.pointerId); } catch {}
    }
    rDrag = null;
    if (_so) _so.style.overflowY = '';
    setTimeout(() => { window._settingsRowDragging = false; }, 0);
  }
  grid.addEventListener('pointerdown', e => {
    const item = e.target.closest('[' + itemAttr + ']');
    if (!item || rDrag) return;
    const rect = item.getBoundingClientRect();
    rDrag = {
      item, startX: e.clientX, startY: e.clientY,
      offX: e.clientX - rect.left, offY: e.clientY - rect.top,
      w: rect.width, h: rect.height,
      ghost: null, lastOver: null, active: false,
      pointerId: e.pointerId,
    };
    rReady = false;
    rHoldTimer = setTimeout(() => {
      if (rDrag) {
        rReady = true;
        grid.style.touchAction = 'none';
        const _soHold = document.getElementById('settings-overlay');
        if (_soHold) _soHold.style.overflowY = 'hidden';
        rDrag.item.style.boxShadow = '0 0 14px 5px rgba(255,255,255,0.85)';
        try { rDrag.item.setPointerCapture(rDrag.pointerId); } catch {}
      }
    }, 400);
  });
  document.addEventListener('pointermove', e => {
    if (!rDrag) return;
    const _rdx = Math.abs(e.clientX - rDrag.startX);
    const _rdy = Math.abs(e.clientY - rDrag.startY);
    const moved = Math.hypot(_rdx, _rdy);
    if (!rReady) {
      if (_rdy > 8 && _rdy > _rdx) rCancel();
      else if (moved > 76) rCancel();
      return;
    }
    e.preventDefault();
    if (!rDrag.active) {
      if (moved < DRAG_THRESHOLD) return;
      rDrag.active = true;
      window._settingsRowDragging = true;
      try { rDrag.item.setPointerCapture(rDrag.pointerId); } catch (_) {}
      e.preventDefault();
      const _so = document.getElementById('settings-overlay'); if (_so) _so.style.overflowY = 'hidden';
      const rect = rDrag.item.getBoundingClientRect();
      rDrag.offX = rDrag.startX - rect.left;
      rDrag.offY = rDrag.startY - rect.top;
      rDrag.ghost = rDrag.item.cloneNode(true);
      Object.assign(rDrag.ghost.style, {
        position: 'fixed', left: rect.left + 'px', top: rect.top + 'px',
        width: rect.width + 'px', height: rect.height + 'px',
        pointerEvents: 'none', opacity: '0.75', zIndex: '9999',
        margin: '0', boxSizing: 'border-box',
      });
      (document.getElementById('settings-overlay') || document.body).appendChild(rDrag.ghost);
      rDrag.item.style.opacity = '0.3';
    }
    rDrag.ghost.style.left = (e.clientX - rDrag.offX) + 'px';
    rDrag.ghost.style.top  = (e.clientY - rDrag.offY) + 'px';
    const gcx = e.clientX - rDrag.offX + rDrag.w / 2;
    const gcy = e.clientY - rDrag.offY + rDrag.h / 2;
    let over = null;
    for (const t of grid.querySelectorAll('[' + itemAttr + ']')) {
      if (t === rDrag.item) continue;
      const r = t.getBoundingClientRect();
      if (gcx >= r.left && gcx <= r.right && gcy >= r.top && gcy <= r.bottom) { over = t; break; }
    }
    if (!over) return;
    if (over === rDrag.lastOver) return;
    rDrag.lastOver = over;
    const overNext = over.nextSibling, iNext = rDrag.item.nextSibling;
    if (iNext === over)                grid.insertBefore(over, rDrag.item);
    else if (overNext === rDrag.item)  grid.insertBefore(rDrag.item, over);
    else {
      grid.insertBefore(rDrag.item, overNext || null);
      grid.insertBefore(over, iNext || null);
    }
  }, { passive: false });
  document.addEventListener('pointerup', () => {
    if (!rDrag) return;
    const wasActive = rDrag.active;
    rCancel();
    if (wasActive) saveOrder();
  });
  document.addEventListener('pointercancel', () => {
    if (!rDrag) return;
    rCancel();
  });
  applyOrder();
}
makeRowsDraggable('sg-buttons', 'data-btn-row', '_btnRowOrder');
makeRowsDraggable('sg-app', 'data-app-row', '_appRowOrder');
makeRowsDraggable('sg-clock', 'data-clock-row', '_clockRowOrder');
makeRowsDraggable('sg-checkboxes', 'data-checkbox-row', '_checkboxRowOrder');
makeRowsDraggable('sg-toggles', 'data-toggle-row', '_toggleRowOrder');
makeRowsDraggable('sg-tables', 'data-app-row', '_tablesRowOrder');
window.addEventListener('load', function() {
  history.pushState({panel:'base'}, '');
  var _goingForward = false;
  window.addEventListener('popstate', function() {
    if (_goingForward) { _goingForward = false; return; }
    if (document.getElementById('cp-popup')) { window._cpClose(); _goingForward = true; history.go(1); return; }
    if (document.getElementById('manage-overlay').classList.contains('active')) {
      manageClose();
    } else if (document.getElementById('settings-overlay').classList.contains('active')) {
      var openGroup = null;
      document.querySelectorAll('.settings-group-content').forEach(function(el) {
        if (el.classList.contains('open')) openGroup = el;
      });
      if (openGroup) {
        openGroup.classList.remove('open');
        var btn = document.querySelector('[data-group="' + openGroup.id + '"]');
        if (btn) btn.classList.remove('sg-active');
      } else {
        settingsCancel();
      }
    } else if (typeof getActiveSectionId === 'function' && getActiveSectionId()) {
      setActiveSection(null);
    } else if (typeof habitsVisible !== 'undefined' && habitsVisible) {
      toggleHabits();
    }
    _goingForward = true;
    history.go(1);
  });
});
(function() {
  let swDrag = null, swHoldTimer = null, swReady = false;
  let swScrolling = false, _swLastTouch = null;
  const swGrid = document.getElementById('sg-swatches');
  if (!swGrid) return;
  const SW_SCROLL_THRESHOLD = 76;
  function swCancel() {
    clearTimeout(swHoldTimer); swHoldTimer = null;
    const _wasReady = swReady;
    swReady = false;
    swGrid.style.touchAction = '';
    const _so = document.getElementById('settings-overlay');
    if (_wasReady && _so) {
      _so.style.overflowY = '';
      _so.style.touchAction = '';
      _so.style.overflowX = (parseInt(localStorage.getItem('_zoomSettings')) || 100) > 100 ? 'auto' : '';
    }
    if (swDrag) {
      swDrag.item.style.boxShadow = '';
      swDrag.item.style.opacity = '';
      if (swDrag.ghost) { swDrag.ghost.remove(); swDrag.ghost = null; }
    }
    swDrag = null;
  }
  function saveSwatchOrder() {
    const order = [...swGrid.querySelectorAll('[data-swatch-row]')].map(el => el.dataset.swatchRow);
    localStorage.setItem('_swatchRowOrder', JSON.stringify(order));
  }
  function applySwatchOrder() {
    try {
      const saved = JSON.parse(localStorage.getItem('_swatchRowOrder'));
      if (!Array.isArray(saved)) return;
      saved.forEach(id => {
        const item = swGrid.querySelector(`[data-swatch-row="${id}"]`);
        if (item) swGrid.appendChild(item);
      });
    } catch {}
  }
  (function() {
    var _soTm = document.getElementById('settings-overlay');
    if (!_soTm) return;
    _soTm.addEventListener('touchmove', function(ev) {
      if (!swScrolling) return;
      ev.preventDefault();
      if (swReady) return;
      const touch = ev.touches && ev.touches[0];
      if (touch && _swLastTouch) {
        _soTm.scrollTop  += _swLastTouch.clientY - touch.clientY;
        _soTm.scrollLeft += _swLastTouch.clientX - touch.clientX;
      }
      if (touch) _swLastTouch = { clientX: touch.clientX, clientY: touch.clientY };
    }, { passive: false });
    document.addEventListener('pointermove', function(ev) {
      if (ev.pointerType === 'touch') return;
      if (!swScrolling || swReady || ev.buttons === 0 || !_swLastTouch) return;
      _soTm.scrollTop  += _swLastTouch.clientY - ev.clientY;
      _soTm.scrollLeft += _swLastTouch.clientX - ev.clientX;
      _swLastTouch = { clientX: ev.clientX, clientY: ev.clientY };
    }, { passive: true });
  })();
  window._swScrollingReset = function() { swScrolling = false; _swLastTouch = null; };
  swGrid.addEventListener('pointerdown', e => {
    if (swDrag) return;
    swScrolling = true;
    _swLastTouch = { clientX: e.clientX, clientY: e.clientY };
    const item = e.target.closest('[data-swatch-row]');
    if (!item) return;
    const rect = item.getBoundingClientRect();
    swDrag = {
      item, startX: e.clientX, startY: e.clientY,
      offX: e.clientX - rect.left, offY: e.clientY - rect.top,
      w: rect.width, h: rect.height,
      ghost: null, lastOver: null, active: false, pointerId: e.pointerId,
      _lastY: e.clientY,
    };
    swHoldTimer = setTimeout(() => {
      if (swDrag) {
        swReady = true;
        swDrag.item.style.boxShadow = '0 0 14px 5px rgba(255,255,255,0.85)';
        swGrid.style.touchAction = 'none';
        const _soSw = document.getElementById('settings-overlay');
        if (_soSw) { _soSw.style.overflowY = 'hidden'; _soSw.style.overflowX = 'hidden'; }
        try { swDrag.item.setPointerCapture(swDrag.pointerId); } catch {}
      }
    }, 400);
  });
  document.addEventListener('pointermove', e => {
    if (!swDrag) return;
    const moved = Math.hypot(e.clientX - swDrag.startX, e.clientY - swDrag.startY);
    if (!swReady) { if (moved > 76) { swCancel(); } return; }
    e.preventDefault();
    if (!swDrag.active) {
      if (moved < 6) return;
      swDrag.active = true;
      window._settingsRowDragging = true;
      try { swDrag.item.setPointerCapture(swDrag.pointerId); } catch (_) {}
      const _so = document.getElementById('settings-overlay'); if (_so) _so.style.overflowY = 'hidden';
      const rect = swDrag.item.getBoundingClientRect();
      swDrag.offX = e.clientX - rect.left;
      swDrag.offY = e.clientY - rect.top;
      swDrag.ghost = swDrag.item.cloneNode(true);
      Object.assign(swDrag.ghost.style, {
        position: 'fixed', left: rect.left + 'px', top: rect.top + 'px',
        width: rect.width + 'px', height: rect.height + 'px',
        pointerEvents: 'none', opacity: '0.75', zIndex: '99999',
        margin: '0', boxSizing: 'border-box',
      });
      (document.getElementById('settings-overlay') || document.body).appendChild(swDrag.ghost);
      swDrag.item.style.opacity = '0.3';
    }
    swDrag.ghost.style.left = (e.clientX - swDrag.offX) + 'px';
    swDrag.ghost.style.top  = (e.clientY - swDrag.offY) + 'px';
    const gcx = e.clientX - swDrag.offX + swDrag.w / 2;
    const gcy = e.clientY - swDrag.offY + swDrag.h / 2;
    let over = null;
    for (const t of swGrid.querySelectorAll('[data-swatch-row]')) {
      if (t === swDrag.item) continue;
      const r = t.getBoundingClientRect();
      if (gcx >= r.left && gcx <= r.right && gcy >= r.top && gcy <= r.bottom) { over = t; break; }
    }
    if (!over) { swDrag.lastOver = null; return; }
    if (over === swDrag.lastOver) return;
    swDrag.lastOver = over;
    const overNext = over.nextSibling, iNext = swDrag.item.nextSibling;
    if (iNext === over)                swGrid.insertBefore(over, swDrag.item);
    else if (overNext === swDrag.item) swGrid.insertBefore(swDrag.item, over);
    else {
      swGrid.insertBefore(swDrag.item, overNext || null);
      swGrid.insertBefore(over, iNext || null);
    }
  }, { passive: false });
  document.addEventListener('pointerup', () => {
    swScrolling = false;
    _swLastTouch = null;
    if (!swDrag) return;
    const wasActive = swDrag.active;
    swCancel();
    if (wasActive) {
      saveSwatchOrder();
      setTimeout(() => { window._settingsRowDragging = false; }, 100);
    } else {
      window._settingsRowDragging = false;
    }
  });
  document.addEventListener('pointercancel', () => {
    swScrolling = false;
    _swLastTouch = null;
    if (!swDrag) return;
    const _wasActive = swDrag.active;
    swCancel();
    if (_wasActive) {
      setTimeout(() => { window._settingsRowDragging = false; }, 100);
    } else {
      window._settingsRowDragging = false;
    }
  });
  applySwatchOrder();
})();
(function() {
  var _soSafeTimer = null;
  document.addEventListener('pointerdown', function() {
    clearTimeout(_soSafeTimer);
  }, { passive: true });
  document.addEventListener('pointerup', function() {
    clearTimeout(_soSafeTimer);
    _soSafeTimer = setTimeout(function() {
      var _so = document.getElementById('settings-overlay');
      if (_so) {
        _so.style.overflowY = '';
        _so.style.touchAction = '';
        _so.style.overflowX = (parseInt(localStorage.getItem('_zoomSettings')) || 100) > 100 ? 'auto' : '';
      }
      if (window._swScrollingReset) window._swScrollingReset();
    }, 400);
  }, { passive: true });
})();
(function() {
  var _soEl = document.getElementById('settings-overlay');
  if (!_soEl) return;
  var _soLast = null, _soActive = false;
  function _soIsZoomed() { return (parseInt(localStorage.getItem('_zoomSettings')) || 100) > 100; }
  document.addEventListener('pointerdown', function(e) {
    if (!_soEl.classList.contains('active')) return;
    if (e.target.closest('#sg-swatches')) return;
    if (e.target.closest('#notif-habit-dropdown-list')) return;
    _soActive = !!e.target.closest('.settings-group-content, #settings-panel');
    if (_soActive) {
      _soLast = { x: e.clientX, y: e.clientY };
      var _sp = document.getElementById('settings-panel');
      if (_sp && _soIsZoomed()) _sp.style.cursor = 'grabbing';
    }
  }, { passive: true });
  document.addEventListener('pointermove', function(e) {
    if (e.pointerType === 'touch') return;
    if (!_soActive || window._settingsRowDragging || !_soLast || e.buttons === 0) return;
    _soEl.scrollTop  += _soLast.y - e.clientY;
    _soEl.scrollLeft += _soLast.x - e.clientX;
    _soLast = { x: e.clientX, y: e.clientY };
  }, { passive: true });
  _soEl.addEventListener('touchmove', function(e) {
    if (!_soActive || window._settingsRowDragging) return;
    var t = e.touches && e.touches[0];
    if (!t || !_soLast) return;
    e.preventDefault();
    _soEl.scrollTop  += _soLast.y - t.clientY;
    _soEl.scrollLeft += _soLast.x - t.clientX;
    _soLast = { x: t.clientX, y: t.clientY };
  }, { passive: false });
  function _soRestoreCursor() {
    _soActive = false;
    _soLast = null;
    var _sp = document.getElementById('settings-panel');
    if (_sp && _soIsZoomed()) _sp.style.cursor = 'grab';
  }
  document.addEventListener('pointerup',     _soRestoreCursor, { passive: true });
  document.addEventListener('pointercancel', _soRestoreCursor, { passive: true });
})();

