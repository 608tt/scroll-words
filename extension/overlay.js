(function (root) {
  'use strict';
  function showWords({ words, dwell = 5, onClose = () => {} }) {
    const before = document.activeElement;
    const host = document.createElement('div'); host.setAttribute('data-scroll-words', '');
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `:host{all:initial}dialog{box-sizing:border-box;border:1px solid #d8e1d5;border-radius:24px;padding:32px;width:min(520px,calc(100vw - 32px));max-height:90vh;overflow:auto;color:#21382a;background:#fafbf7;box-shadow:0 24px 100px #132b2340;font:16px/1.6 system-ui,sans-serif}dialog::backdrop{background:#142d26ba;backdrop-filter:blur(8px)}h2{font-size:27px;line-height:1.2;margin:8px 0}p{margin:8px 0;color:#5c7063}.eyebrow{font-size:11px;letter-spacing:2px;font-weight:700}.words{display:grid;gap:12px;margin:24px 0}.word{padding:14px 18px;border:1px solid #dde4d8;border-radius:13px;background:white;overflow-wrap:anywhere}.word strong{display:block;font-size:26px;font-weight:650;color:#2a563e}.word span{display:block;color:#536558}button{font:inherit;cursor:pointer;border:1px solid #c9d6c6;border-radius:10px;background:white;color:#30533c;padding:10px 14px}button:focus-visible{outline:3px solid #b87835;outline-offset:3px}button.primary{background:#30593f;color:white;flex:1}button:disabled{opacity:.55;cursor:wait}.actions{display:flex;gap:10px;flex-wrap:wrap}.hint{font-size:12px;margin-top:16px}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}`;
    const dialog = document.createElement('dialog'); dialog.setAttribute('aria-labelledby', 'sw-title');
    const eyebrow = document.createElement('div'); eyebrow.className = 'eyebrow'; eyebrow.textContent = 'SCROLL WORDS / 刷着记';
    const title = document.createElement('h2'); title.id = 'sw-title'; title.textContent = '先遇见几个单词。';
    const sub = document.createElement('p'); sub.textContent = '不用考试。读一眼，再继续你的内容。';
    const list = document.createElement('div'); list.className = 'words';
    for (const entry of words) {
      const item = document.createElement('div'); item.className = 'word';
      const word = document.createElement('strong'); word.lang = 'en'; word.textContent = entry.word;
      const meaning = document.createElement('span'); meaning.textContent = entry.meaning;
      item.append(word, meaning); list.append(item);
    }
    const actions = document.createElement('div'); actions.className = 'actions';
    const next = document.createElement('button'); next.className = 'primary'; next.disabled = dwell > 0;
    const snooze = document.createElement('button'); snooze.textContent = '休息 10 分钟';
    const hint = document.createElement('p'); hint.className = 'hint'; hint.textContent = 'Esc 可立即退出并暂停提醒 10 分钟。只记录展示次数，不代表已经记住。';
    actions.append(next, snooze); dialog.append(eyebrow, title, sub, list, actions, hint); shadow.append(style, dialog);
    document.documentElement.append(host);
    let remaining = dwell * 1000, last = performance.now(), closed = false;
    const update = () => { next.textContent = remaining > 0 ? `看一眼 · ${Math.ceil(remaining / 1000)} 秒` : '继续浏览'; next.disabled = remaining > 0; };
    update();
    const interval = setInterval(() => {
      const now = performance.now();
      if (!document.hidden && document.hasFocus()) remaining = Math.max(0, remaining - Math.min(now - last, 1000));
      last = now; update();
    }, 200);
    const close = reason => { if (closed) return; closed = true; clearInterval(interval); dialog.close(); host.remove(); before?.focus?.({ preventScroll: true }); onClose(reason); };
    next.addEventListener('click', () => { if (!next.disabled) close('continue'); });
    snooze.addEventListener('click', () => close('snooze'));
    dialog.addEventListener('cancel', event => { event.preventDefault(); close('snooze'); });
    dialog.showModal(); snooze.focus();
    return () => close('disabled');
  }
  root.ScrollWordsOverlay = { showWords };
})(globalThis);
