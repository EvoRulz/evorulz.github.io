// @version 1238

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
    if (window._cpSaveFromUI) window._cpSaveFromUI();
    if (['s-cp-bg', 's-cp-border', 's-cp-label', 's-cp-text'].includes(id) && window._cpRebuild
      && !window._cpActiveDrag) window._cpRebuild();
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
    if (window._cpSaveFromUI) window._cpSaveFromUI();
    if (['s-cp-bg', 's-cp-border', 's-cp-label', 's-cp-text'].includes(id) && window._cpRebuild
      && !window._cpActiveDrag) window._cpRebuild();
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
  
  function _expandHex(raw) {
    let val = raw.trim().replace(/[^0-9a-fA-F#]/g, '');
    if (val && !val.startsWith('#')) val = '#' + val;
    const h = val.replace('#', '');
    if (h.length === 3) return '#' + (h[0]+h[0]+h[1]+h[1]+h[2]+h[2]).toUpperCase() + 'FF';
    if (h.length === 4) return '#' + (h[0]+h[0]+h[1]+h[1]+h[2]+h[2]+h[3]+h[3]).toUpperCase();
    if (h.length === 6) return '#' + h.toUpperCase() + 'FF';
    if (h.length === 8) return '#' + h.toUpperCase();
    return null;
  }
  function commitHexInput(id) {
    const hexEl = document.getElementById(id + '-hex');
    if (!hexEl) return;
    const result = _expandHex(hexEl.value);
    if (!result) return;
    hexEl.value = result;
    const { r, g, b, a } = hex8ToComponents(result);
    const picker = document.getElementById(id);
    const slider = document.getElementById(id + '-alpha');
    if (picker) picker.value = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    if (slider) { slider.value = a; updateAlphaSliderBg(id); }
    settingsChange();
  }
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;
    const hexEl = e.target;
    if (!hexEl.classList.contains('hex-input')) return;
    e.preventDefault();
    const id = hexEl.id.replace('-hex', '');
    commitHexInput(id);
    hexEl.blur();
  });

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
      const _spPicker = document.getElementById(pid);
      if (_spPicker && !_spPicker.closest('.color-swatch-wrap')) {
        const _spWrap = document.createElement('div');
        _spWrap.className = 'color-swatch-wrap';
        _spPicker.parentNode.insertBefore(_spWrap, _spPicker);
        _spWrap.appendChild(_spPicker);
        const _spOv = document.createElement('div');
        _spOv.className = 'color-swatch-overlay';
        _spOv.id = pid + '-swatch-overlay';
        _spWrap.appendChild(_spOv);
      }
    }
  }
  function collectAppStops() {
    const t = appStyle.bgType;
    const numStops = t === "solid" ? 1 : t === "gradient2" ? 2 : t === "gradient3" ? 3 : t === "gradient4" ? 4 : 0;
    appStyle.stops = [];
    for (let i = 0; i < numStops; i++) {
      appStyle.stops.push(t === 'solid' ? getStyleValue(`s-app-stop-${i}`) : getColorValue(`s-app-stop-${i}`));
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
    appStyle.borderColor = getStyleValue("s-app-border");
    appStyle.theadBg     = getStyleValue("s-app-thead");
    appStyle.cellBg      = getStyleValue("s-app-cell-bg");
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










