// Reads "LLM Credits: 0.00$" from the Terno top bar (shown on app.terno.ai/billing).
// On pages that don't show it (e.g. your tushar9.app.terno.ai workspace) it shows the last known balance.
(() => {
  const RE = /LLM\s*Credits:\s*\$?\s*([0-9]+(?:\.[0-9]+)?)\s*\$?/i;
  let last = null, timer = null, pill = null, lastAsk = 0;

  function ensurePill() {
    if (pill) return;
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;right:14px;bottom:14px;z-index:2147483647;";
    const root = host.attachShadow({ mode: "open" });
    root.innerHTML = `<style>
      .p{font:12px/1.35 Arial,sans-serif;background:#1f2937;color:#fff;padding:8px 12px;border-radius:10px;
         box-shadow:0 2px 10px rgba(0,0,0,.25);min-width:150px;max-width:230px}
      .b{font-size:16px;font-weight:700} .low{color:#fca5a5} .s{opacity:.8} .o{opacity:.65;font-size:11px;margin-top:3px}
    </style><div class="p"><div class="b" id="b">--</div><div class="s" id="s"></div><div class="o" id="o"></div></div>`;
    document.documentElement.appendChild(host);
    pill = root;
  }

  function render(v, stats, low, staleTs) {
    ensurePill();
    const b = pill.getElementById("b");
    b.textContent = (staleTs ? "Last known: $" : "Credits: $") + v.toFixed(2);
    b.className = "b" + (v <= low ? " low" : "");
    const parts = [];
    if (stats) {
      parts.push("Spent today: $" + stats.spentToday.toFixed(2));
      if (stats.lastDelta) parts.push("Last change: " + (stats.lastDelta < 0 ? "-" : "+") + "$" + Math.abs(stats.lastDelta).toFixed(2));
    }
    pill.getElementById("s").innerHTML = parts.join("<br>");
    pill.getElementById("o").textContent = staleTs
      ? "Seen " + new Date(staleTs).toLocaleString() + ". Open app.terno.ai/billing to refresh."
      : "";
  }

  function showLastKnown() {
    const now = Date.now();
    if (last !== null || now - lastAsk < 10000) return;
    lastAsk = now;
    try {
      chrome.runtime.sendMessage({ type: "last" }, (res) => {
        if (chrome.runtime.lastError || !res || !res.last) return;
        if (last === null) render(res.last.v, res.stats, res.low, res.last.t);
      });
    } catch (e) {}
  }

  function read() {
    const m = RE.exec(document.body ? document.body.innerText : "");
    if (!m) { showLastKnown(); return; }
    const v = parseFloat(m[1]);
    if (v === last) return;
    last = v;
    try {
      chrome.runtime.sendMessage({ type: "balance", value: v }, (res) => {
        if (chrome.runtime.lastError) { render(v, null, 1); return; }
        render(v, res && res.stats, res ? res.low : 1);
      });
    } catch (e) { render(v, null, 1); }
  }

  const schedule = () => { clearTimeout(timer); timer = setTimeout(read, 500); };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  schedule();
})();
