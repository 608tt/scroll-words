/* Shared by the extension, its offline demo and Node tests. No network access. */
(function (root) {
  'use strict';
  const DEFAULTS = Object.freeze({ enabled: true, mode: 'hybrid', every: 5, seconds: 180, batch: 3, dwell: 5, douyin: true, xiaohongshu: true });
  const STARTER = [
    ['begin', '开始；着手'], ['notice', '注意到；察觉'], ['gentle', '温和的；轻柔的'],
    ['persist', '坚持；持续'], ['curious', '好奇的'], ['pause', '暂停；停顿'],
    ['improve', '改善；提高'], ['enough', '足够的'], ['focus', '专注；焦点'],
    ['gradual', '逐渐的'], ['explore', '探索'], ['habit', '习惯']
  ].map(([word, meaning]) => ({ word, meaning }));
  function settings(input = {}) {
    const result = { ...DEFAULTS };
    for (const k of ['enabled', 'douyin', 'xiaohongshu']) if (typeof input[k] === 'boolean') result[k] = input[k];
    if (['views', 'time', 'hybrid'].includes(input.mode)) result.mode = input.mode;
    for (const [k, min, max] of [['every', 1, 100], ['seconds', 15, 3600], ['batch', 1, 5], ['dwell', 0, 30]]) {
      if (Number.isFinite(Number(input[k]))) result[k] = Math.min(max, Math.max(min, Math.round(Number(input[k]))));
    }
    return result;
  }
  function validateDeck(rows) {
    if (!Array.isArray(rows) || !rows.length || rows.length > 5000) throw Error('词库需要 1–5000 条单词。');
    const seen = new Set(), deck = [];
    for (let i = 0; i < rows.length; i++) {
      const word = typeof rows[i]?.word === 'string' ? rows[i].word.trim() : '';
      const meaning = typeof rows[i]?.meaning === 'string' ? rows[i].meaning.trim() : '';
      if (!word || !meaning || word.length > 120 || meaning.length > 500) throw Error(`第 ${i + 1} 条需要英文与释义（最多 120 / 500 字符）。`);
      if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(word + meaning)) throw Error('词库含不可显示的控制字符。');
      const key = word.toLocaleLowerCase('en');
      if (!seen.has(key)) { seen.add(key); deck.push({ word, meaning }); }
    }
    return deck;
  }
  function csvRows(text, delimiter) {
    const rows = []; let row = [], cell = '', quoted = false, closed = false;
    for (let i = 0; i <= text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === undefined) throw Error('CSV 引号未闭合。');
        if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else { quoted = false; closed = true; } }
        else cell += c;
      } else if (c === '"' && cell === '' && !closed) quoted = true;
      else if (c === delimiter || c === '\n' || c === undefined) {
        row.push(cell); cell = ''; closed = false;
        if (c !== delimiter) { if (row.some(v => v.trim())) rows.push(row); row = []; }
      } else if (c === '\r' && (text[i + 1] === '\n' || text[i + 1] === undefined)) continue;
      else if (closed || c === '"') throw Error('CSV 引号格式不正确。');
      else cell += c;
    }
    return rows;
  }
  function parseDeck(text) {
    if (typeof text !== 'string' || text.length > 3_000_000) throw Error('词库文件过大（最多 3 MB 文本）。');
    text = text.replace(/^\uFEFF/u, '').trim();
    if (text.startsWith('[')) { try { return validateDeck(JSON.parse(text)); } catch (e) { throw Error(`JSON 词库：${e.message}`); } }
    const rows = csvRows(text, text.split('\n')[0]?.includes('\t') ? '\t' : ',');
    if (rows[0]?.length === 2 && /^(word|英文|单词)$/i.test(rows[0][0].trim()) && /^(meaning|释义|中文)$/i.test(rows[0][1].trim())) rows.shift();
    if (rows.some(r => r.length !== 2)) throw Error('每行需要两列：英文,中文释义。含逗号的释义请加双引号；也支持制表符。');
    return validateDeck(rows.map(([word, meaning]) => ({ word, meaning })));
  }
  function nextBatch(deck, cursor = 0, count = 3) {
    if (!deck.length) return { words: [], cursor: 0 };
    const start = Math.max(0, Math.floor(Number(cursor) || 0)) % deck.length;
    count = Math.min(deck.length, Math.max(1, Math.min(5, Math.floor(Number(count) || 1))));
    return { words: Array.from({ length: count }, (_, i) => deck[(start + i) % deck.length]), cursor: (start + count) % deck.length };
  }
  function due(config, views, milliseconds) {
    return (config.mode !== 'time' && views >= config.every) || (config.mode !== 'views' && milliseconds >= config.seconds * 1000);
  }
  class ViewCounter {
    constructor() { this.candidate = ''; this.since = 0; this.seen = []; }
    observe(key, now) {
      if (!key) { this.candidate = ''; return false; }
      if (key !== this.candidate) { this.candidate = key; this.since = now; return false; }
      if (now - this.since < 1500 || this.seen.includes(key)) return false;
      this.seen.push(key); if (this.seen.length > 100) this.seen.shift(); return true;
    }
  }
  const api = { DEFAULTS, STARTER, settings, validateDeck, parseDeck, csvRows, nextBatch, due, ViewCounter };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ScrollWords = api;
})(globalThis);
