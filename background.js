function startOfToday() { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }

function compute(history) {
  const t0 = startOfToday();
  let spentToday = 0, lastDelta = 0;
  for (let i = 1; i < history.length; i++) {
    const d = history[i].v - history[i - 1].v;
    lastDelta = d;
    if (history[i].t >= t0 && d < 0) spentToday += -d; // top-ups/daily resets are not counted as spending
  }
  return { spentToday, lastDelta };
}

function badgeText(v) {
  if (v >= 100) return String(Math.round(v));
  if (v >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

async function handle(value) {
  const { history = [], settings = { low: 1 } } = await chrome.storage.local.get(["history", "settings"]);
  const prev = history.length ? history[history.length - 1].v : null;
  if (prev !== value) {
    history.push({ t: Date.now(), v: value });
    while (history.length > 1000) history.shift();
    await chrome.storage.local.set({ history });
  }
  chrome.action.setBadgeText({ text: badgeText(value) });
  chrome.action.setBadgeBackgroundColor({ color: value <= settings.low ? "#dc2626" : "#16a34a" });
  return { stats: compute(history), low: settings.low };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === "last") {
    chrome.storage.local.get(["history", "settings"]).then(({ history = [], settings = { low: 1 } }) => {
      sendResponse({ last: history.length ? history[history.length - 1] : null, stats: compute(history), low: settings.low });
    });
    return true;
  }
  if (msg && msg.type === "balance" && typeof msg.value === "number") {
    handle(msg.value).then(sendResponse);
    return true;
  }
});
