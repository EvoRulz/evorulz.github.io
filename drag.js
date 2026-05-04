// @version 1222

/// ── Drag-to-reorder — HABIT BUTTONS ──────────────────────
  const DRAG_THRESHOLD = 6;
  var drag = null;

  buttonsEl.addEventListener("pointerdown", e => {
    const btn = e.target.closest(".tracker-btn[data-id]");
    if (!btn) return;
    if (drag) return;
    if (window._dragEnabled === false) return;
    const rect = btn.getBoundingClientRect();
    drag = {
      id: btn.dataset.id, btn,
      startX: e.clientX, startY: e.clientY,
      offX: e.clientX - rect.left, offY: e.clientY - rect.top,
      btnW: rect.width, btnH: rect.height,
      ghost: null, lastOver: null, active: false,
    };
    e.preventDefault();
  });

  document.addEventListener("pointermove", e => {
    if (!drag) return;
    if (!drag.active) {
      if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < DRAG_THRESHOLD) return;
      if (window._dragEnabled === false) return;
      drag.active = true;
      e.preventDefault();
      const rect = drag.btn.getBoundingClientRect();
      drag.ghost = drag.btn.cloneNode(true);
      drag.ghost.classList.add("drag-ghost");
      Object.assign(drag.ghost.style, {
        position: "fixed", left: rect.left+"px", top: rect.top+"px",
        width: rect.width+"px", height: rect.height+"px",
        pointerEvents: "none", opacity: "0.75", zIndex: "9000",
        margin: "0", boxSizing: "border-box",
      });
      document.body.appendChild(drag.ghost);
      drag.btn.style.visibility = "hidden";
      document.body.classList.add("is-dragging");
    }
    drag.ghost.style.left = (e.clientX - drag.offX) + "px";
    drag.ghost.style.top  = (e.clientY - drag.offY) + "px";
    const gcx = e.clientX - drag.offX + drag.btnW / 2;
    const gcy = e.clientY - drag.offY + drag.btnH / 2;
    let over = null;
    for (const t of buttonsEl.children) {
      if (t === drag.btn) continue;
      const r = t.getBoundingClientRect();
      if (gcx >= r.left && gcx <= r.right && gcy >= r.top && gcy <= r.bottom) { over = t; break; }
    }
    if (!over) { drag.lastOver = null; return; }
    if (over === drag.lastOver) return;
    drag.lastOver = over;
    const overNext = over.nextSibling, btnNext = drag.btn.nextSibling;
    if (btnNext === over)              buttonsEl.insertBefore(over, drag.btn);
    else if (overNext === drag.btn)    buttonsEl.insertBefore(drag.btn, over);
    else {
      buttonsEl.insertBefore(drag.btn, overNext || null);
      buttonsEl.insertBefore(over, btnNext || null);
    }
  });

  document.addEventListener("pointerup", () => {
    if (!drag) return;
    if (drag.active) {
      drag.btn.style.visibility = "";
      drag.ghost.remove();
      document.body.classList.remove("is-dragging");
      saveButtonOrder();
      drag.btn.style.background = "";
      window._habitDragOccurred = true;
      setTimeout(() => { window._habitDragOccurred = false; }, 300);
    }
    drag = null;
  });

  document.addEventListener("pointercancel", () => {
    if (!drag) return;
    if (drag.active) {
      drag.btn.style.visibility = "";
      if (drag.ghost) drag.ghost.remove();
      document.body.classList.remove("is-dragging");
    }
    drag = null;
  });

  // ── Show / Hide Habits ─────────────────────────────────────
  let habitsVisible = localStorage.getItem("_habitsVisible") !== "false";
  buttonsEl.style.display = habitsVisible ? "" : "none";
  document.getElementById("hide-habits-btn").textContent = habitsVisible ? "Hide Habits" : "Show Habits";
  applyBtnStyle();
  function toggleHabits() {
    habitsVisible = !habitsVisible;
    if (habitsVisible) history.pushState({panel:'base'}, '');
    if (!habitsVisible) setActiveSection(null);
    buttonsEl.style.display = habitsVisible ? "" : "none";
    if (habitsVisible) { buttonsEl.style.gridAutoRows = ''; equalizeButtonSizes(); }
    document.getElementById("hide-habits-btn").textContent = habitsVisible ? "Hide Habits" : "Show Habits";
    localStorage.setItem("_habitsVisible", habitsVisible);
    applyBtnStyle();
    if (window._cfBuild) {
      const newItems = window._cfItems();
      const targetId = habitsVisible ? 'top-hide-habits' : 'top-show-habits';
      const newIdx = newItems.findIndex(it => it.id === targetId);
      if (newIdx !== -1 && window._cfSetIdx) window._cfSetIdx(newIdx);
      window._cfBuild();
    }
  }
  const sgGrid = document.getElementById('settings-groups-grid');
  let sgDrag = null;

  sgGrid.addEventListener('pointerdown', e => {
    const item = e.target.closest('.settings-group-item');
    if (!item) return;
    if (sgDrag) {
      if (sgDrag.active) {
        sgDrag.item.style.opacity = '';
        if (sgDrag.ghost) sgDrag.ghost.remove();
      }
      sgDrag = null;
    }
    if (window._interactEnabled === false) return;
    const rect = item.getBoundingClientRect();
    sgDrag = {
      item, startX: e.clientX, startY: e.clientY,
      offX: e.clientX - rect.left, offY: e.clientY - rect.top,
      w: rect.width, h: rect.height,
      ghost: null, lastOver: null, active: false,
    };
    item.setPointerCapture(e.pointerId);
  });

  sgGrid.addEventListener('pointermove', e => {
    if (!sgDrag) return;
    if (!sgDrag.active) {
      if (Math.hypot(e.clientX - sgDrag.startX, e.clientY - sgDrag.startY) < 14) return;
      sgDrag.active = true;
      e.preventDefault();
      const _so = document.getElementById('settings-overlay');
      if (_so) _so.style.overflowY = 'hidden';
      const rect = sgDrag.item.getBoundingClientRect();
      sgDrag.ghost = sgDrag.item.cloneNode(true);
      Object.assign(sgDrag.ghost.style, {
        position: 'fixed', left: rect.left + 'px', top: rect.top + 'px',
        width: rect.width + 'px', height: rect.height + 'px',
        pointerEvents: 'none', opacity: '0.75', zIndex: '9999',
        margin: '0', boxSizing: 'border-box',
      });
      document.body.appendChild(sgDrag.ghost);
        sgDrag.item.style.opacity = '0.3';
    }
    e.preventDefault();
    e.stopPropagation();
    if (sgDrag.ghost) {
      sgDrag.ghost.style.left = (e.clientX - sgDrag.offX) + 'px';
      sgDrag.ghost.style.top  = (e.clientY - sgDrag.offY) + 'px';
    }
    const gcx = e.clientX - sgDrag.offX + sgDrag.w / 2;
    const gcy = e.clientY - sgDrag.offY + sgDrag.h / 2;
    let over = null;
    for (const t of sgGrid.children) {
      if (t === sgDrag.item) continue;
      const r = t.getBoundingClientRect();
      if (gcx >= r.left && gcx <= r.right && gcy >= r.top && gcy <= r.bottom) { over = t; break; }
    }
    if (!over) { sgDrag.lastOver = null; return; }
    if (over === sgDrag.lastOver) return;
    sgDrag.lastOver = over;
    const overNext = over.nextSibling, iNext = sgDrag.item.nextSibling;
    if (iNext === over)                sgGrid.insertBefore(over, sgDrag.item);
    else if (overNext === sgDrag.item) sgGrid.insertBefore(sgDrag.item, over);
    else {
      sgGrid.insertBefore(sgDrag.item, overNext || null);
      sgGrid.insertBefore(over, iNext || null);
    }
  }, { passive: false });

  document.addEventListener('pointerup', e => {
    if (!sgDrag) return;
    e.stopPropagation();
    const _so = document.getElementById('settings-overlay');
    if (_so) _so.style.overflowY = '';
    if (sgDrag.active) {
      sgDrag.item.style.opacity = '';
      if (sgDrag.ghost) sgDrag.ghost.remove();
      saveSettingsGroupOrder();
    } else {
      if (window._interactEnabled !== false) toggleSettingsGroup(sgDrag.item.dataset.group);
    }
    sgDrag = null;
  });

  document.addEventListener('pointercancel', e => {
    if (!sgDrag) return;
    const _so = document.getElementById('settings-overlay');
    if (_so) _so.style.overflowY = '';
    sgDrag.item.style.opacity = '';
    if (sgDrag.ghost) sgDrag.ghost.remove();
    sgDrag = null;
  });

  function applySettingsGroupOrder() {
    try {
      const saved = JSON.parse(localStorage.getItem('_settingsGroupOrder'));
      if (!Array.isArray(saved)) return;
      saved.forEach(id => {
        const item = sgGrid.querySelector(`[data-group="${id}"]`);
        if (item) sgGrid.appendChild(item);
      });
      sgGrid.querySelectorAll('.settings-group-item').forEach(item => {
        if (!saved.includes(item.dataset.group)) sgGrid.appendChild(item);
      });
    } catch {}
  }
  applySettingsGroupOrder();

  // ── Top-grid drag-to-reorder ─────────────────────────────
  const topGrid = document.getElementById('top-grid');
  let topDrag = null;

  function applyTopGridOrder() {
    try {
      const saved = JSON.parse(localStorage.getItem('_topGridOrder'));
      if (!Array.isArray(saved)) return;
      saved.forEach(id => {
        if (!id) return;
        const item = topGrid.querySelector(`.top-item[data-item="${id}"]`);
        if (item) topGrid.appendChild(item);
      });
    } catch {}
  }

  function saveTopGridOrder() {
    const order = [...topGrid.children].map(el => el.dataset.item || null).filter(Boolean);
    localStorage.setItem('_topGridOrder', JSON.stringify(order));
  }

  applyTopGridOrder();

  topGrid.addEventListener('pointerdown', e => {
    const item = e.target.closest('.top-item[data-item]');
    if (!item) return;
    if (topDrag) {
      if (topDrag.active) {
        topDrag.item.style.visibility = '';
        if (topDrag.ghost) topDrag.ghost.remove();
      }
      topDrag = null;
    }
    if (window._dragEnabled === false) return;
    const rect = item.getBoundingClientRect();
    topDrag = {
      item, startX: e.clientX, startY: e.clientY,
      offX: e.clientX - rect.left, offY: e.clientY - rect.top,
      w: rect.width, h: rect.height,
      ghost: null, lastOver: null, active: false,
    };
  });

  document.addEventListener('pointermove', e => {
    if (!topDrag) return;
    if (!topDrag.active) {
      if (Math.hypot(e.clientX - topDrag.startX, e.clientY - topDrag.startY) < DRAG_THRESHOLD) return;
      if (window._dragEnabled === false) { topDrag = null; return; }
      topDrag.active = true;
      e.preventDefault();
      const rect = topDrag.item.getBoundingClientRect();
      topDrag.ghost = topDrag.item.cloneNode(true);
      topDrag.ghost.classList.add('drag-ghost');
      Object.assign(topDrag.ghost.style, {
        position: 'fixed', left: rect.left + 'px', top: rect.top + 'px',
        width: rect.width + 'px', height: rect.height + 'px',
        pointerEvents: 'none', opacity: '0.75', zIndex: '9001',
        margin: '0', boxSizing: 'border-box',
      });
      document.body.appendChild(topDrag.ghost);
      topDrag.item.style.visibility = 'hidden';
    }
    topDrag.ghost.style.left = (e.clientX - topDrag.offX) + 'px';
    topDrag.ghost.style.top  = (e.clientY - topDrag.offY) + 'px';
    const gcx = e.clientX - topDrag.offX + topDrag.w / 2;
    const gcy = e.clientY - topDrag.offY + topDrag.h / 2;
    let over = null;
    for (const t of topGrid.children) {
      if (t === topDrag.item) continue;
      const r = t.getBoundingClientRect();
      if (gcx >= r.left && gcx <= r.right && gcy >= r.top && gcy <= r.bottom) { over = t; break; }
    }
    if (!over) { topDrag.lastOver = null; return; }
    if (over === topDrag.lastOver) return;
    topDrag.lastOver = over;
    const overNext = over.nextSibling, iNext = topDrag.item.nextSibling;
    if (iNext === over)                 topGrid.insertBefore(over, topDrag.item);
    else if (overNext === topDrag.item) topGrid.insertBefore(topDrag.item, over);
    else {
      topGrid.insertBefore(topDrag.item, overNext || null);
      topGrid.insertBefore(over, iNext || null);
    }
  });

  document.addEventListener('pointerup', () => {
    if (!topDrag) return;
    if (topDrag.active) {
      topDrag.item.style.visibility = '';
      if (topDrag.ghost) topDrag.ghost.remove();
      saveTopGridOrder();
    }
    topDrag = null;
  });

  document.addEventListener('pointercancel', () => {
    if (!topDrag) return;
    topDrag.item.style.visibility = '';
    if (topDrag.ghost) topDrag.ghost.remove();
    topDrag = null;
  });