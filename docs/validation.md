# Validation record

Date: 2026-10-28. Initial release: 0.1.0. Tested on macOS, Node.js 26.8.1 and Chrome. CI targets Node.js 22 on Linux.

## Automated

`npm test`: 13 passing tests. CSV quoting, BOM, TSV/JSON, duplicate folding, all-or-nothing invalid imports, size limits, cyclic word selection, settings limits, timer thresholds and stable-item deduplication are covered.

The actual production `content.js` also runs in deterministic DOM/storage fixtures: pause a playing video; resume only on Continue; ignore background time; snooze; respect per-site disabling. This tests the real script's control flow but does not reproduce all live platform behavior.

`npm run build` creates a standalone demo and a ZIP containing only the reviewed extension files. No npm dependencies or user vocabulary are packaged.

## Browser verification

- Chrome rendered the real settings page, sample word card and shared modal component.
- Preview showed three English–Chinese words and an initially disabled countdown button.
- Snooze closed the modal and restored focus to the originating control.
- CSV with a quoted comma and case-insensitive duplicate was saved as two unique words.
- Public Xiaohongshu's page contained visible `/explore/` note links matching the adapter's route strategy.
- Douyin's unauthenticated recommended-feed entry showed a login panel; no login or access-control bypass was attempted.

## Limits of this verification

The extension has not been installed and exercised end-to-end on live Douyin/Xiaohongshu accounts. The demo and deterministic fixtures are not substitutes for that check. Edge, mobile, native app overlays, full-screen playback and learning outcomes are not verified. Website-specific content counts remain experimental; use the foreground-time fallback.
