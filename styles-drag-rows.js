// @version 1236

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
      if (e.target.closest('input, select, button, textarea')) return;
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
        return;
      }
      srHoldTimer = setTimeout(() => {
        if (srDrag) {
          srReady = true;
          srDrag.item.style.boxShadow = '0 0 14px 5px rgba(255,255,255,0.85)';
        grid.style.touchAction = 'none';
        const _so = document.getElementById('settings-overlay'); if (_so) _so.style.overflowY = 'hidden';
        }
      }, 500);
    });

    grid.addEventListener('pointermove', e => {
      if (!srDrag) return;
      const moved = Math.hypot(e.clientX - srDrag.startX, e.clientY - srDrag.startY);
      if (!srReady) {
        if (moved > 10) srCancel();
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
      if (!over) { srDrag.lastOver = null; return; }
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
      grid.style.touchAction = '';
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
    grid.addEventListener('pointerdown', e => {
      if (e.target.closest('input, select, button, textarea')) return;
      const item = e.target.closest('[' + itemAttr + ']');
      if (!item || rDrag) return;
      const rect = item.getBoundingClientRect();
      rDrag = {
        item, startX: e.clientX, startY: e.clientY,
        offX: e.clientX - rect.left, offY: e.clientY - rect.top,
        w: rect.width, h: rect.height,
        ghost: null, lastOver: null, active: false,
      };
    });
    document.addEventListener('pointermove', e => {
      if (!rDrag) return;
      if (!rDrag.active) {
        if (Math.hypot(e.clientX - rDrag.startX, e.clientY - rDrag.startY) < DRAG_THRESHOLD) return;
        if (window._dragEnabled === false) { rDrag = null; return; }
        rDrag.active = true;
        const rect = rDrag.item.getBoundingClientRect();
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
      if (!over) { rDrag.lastOver = null; return; }
      if (over === rDrag.lastOver) return;
      rDrag.lastOver = over;
      const overNext = over.nextSibling, iNext = rDrag.item.nextSibling;
      if (iNext === over)                grid.insertBefore(over, rDrag.item);
      else if (overNext === rDrag.item)  grid.insertBefore(rDrag.item, over);
      else {
        grid.insertBefore(rDrag.item, overNext || null);
        grid.insertBefore(over, iNext || null);
      }
    });
    document.addEventListener('pointerup', () => {
      if (!rDrag) return;
      if (rDrag.active) {
        rDrag.item.style.opacity = '';
        if (rDrag.ghost) rDrag.ghost.remove();
        saveOrder();
      }
      rDrag = null;
    });
    document.addEventListener('pointercancel', () => {
      if (!rDrag) return;
      rDrag.item.style.opacity = '';
      if (rDrag.ghost) rDrag.ghost.remove();
      rDrag = null;
    });
    applyOrder();
  }

makeRowsDraggable('sg-buttons', 'data-btn-row', '_btnRowOrder');
makeRowsDraggable('sg-app', 'data-app-row', '_appRowOrder');
makeRowsDraggable('sg-clock', 'data-clock-row', '_clockRowOrder');
makeRowsDraggable('sg-checkboxes', 'data-checkbox-row', '_checkboxRowOrder');

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
  const swGrid = document.getElementById('sg-swatches');
  if (!swGrid) return;
  swGrid.style.touchAction = 'none';

  function swCancel() {
    clearTimeout(swHoldTimer); swHoldTimer = null; swReady = false;
    const _so = document.getElementById('settings-overlay'); if (_so) _so.style.overflowY = '';
    if (swDrag) {
      try { swGrid.releasePointerCapture(swDrag.pointerId); } catch {}
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

  swGrid.addEventListener('pointerdown', e => {
    if (e.target.closest('input, select, button, textarea')) return;
    const item = e.target.closest('[data-swatch-row]');
    if (!item || swDrag) return;
    const rect = item.getBoundingClientRect();
    swDrag = {
      item, startX: e.clientX, startY: e.clientY,
      offX: e.clientX - rect.left, offY: e.clientY - rect.top,
      w: rect.width, h: rect.height,
      ghost: null, lastOver: null, active: false, pointerId: e.pointerId,
    };
    swGrid.setPointerCapture(e.pointerId);
    swReady = false;
    swHoldTimer = setTimeout(() => {
      if (swDrag) {
        swReady = true;
        swDrag.item.style.boxShadow = '0 0 14px 5px rgba(255,255,255,0.85)';
      }
    }, 400);
  });

  swGrid.addEventListener('pointermove', e => {
    if (!swDrag) return;
    const moved = Math.hypot(e.clientX - swDrag.startX, e.clientY - swDrag.startY);
    e.preventDefault();
    if (!swReady) {
      if (moved > 10) swCancel();
      return;
    }
    if (!swDrag.active) {
      if (moved < 6) return;
      swDrag.active = true;
      const _so = document.getElementById('settings-overlay'); if (_so) _so.style.overflowY = 'hidden';
      const rect = swDrag.item.getBoundingClientRect();
      swDrag.offX = swDrag.startX - rect.left;
      swDrag.offY = swDrag.startY - rect.top;
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

  swGrid.addEventListener('pointerup', () => {
    if (!swDrag) return;
    const wasActive = swDrag.active;
    swCancel();
    if (wasActive) saveSwatchOrder();
  });
  swGrid.addEventListener('pointercancel', swCancel);

  applySwatchOrder();
})();








