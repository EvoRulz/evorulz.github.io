// @version 1236

  // ── Bootstrap ──────────────────────────────────────────────
  const buttonsEl  = document.getElementById("buttons");
  const sectionsEl = document.getElementById("sections");

  // Pre-create all section divs (always present in DOM so open state survives reorder)
  const sectionEls = {};
  TRACKER_CONFIGS.forEach(config => {
    const section = document.createElement("div");
    section.id        = `section-${config.id}`;
    section.className = "tracker-section";
    sectionsEl.appendChild(section);
    sectionEls[config.id] = section;
  });

  // Track which trackers have been lazy-initialised
  const initializedSet = new Set();

  // ── Active section management ──────────────────────────────
  // Only one section open at a time; button glows when its section is open.
  function getActiveSectionId() {
    return TRACKER_CONFIGS.map(c=>c.id).find(id => sectionEls[id].style.display === "block") || null;
  }

  function setActiveSection(targetId) {
    // Close all sections and unglow all buttons
    TRACKER_CONFIGS.forEach(c => {
      sectionEls[c.id].style.display = "none";
      const btn = buttonsEl.querySelector(`.tracker-btn[data-id="${c.id}"]`);
      if (btn) btn.classList.remove("active");
    });

    if (!targetId) return; // just close everything

    // Open target and glow its button
    sectionEls[targetId].style.display = "block";
    history.pushState({panel:'section'}, '');
    const btn = buttonsEl.querySelector(`.tracker-btn[data-id="${targetId}"]`);
    if (btn) btn.classList.add("active");

    // Lazy-init tracker
    if (!initializedSet.has(targetId)) {
      const config = TRACKER_CONFIGS.find(c => c.id === targetId);
      trackers[targetId] = createTracker(config);
      trackers[targetId].init();
      initializedSet.add(targetId);
    }
  }

  // ── Button order persistence ───────────────────────────────
  function loadButtonOrder() {
    try {
      const saved = JSON.parse(localStorage.getItem("_buttonOrder"));
      if (Array.isArray(saved)) {
        const knownIds = new Set(TRACKER_CONFIGS.map(c => c.id));
        // Filter out deleted habits, keep nulls (empty slots) and known ids
        const filtered = saved.filter(id => !id || knownIds.has(id));
        // Append any newly added habits not yet in the saved order
        const presentIds = new Set(filtered.filter(Boolean));
        TRACKER_CONFIGS.forEach(c => { if (!presentIds.has(c.id)) filtered.push(c.id); });
        return filtered;
      }
    } catch {}
    return TRACKER_CONFIGS.map(c => c.id);
  }
  function saveButtonOrder() {
    // Save full slot layout — null for empty slots so positions persist
    const order = [...buttonsEl.children].map(el => el.dataset.id || null);
    localStorage.setItem("_buttonOrder", JSON.stringify(order));
  }

  // ── Create a tracker toggle button element ─────────────────
  function makeTrackerBtn(config) {
    const btn = document.createElement("button");
    btn.className   = "tracker-btn";
    btn.dataset.id  = config.id;
    btn.textContent = config.label;
    let _tapX = null, _tapY = null;
btn.addEventListener('pointerdown', (e) => {
  _tapX = e.clientX; _tapY = e.clientY;
  console.log('[btn] pointerdown', config.id, 'drag:', window._dragEnabled, 'interact:', window._interactEnabled);
  const _s = _btnStyleFor(config.id);
  btn.style.background = hex8ToCss(_s.tap || btnStyle.tap);
});
btn.addEventListener('pointerup', (e) => {
  const _s = _btnStyleFor(config.id);
  btn.style.background = hex8ToCss(_s.bg);
  const dist = (_tapX !== null) ? Math.hypot(e.clientX - _tapX, e.clientY - _tapY) : 999;
  console.log('[btn] pointerup', config.id, 'dist:', dist.toFixed(1), 'dragOccurred:', window._habitDragOccurred, 'interact:', window._interactEnabled);
  _tapX = null; _tapY = null;
  if (dist > 10) { console.log('[btn] suppressed: moved too far'); return; }
  if (window._habitDragOccurred) { console.log('[btn] suppressed: drag occurred'); return; }
  if (window._interactEnabled === false) { console.log('[btn] suppressed: interact disabled'); return; }
  console.log('[btn] opening section', config.id);
  const currentlyOpen = getActiveSectionId();
  setActiveSection(currentlyOpen === config.id ? null : config.id);
});
btn.addEventListener('pointercancel', () => {
  console.log('[btn] pointercancel', config.id);
  const _s = _btnStyleFor(config.id);
  btn.style.background = hex8ToCss(_s.bg);
  _tapX = null; _tapY = null;
});
    return btn;
  }

  // Total grid slots: 3 cols × 3 rows = 9, giving 3 buttons room to spread out
  const TOTAL_SLOTS = 9;

  function padEmptySlots() {
    const total = buttonsEl.children.length;
    for (let i = total; i < TOTAL_SLOTS; i++) {
      const slot = document.createElement("div");
      slot.className = "empty-slot";
      buttonsEl.appendChild(slot);
    }
  }

  // Initial button render in saved order (supports id or null for empty slots)
  loadButtonOrder().forEach(id => {
    if (!id) {
      const slot = document.createElement("div");
      slot.className = "empty-slot";
      buttonsEl.appendChild(slot);
    } else {
      const config = TRACKER_CONFIGS.find(c => c.id === id);
      if (config) buttonsEl.appendChild(makeTrackerBtn(config));
    }
  });
  padEmptySlots(); // fill any remaining slots up to TOTAL_SLOTS

  var _eqFrame = null;
  function equalizeButtonSizes() {
    if (_eqFrame) cancelAnimationFrame(_eqFrame);
    _eqFrame = requestAnimationFrame(() => {
      const btns = [...buttonsEl.querySelectorAll('.tracker-btn')];
      if (!btns.length) return;
      const maxH = Math.max(...btns.map(b => b.offsetHeight));
      if (maxH > 0) buttonsEl.style.gridAutoRows = maxH + 'px';
      buttonsEl.style.gridAutoRows = maxH + 'px';
    });
  }
  equalizeButtonSizes();
  new ResizeObserver(equalizeButtonSizes).observe(buttonsEl);
  function equalizeTopGrid() {
    const items = [...topGrid.querySelectorAll('.top-item')];
    if (!items.length) return;
    topGrid.style.gridAutoRows = '';
    const maxH = Math.max(...items.map(i => i.offsetHeight));
    topGrid.style.gridAutoRows = maxH + 'px';
  }
  requestAnimationFrame(equalizeTopGrid);








