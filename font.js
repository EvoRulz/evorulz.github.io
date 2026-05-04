// @version 1239

function _makeFontTumbler(selectId, wrapId, onChangeCb) {
  function getOpts() {
    var sel = document.getElementById(selectId);
    if (!sel) return [];
    return Array.from(sel.options).map(function(o){ return { value: o.value, text: o.text }; });
  }
  function getIdx() {
    var sel = document.getElementById(selectId);
    return sel ? Math.max(0, sel.selectedIndex) : 0;
  }
  function setIdx(idx) {
    var sel = document.getElementById(selectId);
    var opts = getOpts();
    if (!sel || !opts.length) return;
    idx = ((idx % opts.length) + opts.length) % opts.length;
    sel.selectedIndex = idx;
    sel.dispatchEvent(new Event('change'));
    render();
    if (onChangeCb) onChangeCb(sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].value : '');
  }
  function render() {
    var wrap = document.getElementById(wrapId);
    if (!wrap) return;
    var opts = getOpts();
    if (!opts.length) return;
    var idx = getIdx();
    var prev = ((idx - 1) + opts.length) % opts.length;
    var next = (idx + 1) % opts.length;
    var items = wrap.querySelectorAll('.font-tumb-item');
    if (items.length !== 3) { build(); return; }
    items[0].textContent = opts[prev].text;
    items[0].style.fontFamily = opts[prev].value;
    items[1].textContent = opts[idx].text;
    items[1].style.fontFamily = opts[idx].value;
    items[2].textContent = opts[next].text;
    items[2].style.fontFamily = opts[next].value;
  }
  function build() {
    var wrap = document.getElementById(wrapId);
    if (!wrap) return;
    wrap.innerHTML = '';
    var opts = getOpts();
    var idx = getIdx();
    var prev = ((idx - 1) + opts.length) % opts.length;
    var next = (idx + 1) % opts.length;
    var win = document.createElement('div');
    win.className = 'tumb-window';
    win.style.height = '52px';
    [
      { cls: 'tumb-item tumb-adj font-tumb-item', opt: opts[prev] },
      { cls: 'tumb-item tumb-sel font-tumb-item', opt: opts[idx]  },
      { cls: 'tumb-item tumb-adj font-tumb-item', opt: opts[next] },
    ].forEach(function(spec) {
      var el = document.createElement('div');
      el.className = spec.cls;
      el.textContent = spec.opt.text;
      el.style.fontFamily = spec.opt.value;
      win.appendChild(el);
    });
    wrap.appendChild(win);
    var startY = null, lastY = null, accumY = 0, moved = false;
    var STEP = 28;
    win.addEventListener('pointerdown', function(e) {
      e.preventDefault(); e.stopPropagation();
      win.setPointerCapture(e.pointerId);
      startY = e.clientY; lastY = e.clientY; accumY = 0; moved = false;
    });
    win.addEventListener('pointermove', function(e) {
      if (startY === null) return;
      var dy = lastY - e.clientY;
      if (Math.abs(e.clientY - startY) > 4) moved = true;
      accumY += dy; lastY = e.clientY;
      while (accumY >= STEP)  { accumY -= STEP; setIdx(getIdx() + 1); }
      while (accumY <= -STEP) { accumY += STEP; setIdx(getIdx() - 1); }
    });
    win.addEventListener('pointerup', function(e) {
      if (!moved) {
        var rect = win.getBoundingClientRect();
        setIdx(getIdx() + (e.clientY < rect.top + rect.height / 2 ? -1 : 1));
      }
      startY = null; lastY = null; accumY = 0; moved = false;
    });
    win.addEventListener('pointercancel', function() {
      startY = null; lastY = null; accumY = 0; moved = false;
    });
    
  }
  return { build: build, render: render };
}
(function() {
  var _main = _makeFontTumbler('s-font', 'font-tumbler-wrap', null);
  var _swatch = null;
  function _buildSwatch() {
    _swatch = _makeFontTumbler('s-cp-label-font', 'font-tumbler-wrap-swatch', function() {
      if (window._cpSaveFromUI) window._cpSaveFromUI();
      if (window._applyLabelToSwatches) window._applyLabelToSwatches();
    });
    _swatch.build();
  }
  window.fontPickerSwatchSync  = function() { if (_swatch) _swatch.render(); else _buildSwatch(); };
  window.fontPickerSwatchBuild = function() { _buildSwatch(); };
  window.fontPickerSync   = function() { _main.render(); };
  window.fontPickerToggle = function() {};
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { _main.build(); _buildSwatch(); });
  } else {
    _main.build();
    _buildSwatch();
  }
})();











