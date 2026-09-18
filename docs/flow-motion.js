/* A walkthrough is one window onto a vertical strip of real product views.
   Decode before moving, keep both neighbours until the roll settles, and
   coalesce rapid requests without cancelling a partially painted frame. */
(() => {
  'use strict';
  const flow = document.querySelector('[data-flow]');
  if (!flow || flow.classList.contains('flow-ready')) return;
  const steps = [...flow.querySelectorAll('.step')];
  const clips = [...flow.querySelectorAll('[data-flow-clip]')];
  const figure = flow.querySelector('.flowshot');
  const frame = figure?.querySelector('.frame');
  if (!frame || !steps.length || steps.length !== clips.length) return;

  const names = ['Home · Files / Recognition sequence',
    'annotated_operon.gb · Features · Full + computed',
    'pDEMO-T7 · Fold · 51 nt · −10.6 kcal/mol'];
  const name = flow.querySelector('[data-flow-name]');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => window.gsMotion ? window.gsMotion.matches :
    preference.matches && !document.documentElement.classList.contains('motion-on');
  const refreshMedia = () => dispatchEvent(new Event('gs-section-media'));
  const viewport = document.createElement('div');
  viewport.className = 'flow-viewport';
  frame.insertBefore(viewport, clips[0]);
  clips.forEach(clip => viewport.append(clip));

  let at = Math.max(0, clips.findIndex(clip => clip.classList.contains('on')));
  let wanted = at, visible = false, stopped = false, driven = false;
  let timer = 0, scrollFrame = 0, request = 0, preparing = false;
  let running = null, width = 0;
  const cache = new Map();
  const decoded = source => {
    if (!source) return Promise.resolve(false);
    if (!cache.has(source)) cache.set(source, (async () => {
      const image = new Image();
      image.src = source;
      let timeout;
      const ready = await Promise.race([
        image.decode().then(() => image.naturalWidth > 0).catch(() => false),
        new Promise(done => { timeout = setTimeout(() => done(false), 6000); })
      ]);
      clearTimeout(timeout);
      if (!ready) cache.delete(source);
      return ready;
    })());
    return cache.get(source);
  };
  async function prepare(clip) {
    if (typeof window.gsPrepareSectionMedia === 'function')
      return window.gsPrepareSectionMedia(clip);
    const media = [...clip.querySelectorAll('img,video')]
      .filter(node => getComputedStyle(node).display !== 'none');
    return (await Promise.all(media.map(async node => {
      if (node.tagName === 'VIDEO') {
        const poster = node.getAttribute('poster') || node.dataset.poster;
        if (node.readyState >= 2) return true;
        if (!await decoded(poster)) return false;
        node.poster = poster;
        return true;
      }
      node.dataset.still ||= node.getAttribute('src');
      const source = !still() && node.dataset.anim ? node.dataset.anim : node.dataset.still;
      if (!await decoded(source)) return false;
      node.src = source;
      try { await node.decode(); return node.naturalWidth > 0; } catch { return false; }
    }))).every(Boolean);
  }
  const heightOf = clip => Math.max(1, clip.getBoundingClientRect().height);
  function paintSelection(index) {
    steps.forEach((step, i) => {
      step.classList.toggle('on', i === index);
      step.classList.toggle('done', i < index);
      step.querySelector('.stepbtn')?.setAttribute('aria-current', i === index ? 'step' : 'false');
    });
    clips.forEach((clip, i) => {
      clip.classList.toggle('on', i === index);
      clip.setAttribute('aria-hidden', String(i !== index));
      clip.inert = i !== index;
    });
    if (name) name.textContent = names[index] || names[0];
    flow.dataset.flowIndex = String(index);
  }
  function rest() {
    clips.forEach((clip, i) => {
      clip.classList.remove('flow-entering', 'flow-leaving');
      delete clip.dataset.mediaHold;
      clip.dataset.motionInactive = String(i !== at);
      clip.style.removeProperty('transform');
      if (i !== at) clip.querySelectorAll('video').forEach(video => video.pause());
    });
    viewport.style.height = `${heightOf(clips[at])}px`;
    flow.dataset.flowTransition = 'false';
    refreshMedia();
  }
  function queue() {
    clearTimeout(timer);
    if (stopped || driven || !visible || still() || document.hidden || running || preparing) return;
    timer = setTimeout(() => select((at + 1) % clips.length, 'auto'), 5200);
  }
  function complete(run) {
    if (running !== run) return;
    running = null;
    run.animations.forEach(animation => animation.cancel());
    rest();
    if (wanted !== at) void pump(); else queue();
  }
  function roll(index, direction) {
    const outgoing = clips[at], incoming = clips[index];
    const fromHeight = viewport.getBoundingClientRect().height;
    const toHeight = heightOf(incoming);
    outgoing.classList.add('flow-leaving');
    incoming.classList.add('flow-entering');
    outgoing.dataset.mediaHold = 'true';
    incoming.dataset.motionInactive = 'false';
    outgoing.dataset.motionInactive = 'true';
    at = index;
    paintSelection(index);
    flow.dataset.flowDirection = direction > 0 ? 'forward' : 'backward';
    if (still() || !viewport.animate) { rest(); queue(); return; }
    flow.dataset.flowTransition = 'true';
    // Adjacent edges share the same travel. Using each clip's own height
    // opens a gap when the folded-structure view is taller than the table.
    const distance = direction > 0 ? fromHeight : toHeight;
    const options = {duration:720, easing:'cubic-bezier(.22,.7,.2,1)', fill:'both'};
    const run = {animations:[
      outgoing.animate([{transform:'translateY(0)'},
        {transform:`translateY(${-direction * distance}px)`}], options),
      incoming.animate([{transform:`translateY(${direction * (distance - 1)}px)`},
        {transform:'translateY(0)'}], options),
      viewport.animate([{height:`${fromHeight}px`}, {height:`${toHeight}px`}], options)
    ]};
    running = run;
    refreshMedia();
    Promise.all(run.animations.map(animation => animation.finished))
      .then(() => complete(run)).catch(() => {});
  }
  async function pump() {
    if (running || document.hidden || !visible) return;
    const index = wanted, token = ++request;
    if (index === at) {
      preparing = false;
      flow.removeAttribute('aria-busy');
      delete flow.dataset.flowPending;
      rest(); queue(); return;
    }
    preparing = true;
    flow.setAttribute('aria-busy', 'true');
    flow.dataset.flowPending = String(index);
    clips[at].dataset.mediaHold = 'true';
    const ready = await prepare(clips[index]).catch(() => false);
    if (token !== request) return;
    preparing = false;
    flow.removeAttribute('aria-busy');
    delete flow.dataset.flowPending;
    if (!ready) {
      wanted = at;
      flow.dataset.flowError = 'media';
      rest(); queue(); return;
    }
    delete flow.dataset.flowError;
    if (document.hidden || !visible) return;
    const direction = flow.dataset.flowRequestSource === 'auto' ? 1 : Math.sign(index - at);
    roll(index, direction || 1);
  }
  function select(index, source) {
    if (index < 0 || index >= clips.length) return;
    clearTimeout(timer);
    wanted = index;
    flow.dataset.flowRequestSource = source;
    if (source === 'user') { stopped = true; flow.dataset.flowStopped = 'true'; }
    if (source === 'scroll') driven = true;
    if (!running) void pump();
  }

  steps.forEach((step, index) => {
    const heading = step.querySelector('b');
    let button = heading?.querySelector('.stepbtn');
    if (heading && !button) {
      button = document.createElement('button');
      button.type = 'button'; button.className = 'stepbtn';
      button.append(...heading.childNodes); heading.append(button);
    }
    clips[index].id ||= `flow-view-${index + 1}`;
    button?.setAttribute('aria-controls', clips[index].id);
    step.addEventListener('click', () => select(index, 'user'));
  });
  flow.classList.add('flow-ready');
  paintSelection(at); rest();
  width = viewport.clientWidth;

  const resize = () => {
    const next = viewport.clientWidth;
    if (Math.abs(next - width) < .5) return;
    width = next;
    if (running) complete(running);
    else viewport.style.height = `${heightOf(clips[at])}px`;
  };
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(viewport);
  else addEventListener('resize', resize, {passive:true});
  clips.forEach(clip => clip.querySelectorAll('img,video').forEach(media =>
    media.addEventListener(media.tagName === 'IMG' ? 'load' : 'loadedmetadata', () => {
      if (!running) viewport.style.height = `${heightOf(clips[at])}px`;
    })));
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    if (running) running.animations.forEach(animation =>
      !visible || document.hidden ? animation.pause() : animation.play());
    if (visible && !running && wanted !== at) void pump();
    queue();
    if (visible) clips.forEach(clip => { void prepare(clip).catch(() => {}); });
  }, {threshold:0}).observe(figure);
  else { visible = true; queue(); }

  const syncMotion = () => {
    if (still() && running) complete(running);
    if (running) running.animations.forEach(animation =>
      document.hidden || !visible ? animation.pause() : animation.play());
    if (!document.hidden && !running && wanted !== at) void pump();
    queue();
  };
  preference.addEventListener?.('change', syncMotion);
  addEventListener('gs-motion', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      if (stopped || still() || document.hidden) return;
      const bounds = flow.getBoundingClientRect();
      if (bounds.bottom < innerHeight * .25 || bounds.top > innerHeight * .75) return;
      const shot = figure.getBoundingClientRect();
      const stacked = matchMedia('(max-width:900px) and (min-height:600px)').matches;
      const middle = stacked ? Math.min(innerHeight * .86,
        shot.bottom + (innerHeight - shot.bottom) / 2) : innerHeight / 2;
      let best = 0, nearest = Infinity;
      steps.forEach((step, index) => {
        const rect = step.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - middle);
        if (distance < nearest) { nearest = distance; best = index; }
      });
      if (best !== wanted) select(best, 'scroll');
    });
  }, {passive:true});
})();
