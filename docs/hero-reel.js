/* A tilted, continuously rotating cylinder of real product screens.
   Curved leaves carry image/video textures; media still has a single owner. */
(() => {
  'use strict';

  const reel = document.querySelector('[data-hero-reel]');
  if (!reel || reel.dataset.controller === 'cylinder') return;
  const ring = reel.querySelector('[data-reel-ring]');
  const faces = [...reel.querySelectorAll('[data-reel-face]')];
  const video = reel.querySelector('[data-reel-video]');
  if (!ring || faces.length < 2 || !video) return;

  reel.dataset.controller = 'cylinder';
  reel.dataset.mode = 'cylinder';
  const buttons = [...reel.querySelectorAll('[data-reel-go]')];
  const pauseButton = reel.querySelector('[data-reel-pause]');
  const pauseLabel = reel.querySelector('[data-reel-pause-label]');
  const count = reel.querySelector('[data-reel-count]');
  const title = reel.querySelector('[data-reel-title]');
  const copy = reel.querySelector('[data-reel-copy]');
  const status = reel.querySelector('[data-reel-status]');
  const compact = matchMedia('(max-width:760px)');
  const reducedMedia = matchMedia('(prefers-reduced-motion:reduce)');
  const root = document.documentElement;
  const total = faces.length, panelCount = total * 2, sliceCount = 8, bend = 27;
  const modulo = (value, count) => ((value % count) + count) % count;
  const number = (value, fallback, min, max) => {
    const parsed = Number(value);
    return value && Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
  };
  const period = number(reel.dataset.reelPeriod, 900, 400, 10000);
  const wrap = value => modulo(value, panelCount);
  const sceneFor = value => modulo(Math.round(value), total);
  const ease = value => value * value * value * (value * (value * 6 - 15) + 10);
  const reduced = () => reducedMedia.matches && !root.classList.contains('motion-on');
  try {
    if (localStorage.getItem('gs-site-motion') === 'on') root.classList.add('motion-on');
  } catch {}

  const words = [
    ['Find the file, or the exact site inside it.',
      'Home searches favorite folders by filename or recognition sequence, locally and without an import step.'],
    ['Read the whole construct at once.',
      'Map resolves the circular molecule, both feature strands and every restriction label as space opens.'],
    ['Open the annotation beyond GenBank.',
      'Features keeps identity pinned while computed properties, eggNOG and InterPro move into view.'],
    ['Cut once. See every consequence.',
      'Digest links the selected stretch, compatible enzymes, gel, fragment table and methylation verdict.'],
    ['Design the edit and the oligos together.',
      'Guides scans real candidates, ranks them and carries the selected design through to order-ready sequences.'],
    ['Verify the clone where the trace says it changed.',
      'Sanger aligns forward and reverse reads, quality, differences and chromatograms against the construct.']
  ];

  const loop = document.createElement('img');
  loop.setAttribute('data-reel-loop', '');
  loop.alt = '';
  loop.decoding = 'async';
  loop.setAttribute('aria-hidden', 'true');
  video.parentNode.insertBefore(loop, video);
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'none';

  let phase = wrap(Number(reel.dataset.index) || 0);
  let position = phase;
  let index = -1;
  let frame = 0;
  let previousTime = 0;
  let transition = null;
  let inView = false;
  let pageVisible = !document.hidden;
  let userPaused = false;
  let hardPaused = false;
  let sourceToken = 0;
  let media = null;
  let cardWidth = 0, cardHeight = 0, canvasFrame = 0;
  const panels = [];

  const visible = () => inView && pageVisible;
  const mayPlay = () => visible() && !reduced() && !hardPaused;
  const mayMove = () => visible() && !reduced() && !hardPaused && (!userPaused || transition);
  const label = () => faces[index]?.dataset.label || 'Product overview';

  function updateState() {
    let state;
    let message;
    if (reduced()) { state = 'still'; message = 'Static product overview'; }
    else if (!visible()) { state = 'idle'; message = 'Overview paused'; }
    else if (hardPaused) { state = 'paused'; message = 'Tour paused'; }
    else if (mayMove()) { state = 'rolling'; message = label() + ' · in motion'; }
    else if (media?.playing) { state = 'playing'; message = label() + ' · in motion'; }
    else { state = 'holding'; message = label() + ' · preview'; }
    reel.dataset.state = state;
    reel.dataset.auto = mayMove() ? 'running' : 'off';
    reel.dataset.userPaused = String(userPaused);
    reel.dataset.reduced = String(reduced());
    reel.dataset.inView = String(inView);
    reel.dataset.pageVisible = String(pageVisible);
    pauseButton?.setAttribute('aria-pressed', String(userPaused || reduced()));
    if (pauseLabel) pauseLabel.textContent = reduced() ? 'Play the tour'
      : userPaused ? 'Resume tour' : 'Pause tour';
    if (status && status.textContent !== message) status.textContent = message;
  }

  function showMedia(ready) {
    faces.forEach((face, at) => { face.dataset.live = String(ready && at === index); });
    reel.dataset.videoReady = String(ready);
    updateTextures();
    updateState();
    if (ready) scheduleCanvas();
  }

  function pauseMedia() {
    video.pause();
    if (media) {
      media.playing = false;
      media.pending = false;
      media.attempt = (media.attempt || 0) + 1;
    }
    // Animated images cannot pause. Removing the loop reveals its own still.
    if (loop.hasAttribute('src')) loop.removeAttribute('src');
    loop.removeAttribute('data-ready');
    if (media?.phone) {
      loop.onload = loop.onerror = null;
      sourceToken++;
      media = null;
    }
    showMedia(false);
  }

  function releaseMedia() {
    sourceToken++;
    video.onloadeddata = video.onerror = null;
    loop.onload = loop.onerror = null;
    pauseMedia();
    video.removeAttribute('src');
    video.removeAttribute('data-ready');
    video.dataset.scene = '';
    video.load();
    media = null;
    reel.dataset.source = '';
  }

  function pauseOtherVideos() {
    for (const other of document.querySelectorAll('video')) {
      if (other !== video) other.pause();
    }
  }

  function startVideo(owner) {
    if (owner !== media || !mayPlay() || owner.failed || owner.pending) return;
    if (!video.paused && owner.ready) {
      owner.playing = true;
      showMedia(true);
      return;
    }
    owner.pending = true;
    const attempt = owner.attempt = (owner.attempt || 0) + 1;
    pauseOtherVideos();
    const token = owner.token;
    video.play().then(() => {
      if (media !== owner || sourceToken !== token || owner.attempt !== attempt) return;
      owner.pending = false;
      if (!mayPlay()) { pauseMedia(); return; }
      owner.ready = true;
      owner.playing = true;
      video.dataset.ready = 'true';
      showMedia(true);
    }).catch(() => {
      if (media !== owner || sourceToken !== token || owner.attempt !== attempt) return;
      owner.pending = false;
      // A pause during play() is an interruption, not an autoplay refusal.
      if (!mayPlay()) return;
      owner.failed = true;
      owner.playing = false;
      showMedia(false);
    });
  }

  function ensureMedia() {
    if (!mayPlay()) { pauseMedia(); return; }
    const phone = compact.matches;
    const src = phone ? faces[index].dataset.phoneAnim : faces[index].dataset.video;
    const key = `${index}:${phone ? 'phone' : 'video'}`;
    if (!media || media.key !== key) {
      releaseMedia();
      const token = ++sourceToken;
      media = { key, token, phone, src, ready:false, playing:false, pending:false, failed:false };
      const owner = media;
      reel.dataset.source = src || '';
      const slot = faces[index].querySelector('[data-reel-live-slot]');
      if (!slot || !src) { owner.failed = true; showMedia(false); return; }
      if (phone) {
        slot.append(loop);
        loop.onload = () => {
          if (media !== owner || token !== sourceToken || !mayPlay()) return;
          owner.ready = true;
          owner.playing = true;
          loop.dataset.ready = 'true';
          pauseOtherVideos();
          showMedia(true);
        };
        loop.onerror = () => {
          if (media !== owner || token !== sourceToken || !loop.hasAttribute('src')) return;
          owner.failed = true;
          owner.playing = false;
          showMedia(false);
        };
      } else {
        slot.append(video);
        video.dataset.scene = faces[index].dataset.scene;
        video.onloadeddata = () => {
          if (media !== owner || token !== sourceToken) return;
          owner.ready = true;
          if (mayPlay()) startVideo(owner);
        };
        video.onerror = () => {
          if (media !== owner || token !== sourceToken) return;
          owner.failed = true;
          owner.playing = false;
          showMedia(false);
        };
        video.src = src;
        video.load();
      }
    }
    if (media.failed) { showMedia(false); return; }
    if (phone) {
      if (!loop.hasAttribute('src')) loop.src = media.src;
      else if (media.ready) { media.playing = true; showMedia(true); }
    } else startVideo(media);
  }

  function buildCylinder() {
    reel.dataset.panelCount = String(panelCount);
    for (let at = 0; at < panelCount; at++) {
      const source = at % total;
      const face = at < total ? faces[at] : faces[source].cloneNode(true);
      if (at >= total) {
        face.removeAttribute('data-reel-face');
        face.classList.remove('is-active');
        face.querySelectorAll('.cylinder-curve').forEach(node => node.remove());
        face.querySelector('[data-reel-live-slot]').replaceChildren();
        ring.append(face);
      }
      face.dataset.cylinderPanel = String(at);
      face.dataset.sourceIndex = String(source);
      face.style.setProperty('--panel-angle', `${-at * 360 / panelCount}deg`);
      const curve = document.createElement('div');
      curve.className = 'cylinder-curve';
      curve.setAttribute('aria-hidden', 'true');
      const leaves = [];
      for (let part = 0; part < sliceCount; part++) {
        const slice = document.createElement('div');
        slice.className = 'cylinder-slice';
        slice.style.setProperty('--slice-index', String(part));
        slice.style.setProperty('--slice-angle', `${(part - (sliceCount - 1) / 2) * bend / sliceCount}deg`);
        const img = document.createElement('img');
        img.alt = ''; img.decoding = 'async';
        const canvas = document.createElement('canvas');
        canvas.className = 'cylinder-video';
        slice.append(img, canvas); curve.append(slice);
        leaves.push({slice,img,canvas,context:canvas.getContext('2d')});
      }
      face.querySelector('.reel-screen').prepend(curve);
      panels.push({face,source,leaves});
    }
    for (const face of faces) face.querySelector('picture img').addEventListener('load', updateTextures);
    updateTextures(); resizeCylinder();
  }

  function updateTextures() {
    for (const panel of panels) {
      const poster = faces[panel.source].querySelector('picture img');
      const animated = media?.phone && media.playing && media.ready && mayPlay() && panel.source === index;
      const src = animated ? media.src : (poster.currentSrc || poster.getAttribute('src'));
      panel.face.dataset.phoneLive = String(!!animated);
      if (!media?.ready || panel.source !== index || compact.matches) panel.face.dataset.canvasReady = 'false';
      for (const leaf of panel.leaves) if (leaf.img.getAttribute('src') !== src) leaf.img.src = src;
    }
  }

  function resizeCylinder() {
    const width = ring.offsetWidth, height = ring.offsetHeight;
    if (!width || !height) return;
    cardWidth = width; cardHeight = height;
    const step = bend / sliceCount * Math.PI / 180;
    const radius = width / sliceCount / (2 * Math.tan(step / 2));
    ring.style.setProperty('--cylinder-radius', `${radius.toFixed(3)}px`);
    ring.style.setProperty('--slice-width', `${(width / sliceCount).toFixed(3)}px`);
    ring.style.setProperty('--card-width', `${width}px`);
    const density = Math.min(2, devicePixelRatio || 1);
    for (const panel of panels) for (const leaf of panel.leaves) {
      const pixelWidth = Math.ceil((width / sliceCount + 1) * density);
      const pixelHeight = Math.ceil(height * density);
      // Assigning an unchanged canvas dimension clears its frozen video frame.
      // Pause/resume reconciles layout too, so resize only when it changed.
      if (leaf.canvas.width !== pixelWidth || leaf.canvas.height !== pixelHeight) {
        leaf.canvas.width = pixelWidth;
        leaf.canvas.height = pixelHeight;
        panel.face.dataset.canvasReady = 'false';
      }
    }
    updateTextures(); paintVideo();
  }

  function paintVideo() {
    if (!mayPlay() || compact.matches || !media?.playing || !media.ready || video.readyState < 2 || !cardWidth || !video.videoWidth) return;
    const scale = Math.max(cardWidth / video.videoWidth, cardHeight / video.videoHeight);
    const cropW = cardWidth / scale, cropH = cardHeight / scale;
    const cropX = (video.videoWidth - cropW) / 2;
    const cropY = faces[index].dataset.fit === 'tall' ? 0 : (video.videoHeight - cropH) / 2;
    for (const panel of panels) {
      if (panel.source !== index) continue;
      let painted = true;
      for (let at = 0; at < panel.leaves.length; at++) {
        const leaf = panel.leaves[at];
        if (!leaf.context) { painted = false; break; }
        const x = Math.max(0, at * cardWidth / sliceCount - .5);
        const width = Math.min(cardWidth - x, cardWidth / sliceCount + 1);
        try {
          leaf.context.drawImage(video, cropX + x / cardWidth * cropW, cropY,
            width / cardWidth * cropW, cropH, 0, 0, leaf.canvas.width, leaf.canvas.height);
        } catch { painted = false; }
      }
      panel.face.dataset.canvasReady = String(painted);
    }
  }

  function scheduleCanvas() {
    if (canvasFrame || compact.matches || !media?.playing || !mayPlay()) return;
    canvasFrame = requestAnimationFrame(() => {
      canvasFrame = 0; paintVideo(); scheduleCanvas();
    });
  }

  function syncScene(next) {
    if (next === index) return;
    index = next;
    reel.dataset.index = String(index);
    faces.forEach((face, at) => face.classList.toggle('is-active', at === index));
    buttons.forEach((button, at) => button.setAttribute('aria-current', String(at === index)));
    if (count) count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    if (title) title.textContent = faces[index].dataset.title || words[index]?.[0] || label();
    if (copy) copy.textContent = faces[index].dataset.copy || words[index]?.[1] || '';
    ensureMedia();
  }

  function render() {
    syncScene(sceneFor(position));
    const angle = wrap(position) * 360 / panelCount;
    ring.style.setProperty('--cylinder-angle', `${angle.toFixed(5)}deg`);
    reel.dataset.angle = angle.toFixed(5);
    reel.dataset.phase = wrap(position).toFixed(5);
    for (const [at, panel] of panels.entries()) {
      const relative = modulo(angle - at * 360 / panelCount + 180, 360) - 180;
      const front = Math.round(wrap(position)) % panelCount === at;
      panel.face.dataset.cylinderFront = String(front);
      panel.face.dataset.reelPosition = Math.abs(relative) <= 90 ? (front ? 'center' : 'neighbor') : 'rear';
      // Shading belongs on 2D leaves; opacity/filter on a 3D parent flattens the cylinder.
      panel.face.style.setProperty('--panel-light', (0.68 + 0.32 * Math.max(0, Math.cos(relative * Math.PI / 180))).toFixed(3));
    }
  }

  function tick(time) {
    frame = 0;
    if (!mayMove()) { previousTime = 0; return; }
    const elapsed = previousTime ? Math.min(80, Math.max(0, time - previousTime)) : 0;
    previousTime = time;
    if (transition) {
      transition.elapsed += elapsed;
      const progress = Math.min(1, transition.elapsed / transition.duration);
      position = transition.from + (transition.to - transition.from) * ease(progress);
      if (progress === 1) {
        phase = wrap(transition.to);
        position = phase;
        transition = null;
      }
    } else {
      phase = wrap(phase + elapsed / period);
      position = phase;
    }
    render();
    if (mayMove()) frame = requestAnimationFrame(tick);
    else { previousTime = 0; updateState(); }
  }

  function reconcile() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    if (reduced()) {
      transition = null;
      phase = position = wrap(Math.round(position));
      releaseMedia();
    }
    resizeCylinder();
    render();
    ensureMedia();
    updateState();
    if (mayMove()) frame = requestAnimationFrame(tick);
  }

  function requestScene(next, direction = 0) {
    next = modulo(next, total);
    userPaused = true;
    hardPaused = false;
    let target = position + (modulo(next - position + total / 2, total) - total / 2);
    if (direction > 0 && target <= position) target += total;
    if (direction < 0 && target >= position) target -= total;
    const distance = Math.abs(target - position);
    if (reduced() || !visible() || distance < .001) {
      phase = position = next;
      transition = null;
    } else {
      transition = { from:position, to:target, elapsed:0, duration:Math.min(1600, 850 + distance * 140) };
    }
    reconcile();
  }

  pauseButton?.addEventListener('click', () => {
    if (reduced()) {
      root.classList.add('motion-on');
      try { localStorage.setItem('gs-site-motion', 'on'); } catch {}
      userPaused = hardPaused = false;
      dispatchEvent(new Event('gs-motion'));
      return;
    }
    if (userPaused) userPaused = hardPaused = false;
    else { userPaused = true; hardPaused = true; }
    if (media) media.failed = false;
    reconcile();
  });
  reel.querySelector('[data-reel-prev]')?.addEventListener('click', () => requestScene(index - 1, -1));
  reel.querySelector('[data-reel-next]')?.addEventListener('click', () => requestScene(index + 1, 1));
  buttons.forEach((button, at) => {
    button.addEventListener('click', () => requestScene(at));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowLeft') next = modulo(at - 1, total);
      else if (event.key === 'ArrowRight') next = modulo(at + 1, total);
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = total - 1;
      else return;
      event.preventDefault();
      buttons[next]?.focus();
      requestScene(next);
    });
  });
  compact.addEventListener('change', () => { releaseMedia(); reconcile(); });
  reducedMedia.addEventListener('change', reconcile);
  addEventListener('gs-motion', reconcile);
  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
    reconcile();
  });
  addEventListener('pagehide', () => { pageVisible = false; reconcile(); });
  addEventListener('pageshow', () => { pageVisible = !document.hidden; reconcile(); });

  buildCylinder();
  if ('ResizeObserver' in window) new ResizeObserver(resizeCylinder).observe(ring);
  compact.addEventListener('change', () => { updateTextures(); resizeCylinder(); });
  render();
  updateState();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      const entry = entries[entries.length - 1];
      const next = entry.isIntersecting && entry.intersectionRatio >= .12;
      if (next === inView) return;
      inView = next;
      reconcile();
    }, { threshold:[0, .12] }).observe(reel.querySelector('[data-reel-viewport]') || reel);
  } else {
    inView = true;
    reconcile();
  }
})();
