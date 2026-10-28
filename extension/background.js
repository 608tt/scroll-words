importScripts('core.js');
let serial = Promise.resolve();
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (!sender.tab || message?.type !== 'next-words') return;
  serial = serial.then(async () => {
    const data = await chrome.storage.local.get(['deck', 'cursor', 'settings', 'stats']);
    const config = ScrollWords.settings(data.settings);
    const host = new URL(sender.tab.url || '').hostname;
    if (!config.enabled || !(host === 'www.douyin.com' && config.douyin || host === 'www.xiaohongshu.com' && config.xiaohongshu)) return reply({ words: [] });
    const batch = ScrollWords.nextBatch(data.deck || ScrollWords.STARTER, data.cursor, config.batch);
    const day = new Date().toLocaleDateString('en-CA');
    const stats = data.stats || {};
    stats[day] = (Number(stats[day]) || 0) + batch.words.length;
    const recent = Object.fromEntries(Object.entries(stats).sort().slice(-31));
    await chrome.storage.local.set({ cursor: batch.cursor, stats: recent });
    reply({ words: batch.words });
  }).catch(() => reply({ error: '词库读取失败，请重新加载插件。' }));
  return true;
});
