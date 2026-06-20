// @version 1531
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
  const file = input.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      _settingsHasChanges = true;
      _history = _history.slice(0, _historyIndex + 1);
      _history.push(_captureStyleSnapshot());
      if(_history.length > 50) _history.shift();
      _historyIndex = _history.length - 1;
      _updateUndoRedoBtns();
      if(data["_btnStyle"]) {
        btnStyle = Object.assign({}, BTN_STYLE_DEFAULTS, JSON.parse(data["_btnStyle"]));
        applyBtnStyle();
        setColorValue('s-bg',       btnStyle.bg);
        setColorValue('s-fg',       s.fg);
        setColorValue('s-fgstroke', s.fgStroke || btnStyle.fgStroke || '#00000000');
        setColorValue('s-glow',     s.glow);
        setColorValue('s-activeglow', btnStyle.activeGlow || btnStyle.glow);
        setColorValue('s-activebg', btnStyle.activeBg);
        setColorValue('s-tap',      btnStyle.tap);
        setColorValue('s-sliderborder', btnStyle.sliderBorder || '#555555FF');
        setColorValue('s-sliderfill',    btnStyle.sliderFill   || '#9659FFFF');
        setColorValue('s-slidertrack',   btnStyle.sliderTrack  || '#333333FF');
        setColorValue('s-sliderhandle',  btnStyle.sliderHandle || '#FFFFFFFF');
        setColorValue('s-sliderhandleborder',    btnStyle.sliderHandleBorder    || '#00000000');
        setColorValue('s-sliderhandleglow',      btnStyle.sliderHandleGlow      || '#FFFFFF00');
        setColorValue('s-sliderhandleactiveglow', btnStyle.sliderHandleActiveGlow || '#FFFFFFD9');
        _sv('s-sliderh',       btnStyle.sliderH);
        _sv('s-sliderr',       btnStyle.sliderR);
        _sv('s-sliderspread',  btnStyle.sliderSpread   ?? 4);
        _sv('s-sliderhandleh', btnStyle.sliderHandleH  ?? 16);
        _sv('s-sliderhandler', btnStyle.sliderHandleR  ?? 3);
        _sv('s-sliderw',       btnStyle.sliderW        ?? 100);
        _sv('s-sliderhandlew', btnStyle.sliderHandleW  ?? 16);
        const _sv = (id, val) => { const el = document.getElementById(id); if(el) el.value = String(val); };
        const _fgsWCEl = document.getElementById('s-fgstrokew'); if(_fgsWCEl) { _fgsWCEl.value = String(s.fgStrokeW ?? btnStyle.fgStrokeW ?? 0); const _fgsWVCEl = document.getElementById('s-fgstrokew-val'); if(_fgsWVCEl) _fgsWVCEl.textContent = (s.fgStrokeW ?? btnStyle.fgStrokeW ?? 0) + 'px'; }
        const _sfgsOv = document.getElementById('s-fgstroke-swatch-overlay');
        const _sfgsGrad = window._cpGetGradient ? window._cpGetGradient('s-fgstroke') : null;
        const _swIvEl = document.getElementById('s-sliderw-val'); if(_swIvEl) _swIvEl.textContent = (btnStyle.sliderW ?? 100) + '%';
        const _shwIvEl = document.getElementById('s-sliderhandlew-val'); if(_shwIvEl) _shwIvEl.textContent = (btnStyle.sliderHandleW ?? 16) + 'px';
        const _shholeIvEl = document.getElementById('s-sliderhandlehole-val'); if(_shholeIvEl) _shholeIvEl.textContent = (btnStyle.sliderHandleHole ?? 0) + '%';
        const _shholeEl = document.getElementById('s-sliderhandlehole'); if(_shholeEl) _shholeEl.value = String(btnStyle.sliderHandleHole ?? 0);
        const _sbgIEl = document.getElementById('s-sliderbtnspacing'); if(_sbgIEl) _sbgIEl.value = String(btnStyle.sliderBtnGap ?? 0);
        const _sbgIvEl = document.getElementById('s-sliderbtnspacing-val'); if(_sbgIvEl) _sbgIvEl.textContent = (btnStyle.sliderBtnGap ?? 0) + 'px';
        const _sbwIEl = document.getElementById('s-sliderbtnw'); if(_sbwIEl) _sbwIEl.value = String(btnStyle.sliderBtnW ?? 22);
        const _sbwIvEl = document.getElementById('s-sliderbtnw-val'); if(_sbwIvEl) _sbwIvEl.textContent = (btnStyle.sliderBtnW ?? 22) + 'px';
        const _sbhIEl = document.getElementById('s-sliderbtnh'); if(_sbhIEl) _sbhIEl.value = String(btnStyle.sliderBtnH ?? 22);
        const _sbhIvEl = document.getElementById('s-sliderbtnh-val'); if(_sbhIvEl) _sbhIvEl.textContent = (btnStyle.sliderBtnH ?? 22) + 'px';
        const _sbrIEl = document.getElementById('s-sliderbtnr'); if(_sbrIEl) _sbrIEl.value = String(btnStyle.sliderBtnR ?? 4);
        const _sbrIvEl = document.getElementById('s-sliderbtnr-val'); if(_sbrIvEl) _sbrIvEl.textContent = (btnStyle.sliderBtnR ?? 4) + 'px';
        const _shv2 = document.getElementById('s-sliderh-val');       if(_shv2) _shv2.textContent = btnStyle.sliderH + 'px';
        const _srv2 = document.getElementById('s-sliderr-val');       if(_srv2) _srv2.textContent = btnStyle.sliderR + '%';
        const _sspv2 = document.getElementById('s-sliderspread-val'); if(_sspv2) _sspv2.textContent = (btnStyle.sliderSpread ?? 4) + 'px';
        const _shhv2 = document.getElementById('s-sliderhandleh-val');if(_shhv2) _shhv2.textContent = (btnStyle.sliderHandleH ?? 16) + 'px';
        const _shrv2 = document.getElementById('s-sliderhandler-val');if(_shrv2) _shrv2.textContent = (btnStyle.sliderHandleR ?? 3) + '%';
        document.getElementById("s-font").value = btnStyle.font;
        settingsUpdatePreview();
        if(window._cpSetGradientStops) window._cpSetGradientStops('s-fg', s.fgStops || null);
        if(window._cpSetGradientStops) window._cpSetGradientStops('s-fgstroke', s.fgStrokeStops || null);
        if(_sfgsOv && _sfgsGrad){
          _sfgsOv.style.background = _sfgsGrad;
        }else{
          updateAlphaSliderBg('s-fgstroke');
        }
        if(window.fontPickerSync)fontPickerSync();
      }
      if(data["_clockTumbler"] !== undefined) {
        try {
          const cfg = JSON.parse(data["_clockTumbler"]);
          if(Array.isArray(cfg) && cfg.length === 8) {
            localStorage.setItem("_clockTumbler", data["_clockTumbler"]);
            window._clockSet(cfg);
            if(window._tumblerRefresh) window._tumblerRefresh();
          }
        }catch{}
      }
      if(data["_btnStyles"]) {
        try {
          _btnStyles = Object.assign({}, JSON.parse(data["_btnStyles"]));
          _saveBtnStyles();
        }catch{}
      }
      if(data["_appStyle"]){
        try {
          const _existingImg = appStyle.imgData;
          appStyle = Object.assign({}, APP_STYLE_DEFAULTS, JSON.parse(data["_appStyle"]));
          if(!appStyle.imgData && _existingImg) appStyle.imgData = _existingImg;
          localStorage.setItem("_appStyle", data["_appStyle"]);
          if(appStyle.bgType === 'image' && !appStyle.imgData) {
            ImgDB.get("bgImage").then(img => { if(img) { appStyle.imgData = img; applyAppStyle(); } }).catch(() => {});
          }
          applyAppStyle();
        } catch{}
      }
      if(data["_cfTuning"]) {
        try {
          Object.assign(cfTuning, JSON.parse(data["_cfTuning"]));
          localStorage.setItem("_cfTuning", data["_cfTuning"]);
          if(typeof cfSyncTuningUI !== 'undefined') if(window.cfSyncTuningUI) window.cfSyncTuningUI();
        } catch{}
      }
      if(data["_settingsGroupOrder"]) {
        try {
          localStorage.setItem("_settingsGroupOrder", data["_settingsGroupOrder"]);
          applySettingsGroupOrder();
        } catch{}
      }
      if(data["_sliderRowOrder"]) {
        try {
          localStorage.setItem("_sliderRowOrder", data["_sliderRowOrder"]);
          applySliderRowOrder();
        } catch{}
      }
      if(data["_trackerConfigs"]) {
        try {
          localStorage.setItem("_trackerConfigs", data["_trackerConfigs"]);
        } catch{}
      }
      input.value = "";
    } catch{ alert("Invalid settings file."); }
  };
  reader.readAsText(file);
}
function settingsChange() {
  if(!document.getElementById('s-bg')) return;
  if(!_applyingSnapshot) {
    _settingsHasChanges = true;
    _updateUndoRedoBtns();
    clearTimeout(_undoDebounceTimer);
    _undoDebounceTimer = setTimeout(() => {
      if(_applyingSnapshot) return;
      if(Date.now() - _lastUndoRedoTime < 600) { _undoDebounceTimer = null; return; }
      _history = _history.slice(0, _historyIndex + 1);
      _history.push(_captureStyleSnapshot());
      if(_history.length > 50) _history.shift();
      _historyIndex = _history.length - 1;
      _undoDebounceTimer = null;
      _updateUndoRedoBtns();
    }, 50);
  }
  const _cfId = window._cfActiveId ? window._cfActiveId() : null;
  if(_cfId) {
    if(_cfId === 'top-date') {
      const dateColor = getStyleValue('s-fg');
      _btnStyles['top-date'] = Object.assign(_btnStyles['top-date'] || {}, {
        bg: getStyleValue('s-bg'), fg: dateColor,
        bgStops: window._cpGetGradientStops ? window._cpGetGradientStops('s-bg') : null,
        bgMode: window._cpGetGradientMode ? window._cpGetGradientMode('s-bg') : 'solid',
        bgDeg: window._cpGetGradientDeg ? window._cpGetGradientDeg('s-bg') : 90,
        glow: getColorValue('s-glow'), activeGlow: getColorValue('s-activeglow'),
        activeBg: getStyleValue('s-activebg'),
        tap: getColorValue('s-tap'), font: document.getElementById("s-font").value,
        clockDateSize: Number(document.getElementById("s-clock-date-size").value),
        border: getColorValue('s-border'),
        activeBorder: getColorValue('s-activeborder'),
        fontScaleX: Number(document.getElementById('s-clock-date-scalex')?.value ?? 100),
        fontWeight: Number(document.getElementById('s-clock-date-weight')?.value ?? 400),
        fgStops: window._cpGetGradientStops ? window._cpGetGradientStops('s-fg') : null,
        fgMode: window._cpGetGradientMode ? window._cpGetGradientMode('s-fg') : 'solid',
        fgStroke: getStyleValue('s-fgstroke'),
        fgStrokeStops: window._cpGetGradientStops ? window._cpGetGradientStops('s-fgstroke') : null,
        fgStrokeMode: window._cpGetGradientMode ? window._cpGetGradientMode('s-fgstroke') : 'solid',
        fgStrokeW: Number(document.getElementById('s-fgstrokew')?.value ?? 0),
        border: getColorValue('s-border'),
        activeBorder: getColorValue('s-activeborder'),
      });
      updateAlphaSliderBg('s-clock-date-color');
      setColorValue('s-clock-date-glow', getColorValue('s-glow'));
      updateAlphaSliderBg('s-clock-date-glow');
    }else if(_cfId === 'top-time') {
      const timeColor = getStyleValue('s-fg');
      _btnStyles['top-time'] = Object.assign(_btnStyles['top-time'] || {}, {
        bg: getStyleValue('s-bg'), fg: timeColor,
        bgStops: window._cpGetGradientStops ? window._cpGetGradientStops('s-bg') : null,
        bgMode: window._cpGetGradientMode ? window._cpGetGradientMode('s-bg') : 'solid',
        bgDeg: window._cpGetGradientDeg ? window._cpGetGradientDeg('s-bg') : 90,
        glow: getColorValue('s-glow'), activeGlow: getColorValue('s-activeglow'),
        activeBg: getStyleValue('s-activebg'),
        tap: getColorValue('s-tap'), font: document.getElementById("s-font").value,
        clockTimeSize: Number(document.getElementById("s-clock-time-size").value),
        fontScaleX: Number(document.getElementById('s-clock-time-scalex')?.value ?? 100),
        fontWeight: Number(document.getElementById('s-clock-time-weight')?.value ?? 400),
        fgStops: window._cpGetGradientStops ? window._cpGetGradientStops('s-fg') : null,
        fgMode: window._cpGetGradientMode ? window._cpGetGradientMode('s-fg') : 'solid',
        fgStroke: getStyleValue('s-fgstroke'),
        fgStrokeStops: window._cpGetGradientStops ? window._cpGetGradientStops('s-fgstroke') : null,
        fgStrokeMode: window._cpGetGradientMode ? window._cpGetGradientMode('s-fgstroke') : 'solid',
        fgStrokeW: Number(document.getElementById('s-fgstrokew')?.value ?? 0),
        border: getColorValue('s-border'),
        activeBorder: getColorValue('s-activeborder'),
      });
      updateAlphaSliderBg('s-clock-time-color');
      setColorValue('s-clock-time-glow', getColorValue('s-glow'));
      updateAlphaSliderBg('s-clock-time-glow');
    }else{
      _btnStyles[_cfId] = Object.assign(_btnStyles[_cfId] || {}, {
        bg: getStyleValue('s-bg'),
        bgStops: window._cpGetGradientStops ? window._cpGetGradientStops('s-bg') : null,
        bgMode: window._cpGetGradientMode ? window._cpGetGradientMode('s-bg') : 'solid',
        bgDeg: window._cpGetGradientDeg ? window._cpGetGradientDeg('s-bg') : 90,
        border: getColorValue('s-border'),
        activeBorder: getColorValue('s-activeborder'),
        fg: getStyleValue('s-fg'),
        glow: getColorValue('s-glow'), activeGlow: getColorValue('s-activeglow'),
        activeBg: getStyleValue('s-activebg'),
        tap: getColorValue('s-tap'), font: document.getElementById("s-font").value,
        fgStops: window._cpGetGradientStops ? window._cpGetGradientStops('s-fg') : null,
        fgMode: window._cpGetGradientMode ? window._cpGetGradientMode('s-fg') : 'solid',
        fgStroke: getStyleValue('s-fgstroke'),
        fgStrokeStops: window._cpGetGradientStops ? window._cpGetGradientStops('s-fgstroke') : null,
        fgStrokeMode: window._cpGetGradientMode ? window._cpGetGradientMode('s-fgstroke') : 'solid',
        fgStrokeW: Number(document.getElementById('s-fgstrokew')?.value ?? 0),
        border: getColorValue('s-border'),
        activeBorder: getColorValue('s-activeborder'),
      });
    }
    _saveBtnStyles();
  }
  if(!_cfId) btnStyle.fontSize = Number(document.getElementById("s-fontsize")?.value ?? 16);
  else{
    _btnStyles[_cfId] = Object.assign(_btnStyles[_cfId] || {}, {
      fontSize: Number(document.getElementById("s-fontsize")?.value ?? 16)
    }
    );
  }
  if(!_cfId) btnStyle.fontWeight = Number(document.getElementById("s-fontweight")?.value ?? 400);
  else{ _btnStyles[_cfId] = Object.assign(_btnStyles[_cfId] || {}, { fontWeight: Number(document.getElementById("s-fontweight")?.value ?? 400) }); }
  if(!_cfId) btnStyle.fontScaleX = Number(document.getElementById("s-fontscalex")?.value ?? 100);
  else{ _btnStyles[_cfId] = Object.assign(_btnStyles[_cfId] || {}, { fontScaleX: Number(document.getElementById("s-fontscalex")?.value ?? 100) }); }
  if(!_cfId) btnStyle.btnRadius = Number(document.getElementById("s-radius").value);
  else{
    _btnStyles[_cfId] = Object.assign(_btnStyles[_cfId] || {}, {
      btnRadius: Number(document.getElementById("s-radius").value)
    });
    if(_cfId === 'top-date') { const _cdrSEl = document.getElementById("s-clock-date-radius"); if(_cdrSEl) { _cdrSEl.value = document.getElementById("s-radius").value; const _cdrsVEl = document.getElementById("s-clock-date-radius-val"); if(_cdrsVEl) _cdrsVEl.textContent = document.getElementById("s-radius").value + "px"; } }
    if(_cfId === 'top-time') { const _ctrSEl = document.getElementById("s-clock-time-radius"); if(_ctrSEl) { _ctrSEl.value = document.getElementById("s-radius").value; const _ctrsVEl = document.getElementById("s-clock-time-radius-val"); if(_ctrsVEl) _ctrsVEl.textContent = document.getElementById("s-radius").value + "px"; } }
  }
  btnStyle.tap            = getColorValue('s-tap');
  btnStyle.border         = getColorValue('s-border');
  btnStyle.activeBorder   = getColorValue('s-activeborder');
  if(!_cfId) {
    btnStyle.fgStroke = getStyleValue('s-fgstroke');
    btnStyle.fgStrokeW = Number(document.getElementById('s-fgstrokew')?.value ?? 0);
  }
  btnStyle.glow           = getColorValue('s-glow');
  btnStyle.activeGlow     = getColorValue('s-activeglow');
  btnStyle.tapHighlight   = getColorValue('s-taphighlight');
  btnStyle.sliderBorder   = getStyleValue('s-sliderborder');
  if(document.getElementById('s-sliderfill'))   btnStyle.sliderFill   = getStyleValue('s-sliderfill');
  if(document.getElementById('s-slidertrack'))  btnStyle.sliderTrack  = getStyleValue('s-slidertrack');
  if(document.getElementById('s-sliderhandle')) btnStyle.sliderHandle = getStyleValue('s-sliderhandle');
  if(document.getElementById('s-sliderhandleborder')) btnStyle.sliderHandleBorder = getStyleValue('s-sliderhandleborder');
  if(document.getElementById('s-sliderhandleglow')) btnStyle.sliderHandleGlow = getColorValue('s-sliderhandleglow');
  if(document.getElementById('s-sliderhandleactiveglow')) btnStyle.sliderHandleActiveGlow = getColorValue('s-sliderhandleactiveglow');
  btnStyle.sliderH        = Number(document.getElementById("s-sliderh").value);
  btnStyle.sliderR        = Number(document.getElementById("s-sliderr").value);
  btnStyle.sliderSpread   = Number(document.getElementById("s-sliderspread").value);
  btnStyle.sliderHandleH  = Number(document.getElementById("s-sliderhandleh").value);
  btnStyle.sliderHandleR  = Number(document.getElementById("s-sliderhandler").value);
  btnStyle.sliderW        = Number(document.getElementById("s-sliderw").value);
  btnStyle.sliderHandleW  = Number(document.getElementById("s-sliderhandlew").value);
  btnStyle.sliderHandleHole = Number(document.getElementById("s-sliderhandlehole").value);
  btnStyle.sliderBtnGap     = Number(document.getElementById("s-sliderbtnspacing").value);
  btnStyle.sliderBtnW       = Number(document.getElementById("s-sliderbtnw")?.value ?? 22);
  btnStyle.sliderBtnH       = Number(document.getElementById("s-sliderbtnh")?.value ?? 22);
  btnStyle.sliderBtnR       = Number(document.getElementById("s-sliderbtnr")?.value ?? 4);
  btnStyle.sliderBtnBg      = getColorValue('s-sliderbtnbg');
  btnStyle.sliderBtnFg      = getColorValue('s-sliderbtnfg');
  btnStyle.sliderBtnBorder  = getColorValue('s-sliderbtnborder');
  btnStyle.checkboxChecked = getColorValue('s-checkbox-checked');
  btnStyle.checkboxMark    = getColorValue('s-checkbox-mark');
  btnStyle.checkboxBorder  = getColorValue('s-checkbox-border');
  btnStyle.checkboxBg      = getColorValue('s-checkbox-bg');
  btnStyle.toggleOffBg     = getColorValue('s-toggle-off-bg');
  btnStyle.toggleOnBg      = getColorValue('s-toggle-on-bg');
  btnStyle.toggleSwitchOff   = getColorValue('s-toggle-switch-off');
  btnStyle.toggleSwitchOn    = getColorValue('s-toggle-switch-on');
  btnStyle.toggleBorderOff = getColorValue('s-toggle-border-off');
  btnStyle.toggleBorderOn  = getColorValue('s-toggle-border-on');
  btnStyle.toggleW         = Number(document.getElementById('s-toggle-w')?.value       ?? 44);
  btnStyle.toggleH         = Number(document.getElementById('s-toggle-h')?.value       ?? 24);
  btnStyle.toggleSwitchSize  = Number(document.getElementById('s-toggle-switch-size')?.value ?? 16);
  btnStyle.clockBg         = getColorValue('s-clock-bg');
  if(_cfId !== 'top-date') {
    _btnStyles['top-date'] = Object.assign(_btnStyles['top-date'] || {}, {
      bg: getStyleValue('s-clock-date-bg'),
      fg: getColorValue('s-clock-date-color'),
      glow: getColorValue('s-clock-date-glow'),
      clockDateSize: Number(document.getElementById("s-clock-date-size").value),
      border: getColorValue('s-border'),
      activeBorder: getColorValue('s-activeborder'),
      fontScaleX: Number(document.getElementById('s-clock-date-scalex')?.value ?? 100),
      fontWeight: Number(document.getElementById('s-clock-date-weight')?.value ?? 400),
    });
  }
  if(_cfId !== 'top-time') {
    _btnStyles['top-time'] = Object.assign(_btnStyles['top-time'] || {}, {
      bg: getStyleValue('s-clock-time-bg'),
      fg: getColorValue('s-clock-time-color'),
      glow: getColorValue('s-clock-time-glow'),
      clockTimeSize: Number(document.getElementById("s-clock-time-size").value),
      fontScaleX: Number(document.getElementById('s-clock-time-scalex')?.value ?? 100),
      fontWeight: Number(document.getElementById('s-clock-time-weight')?.value ?? 400),
    });
  }
  if(_cfId !== 'top-date') {
    const cfDateColor = getColorValue('s-clock-date-color');
    _btnStyles['top-date'] = Object.assign(_btnStyles['top-date'] || {}, {
      bg: getStyleValue('s-clock-date-bg'),
      fg: cfDateColor,
      glow: getColorValue('s-clock-date-glow'),
      clockDateSize: Number(document.getElementById("s-clock-date-size").value),
      border: getColorValue('s-border'),
      activeBorder: getColorValue('s-activeborder'),
      fontScaleX: Number(document.getElementById('s-clock-date-scalex')?.value ?? 100),
      fontWeight: Number(document.getElementById('s-clock-date-weight')?.value ?? 400),
    });
  }
  if(_cfId === 'top-date') {
    const _newDateFg = getColorValue('s-fg');
    _btnStyles['top-date'] = Object.assign(_btnStyles['top-date'] || {}, { fg: _newDateFg, clockDateSize: Number(document.getElementById("s-clock-date-size").value) });
    document.getElementById('s-clock-date-color').value = document.getElementById('s-fg').value;
    document.getElementById('s-clock-date-color-alpha').value = document.getElementById('s-fg-alpha').value;
    updateAlphaSliderBg('s-clock-date-color');
    const _hexDateEl = document.getElementById('s-clock-date-color-hex'); if(_hexDateEl) _hexDateEl.value = getColorValue('s-fg');
  }
  if(_cfId === 'top-time') {
    const _newTimeFg = getColorValue('s-fg');
    _btnStyles['top-time'] = Object.assign(_btnStyles['top-time'] || {}, { fg: _newTimeFg, clockTimeSize: Number(document.getElementById("s-clock-time-size").value) });
    document.getElementById('s-clock-time-color').value = document.getElementById('s-fg').value;
    document.getElementById('s-clock-time-color-alpha').value = document.getElementById('s-fg-alpha').value;
    updateAlphaSliderBg('s-clock-time-color');
    const _hexTimeEl = document.getElementById('s-clock-time-color-hex'); if(_hexTimeEl) _hexTimeEl.value = getColorValue('s-fg');
  }
  const _cdrIn = document.getElementById("s-clock-date-radius");
  const _ctrIn = document.getElementById("s-clock-time-radius");
  if(_cdrIn && _cfId !== 'top-date') _btnStyles['top-date'] = Object.assign(_btnStyles['top-date'] || {}, { btnRadius: Number(_cdrIn.value) });
  if(_ctrIn && _cfId !== 'top-time') _btnStyles['top-time'] = Object.assign(_btnStyles['top-time'] || {}, { btnRadius: Number(_ctrIn.value) });
  _saveBtnStyles();
  (function(){
    var _msId = window._cfActiveId ? window._cfActiveId() : null;
    if (!window._cfSelection || window._cfSelection.size <= 1 || !_msId) return;
    if (_msId === 'top-date' || _msId === 'top-time') return;
    var _src = _btnStyles[_msId]; if (!_src) return;
    var _copy = JSON.parse(JSON.stringify(_src));
    window._cfSelection.forEach(function(_sid) {
      if (_sid === _msId || _sid === 'top-date' || _sid === 'top-time') return;
      _btnStyles[_sid] = Object.assign(_btnStyles[_sid] || {}, _copy);
    });
  })();
  applyBtnStyle();
  if(window._cfRender) window._cfRender();
  if(window._tumblerRenderPreviews) window._tumblerRenderPreviews();
  settingsUpdatePreview();
  document.querySelectorAll('.alpha-slider:not([id$="-alpha"])').forEach(s => updateSliderFill(s));
  appStyle.statusBarMode   = document.getElementById('s-app-statusbar-mode')?.value || 'auto';
  appStyle.statusBarColor = getColorValue('s-app-statusbar-color');
  appStyle.statusBarStops = window._cpGetGradientStops ? window._cpGetGradientStops('s-app-statusbar-color') : null;
  appStyle.statusBarIconStyle = document.getElementById('s-app-statusbar-icons')?.value || 'auto';
  if(document.getElementById('s-app-border'))     appStyle.borderColor = getStyleValue('s-app-border');
  if(document.getElementById('s-app-thead'))      appStyle.theadBg     = getStyleValue('s-app-thead');
  if(document.getElementById('s-app-cell-bg'))    appStyle.cellBg      = getStyleValue('s-app-cell-bg');
  if(document.getElementById('s-app-bar-set'))    appStyle.barSet      = getColorValue('s-app-bar-set');
  if(document.getElementById('s-app-bar-total'))  appStyle.barTotal    = getColorValue('s-app-bar-total');
  if(document.getElementById('s-app-bar-streak')) appStyle.barStreak   = getColorValue('s-app-bar-streak');
  if(document.getElementById('s-app-bar-anti-streak')) appStyle.barAntiStreak = getColorValue('s-app-bar-anti-streak');
  if(document.getElementById('s-app-streak-text'))      appStyle.streakText     = getColorValue('s-app-streak-text');
  if(document.getElementById('s-app-anti-streak-text')) appStyle.antiStreakText  = getColorValue('s-app-anti-streak-text');
  if(document.getElementById('s-app-set-text'))         appStyle.setValueText   = getColorValue('s-app-set-text');
  if(document.getElementById('s-app-today-bg'))   appStyle.todayBg   = getColorValue('s-app-today-bg');
  if(document.getElementById('s-app-today-text')) appStyle.todayText = getColorValue('s-app-today-text');
  if(document.getElementById('s-app-text'))       appStyle.textColor   = getColorValue('s-app-text');
  applyAppStyle();
  _applyStatusBarColor();
  if(window._cpRebuild && !window._cpActiveDrag && !window._cpHexEditing) window._cpRebuild();
}
async function settingsReset() {
  const ok = await confirmClear("This will reset all styles to their <strong>factory defaults</strong>.");
  if(!ok) return;
  _history = _history.slice(0, _historyIndex + 1);
  _history.push(_captureStyleSnapshot());
  if(_history.length > 51) _history.shift();
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
  if(window._tumblerRefresh) window._tumblerRefresh();
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
  setColorValue('s-toggle-off-bg',     BTN_STYLE_DEFAULTS.toggleOffBg);
  setColorValue('s-toggle-on-bg',      BTN_STYLE_DEFAULTS.toggleOnBg);
  setColorValue('s-toggle-switch-off',   BTN_STYLE_DEFAULTS.toggleSwitchOff);
  setColorValue('s-toggle-switch-on',    BTN_STYLE_DEFAULTS.toggleSwitchOn);
  setColorValue('s-toggle-border-off', BTN_STYLE_DEFAULTS.toggleBorderOff);
  setColorValue('s-toggle-border-on',  BTN_STYLE_DEFAULTS.toggleBorderOn);
  const _twREl = document.getElementById('s-toggle-w'); if(_twREl) { _twREl.value = '44'; const _twvREl = document.getElementById('s-toggle-w-val'); if(_twvREl) _twvREl.textContent = '44px'; }
  const _thREl = document.getElementById('s-toggle-h'); if(_thREl) { _thREl.value = '24'; const _thvREl = document.getElementById('s-toggle-h-val'); if(_thvREl) _thvREl.textContent = '24px'; }
  const _tksREl = document.getElementById('s-toggle-switch-size'); if(_tksREl) { _tksREl.value = '16'; const _tksVREl = document.getElementById('s-toggle-switch-size-val'); if(_tksVREl) _tksVREl.textContent = '16px'; }
  document.getElementById("s-sliderh").value = btnStyle.sliderH;
  document.getElementById("s-sliderr").value = btnStyle.sliderR;
  setColorValue('s-sliderborder',    btnStyle.sliderBorder);
  setColorValue('s-sliderfill',      btnStyle.sliderFill   || '#9659FFFF');
  setColorValue('s-slidertrack',     btnStyle.sliderTrack  || '#333333FF');
  setColorValue('s-sliderhandle',    btnStyle.sliderHandle || '#FFFFFFFF');
  setColorValue('s-sliderhandleborder',    btnStyle.sliderHandleBorder    || '#00000000');
  setColorValue('s-sliderhandleglow',      BTN_STYLE_DEFAULTS.sliderHandleGlow);
  setColorValue('s-sliderhandleactiveglow', BTN_STYLE_DEFAULTS.sliderHandleActiveGlow);
  document.getElementById("s-sliderh").value = btnStyle.sliderH;
  document.getElementById("s-sliderr").value = btnStyle.sliderR;
  const _shv = document.getElementById("s-sliderh-val"); if(_shv) _shv.textContent = btnStyle.sliderH + "px";
  const _srv = document.getElementById("s-sliderr-val"); if(_srv) _srv.textContent = btnStyle.sliderR + "%";
  const _shhv = document.getElementById("s-sliderhandleh-val"); if(_shhv) _shhv.textContent = (btnStyle.sliderHandleH ?? 16) + "px";
  const _shrv = document.getElementById("s-sliderhandler-val"); if(_shrv) _shrv.textContent = (btnStyle.sliderHandleR ?? 3) + "%";
  const _shhEl = document.getElementById("s-sliderhandleh"); if(_shhEl) _shhEl.value = btnStyle.sliderHandleH ?? 16;
  const _shrEl = document.getElementById("s-sliderhandler"); if(_shrEl) _shrEl.value = btnStyle.sliderHandleR ?? 3;
  const _swREl = document.getElementById("s-sliderw"); if(_swREl) _swREl.value = String(BTN_STYLE_DEFAULTS.sliderW ?? 100);
  const _swRvEl = document.getElementById("s-sliderw-val"); if(_swRvEl) _swRvEl.textContent = (BTN_STYLE_DEFAULTS.sliderW ?? 100) + '%';
  const _shwREl = document.getElementById("s-sliderhandlew"); if(_shwREl) _shwREl.value = String(BTN_STYLE_DEFAULTS.sliderHandleW ?? 16);
  const _shwRvEl = document.getElementById("s-sliderhandlew-val"); if(_shwRvEl) _shwRvEl.textContent = (BTN_STYLE_DEFAULTS.sliderHandleW ?? 16) + 'px';
  const _shheREl = document.getElementById("s-sliderhandlehole"); if(_shheREl) _shheREl.value = String(BTN_STYLE_DEFAULTS.sliderHandleHole ?? 0);
  const _sbgREl = document.getElementById("s-sliderbtnspacing"); if(_sbgREl) _sbgREl.value = String(BTN_STYLE_DEFAULTS.sliderBtnGap ?? 0);
  setColorValue('s-sliderbtnbg',     BTN_STYLE_DEFAULTS.sliderBtnBg);
  setColorValue('s-sliderbtnfg',     BTN_STYLE_DEFAULTS.sliderBtnFg);
  setColorValue('s-sliderbtnborder', BTN_STYLE_DEFAULTS.sliderBtnBorder);
  const _sbgvREl = document.getElementById("s-sliderbtnspacing-val"); if(_sbgvREl) _sbgvREl.textContent = (BTN_STYLE_DEFAULTS.sliderBtnGap ?? 0) + 'px';
  const _sbwREl = document.getElementById("s-sliderbtnw"); if(_sbwREl) _sbwREl.value = String(BTN_STYLE_DEFAULTS.sliderBtnW ?? 22);
  const _sbwRvEl = document.getElementById("s-sliderbtnw-val"); if(_sbwRvEl) _sbwRvEl.textContent = (BTN_STYLE_DEFAULTS.sliderBtnW ?? 22) + 'px';
  const _sbhREl = document.getElementById("s-sliderbtnh"); if(_sbhREl) _sbhREl.value = String(BTN_STYLE_DEFAULTS.sliderBtnH ?? 22);
  const _sbhRvEl = document.getElementById("s-sliderbtnh-val"); if(_sbhRvEl) _sbhRvEl.textContent = (BTN_STYLE_DEFAULTS.sliderBtnH ?? 22) + 'px';
  const _sbrREl = document.getElementById("s-sliderbtnr"); if(_sbrREl) _sbrREl.value = String(BTN_STYLE_DEFAULTS.sliderBtnR ?? 4);
  const _sbrRvEl = document.getElementById("s-sliderbtnr-val"); if(_sbrRvEl) _sbrRvEl.textContent = (BTN_STYLE_DEFAULTS.sliderBtnR ?? 4) + 'px';
  const _shhevREl = document.getElementById("s-sliderhandlehole-val"); if(_shhevREl) _shhevREl.textContent = (BTN_STYLE_DEFAULTS.sliderHandleHole ?? 0) + '%';
  const _sspv = document.getElementById("s-sliderspread-val"); if(_sspv) _sspv.textContent = (btnStyle.sliderSpread ?? 4) + "px";
  const _sspEl = document.getElementById("s-sliderspread"); if(_sspEl) _sspEl.value = btnStyle.sliderSpread ?? 4;
  document.getElementById("s-font").value    = btnStyle.font;
  setColorValue('s-fgstroke', '#00000000');
  setColorValue('s-border',       '#00000000');
  setColorValue('s-activeborder', '#00000000');
  const _fgsWREl = document.getElementById('s-fgstrokew'); if(_fgsWREl) { _fgsWREl.value = '0'; const _fgsWVREl = document.getElementById('s-fgstrokew-val'); if(_fgsWVREl) _fgsWVREl.textContent = '0px'; }
  document.getElementById("s-radius").value  = String(BTN_STYLE_DEFAULTS.btnRadius ?? 6);
  const _fsREl = document.getElementById("s-fontsize"); if(_fsREl) { _fsREl.value = String(BTN_STYLE_DEFAULTS.fontSize ?? 16); const _fsRvEl = document.getElementById("s-fontsize-val"); if(_fsRvEl) _fsRvEl.textContent = (BTN_STYLE_DEFAULTS.fontSize ?? 16) + "px"; }
  const _fwREl = document.getElementById("s-fontweight"); if(_fwREl) { _fwREl.value = "400"; const _fwRvEl = document.getElementById("s-fontweight-val"); if(_fwRvEl) _fwRvEl.textContent = "400"; }
  const _fxREl = document.getElementById("s-fontscalex"); if(_fxREl) { _fxREl.value = "100"; const _fxRvEl = document.getElementById("s-fontscalex-val"); if(_fxRvEl) _fxRvEl.textContent = "100%"; }
  const _rvDef = document.getElementById("s-radius-val"); if(_rvDef) _rvDef.textContent = (BTN_STYLE_DEFAULTS.btnRadius ?? 6) + "px";
  _btnStyles = {};
  setColorValue('s-clock-date-color', _btnStyleFor('top-date').fg);
  setColorValue('s-clock-time-color', _btnStyleFor('top-time').fg);
  setColorValue('s-clock-date-bg',    _btnStyleFor('top-date').bg);
  setColorValue('s-clock-time-bg',    _btnStyleFor('top-time').bg);
  setColorValue('s-clock-bg',         btnStyle.clockBg);
  setColorValue('s-clock-date-glow',  _btnStyleFor('top-date').glow || '#00000000');
  setColorValue('s-clock-time-glow',  _btnStyleFor('top-time').glow || '#00000000');
  document.getElementById("s-clock-date-size").value = _btnStyles['top-date']?.clockDateSize ?? btnStyle.clockDateSize;
  const _rstDsV = document.getElementById('s-clock-date-size-val'); if(_rstDsV) _rstDsV.textContent = (_btnStyles['top-date']?.clockDateSize ?? btnStyle.clockDateSize) + 'px';
  const _rstDSxEl = document.getElementById('s-clock-date-scalex'); if(_rstDSxEl) { _rstDSxEl.value = '100'; const _rstDSxV = document.getElementById('s-clock-date-scalex-val'); if(_rstDSxV) _rstDSxV.textContent = '100%'; }
  const _rstDWtEl = document.getElementById('s-clock-date-weight'); if(_rstDWtEl) { _rstDWtEl.value = '400'; const _rstDWtV = document.getElementById('s-clock-date-weight-val'); if(_rstDWtV) _rstDWtV.textContent = '400'; }
  document.getElementById("s-clock-time-size").value = _btnStyles['top-time']?.clockTimeSize ?? btnStyle.clockTimeSize;
  const _rstTsV = document.getElementById('s-clock-time-size-val'); if(_rstTsV) _rstTsV.textContent = (_btnStyles['top-time']?.clockTimeSize ?? btnStyle.clockTimeSize) + 'px';
  const _rstTSxEl = document.getElementById('s-clock-time-scalex'); if(_rstTSxEl) { _rstTSxEl.value = '100'; const _rstTSxV = document.getElementById('s-clock-time-scalex-val'); if(_rstTSxV) _rstTSxV.textContent = '100%'; }
  const _rstTWtEl = document.getElementById('s-clock-time-weight'); if(_rstTWtEl) { _rstTWtEl.value = '400'; const _rstTWtV = document.getElementById('s-clock-time-weight-val'); if(_rstTWtV) _rstTWtV.textContent = '400'; }
  const _cdrREl = document.getElementById("s-clock-date-radius"); if(_cdrREl) { _cdrREl.value = "6"; const _cdrRVEl = document.getElementById("s-clock-date-radius-val"); if(_cdrRVEl) _cdrRVEl.textContent = "6px"; }
  const _ctrREl = document.getElementById("s-clock-time-radius"); if(_ctrREl) { _ctrREl.value = "6"; const _ctrRVEl = document.getElementById("s-clock-time-radius-val"); if(_ctrRVEl) _ctrRVEl.textContent = "6px"; }
  const _cdrOpenV = _btnStyles['top-date']?.btnRadius ?? btnStyle.btnRadius ?? 6;
  const _cdrOpenEl = document.getElementById("s-clock-date-radius"); if(_cdrOpenEl) { _cdrOpenEl.value = String(_cdrOpenV); const _cdrvOpenEl = document.getElementById("s-clock-date-radius-val"); if(_cdrvOpenEl) _cdrvOpenEl.textContent = _cdrOpenV + "px"; }
  const _ctrOpenV = _btnStyles['top-time']?.btnRadius ?? btnStyle.btnRadius ?? 6;
  const _ctrOpenEl = document.getElementById("s-clock-time-radius"); if(_ctrOpenEl) { _ctrOpenEl.value = String(_ctrOpenV); const _ctrvOpenEl = document.getElementById("s-clock-time-radius-val"); if(_ctrvOpenEl) _ctrvOpenEl.textContent = _ctrOpenV + "px"; }
  setColorValue('s-app-streak-text',      appStyle.streakText    || "#FFFFFFFF");
  setColorValue('s-app-anti-streak-text', appStyle.antiStreakText || "#8B0000FF");
  setColorValue('s-app-set-text',         appStyle.setValueText  || "#FFFFFFFF");
  setColorValue('s-app-today-bg',   APP_STYLE_DEFAULTS.todayBg);
  setColorValue('s-app-today-text', APP_STYLE_DEFAULTS.todayText);
  applyBtnStyle();
  window._clockSet([6, 1, 1, 1, 2, 1, 1, 0]);
  window._workingCfGroups = {};
  if (window._cfBuild) window._cfBuild();
  settingsUpdatePreview();
  if(window.fontPickerSync)fontPickerSync();
}
function settingsUpdatePreview() {
  const p = document.getElementById("settings-btn-preview");
  if(!p) return;
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
  if(_cogEl2 && _cfId === 'top-settings') {
    _cogEl2.style.background  = hex8ToCss(s.bg);
    _cogEl2.style.color       = hex8ToCss(s.fg);
    _cogEl2.style.borderColor = hex8ToCss(s.fg);
    _cogEl2.style.boxShadow   = `0 0 16px 5px ${hex8ToCss(s.glow)}`;
  }
}

