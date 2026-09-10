/* A cylinder introduces the product; these windows show what it does.
   Each transition has an end. No screen or caption rocks while it is read. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const decks = [];
  const windows = [];
  const refreshMedia = () => window.dispatchEvent(new Event('gs-section-media'));
  const canAnimate = () => !reduced.matches && !document.hidden;
  const inViewport = node => {
    const box = node.getBoundingClientRect();
    return box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth;
  };
  const pauseMedia = node => {
    for(const video of node.querySelectorAll('video')){
      video.dataset.clipVisible = 'false';
      video.pause();
    }
    for(const image of node.querySelectorAll('img[data-anim]')){
      if(image.dataset.still) image.src = image.dataset.still;
    }
  };
  const icon = name => {
    const lines = {
      prev:'<path d="m15 5-7 7 7 7"/>',
      next:'<path d="m9 5 7 7-7 7"/>',
      pause:'<path d="M9 5v14M15 5v14"/>',
      play:'<path d="m8 5 11 7-11 7Z"/>'
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${lines[name]}</svg>`;
  };
  const makeButton = (attribute, label, glyph) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'motion-control';
    button.setAttribute(attribute, '');
    button.setAttribute('aria-label', label);
    button.title = label;
    button.innerHTML = icon(glyph);
    return button;
  };
  const deckNames = {
    sequence:['Select bases', 'Find a motif', 'Edit a primer'],
    digest:['Run a digest', 'Enzyme DB', 'Methylation', 'Strain DB']
  };

  for(const deck of document.querySelectorAll('[data-motion-deck]')){
    const figures = [...deck.children].filter(node => node.tagName === 'FIGURE');
    if(figures.length < 2) continue;
    const section = deck.closest('section');
    const id = section?.id || `views-${decks.length}`;
    const names = figures.map((figure, i) => deckNames[id]?.[i] || `View ${i + 1}`);
    const stage = document.createElement('div');
    stage.className = 'motion-stage';
    stage.append(...figures);
    const controls = document.createElement('div');
    controls.className = 'motion-controls';
    const tabs = document.createElement('div');
    tabs.className = 'motion-tabs';
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', `${section?.querySelector('.num')?.textContent?.trim() || 'Product'} views`);
    const buttons = figures.map((figure, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'motion-tab';
      button.setAttribute('role', 'tab');
      button.dataset.motionIndex = String(i);
      button.id = `${id}-motion-tab-${i}`;
      button.textContent = names[i];
      figure.id ||= `${id}-motion-view-${i}`;
      figure.setAttribute('role', 'tabpanel');
      figure.setAttribute('aria-labelledby', button.id);
      button.setAttribute('aria-controls', figure.id);
      tabs.append(button);
      return button;
    });
    const actions = document.createElement('div');
    actions.className = 'motion-actions';
    const prev = makeButton('data-motion-prev', 'Previous view', 'prev');
    const next = makeButton('data-motion-next', 'Next view', 'next');
    const toggle = makeButton('data-motion-toggle', 'Pause automatic views', 'pause');
    const status = document.createElement('span');
    status.className = 'motion-sr';
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    actions.append(prev, next, toggle);
    controls.append(tabs, actions, status);
    deck.append(stage, controls);
    deck.classList.remove('rise', 'settle');
    deck.classList.add('motion-ready');

    let index = 0;
    let visible = inViewport(stage);
    let paused = false;
    let hovered = false;
    let focused = false;
    let timer = 0;
    let animations = [];
    let generation = 0;
    const clearTimer = () => { clearTimeout(timer); timer = 0; };
    const running = () => visible && inViewport(stage) && canAnimate() && !paused && !hovered && !focused;
    function updateControls(){
      deck.dataset.motionIndex = String(index);
      const stopped = paused || reduced.matches;
      const label = stopped ? 'Play automatic views' : 'Pause automatic views';
      toggle.setAttribute('aria-label', label);
      toggle.title = reduced.matches ? 'Automatic motion is disabled by your motion preference' : label;
      toggle.setAttribute('aria-pressed', String(stopped));
      toggle.disabled = reduced.matches;
      toggle.innerHTML = icon(stopped ? 'play' : 'pause');
      buttons.forEach((button, i) => {
        button.setAttribute('aria-selected', String(i === index));
        button.tabIndex = i === index ? 0 : -1;
      });
    }
    function markFigures(outgoing = -1){
      figures.forEach((figure, i) => {
        const inactive = i !== index;
        figure.dataset.motionInactive = String(inactive);
        figure.hidden = inactive && i !== outgoing;
        figure.inert = inactive;
        figure.tabIndex = inactive ? -1 : 0;
        figure.setAttribute('aria-hidden', String(inactive));
        figure.style.zIndex = i === index ? '2' : '1';
        if(inactive) pauseMedia(figure);
      });
    }
    function settle(){
      generation++;
      for(const animation of animations) animation.cancel();
      animations = [];
      deck.dataset.motionTransition = 'false';
      markFigures();
    }
    function queue(){
      clearTimer();
      const active = running();
      deck.dataset.motionRunning = String(active);
      if(active) timer = setTimeout(() => show(index + 1, 1, false), 5600);
    }
    function show(wanted, direction = 1, manual = true){
      if(manual) paused = true;
      clearTimer();
      settle();
      const previous = index;
      index = (wanted % figures.length + figures.length) % figures.length;
      updateControls();
      if(manual) status.textContent = `${names[index]}, view ${index + 1} of ${figures.length}`;
      const animate = previous !== index && visible && inViewport(stage) && canAnimate() && typeof stage.animate === 'function';
      markFigures(animate ? previous : -1);
      refreshMedia();
      if(!animate){ queue(); return; }
      const currentGeneration = ++generation;
      const incoming = figures[index];
      const outgoing = figures[previous];
      const sign = direction < 0 ? -1 : 1;
      const comet = deck.dataset.motionDeck === 'comet';
      const enter = comet ? [
        {transform:`translate3d(0,${sign * 88}%,0) rotateX(${-sign * 14}deg) scale(.91)`, opacity:.2, filter:'blur(2px)'},
        {transform:`translate3d(0,${sign * 6}%,0) rotateX(${-sign * 2}deg) scale(.992)`, opacity:1, filter:'blur(0px)', offset:.72},
        {transform:'none', opacity:1, filter:'blur(0px)'}
      ] : [
        {transform:`translate3d(${sign * 11}%,12%,-130px) rotateY(${-sign * 15}deg) rotateZ(${sign * 4}deg) scale(.87)`, opacity:1},
        {transform:`translate3d(${sign * 1.5}%,1.5%,-15px) rotateY(${-sign * 2}deg) rotateZ(${sign * .5}deg) scale(.99)`, opacity:1, offset:.7},
        {transform:'none', opacity:1}
      ];
      const leave = comet ? [
        {transform:'none', opacity:1, filter:'blur(0px)'},
        {transform:`translate3d(0,${-sign * 100}%,0) rotateX(${sign * 13}deg) scale(.94)`, opacity:0, filter:'blur(2px)'}
      ] : [
        {transform:'none', opacity:1},
        {transform:`translate3d(${-sign * 100}%,-12%,80px) rotateY(${sign * 20}deg) rotateZ(${-sign * 8}deg) scale(1.04)`, opacity:1, offset:.88},
        {transform:`translate3d(${-sign * 112}%,-14%,80px) rotateY(${sign * 22}deg) rotateZ(${-sign * 9}deg) scale(1.04)`, opacity:0}
      ];
      const options = {duration:comet ? 1180 : 1080, easing:'cubic-bezier(.2,.72,.2,1)', fill:'both'};
      if(!comet) outgoing.style.zIndex = '3';
      deck.dataset.motionTransition = 'true';
      animations = [incoming.animate(enter, options), outgoing.animate(leave, options)];
      Promise.all(animations.map(animation => animation.finished)).then(() => {
        if(generation !== currentGeneration) return;
        settle();
        refreshMedia();
        queue();
      }).catch(() => {});
      deck.dataset.motionRunning = String(running());
    }
    prev.addEventListener('click', () => show(index - 1, -1));
    next.addEventListener('click', () => show(index + 1, 1));
    toggle.addEventListener('click', () => {
      paused = !paused;
      settle();
      updateControls();
      queue();
    });
    buttons.forEach((button, i) => button.addEventListener('click', () => show(i, i < index ? -1 : 1)));
    tabs.addEventListener('keydown', event => {
      const offsets = {ArrowLeft:-1, ArrowRight:1};
      let wanted;
      if(event.key in offsets) wanted = index + offsets[event.key];
      else if(event.key === 'Home') wanted = 0;
      else if(event.key === 'End') wanted = figures.length - 1;
      else return;
      event.preventDefault();
      show(wanted, wanted < index ? -1 : 1);
      buttons[index].focus();
    });
    deck.addEventListener('pointerenter', event => { if(event.pointerType !== 'touch'){ hovered = true; queue(); } });
    deck.addEventListener('pointerleave', () => { hovered = false; queue(); });
    deck.addEventListener('focusin', () => { focused = true; queue(); });
    deck.addEventListener('focusout', () => queueMicrotask(() => { focused = deck.contains(document.activeElement); queue(); }));
    let touchStart = null;
    stage.addEventListener('pointerdown', event => { if(event.pointerType === 'touch') touchStart = {x:event.clientX,y:event.clientY}; }, {passive:true});
    stage.addEventListener('pointerup', event => {
      if(!touchStart) return;
      const dx = event.clientX - touchStart.x;
      const dy = event.clientY - touchStart.y;
      touchStart = null;
      if(Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.35) show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    }, {passive:true});
    stage.addEventListener('pointercancel', () => { touchStart = null; }, {passive:true});
    const lifecycle = () => {
      if(!visible || !inViewport(stage) || !canAnimate()) settle();
      if(!visible || document.hidden) pauseMedia(stage);
      updateControls();
      queue();
    };
    if('IntersectionObserver' in window){
      new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        lifecycle();
      }, {threshold:0}).observe(stage);
    }
    decks.push(lifecycle);
    settle();
    updateControls();
    queue();
  }

  for(const figure of document.querySelectorAll('[data-window-motion]')){
    const frame = figure.querySelector('.frame') || figure;
    const kind = figure.dataset.windowMotion;
    figure.classList.remove('rise', 'settle');
    figure.classList.add('window-motion-ready');
    figure.dataset.windowState = 'waiting';
    let visible = inViewport(figure);
    let entered = false;
    let animations = [];
    let generation = 0;
    const fanLayers = kind === 'fan' ? [0, 1].map(() => {
      const layer = document.createElement('div');
      layer.className = 'motion-fan-layer';
      layer.setAttribute('aria-hidden', 'true');
      figure.prepend(layer);
      return layer;
    }) : [];
    function settle(){
      generation++;
      for(const animation of animations) animation.cancel();
      animations = [];
      figure.dataset.windowState = entered ? 'settled' : 'waiting';
    }
    function enter(){
      if(!visible || !inViewport(figure)) return;
      entered = true;
      settle();
      if(!canAnimate() || typeof frame.animate !== 'function') return;
      const phone = matchMedia('(max-width: 760px)').matches;
      const poses = phone ? {
        fan:'translate3d(2%,16px,-70px) rotateY(-7deg) rotateZ(3deg) scale(.9)',
        rise:'translate3d(0,48px,-70px) rotateX(5deg) scale(.94)',
        tilt:'translate3d(-2%,20px,-90px) rotateY(12deg) rotateX(3deg) scale(.88)',
        orbit:'translate3d(3%,24px,-90px) rotateY(-9deg) rotateZ(-5deg) scale(.87)'
      } : {
        fan:'translate3d(5%,22px,-90px) rotateY(-10deg) rotateZ(5deg) scale(.92)',
        rise:'translate3d(0,74px,-90px) rotateX(7deg) scale(.96)',
        tilt:'translate3d(-4%,30px,-130px) rotateY(16deg) rotateX(5deg) scale(.92)',
        orbit:'translate3d(8%,38px,-140px) rotateY(-13deg) rotateZ(-7deg) scale(.9)'
      };
      const currentGeneration = ++generation;
      figure.dataset.windowState = 'entering';
      const options = {duration:kind === 'orbit' ? 1380 : 1200, easing:'cubic-bezier(.18,.72,.2,1)', fill:'both'};
      const keyframes = [{transform:poses[kind] || poses.rise, opacity:.55}, {transform:'none', opacity:1}];
      if(kind === 'orbit') keyframes.splice(1, 0, {transform:'translate3d(-1%,0,0) rotateY(1.5deg) rotateZ(1deg) scale(.997)',opacity:1,offset:.76});
      animations = [frame.animate(keyframes, options)];
      if(fanLayers.length){
        const clip = figure.querySelector('.flowclip.on');
        const image = clip?.querySelector('img');
        const still = image?.dataset.still || image?.getAttribute('src');
        const source = phone ? still : clip?.querySelector('video')?.dataset.poster || still;
        fanLayers.forEach((layer, i) => {
          if(source) layer.style.backgroundImage = `url(${JSON.stringify(source)})`;
          animations.push(layer.animate([
            {transform:`translate3d(${i ? -4 : 4}%,${i ? 16 : 24}px,0) rotateZ(${i ? -9 : 9}deg) scale(.94)`,opacity:.3},
            {transform:'none',opacity:0}
          ], options));
        });
      }
      Promise.all(animations.map(animation => animation.finished)).then(() => {
        if(currentGeneration === generation) settle();
      }).catch(() => {});
    }
    const lifecycle = () => {
      if(!visible || !inViewport(figure) || !canAnimate()) settle();
      if(visible && !entered && !document.hidden) enter();
    };
    if('IntersectionObserver' in window){
      new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        lifecycle();
      }, {threshold:0}).observe(figure);
    } else lifecycle();
    if(kind === 'fan'){
      let activeClip = figure.querySelector('.flowclip.on');
      new MutationObserver(() => {
        const nextClip = figure.querySelector('.flowclip.on');
        if(nextClip === activeClip) return;
        activeClip = nextClip;
        enter();
      }).observe(frame, {subtree:true, attributes:true, attributeFilter:['class']});
    }
    windows.push(lifecycle);
  }

  const synchronize = () => {
    decks.forEach(lifecycle => lifecycle());
    windows.forEach(lifecycle => lifecycle());
    refreshMedia();
  };
  document.addEventListener('visibilitychange', synchronize);
  reduced.addEventListener?.('change', synchronize);
  window.addEventListener('pageshow', synchronize);
  refreshMedia();
})();
