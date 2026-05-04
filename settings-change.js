// @version 1236

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
        _settingsHasChanges = true;
        _history = _history.slice(0, _historyIndex + 1);
        _history.push(_captureStyleSnapshot());
        if (_history.length > 50) _history.shift();
        _historyIndex = _history.length - 1;
        _updateUndoRedoBtns();
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
          const _shholeIvEl = document.getElementById('s-sliderhandlehole-val'); if (_shholeIvEl) _shholeIvEl.textContent = (btnStyle.sliderHandleHole ?? 0) + '%';
          const _shholeEl = document.getElementById('s-sliderhandlehole'); if (_shholeEl) _shholeEl.value = String(btnStyle.sliderHandleHole ?? 0);
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
        if (Date.now() - _lastUndoRedoTime < 600) { _undoDebounceTimer = null; return; }
        _history = _history.slice(0, _historyIndex + 1);
        _history.push(_captureStyleSnapshot());
        if (_history.length > 50) _history.shift();
        _historyIndex = _history.length - 1;
        _undoDebounceTimer = null;
        _updateUndoRedoBtns();
      }, 50);
    }
    const _cfId = window._cfActiveId ? window._cfActiveId() : null;
    if (_cfId) {
      if (_cfId === 'top-date') {
        const dateColor = getColorValue('s-fg');
        _btnStyles['top-date'] = Object.assign(_btnStyles['top-date'] || {}, {
          bg: getStyleValue('s-bg'), fg: dateColor,
          glow: getColorValue('s-glow'), activeGlow: getColorValue('s-activeglow'),
          activeBg: getStyleValue('s-activebg'),
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
          bg: getStyleValue('s-bg'), fg: timeColor,
          glow: getColorValue('s-glow'), activeGlow: getColorValue('s-activeglow'),
          activeBg: getStyleValue('s-activebg'),
          tap: getColorValue('s-tap'), font: document.getElementById("s-font").value,
          clockTimeSize: Number(document.getElementById("s-clock-time-size").value),
        });
        setColorValue('s-clock-time-color', timeColor);
        updateAlphaSliderBg('s-clock-time-color');
        setColorValue('s-clock-time-glow', getColorValue('s-glow'));
        updateAlphaSliderBg('s-clock-time-glow');
      } else {
        _btnStyles[_cfId] = Object.assign(_btnStyles[_cfId] || {}, {
          bg: getStyleValue('s-bg'),
          bgStops: window._cpGetGradientStops ? window._cpGetGradientStops('s-bg') : null,
          fg: getColorValue('s-fg'),
          glow: getColorValue('s-glow'), activeGlow: getColorValue('s-activeglow'),
          activeBg: getStyleValue('s-activebg'),
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
    btnStyle.sliderBorder   = getStyleValue('s-sliderborder');
    if (document.getElementById('s-sliderfill'))   btnStyle.sliderFill   = getStyleValue('s-sliderfill');
    if (document.getElementById('s-slidertrack'))  btnStyle.sliderTrack  = getStyleValue('s-slidertrack');
    if (document.getElementById('s-sliderhandle')) btnStyle.sliderHandle = getStyleValue('s-sliderhandle');
    if (document.getElementById('s-sliderhandleborder')) btnStyle.sliderHandleBorder = getStyleValue('s-sliderhandleborder');
    btnStyle.sliderH        = Number(document.getElementById("s-sliderh").value);
    btnStyle.sliderR        = Number(document.getElementById("s-sliderr").value);
    btnStyle.sliderSpread   = Number(document.getElementById("s-sliderspread").value);
    btnStyle.sliderHandleH  = Number(document.getElementById("s-sliderhandleh").value);
    btnStyle.sliderHandleR  = Number(document.getElementById("s-sliderhandler").value);
    btnStyle.sliderW        = Number(document.getElementById("s-sliderw").value);
    btnStyle.sliderHandleW  = Number(document.getElementById("s-sliderhandlew").value);
    btnStyle.sliderHandleHole = Number(document.getElementById("s-sliderhandlehole").value);
    btnStyle.checkboxChecked = getColorValue('s-checkbox-checked');
    btnStyle.checkboxMark    = getColorValue('s-checkbox-mark');
    btnStyle.checkboxBorder  = getColorValue('s-checkbox-border');
    btnStyle.checkboxBg      = getColorValue('s-checkbox-bg');
    btnStyle.clockBg         = getColorValue('s-clock-bg');
    if (_cfId !== 'top-date') {
      _btnStyles['top-date'] = Object.assign(_btnStyles['top-date'] || {}, {
        bg: getStyleValue('s-clock-date-bg'),
        fg: getColorValue('s-clock-date-color'),
        glow: getColorValue('s-clock-date-glow'),
        clockDateSize: Number(document.getElementById("s-clock-date-size").value),
      });
    }
    if (_cfId !== 'top-time') {
      _btnStyles['top-time'] = Object.assign(_btnStyles['top-time'] || {}, {
        bg: getStyleValue('s-clock-time-bg'),
        fg: getColorValue('s-clock-time-color'),
        glow: getColorValue('s-clock-time-glow'),
        clockTimeSize: Number(document.getElementById("s-clock-time-size").value),
      });
    }
if (_cfId !== 'top-date') {
const cfDateColor = getColorValue('s-clock-date-color');
_btnStyles['top-date'] = Object.assign(_btnStyles['top-date'] || {}, {
  bg: getStyleValue('s-clock-date-bg'),
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
    if (window._cpRebuild && !window._cpActiveDrag) window._cpRebuild();
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
    const _shheREl = document.getElementById("s-sliderhandlehole"); if (_shheREl) _shheREl.value = String(BTN_STYLE_DEFAULTS.sliderHandleHole ?? 0);
    const _shhevREl = document.getElementById("s-sliderhandlehole-val"); if (_shhevREl) _shhevREl.textContent = (BTN_STYLE_DEFAULTS.sliderHandleHole ?? 0) + '%';
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








