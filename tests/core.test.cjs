const {test} = require('node:test');
const assert = require('node:assert/strict');
const C = require('../extension/core.js');
test('CSV supports BOM, headers, quoted commas and escaped quotes', () => {
  assert.deepEqual(C.parseDeck('\ufeffword,meaning\r\nnotice,"注意,察觉"\r\nquote,"a ""quote"""'), [{word:'notice',meaning:'注意,察觉'},{word:'quote',meaning:'a "quote"'}]);
});
test('TSV, JSON, duplicate folding, multiline definitions', () => {
  assert.equal(C.parseDeck('word\tmeaning\nBegin\t开始\nbegin\t忽略').length,1);
  assert.equal(C.parseDeck('[{"word":"go","meaning":"去"}]')[0].word,'go');
  assert.equal(C.parseDeck('word,meaning\nx,"first\nsecond"')[0].meaning,'first\nsecond');
});
test('malformed imports never partially replace a deck', () => {
  for (const text of ['', 'one', 'a,b,c', 'a,"unfinished', 'a,"b"junk', '[{}]', '[]', 'a,']) assert.throws(() => C.parseDeck(text));
  assert.throws(() => C.parseDeck('x'.repeat(3000001)));
});
test('word markup stays data, not HTML', () => {
  assert.equal(C.parseDeck('<script>,<img onerror=alert(1)>')[0].word,'<script>');
  const overlay = require('node:fs').readFileSync(require.resolve('../extension/overlay.js'),'utf8');
  assert.ok(!overlay.includes('innerHTML')); assert.ok(overlay.includes('word.textContent = entry.word'));
});
test('round robin covers every word and does not duplicate within a batch', () => {
  const deck = C.STARTER.slice(0,4);
  assert.deepEqual(C.nextBatch(deck,3,3).words,[deck[3],deck[0],deck[1]]);
  assert.equal(C.nextBatch(deck,3,3).cursor,2);
  assert.equal(C.nextBatch(deck,0,5).words.length,4);
});
test('settings clamp numeric limits and ignore unknown fields', () => {
  const config = C.settings({batch:100,seconds:-2,every:'3',enabled:false,dwell:'bad',mode:'wrong',evil:true});
  assert.equal(config.batch,5); assert.equal(config.seconds,15); assert.equal(config.every,3); assert.equal(config.dwell,5); assert.equal(config.mode,'hybrid'); assert.equal(config.enabled,false); assert.equal(config.evil,undefined);
});
test('time, view and hybrid thresholds', () => {
  assert.equal(C.due(C.DEFAULTS,4,179999),false);
  assert.equal(C.due(C.DEFAULTS,5,0),true);
  assert.equal(C.due(C.DEFAULTS,0,180000),true);
  assert.equal(C.due({...C.DEFAULTS,mode:'views'},0,999999),false);
  assert.equal(C.due({...C.DEFAULTS,mode:'time'},9,1),false);
});
test('count only stable new items, not autoplay loops or backscroll', () => {
  const counter = new C.ViewCounter();
  assert.equal(counter.observe('a',0),false); assert.equal(counter.observe('a',1499),false); assert.equal(counter.observe('a',1500),true);
  assert.equal(counter.observe('a',5000),false); assert.equal(counter.observe('b',6000),false); assert.equal(counter.observe('b',7600),true);
  counter.observe('a',8000); assert.equal(counter.observe('a',10000),false); assert.equal(counter.observe('',11000),false);
});
test('manifest limits access to two sites and local storage', () => {
  const manifest = require('../extension/manifest.json');
  assert.deepEqual(manifest.permissions,['storage']); assert.equal(manifest.content_scripts[0].matches.length,2); assert.equal(manifest.host_permissions,undefined);
});
