/* Quiet SVG ribbons around the title; a constellation double helix behind the
   cylinder. Both share the tour's visibility, focus and motion lifecycle. */
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
  function createDNA(host) {
    const canvas = document.createElement('canvas');
    canvas.className = 'dna-starfield';
    canvas.setAttribute('aria-hidden', 'true');
    const ctx = canvas.getContext('2d');
    if(!ctx) return null;
    host.replaceChildren(canvas);
    host.dataset.ambientEffect = 'dna-stars';
    let width = 0, height = 0, scale = 1, time = 0, last = 0, frame = 0, running = false;
    let particles = [], field = [], palette = [], light = false;
    const TAU = Math.PI * 2;
    // Seed once: resizing preserves the composition rather than making it pop.
    let seed = 42137;
    const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    const smooth = (a, b, value) => {
      const x = Math.max(0, Math.min(1, (value - a) / (b - a)));
      return x * x * (3 - 2 * x);
    };
    function material() {
      const style = getComputedStyle(host);
      light = document.documentElement.dataset.theme === 'light';
      palette = ['--dna-cyan', '--dna-mint', '--dna-white'].map(name => style.getPropertyValue(name).trim());
    }
    function populate() {
      seed = 42137;
      particles = []; field = [];
      const phone = width < 600, rows = phone ? 110 : 184, lanes = phone ? 5 : 7;
      for(let strand = 0; strand < 2; strand++) {
        for(let row = 0; row < rows; row++) {
          for(let lane = 0; lane < lanes; lane++) {
            particles.push({
              u:(row + random() * .8) / (rows - 1), strand,
              cross:-1, offset:(random() - .5) * 2, spread:(random() - .5) * 2,
              size:.35 + random() * .85, phase:random() * TAU,
              driftX:(random() - .5) * .24, driftY:(random() - .5) * .54,
              shimmer:random(), color:lane === 0 ? 2 : strand,
              x:0, y:0, radius:0, alpha:0, depth:0
            });
          }
        }
      }
      // Pairs of bases remain separate constellations between the two rails.
      const rungs = phone ? 25 : 33, beads = phone ? 12 : 22;
      for(let row = 0; row < rungs; row++) {
        for(let bead = 0; bead < beads; bead++) {
          particles.push({u:(row + .5) / rungs, strand:0, cross:bead / (beads - 1),
            offset:(random() - .5) * 1.8, spread:(random() - .5),
            size:.3 + random() * .62, phase:random() * TAU,
            driftX:(random() - .5) * .2, driftY:(random() - .5) * .4,
            shimmer:random(), color:bead < beads / 2 ? 0 : 1,
            x:0, y:0, radius:0, alpha:0, depth:0});
        }
      }
      for(let i = 0; i < (phone ? 75 : 150); i++) {
        field.push({x:random(), y:random(), radius:.35 + random() * .8,
          phase:random() * TAU, speed:.3 + random() * .7});
      }
    }
    function project(u, angle, across = 1) {
      const depth = Math.cos(angle) * across;
      return {
        x:width * (-.09 + 1.18 * u) + depth * width * .022,
        y:height * (.88 - .76 * u + .035 * Math.sin(u * Math.PI)) + Math.sin(angle) * across * height * .19,
        depth
      };
    }
    function draw() {
      if(!width || !height) return;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
      const cycle = time % 28;
      // A slow travelling release of stars; most of the double helix always
      // remains readable. Reduced motion gets the fully assembled specimen.
      const release = reduced.matches ? 0 : smooth(15, 19, cycle) * (1 - smooth(22, 27.5, cycle));
      const spin = time * .19 + .35;
      ctx.fillStyle = palette[0];
      for(const star of field) {
        const x = ((star.x + Math.sin(time * .04 + star.phase) * .008 + 1) % 1) * width;
        const y = ((star.y - (time * .0014 * star.speed % 1) + 1) % 1) * height;
        ctx.globalAlpha = (light ? .22 : .32) * (.58 + .42 * Math.sin(time * .5 + star.phase) ** 2);
        ctx.beginPath(); ctx.arc(x, y, star.radius, 0, TAU); ctx.fill();
      }
      for(const p of particles) {
        const angle = p.u * TAU * 2.15 + spin + p.strand * Math.PI;
        const across = p.cross < 0 ? 1 : 1 - 2 * p.cross;
        const point = project(p.u, angle, across);
        const drift = release * (.3 + .7 * Math.sin(p.u * Math.PI) ** 2);
        const thickness = height * (p.cross < 0 ? .014 : .006);
        p.x = point.x + p.offset * thickness + p.driftX * width * drift;
        p.y = point.y + p.spread * thickness + p.driftY * height * drift
          + Math.sin(time * .6 + p.phase) * (1 + drift * 6);
        p.depth = point.depth;
        p.radius = p.size * (.82 + .28 * (point.depth + 1)) * (width < 600 ? .85 : 1);
        const endFade = smooth(0, .1, p.u) * (1 - smooth(.9, 1, p.u));
        const twinkle = .76 + .24 * Math.sin(time * .85 + p.phase) ** 2;
        p.alpha = endFade * twinkle * (.43 + .25 * (point.depth + 1)) * (1 - drift * .45)
          * (p.cross < 0 ? 1 : .54) * (light ? .82 : 1);
      }
      // Paint back-to-front in a few buckets, avoiding thousands of glow
      // filters or DOM nodes while keeping each star a sharp point of light.
      for(let layer = 0; layer < 5; layer++) {
        for(let color = 0; color < palette.length; color++) {
          ctx.fillStyle = palette[color];
          for(const p of particles) {
            if(p.color !== color || Math.min(4, Math.floor((p.depth + 1) * 2.5)) !== layer) continue;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, TAU); ctx.fill();
            if(p.shimmer > .982 && p.cross < 0 && p.depth > 0) {
              ctx.globalAlpha = p.alpha * .09;
              ctx.beginPath(); ctx.arc(p.x, p.y, p.radius * 4.5, 0, TAU); ctx.fill();
              ctx.globalAlpha = p.alpha * .34;
              ctx.fillRect(p.x - p.radius * 3.1, p.y - .3, p.radius * 6.2, .6);
              ctx.fillRect(p.x - .3, p.y - p.radius * 3.1, .6, p.radius * 6.2);
            }
          }
        }
      }
      ctx.globalAlpha = 1;
    }
    function tick(now) {
      frame = 0;
      if(!running) return;
      if(!last) last = now;
      const elapsed = now - last;
      if(elapsed >= 1000 / 30) {
        time += Math.min(elapsed, 80) / 1000;
        last = now; draw();
      }
      frame = requestAnimationFrame(tick);
    }
    function setRunning(value) {
      if(running === value) return;
      running = value;
      last = 0;
      if(frame) cancelAnimationFrame(frame);
      frame = running ? requestAnimationFrame(tick) : 0;
    }
    function resize() {
      const box = host.getBoundingClientRect();
      const nextScale = Math.min(devicePixelRatio || 1, 1.5);
      if(width === box.width && height === box.height && scale === nextScale) return;
      width = box.width; height = box.height; scale = nextScale;
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      populate(); material(); draw();
    }
    resize();
    if('ResizeObserver' in window) new ResizeObserver(resize).observe(host);
    else addEventListener('resize', resize, {passive:true});
    new MutationObserver(() => { material(); draw(); }).observe(document.documentElement, {
      attributes:true, attributeFilter:['data-theme']
    });
    reduced.addEventListener?.('change', draw);
    return {setRunning};
  }
  const records = [];
  for(const [number, host] of hosts.entries()){
    const mode = host.dataset.ambientRibbons;
    if(!['hero', 'reel'].includes(mode)) continue;
    if(mode === 'reel') {
      const dna = createDNA(host);
      if(dna) {
        host.setAttribute('aria-hidden', 'true'); host.dataset.ambientReady = 'true';
        records.push({host, visible:visibleNow(host), dna});
        continue;
      }
    }
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
      record.dna?.setRunning(state === 'running');
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
