const $ = (id) => document.getElementById(id);
const money = (n) => "$" + n.toFixed(2);

async function load() {
  const { history = [], settings = { low: 1 } } = await chrome.storage.local.get(["history", "settings"]);
  $("low").value = settings.low;
  if (!history.length) { $("bal").textContent = "No data yet"; return; }
  const t0 = new Date(); t0.setHours(0, 0, 0, 0);
  let spent = 0, last = 0;
  for (let i = 1; i < history.length; i++) {
    const d = history[i].v - history[i - 1].v; last = d;
    if (history[i].t >= t0.getTime() && d < 0) spent += -d;
  }
  $("bal").textContent = money(history[history.length - 1].v);
  $("today").textContent = money(spent);
  $("delta").textContent = last ? (last < 0 ? "-" : "+") + money(Math.abs(last)) : "--";
  $("hist").innerHTML = history.slice(-12).reverse()
    .map((h) => `<tr><td>${new Date(h.t).toLocaleString()}</td><td style="text-align:right">${money(h.v)}</td></tr>`).join("");
}

$("low").addEventListener("change", async () => {
  await chrome.storage.local.set({ settings: { low: parseFloat($("low").value) || 0 } });
});
$("clear").addEventListener("click", async () => { await chrome.storage.local.set({ history: [] }); load(); });
$("csv").addEventListener("click", async () => {
  const { history = [] } = await chrome.storage.local.get("history");
  const csv = "time,balance_usd\n" + history.map((h) => `${new Date(h.t).toISOString()},${h.v}`).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "terno_credits_history.csv"; a.click();
});
load();
