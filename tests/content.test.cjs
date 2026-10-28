const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const C = require('../extension/core.js');
function harness(config = {}) {
  let clock = 0, interval, changed, modal, requests = 0;
  const video = {currentSrc:'https://example.test/1.mp4',paused:false,isConnected:true,getBoundingClientRect:() => ({top:0,left:0,right:400,bottom:400,width:400,height:400}),pause(){this.paused=true;},play(){this.paused=false;return Promise.resolve();}};
  const document = {hidden:false,hasFocus:()=>true,addEventListener:()=>{},querySelectorAll:selector=>selector==='video'?[video]:[]};
  const context = {ScrollWords:C,URL,location:{href:'https://www.douyin.com/',hostname:'www.douyin.com'},document,innerWidth:1000,innerHeight:800,performance:{now:()=>clock},Date:{now:()=>clock},setInterval:fn=>{interval=fn;},ScrollWordsOverlay:{showWords:opts=>{modal=opts;return ()=>opts.onClose('disabled');}},chrome:{storage:{local:{get:async()=>({settings:config})},onChanged:{addListener:fn=>changed=fn}},runtime:{sendMessage:async()=>{requests++;return {words:C.STARTER.slice(0,2)};}}}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../extension/content.js'),'utf8'),context);
  return {video,document,get requests(){return requests;},get modal(){return modal;},change:settings=>changed({settings:{newValue:settings}},'local'),async tick(ms=500){clock+=ms;interval();await Promise.resolve();await Promise.resolve();}};
}
test('production content script counts a stable video, pauses it and resumes only on continue',async()=>{
  const h=harness({every:1,mode:'views'}); await Promise.resolve(); for(let i=0;i<4;i++)await h.tick(); assert.equal(h.requests,1); assert.equal(h.video.paused,true); assert.equal(h.modal.words.length,2); h.modal.onClose('continue'); assert.equal(h.video.paused,false);
});
test('hidden tabs do not trigger time fallback; foreground time does',async()=>{
  const h=harness({mode:'time',seconds:15}); await Promise.resolve(); h.document.hidden=true;for(let i=0;i<40;i++)await h.tick();assert.equal(h.requests,0); h.document.hidden=false;for(let i=0;i<30;i++)await h.tick();assert.equal(h.requests,1);
});
test('snooze suppresses reminders and does not resume video',async()=>{
  const h=harness({every:1,mode:'views'}); await Promise.resolve();for(let i=0;i<4;i++)await h.tick();h.modal.onClose('snooze');h.video.currentSrc='https://example.test/2.mp4';for(let i=0;i<10;i++)await h.tick();assert.equal(h.requests,1);assert.equal(h.video.paused,true);
});
test('disabling a site stops content reminders',async()=>{
  const h=harness({every:1,mode:'views'});await Promise.resolve();h.change({enabled:true,douyin:false});for(let i=0;i<10;i++)await h.tick();assert.equal(h.requests,0);
});
