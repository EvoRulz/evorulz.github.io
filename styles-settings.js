// ── Settings panel logic ───────────────────────────────────
  function onColorPickerChange(id) {
    const picker = document.getElementById(id);
    const slider = document.getElementById(id+'-alpha');
    const hexEl  = document.getElementById(id+'-hex');
    const h = picker.value.replace('#','').toUpperCase();
    const a = slider ? parseInt(slider.value).toString(16).padStart(2,'0').toUpperCase() : 'FF';
    if (hexEl) hexEl.value = '#'+h+a;
    updateAlphaSliderBg(id);
    const _cfId = window._cfActiveId ? window._cfActiveId() : null;
    if (id === 's-clock-date-bg' && _cfId === 'top-date') {
      document.getElementById('s-bg').value = picker.value;
      document.getElementById('s-bg-alpha').value = slider ? slider.value : 255;
      updateAlphaSliderBg('s-bg');
    } else if (id === 's-clock-time-bg' && _cfId === 'top-time') {
      document.getElementById('s-bg').value = picker.value;
      document.getElementById('s-bg-alpha').value = slider ? slider.value : 255;
      updateAlphaSliderBg('s-bg');
    } else if (id === 's-clock-date-color' && _cfId === 'top-date') {
      document.getElementById('s-fg').value = picker.value;
      document.getElementById('s-fg-alpha').value = slider ? slider.value : 255;
      updateAlphaSliderBg('s-fg');
    } else if (id === 's-clock-time-color' && _cfId === 'top-time') {
      document.getElementById('s-fg').value = picker.value;
      document.getElementById('s-fg-alpha').value = slider ? slider.value : 255;
      updateAlphaSliderBg('s-fg');
    } else if (id === 's-clock-date-glow' && _cfId === 'top-date') {
      document.getElementById('s-glow').value = picker.value;
      document.getElementById('s-glow-alpha').value = slider ? slider.value : 255;
      updateAlphaSliderBg('s-glow');
    } else if (id === 's-clock-time-glow' && _cfId === 'top-time') {
      document.getElementById('s-glow').value = picker.value;
      document.getElementById('s-glow-alpha').value = slider ? slider.value : 255;
      updateAlphaSliderBg('s-glow');
    } else if (id === 's-glow' && _cfId === 'top-date') {
      const _dg = document.getElementById('s-clock-date-glow');
      const _dga = document.getElementById('s-clock-date-glow-alpha');
      if (_dg) { _dg.value = picker.value; updateAlphaSliderBg('s-clock-date-glow'); }
      if (_dga) _dga.value = slider ? slider.value : 255;
    } else if (id === 's-glow' && _cfId === 'top-time') {
      const _tg = document.getElementById('s-clock-time-glow');
      const _tga = document.getElementById('s-clock-time-glow-alpha');
      if (_tg) { _tg.value = picker.value; updateAlphaSliderBg('s-clock-time-glow'); }
      if (_tga) _tga.value = slider ? slider.value : 255;
    }
    settingsChange();
}
function onAlphaChange(id) {
    const picker = document.getElementById(id);
    const slider = document.getElementById(id+'-alpha');
    const hexEl  = document.getElementById(id+'-hex');
    const h = picker ? picker.value.replace('#','').toUpperCase() : '444444';
    const a = parseInt(slider.value).toString(16).padStart(2,'0').toUpperCase();
    if (hexEl) hexEl.value = '#'+h+a;
    updateAlphaSliderBg(id);
    const _cfId = window._cfActiveId ? window._cfActiveId() : null;
    if (id === 's-clock-date-color' && _cfId === 'top-date') {
      document.getElementById('s-fg').value = document.getElementById('s-clock-date-color').value;
      document.getElementById('s-fg-alpha').value = document.getElementById('s-clock-date-color-alpha').value;
      updateAlphaSliderBg('s-fg');
    } else if (id === 's-clock-time-color' && _cfId === 'top-time') {
      document.getElementById('s-fg').value = document.getElementById('s-clock-time-color').value;
      document.getElementById('s-fg-alpha').value = document.getElementById('s-clock-time-color-alpha').value;
      updateAlphaSliderBg('s-fg');
    } else if (id === 's-clock-date-bg' && _cfId === 'top-date') {
      document.getElementById('s-bg').value = document.getElementById('s-clock-date-bg').value;
      document.getElementById('s-bg-alpha').value = document.getElementById('s-clock-date-bg-alpha').value;
      updateAlphaSliderBg('s-bg');
    } else if (id === 's-clock-time-bg' && _cfId === 'top-time') {
      document.getElementById('s-bg').value = document.getElementById('s-clock-time-bg').value;
      document.getElementById('s-bg-alpha').value = document.getElementById('s-clock-time-bg-alpha').value;
      updateAlphaSliderBg('s-bg');
    } else if (id === 's-clock-date-glow' && _cfId === 'top-date') {
      document.getElementById('s-glow').value = document.getElementById('s-clock-date-glow').value;
      document.getElementById('s-glow-alpha').value = document.getElementById('s-clock-date-glow-alpha').value;
      updateAlphaSliderBg('s-glow');
    } else if (id === 's-clock-time-glow' && _cfId === 'top-time') {
      document.getElementById('s-glow').value = document.getElementById('s-clock-time-glow').value;
      document.getElementById('s-glow-alpha').value = document.getElementById('s-clock-time-glow-alpha').value;
      updateAlphaSliderBg('s-glow');
    } else if (id === 's-glow' && _cfId === 'top-date') {
      const _dg = document.getElementById('s-clock-date-glow');
      const _dga = document.getElementById('s-clock-date-glow-alpha');
      if (_dg) { _dg.value = document.getElementById('s-glow').value; updateAlphaSliderBg('s-clock-date-glow'); }
      if (_dga) _dga.value = slider.value;
    } else if (id === 's-glow' && _cfId === 'top-time') {
      const _tg = document.getElementById('s-clock-time-glow');
      const _tga = document.getElementById('s-clock-time-glow-alpha');
      if (_tg) { _tg.value = document.getElementById('s-glow').value; updateAlphaSliderBg('s-clock-time-glow'); }
      if (_tga) _tga.value = slider.value;
    }
    settingsChange();
}
function onHexInput(id) {
    const hexEl = document.getElementById(id+'-hex');
    let val = hexEl.value.trim().replace(/[^0-9a-fA-F#]/g, '');
    if (val && !val.startsWith('#')) val = '#'+val;
    const h = val.replace('#','');
    if ((h.length === 6 || h.length === 8) && /^[0-9a-fA-F]+$/.test(h)) {
      hexEl.value = '#' + h.toUpperCase();
      const {r,g,b,a} = hex8ToComponents(h.length === 6 ? '#'+h+'FF' : '#'+h);
      const picker = document.getElementById(id);
      const slider = document.getElementById(id+'-alpha');
      if (picker) picker.value = '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
      if (slider) { slider.value = a; updateAlphaSliderBg(id); }
      settingsChange();
    }
  }
  document.addEventListener('focus', e => {
    if (e.target.classList.contains('hex-input')) e.target.select();
  }, true);

  function copyHex(id, btn) {
    const val = getColorValue(id);
    navigator.clipboard.writeText(val).then(() => {
      btn.textContent = 'Copied';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1200);
    }).catch(() => {});
  }

  // ── App background builders ────────────────────────────────
  function buildStopPickers() {
    const wrap = document.getElementById("s-app-stops-wrap");
    wrap.innerHTML = "";
    const t = appStyle.bgType;
    const numStops = t === "solid" ? 1 : t === "gradient2" ? 2 : t === "gradient3" ? 3 : t === "gradient4" ? 4 : 0;
    if (numStops === 0) return;
    while (appStyle.stops.length < numStops) appStyle.stops.push("#111111FF");
    for (let i = 0; i < numStops; i++) {
      const label = numStops === 1 ? "Background colour" : `Stop ${i+1}`;
      const pid = `s-app-stop-${i}`;
      const div = document.createElement("div");
      div.className = "color-settings-row";
      div.style.marginBottom = "4px";
      div.innerHTML = `
        <label>${label}</label>
        <div class="color-picker-row">
          <input type="color" id="${pid}" oninput="onColorPickerChange('${pid}')">
          <input type="range" class="alpha-slider" id="${pid}-alpha" min="0" max="255" value="255" oninput="onAlphaChange('${pid}')">
        </div>
        <div class="hex-copy-row">
          <input type="text" class="hex-input" id="${pid}-hex" maxlength="9" oninput="onHexInput('${pid}')" spellcheck="false" autocomplete="off">
          <button class="copy-btn" onclick="copyHex('${pid}',this)">Copy</button>
        </div>`;
      wrap.appendChild(div);
      setColorValue(pid, appStyle.stops[i] || "#111111FF");
      document.getElementById(pid).addEventListener("input", () => collectAppStops());
      document.getElementById(pid+"-alpha").addEventListener("input", () => collectAppStops());
    }
  }
  function collectAppStops() {
    const t = appStyle.bgType;
    const numStops = t === "solid" ? 1 : t === "gradient2" ? 2 : t === "gradient3" ? 3 : t === "gradient4" ? 4 : 0;
    appStyle.stops = [];
    for (let i = 0; i < numStops; i++) {
      appStyle.stops.push(getColorValue(`s-app-stop-${i}`));
    }
    buildAppBg();
  }

  function appBgTypeChange() {
    appStyle.bgType = document.getElementById("s-app-bg-type").value;
    const isGrad    = appStyle.bgType.startsWith("gradient");
    const isPat     = appStyle.bgType.startsWith("pattern");
    const isImg     = appStyle.bgType === "image";
    document.getElementById("s-app-grad-dir-row").style.display  = isGrad ? "" : "none";
    document.getElementById("s-app-pattern-wrap").style.display  = isPat  ? "" : "none";
    document.getElementById("s-app-image-wrap").style.display    = isImg  ? "flex" : "none";
    buildStopPickers();
    buildAppBg();
  }
  function settingsAppChange() {
    appStyle.bgType   = document.getElementById("s-app-bg-type").value;
    appStyle.gradDir  = document.getElementById("s-app-grad-dir").value;
    appStyle.patColor = getColorValue("s-app-pat-color");
    appStyle.patBg    = getColorValue("s-app-pat-bg");
    appStyle.patSize  = Number(document.getElementById("s-app-pat-size").value);
    appStyle.imgSize  = document.getElementById("s-app-img-size").value;
    appStyle.imgPos   = document.getElementById("s-app-img-pos").value;
    appStyle.imgRepeat   = document.getElementById("s-app-img-repeat").value;
    appStyle.imgAttach   = document.getElementById("s-app-img-attach").value;
    appStyle.imgTint     = getColorValue("s-app-img-tint");
    appStyle.textColor   = getColorValue("s-app-text");
    appStyle.borderColor = getColorValue("s-app-border");
    appStyle.theadBg     = getColorValue("s-app-thead");
    appStyle.cellBg      = getColorValue("s-app-cell-bg");
    if (document.getElementById("s-app-bar-set"))    appStyle.barSet    = getColorValue("s-app-bar-set");
    if (document.getElementById("s-app-bar-total"))  appStyle.barTotal  = getColorValue("s-app-bar-total");
    if (document.getElementById("s-app-bar-streak")) appStyle.barStreak = getColorValue("s-app-bar-streak");
    const _padEl = document.getElementById("s-app-padding"); if (_padEl) appStyle.padding = Number(_padEl.value);
    collectAppStops();
    applyAppStyle();
  }
  function appLoadImage(input) {
    const file = input.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      appStyle.imgData = e.target.result;
      appStyle.bgType  = "image";
      appStyle.imgSize   = document.getElementById("s-app-img-size").value   || appStyle.imgSize;
      appStyle.imgPos    = document.getElementById("s-app-img-pos").value    || appStyle.imgPos;
      appStyle.imgRepeat = document.getElementById("s-app-img-repeat").value || appStyle.imgRepeat;
      appStyle.imgAttach = document.getElementById("s-app-img-attach").value || appStyle.imgAttach;
      appStyle.imgTint   = getColorValue("s-app-img-tint");
      document.getElementById("s-app-bg-type").value = "image";
      appBgTypeChange();
      const thumb = document.getElementById("s-app-img-thumb");
      const prev  = document.getElementById("s-app-img-preview");
      if (thumb) { thumb.src = appStyle.imgData; prev.style.display = ""; }
      buildAppBg();
      input.value = "";
    };
    reader.readAsDataURL(file);
  }
  function appClearImage() {
    appStyle.imgData = null;
    const thumb = document.getElementById("s-app-img-thumb");
    const prev  = document.getElementById("s-app-img-preview");
    if (thumb) { thumb.src = ""; prev.style.display = "none"; }
    buildAppBg();
  }

  // ── Settings open/close/save/cancel/reset/export/import ───
  let _appStyleSnapshot = null;
  let _clockSnapshot    = null;
  let _settingsHasChanges = false;
  let _history = [];
  let _historyIndex = -1;
  let _undoPending = false;
  let _preGestureSnapshot = null;
  let _gestureHasChanges = false;
  let _undoDebounceTimer = null;
  let _skipCancelSnapshot = false;
  let _applyingSnapshot = false;
  function toggleSettingsGroup(groupId) {
    document.querySelectorAll('.settings-group-content').forEach(el => {
      if (el.id !== groupId) {
        el.classList.remove('open');
        const btn = document.querySelector(`#settings-groups-grid [data-group="${el.id}"]`);
        if (btn) btn.classList.remove('sg-active');
      }
    });
    if (window._cpClose) window._cpClose();
    const c = document.getElementById(groupId);
    const isOpen = c.classList.toggle('open');
    if (isOpen) history.pushState({panel:'sg'}, '');
    if (groupId === 'sg-clock' && isOpen) {
  setColorValue('s-clock-date-color', _btnStyles['top-date']?.fg || btnStyle.clockDateColor);
  updateAlphaSliderBg('s-clock-date-color');
}
    const item = document.querySelector(`#settings-groups-grid [data-group="${groupId}"]`);
    if (item) item.classList.toggle('sg-active', isOpen);
    if (groupId === 'sg-swatches' && isOpen) {
      if (window._cpSyncUI) window._cpSyncUI();
    }
    if (groupId === 'sg-notifications' && isOpen) {
      if (window.notifRefreshPermission) window.notifRefreshPermission();
      if (window.notifLoadScheduleUI) window.notifLoadScheduleUI();
    }
    if (groupId === 'sg-buttons' && isOpen) {
      const stage = document.getElementById('cf-stage');
      if (stage) stage.style.visibility = 'hidden';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (window._cfBuild) window._cfBuild();
          if (stage) stage.style.visibility = '';
        });
      });
    }
  }
  function _captureStyleSnapshot() {
    return {
      btnStyle: Object.assign({}, btnStyle),
      _btnStyles: JSON.parse(JSON.stringify(_btnStyles)),
      appStyle: Object.assign({}, appStyle, { stops: appStyle.stops.slice(), imgData: appStyle.imgData }),
      clock: window._clockGet().tumblerCfg.slice(),
    };
  }
  function _updateUndoRedoBtns() { _updateSettingsBtns(); }
  function _canUndo() { return _historyIndex > 0; }
  function _canRedo() { return _historyIndex < _history.length - 1; }
  function _updateSettingsBtns() {
    const saveBtn   = document.getElementById('settings-save');
    const cancelBtn = document.getElementById('settings-cancel');
    const undoBtn   = document.getElementById('settings-undo');
    const redoBtn   = document.getElementById('settings-redo');
    const anyActivity = _settingsHasChanges || _history.length > 1;
    if (saveBtn)   { saveBtn.style.display = anyActivity ? '' : 'none'; saveBtn.disabled = !_settingsHasChanges; saveBtn.style.opacity = _settingsHasChanges ? '' : '0.35'; }
    if (cancelBtn) cancelBtn.textContent = _settingsHasChanges ? 'Cancel' : 'Close';
    if (undoBtn)   { undoBtn.style.display = anyActivity ? '' : 'none'; undoBtn.disabled = !_canUndo(); undoBtn.style.opacity = _canUndo() ? '' : '0.35'; }
    if (redoBtn)   { redoBtn.style.display = anyActivity ? '' : 'none'; redoBtn.disabled = !_canRedo(); redoBtn.style.opacity = _canRedo() ? '' : '0.35'; }
  }
  function _syncSettingsPanelUI() {
    if (window._cfBuild) window._cfBuild();
    setColorValue('s-sliderborder',       btnStyle.sliderBorder       || '#555555FF');
    setColorValue('s-sliderfill',         btnStyle.sliderFill         || '#9659FFFF');
    setColorValue('s-slidertrack',        btnStyle.sliderTrack        || '#333333FF');
    setColorValue('s-sliderhandle',       btnStyle.sliderHandle       || '#FFFFFFFF');
    setColorValue('s-sliderhandleborder', btnStyle.sliderHandleBorder || '#00000000');
    const _sv  = (id, v)      => { const el = document.getElementById(id); if (el) el.value = String(v); };
    const _svl = (id, v, sfx) => { const el = document.getElementById(id); if (el) el.textContent = v + sfx; };
    _sv('s-sliderh',       btnStyle.sliderH      ?? 8);   _svl('s-sliderh-val',       btnStyle.sliderH      ?? 8,   'px');
    _sv('s-sliderr',       btnStyle.sliderR      ?? 4);   _svl('s-sliderr-val',       btnStyle.sliderR      ?? 4,   '%');
    _sv('s-sliderspread',  btnStyle.sliderSpread ?? 4);   _svl('s-sliderspread-val',  btnStyle.sliderSpread ?? 4,   'px');
    _sv('s-sliderhandleh', btnStyle.sliderHandleH?? 16);  _svl('s-sliderhandleh-val', btnStyle.sliderHandleH?? 16,  'px');
    _sv('s-sliderhandler', btnStyle.sliderHandleR?? 3);   _svl('s-sliderhandler-val', btnStyle.sliderHandleR?? 3,   '%');
    _sv('s-sliderw',       btnStyle.sliderW      ?? 100); _svl('s-sliderw-val',       btnStyle.sliderW      ?? 100, '%');
    _sv('s-sliderhandlew', btnStyle.sliderHandleW?? 16);  _svl('s-sliderhandlew-val', btnStyle.sliderHandleW?? 16,  'px');
    setColorValue('s-clock-date-color', _btnStyleFor('top-date').fg);
    setColorValue('s-clock-time-color', _btnStyleFor('top-time').fg);
    setColorValue('s-clock-date-bg',    _btnStyleFor('top-date').bg);
    setColorValue('s-clock-time-bg',    _btnStyleFor('top-time').bg);
    setColorValue('s-clock-date-glow',  _btnStyleFor('top-date').glow || '#00000000');
    setColorValue('s-clock-time-glow',  _btnStyleFor('top-time').glow || '#00000000');
    _sv('s-clock-date-size', _btnStyles['top-date']?.clockDateSize ?? btnStyle.clockDateSize);
    _sv('s-clock-time-size', _btnStyles['top-time']?.clockTimeSize ?? btnStyle.clockTimeSize);
    if (window._tumblerRefresh) window._tumblerRefresh();
    setColorValue('s-checkbox-checked', btnStyle.checkboxChecked);
    setColorValue('s-checkbox-mark',    btnStyle.checkboxMark);
    setColorValue('s-checkbox-border',  btnStyle.checkboxBorder);
    setColorValue('s-checkbox-bg',      btnStyle.checkboxBg);
    const _bgTypeEl  = document.getElementById('s-app-bg-type');  if (_bgTypeEl)  _bgTypeEl.value  = appStyle.bgType;
    const _gradDirEl = document.getElementById('s-app-grad-dir'); if (_gradDirEl) _gradDirEl.value = appStyle.gradDir;
    setColorValue('s-app-pat-color',  appStyle.patColor);
    setColorValue('s-app-pat-bg',     appStyle.patBg);
    setColorValue('s-app-img-tint',   appStyle.imgTint);
    setColorValue('s-app-text',       appStyle.textColor);
    setColorValue('s-app-border',     appStyle.borderColor);
    setColorValue('s-app-thead',      appStyle.theadBg);
    setColorValue('s-app-cell-bg',    appStyle.cellBg || '#111111FF');
    buildStopPickers();
    const _isGrad = appStyle.bgType.startsWith('gradient');
    const _isPat  = appStyle.bgType.startsWith('pattern');
    const _isImg  = appStyle.bgType === 'image';
    document.getElementById('s-app-grad-dir-row').style.display = _isGrad ? '' : 'none';
    document.getElementById('s-app-pattern-wrap').style.display = _isPat  ? '' : 'none';
    document.getElementById('s-app-image-wrap').style.display   = _isImg  ? 'flex' : 'none';
    if (window._cpSyncUI) window._cpSyncUI();
    const _fontSel = document.getElementById('s-font'); if (_fontSel) _fontSel.value = btnStyle.font;
    if (window.fontPickerSync) window.fontPickerSync();
    document.querySelectorAll('.alpha-slider').forEach(function(s) {
      if (s.id && s.id.endsWith('-alpha')) updateAlphaSliderBg(s.id.slice(0, -6));
      else updateSliderFill(s);
    });
    settingsUpdatePreview();
  }
  function _applyStyleSnapshot(snap) {
    _applyingSnapshot = true;
    btnStyle   = Object.assign({}, snap.btnStyle);
    _btnStyles = JSON.parse(JSON.stringify(snap._btnStyles));
    appStyle   = Object.assign({}, snap.appStyle, { stops: snap.appStyle.stops.slice(), imgData: snap.appStyle.imgData });
    window._clockSet(snap.clock);
    applyBtnStyle();
    applyAppStyle();
    if (document.getElementById('settings-overlay').classList.contains('active')) {
      _syncSettingsPanelUI();
    }
    _applyingSnapshot = false;
  }
  function settingsUndo() {
    clearTimeout(_undoDebounceTimer);
    if (!_canUndo()) return;
    _historyIndex--;
    _applyingSnapshot = true;
    _applyStyleSnapshot(_history[_historyIndex]);
    _applyingSnapshot = false;
    _settingsHasChanges = true;
    _updateUndoRedoBtns();
  }
  function settingsRedo() {
    clearTimeout(_undoDebounceTimer);
    if (!_canRedo()) return;
    _historyIndex++;
    _applyingSnapshot = true;
    _applyStyleSnapshot(_history[_historyIndex]);
    _applyingSnapshot = false;
    _settingsHasChanges = true;
    _updateUndoRedoBtns();
  }
  function settingsOpen() {
    try {
    _settingsJustOpened = true;
    // Debounce all top-grid buttons to prevent accidental clicks on open
    document.querySelectorAll('.top-item button, .app-btn').forEach(btn => {
      btn.dataset.debounced = 'false';
      if (!btn.dataset.debounceListener) {
        btn.addEventListener('click', (e) => {
          if (btn.dataset.debounced === 'true') {
            e.stopImmediatePropagation();
            e.preventDefault();
            return;
          }
          btn.dataset.debounced = 'true';
          setTimeout(() => { btn.dataset.debounced = 'false'; }, btn.id === 'hide-habits-btn' ? 2 : 500);
    }, true);
    btn.dataset.debounceListener = 'true';
      }
    });
    const _wasSkipSnap = _skipCancelSnapshot;
    _skipCancelSnapshot = false;
    if (!_wasSkipSnap) {
      _settingsHasChanges = false;
      _btnStyleSnapshot  = Object.assign({}, btnStyle);
      _btnStylesSnapshot = JSON.parse(JSON.stringify(_btnStyles));
      _appStyleSnapshot  = Object.assign({}, appStyle, { stops: appStyle.stops.slice(), imgData: appStyle.imgData });
      const clk = window._clockGet();
      _clockSnapshot = { tumblerCfg: clk.tumblerCfg.slice() };
      _history = [_captureStyleSnapshot()]; _historyIndex = 0; _updateSettingsBtns();
    }
    const _initId = window._cfActiveId ? window._cfActiveId() : null;
    const _initS  = _initId ? _btnStyleFor(_initId) : btnStyle;
    setColorValue('s-bg',           _initS.bg);
    setColorValue('s-fg',           _initS.fg);
    setColorValue('s-glow',         _initS.glow);
    setColorValue('s-activeglow',   _initS.activeGlow || _initS.glow);
    setColorValue('s-activebg',     _initS.activeBg);
    setColorValue('s-tap',          _initS.tap || btnStyle.tap);
    setColorValue('s-taphighlight', btnStyle.tapHighlight);
    setColorValue('s-sliderfill',      btnStyle.sliderFill   || '#9659FFFF');
    setColorValue('s-slidertrack',     btnStyle.sliderTrack  || '#333333FF');
    setColorValue('s-sliderhandle',    btnStyle.sliderHandle || '#FFFFFFFF');
    setColorValue('s-sliderhandleborder', btnStyle.sliderHandleBorder || '#00000000');
    setColorValue('s-sliderborder', btnStyle.sliderBorder || '#555555FF');
    setColorValue('s-checkbox-checked', btnStyle.checkboxChecked);
    setColorValue('s-checkbox-mark',    btnStyle.checkboxMark);
    setColorValue('s-checkbox-border',  btnStyle.checkboxBorder);
    setColorValue('s-checkbox-bg', btnStyle.checkboxBg);
    setColorValue('s-clock-date-color', _btnStyleFor('top-date').fg);
    setColorValue('s-clock-time-color', _btnStyleFor('top-time').fg);
    setColorValue('s-clock-date-bg',    _btnStyleFor('top-date').bg);
    setColorValue('s-clock-time-bg',    _btnStyleFor('top-time').bg);
    setColorValue('s-clock-bg',         btnStyle.clockBg);
    setColorValue('s-clock-date-glow',  _btnStyleFor('top-date').glow || '#00000000');
    setColorValue('s-clock-time-glow',  _btnStyleFor('top-time').glow || '#00000000');
    document.getElementById("s-clock-date-size").value = _btnStyles['top-date']?.clockDateSize ?? btnStyle.clockDateSize;
    document.getElementById("s-clock-time-size").value = _btnStyles['top-time']?.clockTimeSize ?? btnStyle.clockTimeSize;
    const _cdrOpenV = _btnStyles['top-date']?.btnRadius ?? btnStyle.btnRadius ?? 6;
    const _cdrOpenEl = document.getElementById("s-clock-date-radius"); if (_cdrOpenEl) { _cdrOpenEl.value = String(_cdrOpenV); const _cdrvOpenEl = document.getElementById("s-clock-date-radius-val"); if (_cdrvOpenEl) _cdrvOpenEl.textContent = _cdrOpenV + "px"; }
    const _ctrOpenV = _btnStyles['top-time']?.btnRadius ?? btnStyle.btnRadius ?? 6;
    const _ctrOpenEl = document.getElementById("s-clock-time-radius"); if (_ctrOpenEl) { _ctrOpenEl.value = String(_ctrOpenV); const _ctrvOpenEl = document.getElementById("s-clock-time-radius-val"); if (_ctrvOpenEl) _ctrvOpenEl.textContent = _ctrOpenV + "px"; }
    document.getElementById("s-font").value    = btnStyle.font;
    const _initRadius = (_initId && _btnStyles[_initId]?.btnRadius != null) ? _btnStyles[_initId].btnRadius : (btnStyle.btnRadius ?? 6);
document.getElementById("s-radius").value  = String(_initRadius);
const _rvVal = document.getElementById("s-radius-val"); if (_rvVal) _rvVal.textContent = _initRadius + "px";
    const _sliderW = btnStyle.sliderW ?? 100;
    const _sliderHW = btnStyle.sliderHandleW ?? 16;
    const _swEl = document.getElementById('s-sliderw'); if (_swEl) _swEl.value = String(_sliderW);
    const _swvEl = document.getElementById('s-sliderw-val'); if (_swvEl) _swvEl.textContent = _sliderW + '%';
    const _shwEl = document.getElementById('s-sliderhandlew'); if (_shwEl) _shwEl.value = String(_sliderHW);
    const _shwvEl = document.getElementById('s-sliderhandlew-val'); if (_shwvEl) _shwvEl.textContent = _sliderHW + 'px';
    const _shEl = document.getElementById('s-sliderh'); if (_shEl) _shEl.value = String(btnStyle.sliderH ?? 8);
    const _shvEl = document.getElementById('s-sliderh-val'); if (_shvEl) _shvEl.textContent = (btnStyle.sliderH ?? 8) + 'px';
    const _srEl = document.getElementById('s-sliderr'); if (_srEl) _srEl.value = String(btnStyle.sliderR ?? 4);
    const _srvEl = document.getElementById('s-sliderr-val'); if (_srvEl) _srvEl.textContent = (btnStyle.sliderR ?? 4) + '%';
    const _sspEl2 = document.getElementById('s-sliderspread'); if (_sspEl2) _sspEl2.value = String(btnStyle.sliderSpread ?? 4);
    const _sspvEl2 = document.getElementById('s-sliderspread-val'); if (_sspvEl2) _sspvEl2.textContent = (btnStyle.sliderSpread ?? 4) + 'px';
    const _shhEl2 = document.getElementById('s-sliderhandleh'); if (_shhEl2) _shhEl2.value = String(btnStyle.sliderHandleH ?? 16);
    const _shhvEl2 = document.getElementById('s-sliderhandleh-val'); if (_shhvEl2) _shhvEl2.textContent = (btnStyle.sliderHandleH ?? 16) + 'px';
    const _shrEl2 = document.getElementById('s-sliderhandler'); if (_shrEl2) _shrEl2.value = String(btnStyle.sliderHandleR ?? 3);
    const _shrvEl2 = document.getElementById('s-sliderhandler-val'); if (_shrvEl2) _shrvEl2.textContent = (btnStyle.sliderHandleR ?? 3) + '%';
    setColorValue('s-sliderhandleborder', btnStyle.sliderHandleBorder || '#00000000');
    const _s = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    _s("s-app-bg-type",    appStyle.bgType);
    _s("s-app-grad-dir",   appStyle.gradDir);
    _s("s-app-pat-size",   appStyle.patSize);
    _s("s-app-img-size",   appStyle.imgSize);
    _s("s-app-img-pos",    appStyle.imgPos);
    _s("s-app-img-repeat", appStyle.imgRepeat);
    _s("s-app-img-attach", appStyle.imgAttach);
    _s("s-app-padding",    appStyle.padding);
    setColorValue("s-app-pat-color",  appStyle.patColor);
    setColorValue("s-app-pat-bg",     appStyle.patBg);
    setColorValue("s-app-img-tint",   appStyle.imgTint);
    setColorValue("s-app-text",       appStyle.textColor);
    setColorValue("s-app-border",     appStyle.borderColor);
    setColorValue("s-app-thead",      appStyle.theadBg);
    setColorValue("s-app-cell-bg",    appStyle.cellBg || "#111111FF");
    setColorValue("s-app-bar-set",    appStyle.barSet);
    setColorValue("s-app-bar-total",  appStyle.barTotal);
    setColorValue("s-app-bar-streak", appStyle.barStreak);
    const isGrad = appStyle.bgType.startsWith("gradient");
    const isPat  = appStyle.bgType.startsWith("pattern");
    const isImg  = appStyle.bgType === "image";
    document.getElementById("s-app-grad-dir-row").style.display = isGrad ? "" : "none";
    document.getElementById("s-app-pattern-wrap").style.display = isPat  ? "" : "none";
    document.getElementById("s-app-image-wrap").style.display   = isImg  ? "flex" : "none";
    if (appStyle.imgData) {
      const thumb = document.getElementById("s-app-img-thumb");
      const prev  = document.getElementById("s-app-img-preview");
      if (thumb) { thumb.src = appStyle.imgData; prev.style.display = ""; }
    }
    buildStopPickers();
    settingsUpdatePreview();
    document.getElementById("settings-overlay").classList.add("active");
    if (typeof cfSyncTuningUI !== 'undefined') if (window.cfSyncTuningUI) window.cfSyncTuningUI();
    if (window._cfBuild) {
      window._cfBuild();
    }
    if(window.fontPickerSync)fontPickerSync();
    document.querySelectorAll('.alpha-slider').forEach(s => {
      if (s.id && s.id.endsWith('-alpha')) updateAlphaSliderBg(s.id.slice(0, -6));
      else updateSliderFill(s);
    });
    requestAnimationFrame(() => {
      document.querySelectorAll('.hex-input').forEach(hexEl => {
        if (hexEl.value) return;
        const id = hexEl.id.replace('-hex', '');
        const picker = document.getElementById(id);
        const slider = document.getElementById(id + '-alpha');
        if (!picker) return;
        const h = picker.value.replace('#', '').toUpperCase();
        const a = slider ? parseInt(slider.value).toString(16).padStart(2,'0').toUpperCase() : 'FF';
        hexEl.value = '#' + h + a;
      });
    });
    if (!_wasSkipSnap) {
      history.pushState({panel:'settings'}, '');
    }
    } catch(e) { alert("settingsOpen error: " + e.message + "\n" + e.stack); }
  }
  function settingsClose() {
    if (window._cpClose) window._cpClose();
    document.getElementById("settings-overlay").classList.remove("active");
  }
  async function settingsSave() {
    _settingsHasChanges = false;
    btnStyle.sliderHandleW  = Number(document.getElementById("s-sliderhandlew").value);
    btnStyle.sliderW        = Number(document.getElementById("s-sliderw").value);
    localStorage.setItem("_btnStyle",   JSON.stringify(btnStyle));
    localStorage.setItem("_btnStyles",  JSON.stringify(_btnStyles));
    try {
      const saveStyle = Object.assign({}, appStyle, { imgData: null });
      localStorage.setItem("_appStyle", JSON.stringify(saveStyle));
    } catch(e) {
      await showAlert("Settings could not be saved: " + e.message);
      return;
    }
    if (appStyle.imgData) {
      try { await ImgDB.set("bgImage", appStyle.imgData); }
      catch(e) { await showAlert("Image could not be saved:\n" + e.message); }
    } else {
      try { await ImgDB.del("bgImage"); } catch {}
    }
    localStorage.setItem("_clockTumbler", JSON.stringify(window._clockGet().tumblerCfg));
    applyBtnStyle();
    applyAppStyle();
    if (window._cpSaveFromUI) window._cpSaveFromUI();
    settingsClose();
  }
  function settingsCancel() {
    if (_btnStyleSnapshot)  { btnStyle   = Object.assign({}, _btnStyleSnapshot); }
    if (_btnStylesSnapshot) { _btnStyles = JSON.parse(JSON.stringify(_btnStylesSnapshot)); }
    if (_btnStyleSnapshot || _btnStylesSnapshot) applyBtnStyle();
    if (_appStyleSnapshot)  { appStyle   = Object.assign({}, _appStyleSnapshot); applyAppStyle(); }
    if (_clockSnapshot) window._clockSet(_clockSnapshot.tumblerCfg);
    _settingsHasChanges = false;
    _history = []; _historyIndex = -1; _updateSettingsBtns();
    settingsClose();
  }
  function settingsExport() {
    const clk = window._clockGet();
    const out = {
      "_btnStyle":           JSON.stringify(btnStyle),
      "_btnStyles":          JSON.stringify(_btnStyles),
      "_clockTumbler":       JSON.stringify(clk.tumblerCfg),
      "_cfTuning":           localStorage.getItem("_cfTuning") || "{}",
      "_settingsGroupOrder": localStorage.getItem("_settingsGroupOrder") || "[]",
      "_sliderRowOrder":     localStorage.getItem("_sliderRowOrder")     || "[]",
      "_trackerConfigs":    localStorage.getItem("_trackerConfigs")    || "[]",
    };
    const saveStyle = Object.assign({}, appStyle, { imgData: null });
    out["_appStyle"] = JSON.stringify(saveStyle);
    const blob = new Blob([JSON.stringify(out, null, 2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `settings-${exportDateStr(new Date())}.json`;
    a.click(); URL.revokeObjectURL(a.href);
  }
  function settingsImport(input) {
    const file = input.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (data["_btnStyle"]) {
          btnStyle = Object.assign({}, BTN_STYLE_DEFAULTS, JSON.parse(data["_btnStyle"]));
          applyBtnStyle();
          setColorValue('s-bg',       btnStyle.bg);
          setColorValue('s-fg',       btnStyle.fg);
          setColorValue('s-glow',     btnStyle.glow);
          setColorValue('s-activeglow', btnStyle.activeGlow || btnStyle.glow);
          setColorValue('s-activebg', btnStyle.activeBg);
          setColorValue('s-tap',      btnStyle.tap);
          setColorValue('s-sliderborder', btnStyle.sliderBorder || '#555555FF');
          setColorValue('s-sliderfill',    btnStyle.sliderFill   || '#9659FFFF');
          setColorValue('s-slidertrack',   btnStyle.sliderTrack  || '#333333FF');
          setColorValue('s-sliderhandle',  btnStyle.sliderHandle || '#FFFFFFFF');
          setColorValue('s-sliderhandleborder', btnStyle.sliderHandleBorder || '#00000000');

          const _sv = (id, val) => { const el = document.getElementById(id); if (el) el.value = String(val); };
          _sv('s-sliderh',       btnStyle.sliderH);
          _sv('s-sliderr',       btnStyle.sliderR);
          _sv('s-sliderspread',  btnStyle.sliderSpread   ?? 4);
          _sv('s-sliderhandleh', btnStyle.sliderHandleH  ?? 16);
          _sv('s-sliderhandler', btnStyle.sliderHandleR  ?? 3);
          _sv('s-sliderw',       btnStyle.sliderW        ?? 100);
          _sv('s-sliderhandlew', btnStyle.sliderHandleW  ?? 16);
          const _swIvEl = document.getElementById('s-sliderw-val'); if (_swIvEl) _swIvEl.textContent = (btnStyle.sliderW ?? 100) + '%';
          const _shwIvEl = document.getElementById('s-sliderhandlew-val'); if (_shwIvEl) _shwIvEl.textContent = (btnStyle.sliderHandleW ?? 16) + 'px';
          const _shv2 = document.getElementById('s-sliderh-val');       if (_shv2) _shv2.textContent = btnStyle.sliderH + 'px';
          const _srv2 = document.getElementById('s-sliderr-val');       if (_srv2) _srv2.textContent = btnStyle.sliderR + '%';
          const _sspv2 = document.getElementById('s-sliderspread-val'); if (_sspv2) _sspv2.textContent = (btnStyle.sliderSpread ?? 4) + 'px';
          const _shhv2 = document.getElementById('s-sliderhandleh-val');if (_shhv2) _shhv2.textContent = (btnStyle.sliderHandleH ?? 16) + 'px';
          const _shrv2 = document.getElementById('s-sliderhandler-val');if (_shrv2) _shrv2.textContent = (btnStyle.sliderHandleR ?? 3) + '%';
          document.getElementById("s-font").value = btnStyle.font;
          settingsUpdatePreview();
          if(window.fontPickerSync)fontPickerSync();
        }
        if (data["_clockTumbler"] !== undefined) {
          try {
            const cfg = JSON.parse(data["_clockTumbler"]);
            if (Array.isArray(cfg) && cfg.length === 8) {
              localStorage.setItem("_clockTumbler", data["_clockTumbler"]);
              window._clockSet(cfg);
              if (window._tumblerRefresh) window._tumblerRefresh();
            }
          } catch {}
        }
        if (data["_btnStyles"]) {
          try {
            _btnStyles = Object.assign({}, JSON.parse(data["_btnStyles"]));
            _saveBtnStyles();
          } catch {}
        }
        if (data["_appStyle"]) {
          try {
            const _existingImg = appStyle.imgData;
            appStyle = Object.assign({}, APP_STYLE_DEFAULTS, JSON.parse(data["_appStyle"]));
            if (!appStyle.imgData && _existingImg) appStyle.imgData = _existingImg;
            localStorage.setItem("_appStyle", data["_appStyle"]);
            if (appStyle.bgType === 'image' && !appStyle.imgData) {
              ImgDB.get("bgImage").then(img => { if (img) { appStyle.imgData = img; applyAppStyle(); } }).catch(() => {});
            }
            applyAppStyle();
          } catch {}
        }
        if (data["_cfTuning"]) {
          try {
            Object.assign(cfTuning, JSON.parse(data["_cfTuning"]));
            localStorage.setItem("_cfTuning", data["_cfTuning"]);
            if (typeof cfSyncTuningUI !== 'undefined') if (window.cfSyncTuningUI) window.cfSyncTuningUI();
          } catch {}
        }
        if (data["_settingsGroupOrder"]) {
          try {
            localStorage.setItem("_settingsGroupOrder", data["_settingsGroupOrder"]);
            applySettingsGroupOrder();
          } catch {}
        }
        if (data["_sliderRowOrder"]) {
          try {
            localStorage.setItem("_sliderRowOrder", data["_sliderRowOrder"]);
            applySliderRowOrder();
          } catch {}
        }
        if (data["_trackerConfigs"]) {
          try {
            localStorage.setItem("_trackerConfigs", data["_trackerConfigs"]);
          } catch {}
        }
        input.value = "";
      } catch { alert("Invalid settings file."); }
    };
    reader.readAsText(file);
  }
  function settingsChange() {
    if (!document.getElementById('s-bg')) return;
    if (!_applyingSnapshot) {
      _settingsHasChanges = true;
      _updateUndoRedoBtns();
      clearTimeout(_undoDebounceTimer);
      _undoDebounceTimer = setTimeout(() => {
        if (_applyingSnapshot) return;
        _history = _history.slice(0, _historyIndex + 1);
        _history.push(_captureStyleSnapshot());
        if (_history.length > 50) _history.shift();
        _historyIndex = _history.length - 1;
        _updateUndoRedoBtns();
      }, 400);
    }
    const _cfId = window._cfActiveId ? window._cfActiveId() : null;
    if (_cfId) {
      if (_cfId === 'top-date') {
        const dateColor = getColorValue('s-fg');
        _btnStyles['top-date'] = Object.assign(_btnStyles['top-date'] || {}, {
          bg: getColorValue('s-bg'), fg: dateColor,
          glow: getColorValue('s-glow'), activeGlow: getColorValue('s-activeglow'),
          activeBg: getColorValue('s-activebg'),
          tap: getColorValue('s-tap'), font: document.getElementById("s-font").value,
          clockDateSize: Number(document.getElementById("s-clock-date-size").value),
        });
        setColorValue('s-clock-date-color', dateColor);
        updateAlphaSliderBg('s-clock-date-color');
        setColorValue('s-clock-date-glow', getColorValue('s-glow'));
        updateAlphaSliderBg('s-clock-date-glow');
      } else if (_cfId === 'top-time') {
        const timeColor = getColorValue('s-fg');
        _btnStyles['top-time'] = Object.assign(_btnStyles['top-time'] || {}, {
          bg: getColorValue('s-bg'), fg: timeColor,
          glow: getColorValue('s-glow'), activeGlow: getColorValue('s-activeglow'),
          activeBg: getColorValue('s-activebg'),
          tap: getColorValue('s-tap'), font: document.getElementById("s-font").value,
          clockTimeSize: Number(document.getElementById("s-clock-time-size").value),
        });
        setColorValue('s-clock-time-color', timeColor);
        updateAlphaSliderBg('s-clock-time-color');
        setColorValue('s-clock-time-glow', getColorValue('s-glow'));
        updateAlphaSliderBg('s-clock-time-glow');
      } else {
        _btnStyles[_cfId] = Object.assign(_btnStyles[_cfId] || {}, {
          bg: getColorValue('s-bg'), fg: getColorValue('s-fg'),
          glow: getColorValue('s-glow'), activeGlow: getColorValue('s-activeglow'),
          activeBg: getColorValue('s-activebg'),
          tap: getColorValue('s-tap'), font: document.getElementById("s-font").value,
        });
      }
      _saveBtnStyles();
    }
    if (!_cfId) btnStyle.btnRadius = Number(document.getElementById("s-radius").value);
else {
  _btnStyles[_cfId] = Object.assign(_btnStyles[_cfId] || {}, {
    btnRadius: Number(document.getElementById("s-radius").value)
  });
  if (_cfId === 'top-date') { const _cdrSEl = document.getElementById("s-clock-date-radius"); if (_cdrSEl) { _cdrSEl.value = document.getElementById("s-radius").value; const _cdrsVEl = document.getElementById("s-clock-date-radius-val"); if (_cdrsVEl) _cdrsVEl.textContent = document.getElementById("s-radius").value + "px"; } }
  if (_cfId === 'top-time') { const _ctrSEl = document.getElementById("s-clock-time-radius"); if (_ctrSEl) { _ctrSEl.value = document.getElementById("s-radius").value; const _ctrsVEl = document.getElementById("s-clock-time-radius-val"); if (_ctrsVEl) _ctrsVEl.textContent = document.getElementById("s-radius").value + "px"; } }
}
    btnStyle.tap            = getColorValue('s-tap');
    btnStyle.glow           = getColorValue('s-glow');
    btnStyle.activeGlow     = getColorValue('s-activeglow');
    btnStyle.tapHighlight   = getColorValue('s-taphighlight');
    btnStyle.sliderBorder   = getColorValue('s-sliderborder');
    if (document.getElementById('s-sliderfill'))   btnStyle.sliderFill   = getColorValue('s-sliderfill');
if (document.getElementById('s-slidertrack'))  btnStyle.sliderTrack  = getColorValue('s-slidertrack');
if (document.getElementById('s-sliderhandle')) btnStyle.sliderHandle = getColorValue('s-sliderhandle');
    if (document.getElementById('s-sliderhandleborder')) btnStyle.sliderHandleBorder = getColorValue('s-sliderhandleborder');
    btnStyle.sliderH        = Number(document.getElementById("s-sliderh").value);
    btnStyle.sliderR        = Number(document.getElementById("s-sliderr").value);
    btnStyle.sliderSpread   = Number(document.getElementById("s-sliderspread").value);
    btnStyle.sliderHandleH  = Number(document.getElementById("s-sliderhandleh").value);
    btnStyle.sliderHandleR  = Number(document.getElementById("s-sliderhandler").value);
    btnStyle.sliderW        = Number(document.getElementById("s-sliderw").value);
    btnStyle.sliderHandleW  = Number(document.getElementById("s-sliderhandlew").value);
    btnStyle.checkboxChecked = getColorValue('s-checkbox-checked');
    btnStyle.checkboxMark    = getColorValue('s-checkbox-mark');
    btnStyle.checkboxBorder  = getColorValue('s-checkbox-border');
    btnStyle.checkboxBg      = getColorValue('s-checkbox-bg');
    btnStyle.clockBg         = getColorValue('s-clock-bg');
    if (_cfId !== 'top-date') {
      _btnStyles['top-date'] = Object.assign(_btnStyles['top-date'] || {}, {
        bg: getColorValue('s-clock-date-bg'),
        fg: getColorValue('s-clock-date-color'),
        glow: getColorValue('s-clock-date-glow'),
        clockDateSize: Number(document.getElementById("s-clock-date-size").value),
      });
    }
    if (_cfId !== 'top-time') {
      _btnStyles['top-time'] = Object.assign(_btnStyles['top-time'] || {}, {
        bg: getColorValue('s-clock-time-bg'),
        fg: getColorValue('s-clock-time-color'),
        glow: getColorValue('s-clock-time-glow'),
        clockTimeSize: Number(document.getElementById("s-clock-time-size").value),
      });
    }
if (_cfId !== 'top-date') {
const cfDateColor = getColorValue('s-clock-date-color');
_btnStyles['top-date'] = Object.assign(_btnStyles['top-date'] || {}, {
  bg: getColorValue('s-clock-date-bg'),
  fg: cfDateColor,
  glow: getColorValue('s-clock-date-glow'),
  clockDateSize: Number(document.getElementById("s-clock-date-size").value),
});
}
    if (_cfId === 'top-date') {
      const _newDateFg = getColorValue('s-fg');
      _btnStyles['top-date'] = Object.assign(_btnStyles['top-date'] || {}, { fg: _newDateFg, clockDateSize: Number(document.getElementById("s-clock-date-size").value) });
      document.getElementById('s-clock-date-color').value = document.getElementById('s-fg').value;
      document.getElementById('s-clock-date-color-alpha').value = document.getElementById('s-fg-alpha').value;
      updateAlphaSliderBg('s-clock-date-color');
      const _hexDateEl = document.getElementById('s-clock-date-color-hex'); if (_hexDateEl) _hexDateEl.value = getColorValue('s-fg');
    }
    if (_cfId === 'top-time') {
      const _newTimeFg = getColorValue('s-fg');
      _btnStyles['top-time'] = Object.assign(_btnStyles['top-time'] || {}, { fg: _newTimeFg, clockTimeSize: Number(document.getElementById("s-clock-time-size").value) });
      document.getElementById('s-clock-time-color').value = document.getElementById('s-fg').value;
      document.getElementById('s-clock-time-color-alpha').value = document.getElementById('s-fg-alpha').value;
      updateAlphaSliderBg('s-clock-time-color');
      const _hexTimeEl = document.getElementById('s-clock-time-color-hex'); if (_hexTimeEl) _hexTimeEl.value = getColorValue('s-fg');
    }
    const _cdrIn = document.getElementById("s-clock-date-radius");
    const _ctrIn = document.getElementById("s-clock-time-radius");
    if (_cdrIn && _cfId !== 'top-date') _btnStyles['top-date'] = Object.assign(_btnStyles['top-date'] || {}, { btnRadius: Number(_cdrIn.value) });
    if (_ctrIn && _cfId !== 'top-time') _btnStyles['top-time'] = Object.assign(_btnStyles['top-time'] || {}, { btnRadius: Number(_ctrIn.value) });
    _saveBtnStyles();
    applyBtnStyle();
    if (window._cfRender) window._cfRender();
    if (window._tumblerRenderPreviews) window._tumblerRenderPreviews();
    settingsUpdatePreview();
    document.querySelectorAll('.alpha-slider:not([id$="-alpha"])').forEach(s => updateSliderFill(s));
  }
  async function settingsReset() {
    const ok = await confirmClear("This will reset all styles to their <strong>factory defaults</strong>.");
    if (!ok) return;
    _history = _history.slice(0, _historyIndex + 1);
    _history.push(_captureStyleSnapshot());
    if (_history.length > 51) _history.shift();
    _historyIndex = _history.length - 1;
    _updateUndoRedoBtns();
    btnStyle  = Object.assign({}, BTN_STYLE_DEFAULTS);
    appStyle  = Object.assign({}, APP_STYLE_DEFAULTS);
    localStorage.removeItem("_btnStyle");
    localStorage.removeItem("_btnStyles");
    localStorage.removeItem("_appStyle");
    localStorage.removeItem("_clockTumbler");
    localStorage.removeItem("_cpSettings");
    _btnStyles = {};
    window._clockSet([6, 1, 1, 1, 2, 1, 1, 0]);
    if (window._tumblerRefresh) window._tumblerRefresh();
    setColorValue('s-bg',              btnStyle.bg);
    setColorValue('s-fg',              btnStyle.fg);
    setColorValue('s-glow',            btnStyle.glow);
    setColorValue('s-activeglow',      btnStyle.activeGlow);
    setColorValue('s-activebg',        btnStyle.activeBg);
    setColorValue('s-tap',             btnStyle.tap);
    setColorValue('s-taphighlight',    btnStyle.tapHighlight);
    setColorValue('s-sliderborder',    btnStyle.sliderBorder);
    setColorValue('s-checkbox-checked', btnStyle.checkboxChecked);
    setColorValue('s-checkbox-mark',    btnStyle.checkboxMark);
    setColorValue('s-checkbox-border',  btnStyle.checkboxBorder);
    setColorValue('s-checkbox-bg',      btnStyle.checkboxBg);
    document.getElementById("s-sliderh").value = btnStyle.sliderH;
    document.getElementById("s-sliderr").value = btnStyle.sliderR;
    setColorValue('s-sliderborder',    btnStyle.sliderBorder);
    setColorValue('s-sliderfill',      btnStyle.sliderFill   || '#9659FFFF');
    setColorValue('s-slidertrack',     btnStyle.sliderTrack  || '#333333FF');
    setColorValue('s-sliderhandle',    btnStyle.sliderHandle || '#FFFFFFFF');
    setColorValue('s-sliderhandleborder', btnStyle.sliderHandleBorder || '#00000000');
    document.getElementById("s-sliderh").value = btnStyle.sliderH;
    document.getElementById("s-sliderr").value = btnStyle.sliderR;
    const _shv = document.getElementById("s-sliderh-val"); if (_shv) _shv.textContent = btnStyle.sliderH + "px";
    const _srv = document.getElementById("s-sliderr-val"); if (_srv) _srv.textContent = btnStyle.sliderR + "%";
    const _shhv = document.getElementById("s-sliderhandleh-val"); if (_shhv) _shhv.textContent = (btnStyle.sliderHandleH ?? 16) + "px";
    const _shrv = document.getElementById("s-sliderhandler-val"); if (_shrv) _shrv.textContent = (btnStyle.sliderHandleR ?? 3) + "%";
    const _shhEl = document.getElementById("s-sliderhandleh"); if (_shhEl) _shhEl.value = btnStyle.sliderHandleH ?? 16;
    const _shrEl = document.getElementById("s-sliderhandler"); if (_shrEl) _shrEl.value = btnStyle.sliderHandleR ?? 3;
    const _swREl = document.getElementById("s-sliderw"); if (_swREl) _swREl.value = String(BTN_STYLE_DEFAULTS.sliderW ?? 100);
    const _swRvEl = document.getElementById("s-sliderw-val"); if (_swRvEl) _swRvEl.textContent = (BTN_STYLE_DEFAULTS.sliderW ?? 100) + '%';
    const _shwREl = document.getElementById("s-sliderhandlew"); if (_shwREl) _shwREl.value = String(BTN_STYLE_DEFAULTS.sliderHandleW ?? 16);
    const _shwRvEl = document.getElementById("s-sliderhandlew-val"); if (_shwRvEl) _shwRvEl.textContent = (BTN_STYLE_DEFAULTS.sliderHandleW ?? 16) + 'px';
    const _sspv = document.getElementById("s-sliderspread-val"); if (_sspv) _sspv.textContent = (btnStyle.sliderSpread ?? 4) + "px";
    const _sspEl = document.getElementById("s-sliderspread"); if (_sspEl) _sspEl.value = btnStyle.sliderSpread ?? 4;
    document.getElementById("s-font").value    = btnStyle.font;
    document.getElementById("s-radius").value  = String(BTN_STYLE_DEFAULTS.btnRadius ?? 6);
const _rvDef = document.getElementById("s-radius-val"); if (_rvDef) _rvDef.textContent = (BTN_STYLE_DEFAULTS.btnRadius ?? 6) + "px";
_btnStyles = {};
    setColorValue('s-clock-date-color', _btnStyleFor('top-date').fg);
    setColorValue('s-clock-time-color', _btnStyleFor('top-time').fg);
    setColorValue('s-clock-date-bg',    _btnStyleFor('top-date').bg);
    setColorValue('s-clock-time-bg',    _btnStyleFor('top-time').bg);
    setColorValue('s-clock-bg',         btnStyle.clockBg);
    setColorValue('s-clock-date-glow',  _btnStyleFor('top-date').glow || '#00000000');
    setColorValue('s-clock-time-glow',  _btnStyleFor('top-time').glow || '#00000000');
    document.getElementById("s-clock-date-size").value = _btnStyles['top-date']?.clockDateSize ?? btnStyle.clockDateSize;
    document.getElementById("s-clock-time-size").value = _btnStyles['top-time']?.clockTimeSize ?? btnStyle.clockTimeSize;
    const _cdrREl = document.getElementById("s-clock-date-radius"); if (_cdrREl) { _cdrREl.value = "6"; const _cdrRVEl = document.getElementById("s-clock-date-radius-val"); if (_cdrRVEl) _cdrRVEl.textContent = "6px"; }
    const _ctrREl = document.getElementById("s-clock-time-radius"); if (_ctrREl) { _ctrREl.value = "6"; const _ctrRVEl = document.getElementById("s-clock-time-radius-val"); if (_ctrRVEl) _ctrRVEl.textContent = "6px"; }
    const _cdrOpenV = _btnStyles['top-date']?.btnRadius ?? btnStyle.btnRadius ?? 6;
    const _cdrOpenEl = document.getElementById("s-clock-date-radius"); if (_cdrOpenEl) { _cdrOpenEl.value = String(_cdrOpenV); const _cdrvOpenEl = document.getElementById("s-clock-date-radius-val"); if (_cdrvOpenEl) _cdrvOpenEl.textContent = _cdrOpenV + "px"; }
    const _ctrOpenV = _btnStyles['top-time']?.btnRadius ?? btnStyle.btnRadius ?? 6;
    const _ctrOpenEl = document.getElementById("s-clock-time-radius"); if (_ctrOpenEl) { _ctrOpenEl.value = String(_ctrOpenV); const _ctrvOpenEl = document.getElementById("s-clock-time-radius-val"); if (_ctrvOpenEl) _ctrvOpenEl.textContent = _ctrOpenV + "px"; }
    applyBtnStyle();
    window._clockSet([6, 1, 1, 1, 2, 1, 1, 0]);
    settingsUpdatePreview();
    if(window.fontPickerSync)fontPickerSync();
  }
  function settingsUpdatePreview() {
    const p = document.getElementById("settings-btn-preview");
    if (!p) return;
    const _cfId = window._cfActiveId ? window._cfActiveId() : null;
    const s = _cfId ? _btnStyleFor(_cfId) : btnStyle;
    p.style.background = hex8ToCss(s.bg);
    p.style.color      = hex8ToCss(s.fg);
    p.style.fontFamily = s.font;
    const items = window._cfItems ? window._cfItems() : [];
    const activeItem = items.find(it => it.id === _cfId);
    p.textContent = activeItem ? activeItem.label : document.getElementById("s-font").selectedOptions[0].text;
    p.style.setProperty("--preview-glow",      hex8ToCss(s.glow));
    p.style.setProperty("--preview-active-bg", hex8ToCss(s.activeBg));
    p.style.borderRadius = ((_cfId && _btnStyles[_cfId]?.btnRadius != null) ? _btnStyles[_cfId].btnRadius : (btnStyle.btnRadius ?? 6)) + 'px';
    p.style.padding = '12px 20px';
    p.style.border = 'none';
    p.style.cursor = 'pointer';
    p.style.fontSize = '16px';
    p.style.width = '100%';
    p.style.boxShadow = `0 0 16px 5px ${hex8ToCss(s.glow)}`;
    const _cogEl2 = document.getElementById('settings-cog');
    if (_cogEl2 && _cfId === 'top-settings') {
      _cogEl2.style.background  = hex8ToCss(s.bg);
      _cogEl2.style.color       = hex8ToCss(s.fg);
      _cogEl2.style.borderColor = hex8ToCss(s.fg);
      _cogEl2.style.boxShadow   = `0 0 16px 5px ${hex8ToCss(s.glow)}`;
    }
  }