# Terno Credits Counter

A small Chrome extension that shows your **Terno AI LLM credit balance**, how much you **spent today**, and a **history** of balance changes, so you can see what each question costs.

> Unofficial tool. Not affiliated with or endorsed by Terno AI or CloudxLab.

## What it does

- Reads the "LLM Credits: $X" figure that Terno shows on its billing page (`app.terno.ai/billing`).
- Shows the balance as a badge on the extension icon (green normally, red at or below a limit you set).
- Shows a small box at the bottom-right of Terno pages with the balance and today's spend.
- On Terno pages that don't display the balance (for example your `<workspace>.app.terno.ai` chat), it shows the **last known** balance and when it was seen.
- Records every balance change locally. The popup lists recent history and can export a CSV.
- Top-ups and daily resets are not counted as spending.

## Install (Chrome / Edge / Brave)

1. Download or clone this repo, so you have a folder with `manifest.json` directly inside it.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select that folder.
4. Open `https://app.terno.ai/billing` once so the extension can record your balance.
5. Refresh any open Terno tabs.

Chrome cannot load a zip file directly. Unzip first, and select the folder that contains `manifest.json`.

## How to use

1. After installing, open `https://app.terno.ai/billing`. The box at the bottom-right and the toolbar badge show your balance.
2. Use Terno as normal. After a few questions, open the billing page again. The balance and "Spent today" update.
3. Click the extension icon to see recent history, set the low-balance limit (the badge turns red at or below it), or export a CSV.
4. To see what one question costs, note the balance before and after asking it. The "Last change" line shows the difference.

## Troubleshooting

| Problem | Fix |
|---|---|
| "Manifest file is missing or unreadable" when loading | You selected the wrong folder. Select the folder that has `manifest.json` directly inside it, not a folder that only contains another folder. |
| Popup says "No data yet" | Open `https://app.terno.ai/billing` once, then reopen the popup. |
| Box does not appear on a Terno tab | Refresh the tab. The extension only reads pages that loaded after it was installed. |
| Shows "Last known" instead of a live balance | Normal on pages that do not display the balance. Open the billing page to refresh it. |
| Nothing is found even on the billing page | Terno may have changed the "LLM Credits" wording. Update the regex at the top of `content.js`. |

## Limits

- The balance updates only when a Terno page that displays it is open (the billing page). Elsewhere you see the last known value.
- It reads the page text. If Terno changes the wording of "LLM Credits", update the regex in `content.js`.
- It only tracks your balance. It cannot add or change credits.

## Privacy

Everything stays in your browser (`chrome.storage.local`). The extension makes no network requests and sends nothing anywhere. It needs only the `storage` permission and access to `*.terno.ai`.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Extension settings (Manifest V3) |
| `content.js` | Reads the balance and draws the on-page box |
| `background.js` | Stores history, computes spend, sets the badge |
| `popup.html` / `popup.js` | Toolbar popup: history, low-balance limit, CSV export |

## License

MIT. See `LICENSE`.
