import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const path = 'public/mandala-v2.html';
let source = readFileSync(path, 'utf8');

function replaceOnce(before, after, label) {
  const occurrences = source.split(before).length - 1;
  if (occurrences !== 1) {
    throw new Error(`${label}: expected exactly one match, found ${occurrences}`);
  }
  source = source.replace(before, after);
}

replaceOnce(
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">',
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
  'allow browser zoom',
);

replaceOnce(
`    <div class="tabbar" role="tablist" aria-label="Mandala controls">
      <button class="tab-btn active" data-tab="shape" role="tab">Shape</button>
      <button class="tab-btn" data-tab="motion" role="tab">Motion</button>
      <button class="tab-btn" data-tab="color" role="tab">Color</button>
      <button class="tab-btn" data-tab="effects" role="tab">Effects</button>
    </div>`,
`    <div class="tabbar" role="tablist" aria-label="Mandala controls" aria-orientation="horizontal">
      <button class="tab-btn active" id="tab-shape" data-tab="shape" role="tab" aria-selected="true" aria-controls="panel-shape" tabindex="0">Shape</button>
      <button class="tab-btn" id="tab-motion" data-tab="motion" role="tab" aria-selected="false" aria-controls="panel-motion" tabindex="-1">Motion</button>
      <button class="tab-btn" id="tab-color" data-tab="color" role="tab" aria-selected="false" aria-controls="panel-color" tabindex="-1">Color</button>
      <button class="tab-btn" id="tab-effects" data-tab="effects" role="tab" aria-selected="false" aria-controls="panel-effects" tabindex="-1">Effects</button>
    </div>`,
  'complete tab semantics',
);

replaceOnce(
  '    <div class="control-panel active" data-panel="shape">',
  '    <div class="control-panel active" id="panel-shape" data-panel="shape" role="tabpanel" aria-labelledby="tab-shape">',
  'shape tabpanel semantics',
);
replaceOnce(
  '    <div class="control-panel" data-panel="motion">',
  '    <div class="control-panel" id="panel-motion" data-panel="motion" role="tabpanel" aria-labelledby="tab-motion" hidden>',
  'motion tabpanel semantics',
);
replaceOnce(
  '    <div class="control-panel" data-panel="color">',
  '    <div class="control-panel" id="panel-color" data-panel="color" role="tabpanel" aria-labelledby="tab-color" hidden>',
  'color tabpanel semantics',
);
replaceOnce(
  '    <div class="control-panel" data-panel="effects">',
  '    <div class="control-panel" id="panel-effects" data-panel="effects" role="tabpanel" aria-labelledby="tab-effects" hidden>',
  'effects tabpanel semantics',
);

replaceOnce(
  '<button class="toggle on tactile" data-toggle="mirror" aria-label="Toggle mirror"></button>',
  '<button class="toggle on tactile" data-toggle="mirror" role="switch" aria-checked="true" aria-label="Toggle mirror"></button>',
  'mirror switch semantics',
);
replaceOnce(
  '<button class="toggle tactile" data-toggle="golden" aria-label="Toggle golden spacing"></button>',
  '<button class="toggle tactile" data-toggle="golden" role="switch" aria-checked="false" aria-label="Toggle golden spacing"></button>',
  'golden switch semantics',
);
replaceOnce(
  '<button class="toggle tactile" data-toggle="animate" aria-label="Toggle animation"></button>',
  '<button class="toggle tactile" data-toggle="animate" role="switch" aria-checked="false" aria-label="Toggle animation"></button>',
  'animation switch semantics',
);
replaceOnce(
  '<button class="toggle tactile" data-toggle="trails" aria-label="Toggle trails"></button>',
  '<button class="toggle tactile" data-toggle="trails" role="switch" aria-checked="false" aria-label="Toggle trails"></button>',
  'trails switch semantics',
);

replaceOnce(
  '  let W=1,H=1,dpr=1,t=0,raf=0,last=performance.now(),fps=60,points=0;',
  '  let W=1,H=1,dpr=1,t=0,raf=0,drawRaf=0,last=performance.now(),fps=60,points=0;',
  'track scheduled redraw frame',
);

