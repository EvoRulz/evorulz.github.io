// @version 1238

// ── Manage Habits ──────────────────────────────────────────
  function manageOpen() {
    manageRenderList();
    document.getElementById("manage-overlay").classList.add("active");
    history.pushState({panel:'manage'}, '');
  }
  function manageClose() {
    document.getElementById("manage-overlay").classList.remove("active");
  }
  function manageRenderList() {
    const list = document.getElementById("manage-list");
    list.innerHTML = "";
    TRACKER_CONFIGS.forEach(cfg => {
      const row = document.createElement("div");
      row.className = "manage-habit-row";
      const safeName = cfg.label.replace(/&/g,"&amp;").replace(/"/g,"&quot;");
      row.innerHTML = `
        <input type="checkbox" class="manage-habit-checkbox" data-id="${cfg.id}" onchange="manageUpdateSelectAll()">
        <input class="manage-habit-name" type="text" value="${safeName}" data-id="${cfg.id}" autocomplete="off" spellcheck="false">
        <button class="manage-rename-btn" onclick="manageRename('${cfg.id}',this)">Rename</button>
        <button class="manage-delete-btn" onclick="manageDelete('${cfg.id}')">Delete</button>`;
      list.appendChild(row);
    });
    document.getElementById("manage-select-all").checked = false;
  }
  function manageRename(id, btn) {
    const input = btn.closest(".manage-habit-row").querySelector(".manage-habit-name");
    const newLabel = input.value.trim();
    if (!newLabel) return;
    const cfg = TRACKER_CONFIGS.find(c => c.id === id);
    if (!cfg) return;
    cfg.label = newLabel;
    saveRawConfigs();
    const domBtn = buttonsEl.querySelector(`.tracker-btn[data-id="${id}"]`);
    if (domBtn) domBtn.textContent = newLabel;
    equalizeButtonSizes();
    const orig = btn.textContent;
    btn.textContent = "✓";
    setTimeout(() => { btn.textContent = orig; }, 1000);
  }
  async function manageDelete(id) {
    const cfg = TRACKER_CONFIGS.find(c => c.id === id);
    if (!cfg) return;
    const ok = await confirmClear(`This will permanently delete the habit <strong>${cfg.label}</strong> and all its data.`);
    if (!ok) return;
    performHabitDelete(id);
    applyButtonOrder();
    manageRenderList();
  }
  function manageUpdateSelectAll() {
    const allChecked = [...document.querySelectorAll('.manage-habit-checkbox')].every(c => c.checked);
    const anyChecked = [...document.querySelectorAll('.manage-habit-checkbox')].some(c => c.checked);
    document.getElementById("manage-select-all").checked = allChecked;
    document.getElementById("manage-delete-selected").style.display = anyChecked ? "" : "none";
  }
  function manageToggleSelectAll() {
    const isChecked = document.getElementById("manage-select-all").checked;
    document.querySelectorAll('.manage-habit-checkbox').forEach(c => c.checked = isChecked);
    document.getElementById("manage-delete-selected").style.display = isChecked ? "" : "none";
  }
  function manageBulkDelete() {
    const selected = [...document.querySelectorAll('.manage-habit-checkbox:checked')];
    if (!selected.length) return;
    const selectedIds = selected.map(c => c.dataset.id);
    const selectedNames = selectedIds.map(id => TRACKER_CONFIGS.find(c => c.id === id)?.label).filter(Boolean);
    
    // Check if any selected habits have data
    const hasData = selectedIds.some(id => {
      const prefix = id + ":";
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith(prefix)) return true;
      }
      return false;
    });
    
    const msg = `This will permanently delete ${selectedNames.length} habit${selectedNames.length === 1 ? '' : 's'}:<br><strong>${selectedNames.join(', ')}</strong>`;
    
    // If no data, use simple confirm; if data exists, use confirmClear with password
    const confirmPromise = hasData ? confirmClear(msg) : Promise.resolve(window.confirm(`Delete ${selectedNames.length} habit${selectedNames.length === 1 ? '' : 's'}?\n\n${selectedNames.join(', ')}`));
    
    confirmPromise.then(ok => {
      if (!ok) return;
      selectedIds.forEach(id => performHabitDelete(id));
      document.getElementById("manage-select-all").checked = false;
      document.getElementById("manage-delete-selected").style.display = "none";
      manageRenderList();
    });
  }
  function performHabitDelete(id) {
    // Wipe all localStorage entries for this habit
    const prefix = id + ":";
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i); if (k.startsWith(prefix)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
    // Close & remove its section if open
    const section = document.getElementById(`section-${id}`);
    if (section) section.remove();
    delete sectionEls[id];
    initializedSet.delete(id);
    delete trackers[id];
    // Remove from config list and persist
    const idx = TRACKER_CONFIGS.findIndex(c => c.id === id);
    if (idx !== -1) TRACKER_CONFIGS.splice(idx, 1);
    saveRawConfigs();
  }
  function manageAddHabit() {
    const input = document.getElementById("manage-new-name");
    const label = input.value.trim();
    if (!label) return;
    const id = "habit_" + Date.now();
    const cfg = buildTrackerConfig({ id, label, type: "simple" });
    TRACKER_CONFIGS.push(cfg);
    saveRawConfigs();
    // Create section element
    const section = document.createElement("div");
    section.id = `section-${id}`;
    section.className = "tracker-section";
    sectionsEl.appendChild(section);
    sectionEls[id] = section;
    // Add button — replace first empty slot, or append
    const emptySlot = buttonsEl.querySelector(".empty-slot");
    const btn = makeTrackerBtn(cfg);
    if (emptySlot) {
      buttonsEl.replaceChild(btn, emptySlot);
    } else {
      buttonsEl.appendChild(btn);
    }
    applyBtnStyle();
    saveButtonOrder();
    input.value = "";
    manageRenderList();
  }
  document.getElementById("manage-overlay").addEventListener("click", e => {
  if (e.target === document.getElementById("manage-overlay")) manageClose();
});










