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