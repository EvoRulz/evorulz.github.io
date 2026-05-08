 // @version 1267

  // ── Constants ──────────────────────────────────────────────
  const MIN_DATE       = new Date("2026-03-14");
  const MAX_DATE       = new Date("2111-04-19");
  const STATUSES       = ["yes", "no", "idk", "not yet", "n/a"];
  const CHUNK          = 30;
  const SET_BAR_MAX    = 100;
  const TOTAL_BAR_MAX  = 100;
  const STREAK_BAR_MAX = 30;
  const NUM_SETS       = 10;

  // ── Status colour ──────────────────────────────────────────
  function applyStatusColor(el) {
    const v = el.value;
    if      (v === "yes") { el.style.background = "#90EE90"; el.style.color = "#000"; }
    else if (v === "no")  { el.style.background = "#cc0000"; el.style.color = "#fff"; }
    else if (v === "n/a") { el.style.background = "#228B22"; el.style.color = "#fff"; }
    else if (v === "")    { el.style.background = "transparent"; el.style.color = "#fff"; }
    else                  { el.style.background = "#FFD580"; el.style.color = "#000"; }
  }

  // ── Confirmation overlay ───────────────────────────────────
  let _confirmResolve = null;
  function confirmClear(bodyHTML) {
    return new Promise(resolve => {
      _confirmResolve = resolve;
      document.getElementById("confirm-msg").innerHTML =
        bodyHTML + '<br><br>Type <strong>Habit Tracker</strong> and press Enter to confirm.';
      const input = document.getElementById("confirm-input");
      input.value = "";
      document.getElementById("confirm-hint").textContent = "";
      input.classList.remove("shake");
      document.getElementById("confirm-overlay").classList.add("active");
      setTimeout(() => input.focus(), 60);
    });
  }
  function confirmCancel() {
    document.getElementById("confirm-overlay").classList.remove("active");
    if (_confirmResolve) { _confirmResolve(false); _confirmResolve = null; }
  }
  document.getElementById("confirm-input").addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    const input = document.getElementById("confirm-input");
    const hint  = document.getElementById("confirm-hint");
    if (input.value === "Habit Tracker") {
      document.getElementById("confirm-overlay").classList.remove("active");
      if (_confirmResolve) { _confirmResolve(true); _confirmResolve = null; }
    } else {
      hint.textContent = "Incorrect — try again.";
      input.classList.remove("shake");
      void input.offsetWidth;
      input.classList.add("shake");
    }
  });
  document.getElementById("confirm-overlay").addEventListener("click", e => {
    if (e.target === document.getElementById("confirm-overlay")) confirmCancel();
  });
  // ── Orientation lock ───────────────────────────────────────
