chrome.storage.local.get(['settings', 'stats']).then(data => {
  let config = ScrollWords.settings(data.settings);
  const toggle = document.getElementById('enabled'); toggle.checked = config.enabled;
  const count = Object.values(data.stats || {}).reduce((a, b) => a + Number(b), 0);
  document.getElementById('status').textContent = `近期安排展示 ${count} 词次 · 展示不等于掌握`;
  toggle.addEventListener('change', async () => {
    const latest = await chrome.storage.local.get(['settings']);
    config = ScrollWords.settings(latest.settings); config.enabled = toggle.checked;
    await chrome.storage.local.set({ settings: config });
  });
});
document.getElementById('options').addEventListener('click', () => chrome.runtime.openOptionsPage());