replaceOnce(
`  function setAnimate(on){
    P.animate=on;$$('[data-toggle="animate"]').forEach(b=>b.classList.toggle('on',on));
    $('#playButton').textContent=on?'Ⅱ':'▶';$('#playButton').setAttribute('aria-label',on?'Pause animation':'Start animation');
    if(on&&!raf){last=performance.now();raf=requestAnimationFrame(loop)}
    if(!on&&raf){cancelAnimationFrame(raf);raf=0;draw()}
  }
  function schedule(){ if(!P.animate) draw(); }`,
`  function setAnimate(on){
    P.animate=on;
    $$('[data-toggle="animate"]').forEach(b=>{
      b.classList.toggle('on',on);
      b.setAttribute('aria-checked',String(on));
    });
    $('#playButton').textContent=on?'Ⅱ':'▶';$('#playButton').setAttribute('aria-label',on?'Pause animation':'Start animation');
    if(on&&drawRaf){cancelAnimationFrame(drawRaf);drawRaf=0}
    if(on&&!raf){last=performance.now();raf=requestAnimationFrame(loop)}
    if(!on&&raf){cancelAnimationFrame(raf);raf=0;draw()}
  }
  function schedule(){
    if(P.animate||drawRaf) return;
    drawRaf=requestAnimationFrame(()=>{drawRaf=0;draw()});
  }`,
  'batch idle redraws',
);

replaceOnce(
  `    $$('[data-toggle]').forEach(el=>el.classList.toggle('on',!!P[el.dataset.toggle]));`,
  `    $$('[data-toggle]').forEach(el=>{
      const on=!!P[el.dataset.toggle];
      el.classList.toggle('on',on);
      el.setAttribute('aria-checked',String(on));
    });`,
  'sync switch state',
);

replaceOnce(
`  $$('[data-toggle]').forEach(btn=>btn.addEventListener('click',()=>{
    const key=btn.dataset.toggle;P[key]=!P[key];btn.classList.toggle('on',P[key]);
    if(key==='animate')setAnimate(P[key]);else schedule();vibrate(14);award(4);
  }));`,
`  $$('[data-toggle]').forEach(btn=>btn.addEventListener('click',()=>{
    const key=btn.dataset.toggle;P[key]=!P[key];btn.classList.toggle('on',P[key]);btn.setAttribute('aria-checked',String(P[key]));
    if(key==='animate')setAnimate(P[key]);else schedule();vibrate(14);award(4);
  }));`,
  'update switch state on activation',
);

replaceOnce(
`  $$('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>{
    $$('[data-tab]').forEach(x=>x.classList.toggle('active',x===btn));$$('[data-panel]').forEach(x=>x.classList.toggle('active',x.dataset.panel===btn.dataset.tab));vibrate(7);
  }));`,
`  const tabs=$$('[data-tab]');
  function activateTab(tab,{focus=false}={}){
    tabs.forEach(item=>{
      const selected=item===tab;
      item.classList.toggle('active',selected);
      item.setAttribute('aria-selected',String(selected));
      item.tabIndex=selected?0:-1;
      const panel=document.getElementById(item.getAttribute('aria-controls'));
      if(panel){panel.classList.toggle('active',selected);panel.hidden=!selected}
    });
    if(focus)tab.focus();
  }
  tabs.forEach((btn,index)=>{
    btn.addEventListener('click',()=>{activateTab(btn);vibrate(7)});
    btn.addEventListener('keydown',event=>{
      let next=index;
      if(event.key==='ArrowRight')next=(index+1)%tabs.length;
      else if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=tabs.length-1;
      else return;
      event.preventDefault();
      activateTab(tabs[next],{focus:true});
    });
  });`,
  'add tab state and keyboard focus management',
);

const required = [
  ['user-scalable=no', false],
  ['role="switch"', 4],
  ['role="tab" aria-selected=', 4],
  ['role="tabpanel"', 4],
  ['drawRaf=requestAnimationFrame', true],
  ["event.key==='ArrowRight'", true],
];
for (const [needle, expected] of required) {
  const count = source.split(needle).length - 1;
  if (expected === false && count !== 0) throw new Error(`Unexpected ${needle}`);
  if (expected === true && count < 1) throw new Error(`Missing ${needle}`);
  if (typeof expected === 'number' && count !== expected) throw new Error(`${needle}: expected ${expected}, found ${count}`);
}

const scriptMatch = source.match(/<script>\s*([\s\S]*?)\s*<\/script>/);
if (!scriptMatch) throw new Error('Unable to extract inline script for syntax validation');
const tempDir = mkdtempSync(join(tmpdir(), 'mandala-v2-check-'));
const tempScript = join(tempDir, 'inline.js');
writeFileSync(tempScript, scriptMatch[1]);
const syntax = spawnSync(process.execPath, ['--check', tempScript], { encoding: 'utf8' });
rmSync(tempDir, { recursive: true, force: true });
if (syntax.status !== 0) throw new Error(syntax.stderr || syntax.stdout || 'Inline JavaScript syntax check failed');

writeFileSync(path, source);
console.log('Applied and validated all four PR #4 review fixes.');
