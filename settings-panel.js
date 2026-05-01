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
  let _lastUndoRedoTime = 0;
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
      cpSettings: (function(){ try { return JSON.parse(localStorage.getItem('_cpSettings')); } catch(e) { return null; } })(),
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
    if (saveBtn)   { saveBtn.disabled = !_settingsHasChanges; saveBtn.style.opacity = _settingsHasChanges ? '' : '0.35'; }
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
    _sv('s-sliderhandlehole', btnStyle.sliderHandleHole ?? 0); _svl('s-sliderhandlehole-val', btnStyle.sliderHandleHole ?? 0, '%');
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
    if (snap.cpSettings !== undefined) {
      if (snap.cpSettings) { localStorage.setItem('_cpSettings', JSON.stringify(snap.cpSettings)); } else { localStorage.removeItem('_cpSettings'); }
      if (window._cpSyncUI) window._cpSyncUI();
      if (window._cpRefresh) window._cpRefresh(); else if (window._cpRebuild) window._cpRebuild();
    }
    if (document.getElementById('settings-overlay').classList.contains('active')) {
      _syncSettingsPanelUI();
    }
    _applyingSnapshot = false;
  }
  function _flushPendingHistory() {
    if (_undoDebounceTimer === null) return;
    clearTimeout(_undoDebounceTimer);
    _undoDebounceTimer = null;
    if (_applyingSnapshot) return;
    _history = _history.slice(0, _historyIndex + 1);
    _history.push(_captureStyleSnapshot());
    if (_history.length > 50) _history.shift();
    _historyIndex = _history.length - 1;
  }
  function settingsUndo() {
    _flushPendingHistory();
    if (!_canUndo()) return;
    _lastUndoRedoTime = Date.now();
    _historyIndex--;
    _applyingSnapshot = true;
    _applyStyleSnapshot(_history[_historyIndex]);
    _applyingSnapshot = false;
    _settingsHasChanges = true;
    _updateUndoRedoBtns();
  }
  function settingsRedo() {
    _flushPendingHistory();
    if (!_canRedo()) return;
    _lastUndoRedoTime = Date.now();
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
    if (window._cpSetGradientStops) window._cpSetGradientStops('s-bg', _initS.bgStops || null);
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
    const _shheEl2 = document.getElementById('s-sliderhandlehole'); if (_shheEl2) _shheEl2.value = String(btnStyle.sliderHandleHole ?? 0);
    const _shhevEl2 = document.getElementById('s-sliderhandlehole-val'); if (_shhevEl2) _shhevEl2.textContent = (btnStyle.sliderHandleHole ?? 0) + '%';
    btnStyle.sliderHandleW  = Number(document.getElementById("s-sliderhandlew").value);
    btnStyle.sliderHandleHole = Number(document.getElementById("s-sliderhandlehole").value);
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
    if (window._cpSyncUI) window._cpSyncUI();
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
    btnStyle.sliderHandleHole = Number(document.getElementById("s-sliderhandlehole").value);
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
  }
  function settingsCancel() {
    if (!_settingsHasChanges) {
      settingsClose();
      return;
    }
    _flushPendingHistory();
    _lastUndoRedoTime = Date.now();
    _historyIndex = 0;
    _applyingSnapshot = true;
    _applyStyleSnapshot(_history[0]);
    _applyingSnapshot = false;
    _settingsHasChanges = false;
    _updateUndoRedoBtns();
  }
  (function() {
    function dbounce(fn) {
      var t = null;
      return function() {
        if (t) return;
        t = setTimeout(function() { t = null; }, 100);
        fn.apply(this, arguments);
      };
    }
    settingsSave   = dbounce(settingsSave);
    settingsUndo   = dbounce(settingsUndo);
    settingsRedo   = dbounce(settingsRedo);
    settingsCancel = dbounce(settingsCancel);
    settingsReset  = dbounce(settingsReset);
  })();