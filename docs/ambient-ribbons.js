/* Fixed SVG geometry, CSS-only movement. Lifecycle updates are event-driven;
   there is no canvas, video, animation-frame loop or changing path geometry. */
(() => {
  'use strict';
  const hosts = [...document.querySelectorAll('[data-ambient-ribbons]')];
  if(!hosts.length) return;
  const reel = document.querySelector('[data-hero-reel]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const NS = 'http://www.w3.org/2000/svg';
  const create = (name, attributes = {}) => {
    const node = document.createElementNS(NS, name);
    for(const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
    return node;
  };
  const visibleNow = host => {
    const box = host.getBoundingClientRect();
    return box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth;
  };
  const records = [];
  for(const [number, host] of hosts.entries()){
    const mode = host.dataset.ambientRibbons;
    if(!['hero', 'reel'].includes(mode)) continue;
    const id = `gs-wire-${mode}-${number}`;
    const svg = create('svg', {viewBox:'0 0 1440 840', preserveAspectRatio:'none', 'aria-hidden':'true', focusable:'false'});
    const defs = create('defs');
    const gradient = create('linearGradient', {id:`${id}-color`,x1:'0%',y1:'100%',x2:'100%',y2:'0%'});
    for(const [offset, color, opacity] of [
      [0,'ribbon-blue',0], [15,'ribbon-blue',.68], [44,'ribbon-mint',1],
      [70,'ribbon-tip',.84], [87,'ribbon-mint',.45], [100,'ribbon-blue',0]
    ]) gradient.append(create('stop',{offset:`${offset}%`,class:color,'stop-opacity':opacity}));
    defs.append(gradient);
    const clear = create('linearGradient',{id:`${id}-clear`,x1:'0%',y1:'0%',x2:'100%',y2:'0%'});
    const stops = mode === 'hero' ? [[0,1],[13,1],[31,0],[69,0],[87,1],[100,1]]
      : [[0,1],[22,1],[42,0],[58,0],[78,1],[100,1]];
    for(const [offset, opacity] of stops) clear.append(create('stop',{
      offset:`${offset}%`,'stop-color':'white','stop-opacity':opacity
    }));
    const mask = create('mask',{id:`${id}-mask`,maskUnits:'userSpaceOnUse',x:0,y:0,width:1440,height:840});
    mask.append(create('rect',{x:0,y:0,width:1440,height:840,fill:`url(#${id}-clear)`}));
    defs.append(clear,mask); svg.append(defs);
    const composition = create('g',{mask:`url(#${id}-mask)`});
    const count = mode === 'hero' ? 18 : 16;
    for(let side = 0; side < 2; side++){
      const drift = create('g',{class:`ribbon-drift ribbon-drift-${side ? 'b' : 'a'}`});
      const lines = create('g',{class:'ribbon-lines',stroke:`url(#${id}-color)`});
      for(let at = 0; at < count; at++){
        const t = at / (count - 1) - .5;
        const d = side === 0
          ? `M -160 ${735+t*230} C 76 ${602+t*186}, 170 ${640-t*62}, 354 ${447+t*122} S 502 ${300+t*142}, 615 ${219+t*130}`
          : `M 838 ${586+t*130} C 1000 ${336+t*128}, 1112 ${310-t*64}, 1288 ${144+t*142} S 1480 ${28+t*145}, 1615 ${-92+t*162}`;
        lines.append(create('path',{class:'ribbon-wire',d,opacity:(.62+.38*Math.sin(at/(count-1)*Math.PI)).toFixed(3)}));
        if(mode === 'hero' && at === (side ? 13 : 4)){
          drift.append(create('path',{class:`ribbon-glint${side ? ' ribbon-glint-b' : ''}`,d,pathLength:100}));
        }
      }
      drift.prepend(lines); composition.append(drift);
    }
    svg.append(composition); host.replaceChildren(svg);
    host.setAttribute('aria-hidden','true'); host.dataset.ambientReady = 'true';
    records.push({host,visible:visibleNow(host)});
  }
  function reconcile(){
    const paused = reel?.dataset.userPaused === 'true' || reel?.dataset.state === 'paused';
    const focused = ['expand','focus','slide','collapse'].includes(reel?.dataset.stage);
    for(const record of records){
      const {host} = record;
      const state = reduced.matches ? 'reduced' : document.hidden ? 'hidden'
        : !record.visible || !visibleNow(host) ? 'offscreen' : focused ? 'focus' : paused ? 'paused' : 'running';
      host.dataset.ambientQuiet = String(focused);
      host.dataset.ambientState = state;
      host.dataset.ambientRunning = String(state === 'running');
    }
  }
  if(records.some(({host}) => host.dataset.ambientRibbons === 'hero') &&
      records.some(({host}) => host.dataset.ambientRibbons === 'reel')){
    document.querySelector('.hero')?.setAttribute('data-ambient-ready','true');
  }
  if('IntersectionObserver' in window){
    const observer = new IntersectionObserver(entries => {
      for(const entry of entries){
        const record = records.find(item => item.host === entry.target);
        if(record) record.visible = entry.isIntersecting;
      }
      reconcile();
    },{threshold:0});
    records.forEach(({host}) => observer.observe(host));
  } else {
    records.forEach(record => { record.visible = false; });
  }
  if(reel) new MutationObserver(reconcile).observe(reel,{
    attributes:true,attributeFilter:['data-state','data-stage','data-user-paused']
  });
  reduced.addEventListener?.('change',reconcile);
  document.addEventListener('visibilitychange',reconcile);
  addEventListener('pageshow',reconcile);
  addEventListener('resize',reconcile,{passive:true});
  reconcile();
})();
