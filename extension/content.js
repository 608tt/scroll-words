(function () {
  'use strict';
  let config = ScrollWords.settings(), views = 0, activeMs = 0, last = performance.now(), snoozeUntil = 0, busy = false, dismiss;
  const counter = new ScrollWords.ViewCounter();
  const videoIds = new WeakMap(); let seq = 0;
  function visibleArea(el) {
    const r = el.getBoundingClientRect();
    const visible = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(0, r.top)) * Math.max(0, Math.min(r.right, innerWidth) - Math.max(0, r.left));
    return r.width > 80 && r.height > 80 && visible >= r.width * r.height * .5 ? visible : 0;
  }
  function currentItem() {
    const url = new URL(location.href);
    const note = url.pathname.match(/\/(explore|discovery\/item)\/([a-zA-Z0-9]+)/);
    if (note) return 'note:' + note[2];
    const video = [...document.querySelectorAll('video')].filter(v => visibleArea(v)).sort((a, b) => Number(a.paused) - Number(b.paused) || visibleArea(b) - visibleArea(a))[0];
    if (video) {
      const id = url.searchParams.get('modal_id') || url.pathname.match(/\/video\/(\d+)/)?.[1];
      if (id) return 'video:' + id;
      if (video.currentSrc || video.src) return 'src:' + (video.currentSrc || video.src);
      if (!videoIds.has(video)) videoIds.set(video, ++seq);
      return 'element:' + videoIds.get(video);
    }
    if (location.hostname === 'www.xiaohongshu.com') {
      const cards = [...document.querySelectorAll('a[href*="/explore/"],a[href*="/discovery/item/"]')].slice(0, 250).filter(visibleArea);
      cards.sort((a, b) => Math.abs(a.getBoundingClientRect().top + a.offsetHeight / 2 - innerHeight / 2) - Math.abs(b.getBoundingClientRect().top + b.offsetHeight / 2 - innerHeight / 2));
      const key = cards[0]?.pathname.match(/\/(?:explore|discovery\/item)\/([a-zA-Z0-9]+)/)?.[1];
      if (key) return 'note:' + key;
    }
    return '';
  }
  function enabled() {
    return config.enabled && (location.hostname === 'www.douyin.com' ? config.douyin : config.xiaohongshu);
  }
  document.addEventListener('play', event => { if (busy && event.target instanceof HTMLVideoElement) event.target.pause(); }, true);
  async function trigger() {
    busy = true;
    try {
      const result = await chrome.runtime.sendMessage({ type: 'next-words' });
      if (!result?.words?.length || !enabled() || document.hidden) { busy = false; return; }
      const playing = [...document.querySelectorAll('video')].filter(v => !v.paused && visibleArea(v));
      playing.forEach(v => v.pause());
      views = 0; activeMs = 0;
      dismiss = ScrollWordsOverlay.showWords({ words: result.words, dwell: config.dwell, onClose(reason) {
        busy = false; dismiss = undefined; last = performance.now();
        if (reason === 'snooze') snoozeUntil = Date.now() + 600000;
        if (reason === 'continue') playing.filter(v => v.isConnected && visibleArea(v)).forEach(v => v.play().catch(() => {}));
      } });
    } catch { busy = false; config.enabled = false; }
  }
  chrome.storage.local.get(['settings']).then(data => { config = ScrollWords.settings(data.settings); });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.settings) {
      config = ScrollWords.settings(changes.settings.newValue); views = 0; activeMs = 0;
      if (!enabled()) dismiss?.();
    }
  });
  setInterval(() => {
    const now = performance.now(), elapsed = Math.min(1000, now - last); last = now;
    if (!enabled() || document.hidden || !document.hasFocus() || busy || Date.now() < snoozeUntil) return;
    activeMs += elapsed;
    if (counter.observe(currentItem(), now)) views++;
    if (ScrollWords.due(config, views, activeMs)) trigger();
  }, 500);
})();
