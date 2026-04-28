/// ── Drag-to-reorder — HABIT BUTTONS ──────────────────────
  const DRAG_THRESHOLD = 6;
  let drag = null;

  buttonsEl.addEventListener("pointerdown", e => {
    const btn = e.target.closest(".tracker-btn[data-id]");
    if (!btn) return;
    if (drag) return;
    e.preventDefault();
    const rect = btn.getBoundingClientRect();
    drag = {
      id: btn.dataset.id, btn,
      startX: e.clientX, startY: e.clientY,
      offX: e.clientX - rect.left, offY: e.clientY - rect.top,
      btnW: rect.width, btnH: rect.height,
      ghost: null, lastOver: null, active: false,
    };
  });

  buttonsEl.addEventListener("pointerup", e => {
    if (!drag || drag.active) return;
    if (window._interactEnabled === false) return;
    const id = drag.id;
    drag = null;
    const currentlyOpen = getActiveSectionId();
    setActiveSection(currentlyOpen === id ? null : id);
  });

  document.addEventListener("pointermove", e => {
    if (!drag) return;
    if (!drag.active) {
      if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < DRAG_THRESHOLD) return;
      if (window._dragEnabled === false) return;
      drag.active = true;
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
    } else {
      const currentlyOpen = getActiveSectionId();
      setActiveSection(currentlyOpen === drag.id ? null : drag.id);
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
  // ── Top grid drag-to-reorder ───────────────────────────────
  const topGrid = document.getElementById("top-grid");
  let tdrag = null;

  topGrid.addEventListener("pointerdown", e => {
    const item = e.target.closest(".top-item");
    if (!item) return;
    if (tdrag) return;
    e.preventDefault();
    const rect = item.getBoundingClientRect();
    tdrag = {
      item, startX: e.clientX, startY: e.clientY,
      offX: e.clientX - rect.left, offY: e.clientY - rect.top,
      w: rect.width, h: rect.height,
      ghost: null, lastOver: null, active: false,
    };
  });

  topGrid.addEventListener("pointermove", e => {
    if (!tdrag) return;
    if (!tdrag.active) {
      if (Math.hypot(e.clientX - tdrag.startX, e.clientY - tdrag.startY) < DRAG_THRESHOLD) return;
      if (window._dragEnabled === false) { tdrag = null; return; }
      tdrag.active = true;
      const rect = tdrag.item.getBoundingClientRect();
      tdrag.ghost = tdrag.item.cloneNode(true);
      Object.assign(tdrag.ghost.style, {
        position: "fixed", left: rect.left+"px", top: rect.top+"px",
        width: rect.width+"px", height: rect.height+"px",
        pointerEvents: "none", opacity: "0.75", zIndex: "8999",
        margin: "0", boxSizing: "border-box",
      });
      document.body.appendChild(tdrag.ghost);
      tdrag.item.style.visibility = "hidden";
    }
    tdrag.ghost.style.left = (e.clientX - tdrag.offX) + "px";
    tdrag.ghost.style.top  = (e.clientY - tdrag.offY) + "px";
    const gcx = e.clientX - tdrag.offX + tdrag.w / 2;
    const gcy = e.clientY - tdrag.offY + tdrag.h / 2;
    let over = null;
    for (const t of topGrid.children) {
      if (t === tdrag.item) continue;
      const r = t.getBoundingClientRect();
      if (gcx >= r.left && gcx <= r.right && gcy >= r.top && gcy <= r.bottom) { over = t; break; }
    }
    if (!over) { tdrag.lastOver = null; return; }
    if (over === tdrag.lastOver) return;
    tdrag.lastOver = over;
    const overNext = over.nextSibling, iNext = tdrag.item.nextSibling;
    if (iNext === over)                topGrid.insertBefore(over, tdrag.item);
    else if (overNext === tdrag.item)  topGrid.insertBefore(tdrag.item, over);
    else {
      topGrid.insertBefore(tdrag.item, overNext || null);
      topGrid.insertBefore(over, iNext || null);
    }
  });

  document.addEventListener("pointerup", () => {
    if (!tdrag) return;
    if (tdrag.active) {
      tdrag.item.style.visibility = "";
      if (tdrag.ghost) tdrag.ghost.remove();
      saveTopGridOrder();
    } else {
      if (window._interactEnabled !== false) {
        const btn = tdrag.item.querySelector("button");
        if (btn && tdrag.item.dataset.item !== "manage-habits") btn.click();
      }
    }
    tdrag = null;
  });

  document.addEventListener("pointercancel", () => {
    if (!tdrag) return;
    tdrag.item.style.visibility = "";
    if (tdrag.ghost) tdrag.ghost.remove();
    tdrag = null;
  });

  function saveTopGridOrder() {
    const order = [...topGrid.children].map(w => w.dataset.item).filter(Boolean);
    localStorage.setItem("_topGridOrder", JSON.stringify(order));
  }
  function applyTopGridOrder() {
    try {
      const saved = JSON.parse(localStorage.getItem("_topGridOrder"));
      if (!Array.isArray(saved)) return;
      saved.forEach(id => {
        const w = topGrid.querySelector(`.top-item[data-item="${id}"]`);
        if (w) topGrid.appendChild(w);
      });
    } catch {}
  }
  applyTopGridOrder();
  // ── Settings group grid drag-to-reorder ───────────────────
  const sgGrid = document.getElementById('settings-groups-grid');
  let sgDrag = null;

  sgGrid.addEventListener('pointerdown', e => {
    const item = e.target.closest('.settings-group-item');
    if (!item || sgDrag) return;
    if (window._interactEnabled === false) return;
    const rect = item.getBoundingClientRect();
    sgDrag = {
      item, startX: e.clientX, startY: e.clientY,
      offX: e.clientX - rect.left, offY: e.clientY - rect.top,
      w: rect.width, h: rect.height,
      ghost: null, lastOver: null, active: false,
    };
  });

  document.addEventListener('pointermove', e => {
    if (!sgDrag) return;
    if (!sgDrag.active) {
      if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < DRAG_THRESHOLD) return;
      if (window._dragEnabled === false) return;
      drag.active = true;
      const rect = sgDrag.item.getBoundingClientRect();
      sgDrag.ghost = sgDrag.item.cloneNode(true);
      Object.assign(sgDrag.ghost.style, {
        position:'fixed', left:rect.left+'px', top:rect.top+'px',
        width:rect.width+'px', height:rect.height+'px',
        pointerEvents:'none', opacity:'0.75', zIndex:'9999',
        margin:'0', boxSizing:'border-box',
      });
      (document.getElementById('settings-overlay') || document.body).appendChild(sgDrag.ghost);
      sgDrag.item.style.opacity = '0.3';
    }
    sgDrag.ghost.style.left = (e.clientX - sgDrag.offX) + 'px';
    sgDrag.ghost.style.top  = (e.clientY - sgDrag.offY) + 'px';
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
  });

  document.addEventListener('pointerup', () => {
    if (!sgDrag) return;
    if (sgDrag.active) {
      sgDrag.item.style.opacity = '';
      if (sgDrag.ghost) sgDrag.ghost.remove();
      saveSettingsGroupOrder();
    } else {
      if (window._interactEnabled !== false) toggleSettingsGroup(sgDrag.item.dataset.group);
    }
    sgDrag = null;
  });

  document.addEventListener('pointercancel', () => {
    if (!sgDrag) return;
    sgDrag.item.style.opacity = '';
    if (sgDrag.ghost) sgDrag.ghost.remove();
    sgDrag = null;
  });

  function saveSettingsGroupOrder() {
    const order = [...sgGrid.children].map(el => el.dataset.group).filter(Boolean);
    localStorage.setItem('_settingsGroupOrder', JSON.stringify(order));
  }
  function applySettingsGroupOrder() {
    try {
      const saved = JSON.parse(localStorage.getItem('_settingsGroupOrder'));
      if (!Array.isArray(saved)) return;
      // Append known saved items in order
      saved.forEach(id => {
        const item = sgGrid.querySelector(`[data-group="${id}"]`);
        if (item) sgGrid.appendChild(item);
      });
      // Append any new group items not present in the saved order
      sgGrid.querySelectorAll('.settings-group-item').forEach(item => {
        if (!saved.includes(item.dataset.group)) sgGrid.appendChild(item);
      });
    } catch {}
  }
  applySettingsGroupOrder();