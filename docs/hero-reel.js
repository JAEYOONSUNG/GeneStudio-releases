/* The product tour follows one clock: cards enter below, resolve at the
   centre, then leave above. Media has one owner independently of the clock. */
(() => {
  'use strict';

  const reel = document.querySelector('[data-hero-reel]');
  if (!reel || reel.dataset.controller === 'comet') return;
  const ring = reel.querySelector('[data-reel-ring]');
  const faces = [...reel.querySelectorAll('[data-reel-face]')];
  const video = reel.querySelector('[data-reel-video]');
  if (!ring || faces.length < 2 || !video) return;

  reel.dataset.controller = 'comet';
  reel.dataset.mode = 'comet';
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
  const total = faces.length;
  const number = (value, fallback, min, max) => {
    const parsed = Number(value);
    return value && Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
  };
  const period = number(reel.dataset.reelPeriod, 2400, 600, 10000);
  const spacing = number(reel.dataset.reelSpacing, 150, 115, 210);
  const travelBlur = number(reel.dataset.reelBlur, 6, 0, 18);
  const wrap = value => ((value % total) + total) % total;
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
    updateState();
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
    syncScene(wrap(Math.round(position)));
    reel.dataset.phase = wrap(position).toFixed(5);
    faces.forEach((face, at) => {
      let distance = wrap(at - position + total / 2) - total / 2;
      if (reduced()) distance = at === index ? 0 : 3;
      const magnitude = Math.abs(distance);
      const near = magnitude < 1.75;
      const kind = !near ? 'away' : at === index ? 'center' : 'neighbor';
      if (kind === 'away' && face.dataset.reelPosition === 'away') return;
      face.dataset.reelPosition = kind;
      const travel = Math.max(0, Math.min(1, (magnitude - .2) / .95));
      const values = {
        '--reel-y': `${(distance * spacing).toFixed(3)}%`,
        '--reel-x': `${(Math.sin(distance * 1.2) * 15).toFixed(3)}px`,
        '--reel-tilt': `${(Math.max(-1.5, Math.min(1.5, distance)) * 5.5).toFixed(3)}deg`,
        '--reel-pitch': `${(Math.max(-1.5, Math.min(1.5, distance)) * -10).toFixed(3)}deg`,
        '--reel-scale': Math.max(.82, 1 - magnitude * .075).toFixed(4),
        '--reel-depth': `${(-Math.min(magnitude, 2) * 65).toFixed(3)}px`,
        '--reel-blur': `${(travel * travelBlur).toFixed(3)}px`,
        '--reel-opacity': near ? String(Math.min(1, (1.75 - magnitude) / .35)) : '0'
      };
      for (const [name, value] of Object.entries(values)) face.style.setProperty(name, value);
      face.style.zIndex = String(Math.round(100 - magnitude * 20));
    });
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
      const whole = Math.floor(phase);
      position = whole + ease(phase - whole);
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
    render();
    ensureMedia();
    updateState();
    if (mayMove()) frame = requestAnimationFrame(tick);
  }

  function requestScene(next, direction = 0) {
    next = wrap(next);
    userPaused = true;
    hardPaused = false;
    let target = position + (wrap(next - position + total / 2) - total / 2);
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
      if (event.key === 'ArrowLeft') next = wrap(at - 1);
      else if (event.key === 'ArrowRight') next = wrap(at + 1);
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
