(async function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const extension = typeof chrome !== 'undefined' && !!chrome.storage?.local;
  const localKey = 'scroll-words-demo-v1';
  const storage = extension ? chrome.storage.local : {
    async get() { try { return JSON.parse(localStorage.getItem(localKey) || '{}'); } catch { return {}; } },
    async set(value) { const old = await this.get(); localStorage.setItem(localKey, JSON.stringify({ ...old, ...value })); }
  };
  let data = await storage.get(['settings', 'deck', 'cursor']);
  let config = ScrollWords.settings(data.settings), deck = data.deck || ScrollWords.STARTER, cursor = 0, simulated = 0, activeOverlay;
  $('demo-banner').hidden = extension;
  function status(message) { $('status').textContent = message; }
  function showDeck() {
    $('deck').value = deck.map(({ word, meaning }) => [word, meaning].map(v => '"' + v.replaceAll('"', '""') + '"').join(',')).join('\n');
    $('deck-count').textContent = `${deck.length} 个词`;
    $('sample-word').textContent = deck[0].word; $('sample-meaning').textContent = deck[0].meaning;
  }
  for (const [k, v] of Object.entries(config)) if (typeof v === 'boolean') $(k).checked = v; else $(k).value = v;
  showDeck();
  $('settings-form').addEventListener('submit', async event => {
    event.preventDefault();
    try {
      const input = Object.fromEntries(Object.keys(config).map(k => [k, typeof config[k] === 'boolean' ? $(k).checked : $(k).value]));
      config = ScrollWords.settings(input); await storage.set({ settings: config }); simulated = 0;
      status('已保存。扩展设置会自动应用到已打开的支持页面。');
    } catch (e) { status(`保存失败：${e.message}`); }
  });
  $('save-deck').addEventListener('click', async () => {
    try { const next = ScrollWords.parseDeck($('deck').value); await storage.set({ deck: next, cursor: 0 }); deck = next; cursor = 0; showDeck(); status(`已保存 ${deck.length} 个单词。`); }
    catch (e) { status(e.message); }
  });
  $('import').addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file) return;
    try { if (file.size > 3_000_000) throw Error('文件超过 3 MB。'); const text = await file.text(); const next = ScrollWords.parseDeck(text); $('deck').value = JSON.stringify(next, null, 2); status(`已预览 ${next.length} 词，请点“保存词库”应用。`); }
    catch (e) { status(`导入失败：${e.message}`); }
    event.target.value = '';
  });
  $('export').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'scroll-words.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
  });
  function preview() {
    if (activeOverlay) return;
    const next = ScrollWords.nextBatch(deck, cursor, config.batch); cursor = next.cursor;
    activeOverlay = ScrollWordsOverlay.showWords({ words: next.words, dwell: config.dwell, onClose() { activeOverlay = undefined; simulated = 0; $('sim-status').textContent = '本轮已结束。演示不会自动控制真实网页。'; } });
  }
  $('preview').addEventListener('click', preview);
  $('next-item').addEventListener('click', () => {
    simulated++; $('sim-status').textContent = `模拟浏览 ${simulated} 条 / 每 ${config.every} 条提醒一次（仅模拟数量触发）。`;
    if (simulated >= config.every) preview();
  });
})();