let _orientLocked = false;
const _LOCK_PATH   = '<path fill-rule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1zm3 8V5.5a3 3 0 1 0-6 0V9h6z" clip-rule="evenodd"/>';
const _UNLOCK_PATH = '<path fill-rule="evenodd" d="M14.5 1A4.5 4.5 0 0 0 10 5.5V9H3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1.5V5.5a3 3 0 1 1 6 0v2.75a.75.75 0 0 0 1.5 0V5.5A4.5 4.5 0 0 0 14.5 1z" clip-rule="evenodd"/>';
function _updateOrientBtn() {
  const icon = document.getElementById('orient-lock-icon');
  if (!icon) return;
  icon.innerHTML = _orientLocked ? _LOCK_PATH : _UNLOCK_PATH;
  if (typeof applyBtnStyle === 'function') applyBtnStyle();
}
document.addEventListener('DOMContentLoaded', _updateOrientBtn);
async function toggleOrientLockNoFullscreen() {
  if (_orientLocked) {
    try { await screen.orientation.unlock(); } catch(e) {}
    _orientLocked = false;
    _updateOrientBtn();
    if (window._cfRender) window._cfRender();
    return;
  }
  const t = (screen.orientation && screen.orientation.type) || 'portrait-primary';
  const target = t.startsWith('landscape') ? 'landscape' : 'portrait';
  let locked = false;
  try { await screen.orientation.lock(target); locked = true; } catch(e) {}
  if (!locked && window.AndroidOrientation) {
    try { window.AndroidOrientation.lock(target); locked = true; } catch(e) {}
  }
  _orientLocked = locked;
  _updateOrientBtn();
  if (window._cfRender) window._cfRender();
}
async function toggleOrientLock() {
  if (_orientLocked) {
    try { await screen.orientation.unlock(); } catch(e) {}
    try { document.exitFullscreen && document.exitFullscreen(); } catch(e) {}
    _orientLocked = false;
    _updateOrientBtn();
    if (window._cfRender) window._cfRender();
    return;
  }
  const t = (screen.orientation && screen.orientation.type) || 'portrait-primary';
  const target = t.startsWith('landscape') ? 'landscape' : 'portrait';
  let locked = false;
  try {
    const el = document.documentElement;
    if (el.requestFullscreen) await el.requestFullscreen();
    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
  } catch(e) {}
  try {
    await screen.orientation.lock(target);
    locked = true;
  } catch(e) {}
  if (!locked && window.AndroidOrientation) {
    try { window.AndroidOrientation.lock(target); locked = true; } catch(e) {}
  }
  _orientLocked = locked;
  _updateOrientBtn();
  if (window._cfRender) window._cfRender();
}
(function() {
  const saved = localStorage.getItem('_zoom');
  if (saved) {
    const zoom = parseInt(saved);
    const sliderVal = Math.round(zoomToSlider(zoom));
    const content = document.getElementById('zoom-content');
    if (content) {
      if (zoom === 100) {
        content.style.transform = '';
        content.style.transformOrigin = '';
        content.style.height = '';
      } else {
        const scale = zoom / 100;
        content.style.transformOrigin = 'top center';
        content.style.transform = 'scale(' + scale + ')';
        content.style.height = (content.scrollHeight * scale) + 'px';
      }
    }
    const sl = document.getElementById('zoom-slider');
    const lb = document.getElementById('zoom-label');
    if (sl) sl.value = sliderVal;
    if (lb) lb.textContent = zoom + '%';
  }
})();
  function sliderToZoom(s) {
    s = Number(s);
    if (s <= 175) return 50 + (s - 50) * 50 / 125;
    return 100 + (s - 175) * 200 / 125;
  }
  function zoomToSlider(z) {
    z = Number(z);
    if (z <= 100) return 50 + (z - 50) * 125 / 50;
    return 175 + (z - 100) * 125 / 200;
  }
  function ctrlZoom(sliderVal) {
    sliderVal = Number(sliderVal);
    if (Math.abs(sliderVal - 175) <= 8) sliderVal = 175;
    const zoom = Math.round(sliderToZoom(sliderVal));
    const sl = document.getElementById('zoom-slider');
    if (sl) sl.value = sliderVal;
    const content = document.getElementById('zoom-content');
    if (content) {
      if (zoom === 100) {
        content.style.transform = '';
        content.style.transformOrigin = '';
        content.style.height = '';
      } else {
        const scale = zoom / 100;
        content.style.transformOrigin = 'top center';
        content.style.transform = 'scale(' + scale + ')';
        content.style.height = (content.scrollHeight * scale) + 'px';
      }
    }
    const lb = document.getElementById('zoom-label');
    if (lb) lb.textContent = zoom + '%';
    localStorage.setItem('_zoom', zoom);
  }
  window._dragEnabled = true;
  window._interactEnabled = true;
  function ctrlToggleDrag() {
    window._dragEnabled = !window._dragEnabled;
    const t = document.getElementById('drag-toggle');
    if (t) t.classList.toggle('on', window._dragEnabled);
  }
  async function hardReload() {
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const r of regs) await r.unregister();
  }
  const keys = await caches.keys();
  for (const k of keys) await caches.delete(k);
  window.location.replace(location.href.replace(/[?#].*$/, '') + '?t=' + Date.now());
}
  
  function ctrlToggleInteract() {
    window._interactEnabled = !window._interactEnabled;
    const t = document.getElementById('interact-toggle');
    if (t) t.classList.toggle('on', window._interactEnabled);
    document.body.classList.toggle('interact-locked', !window._interactEnabled);
  }










































