/* A light rotating overview, followed by a readable native product demo.
   One curved screen opens a horizontal walkthrough; the last view rejoins the ring. */
(() => {
  'use strict';
  const reel = document.querySelector('[data-hero-reel]');
  if (!reel || reel.dataset.controller === 'cylinder-focus') return;
  const ring = reel.querySelector('[data-reel-ring]');
  const viewport = reel.querySelector('[data-reel-viewport]');
  const faces = [...reel.querySelectorAll('[data-reel-face]')];
  const video = reel.querySelector('[data-reel-video]');
  if (!ring || !viewport || faces.length < 2 || !video) return;
  reel.dataset.controller = 'cylinder-focus';
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
  try { if (localStorage.getItem('gs-site-motion') === 'on') root.classList.add('motion-on'); } catch {}
  const reduced = () => reducedMedia.matches && !root.classList.contains('motion-on');
  const total = faces.length, panelCount = total * 2, sliceCount = 8, bend = 27;
  const mod = (v, n) => ((v % n) + n) % n;
  const clamp = v => Math.max(0, Math.min(1, v));
  const ease = v => v * v * v * (10 + v * (-15 + v * 6));
  const smooth = v => v * v * (3 - 2 * v);
  const integral = v => v * v * v - .5 * v * v * v * v;
  const period = Math.max(600, Math.min(2000, Number(reel.dataset.reelPeriod) || 900));
  const speed = 1 / period, brakeDuration = 1600, expandDuration = 1400;
  const focusDuration = 5200, collapseDuration = 1300, accelerationDuration = 800, slideDuration = 900;
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


  const veil = document.createElement('div');
  veil.className = 'reel-detail-veil'; veil.setAttribute('aria-hidden', 'true');
  const detail = document.createElement('div');
  detail.className = 'reel-detail'; detail.setAttribute('data-reel-detail', '');
  detail.setAttribute('aria-hidden', 'true');
  const curve = document.createElement('div');
  curve.className = 'detail-curve';
  const plane = document.createElement('div');
  plane.className = 'detail-plane'; plane.setAttribute('data-detail-plane', '');
  const poster = document.createElement('img');
  poster.setAttribute('data-detail-poster', ''); poster.alt = ''; poster.decoding = 'async';
  const loop = document.createElement('img');
  loop.setAttribute('data-reel-loop', ''); loop.alt = ''; loop.decoding = 'async';
  const outgoing = document.createElement('div');
  outgoing.className = 'gallery-outgoing'; outgoing.setAttribute('data-gallery-outgoing', '');
  outgoing.dataset.visible = 'false';
  const outgoingPoster = document.createElement('img');
  outgoingPoster.setAttribute('data-gallery-poster', ''); outgoingPoster.alt = '';
  const outgoingCanvas = document.createElement('canvas');
  outgoingCanvas.setAttribute('data-gallery-snapshot', '');
  outgoing.append(outgoingPoster, outgoingCanvas);
  plane.append(poster, video, loop); detail.append(curve, plane, outgoing); viewport.append(veil, detail);
  video.muted = video.defaultMuted = video.loop = video.playsInline = true;
  video.preload = 'auto';

  const panels = [], leaves = [];
  let position = 2, velocity = speed, index = 0, focusPanel = 0;
  let stage = 'rotate', elapsed = 0, segment = null, focus = 0;
  let rotation = null, gallerySlide = null, pendingScene = null, pendingDirection = 0, manualHold = false, hardPaused = false;
  let inView = false, pageVisible = !document.hidden, frame = 0, previousTime = 0;
  let media = null, sourceToken = 0, snapshotReady = false;
  let width = 0, height = 0, radius = 0, viewWidth = 0, viewHeight = 0;
  let fullHeight = 0, focusScale = 1, lastAngle = null, lastFront = -1, lastFocus = -1;
  let lastExtracted = -1;
  let lastSlideProgress = null;
  const visible = () => inView && pageVisible;
  const mayTick = () => visible() && !reduced() && !hardPaused && !(stage === 'focus' && manualHold);
  const mayPlay = () => visible() && !reduced() && !hardPaused && stage === 'focus';
  const sourcePoster = scene => {
    const image = faces[scene].querySelector('picture img');
    return image.currentSrc || image.getAttribute('src');
  };

  function makeSlice(part, isDetail) {
    const slice = document.createElement('div');
    slice.className = 'cylinder-slice' + (isDetail ? ' detail-slice' : '');
    slice.style.setProperty('--slice-index', String(part));
    slice.style.setProperty('--slice-angle', ((part - 3.5) * bend / sliceCount) + 'deg');
    if(part === 0 || part === sliceCount - 1) slice.dataset.edge = part === 0 ? 'start' : 'end';
    const img = document.createElement('img');
    img.alt = ''; img.decoding = 'async'; slice.append(img);
    if (!isDetail) return {slice, img};
    const canvas = document.createElement('canvas');
    canvas.className = 'detail-snapshot'; slice.append(canvas);
    return {slice, img, canvas};
  }

  function build() {
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
      face.style.setProperty('--panel-angle', (-at * 360 / panelCount) + 'deg');
      face.style.setProperty('--panel-glint-delay', (-at * .73) + 's');
      const mesh = document.createElement('div');
      mesh.className = 'cylinder-curve'; mesh.setAttribute('aria-hidden', 'true');
      const parts = [];
      for (let part = 0; part < sliceCount; part++) {
        const leaf = makeSlice(part, false); parts.push(leaf); mesh.append(leaf.slice);
        // A separate curved surface lets light spill outside the screen while
        // the original slices retain their crisp clipping and 3D geometry.
        const light = document.createElement('span');
        light.className = 'panel-light-slice';
        light.style.setProperty('--slice-index', String(part));
        light.style.setProperty('--slice-angle', ((part - 3.5) * bend / sliceCount) + 'deg');
        if(part === 0 || part === sliceCount - 1) {
          light.dataset.edge = part === 0 ? 'start' : 'end';
          const corner = document.createElement('i');
          corner.className = 'panel-corner-light'; light.append(corner);
        }
        mesh.append(light);
      }
      face.querySelector('.reel-screen').prepend(mesh);
      panels.push({face, source, leaves:parts});
    }
    for (let part = 0; part < sliceCount; part++) {
      const leaf = makeSlice(part, true); leaves.push(leaf); curve.append(leaf.slice);
    }
    for (const face of faces) face.querySelector('picture img').addEventListener('load', () => {
      updatePosters(); resize();
    });
    updatePosters();
  }

  function updatePosters() {
    for (const panel of panels) {
      // The ring displays small previews; the full source stays reserved for
      // the extracted detail and its native video, not 96 rotating textures.
      const src = !compact.matches && faces[panel.source].dataset.poster
        ? faces[panel.source].dataset.poster : sourcePoster(panel.source);
      for (const leaf of panel.leaves) if (leaf.img.getAttribute('src') !== src) leaf.img.src = src;
    }
    if (gallerySlide) {
      const previous = sourcePoster(gallerySlide.fromIndex);
      if (outgoingPoster.getAttribute('src') !== previous) outgoingPoster.src = previous;
    }
    const src = sourcePoster(index);
    if (poster.getAttribute('src') !== src) poster.src = src;
    for (const leaf of leaves) if (leaf.img.getAttribute('src') !== src) leaf.img.src = src;
    detail.dataset.sourceIndex = String(index);
    detail.dataset.scene = faces[index].dataset.scene;
    detail.dataset.fit = faces[index].dataset.fit || 'wide';
  }

  function resize() {
    const nextWidth = ring.offsetWidth, nextHeight = ring.offsetHeight;
    if (!nextWidth || !nextHeight) return;
    width = nextWidth; height = nextHeight;
    viewWidth = viewport.clientWidth; viewHeight = viewport.clientHeight;
    radius = width / sliceCount / (2 * Math.tan(bend / sliceCount * Math.PI / 360));
    for (const node of [ring]) {
      node.style.setProperty('--cylinder-radius', radius + 'px');
      node.style.setProperty('--slice-width', width / sliceCount + 'px');
      node.style.setProperty('--card-width', width + 'px');
    }
    // All six scenes share one enlarged frame. Tall sources are contained,
    // including their letterboxing, rather than resizing between slides.
    fullHeight = height;
    const margin = compact.matches ? 14 : 24;
    focusScale = Math.floor(width * Math.min((viewWidth - margin * 2) / width,
      (viewHeight - margin * 2) / fullHeight)) / width;
    // Rasterize the extracted screen at its final readable size. Starting with
    // a thumbnail-sized canvas and scaling it up made return frames blurry.
    detail.style.setProperty('--slice-width', width * focusScale / sliceCount + 'px');
    detail.style.setProperty('--card-width', width * focusScale + 'px');
    lastFocus = -1;
    renderDetail();
  }

  function choose(scene) {
    index = mod(scene, total);
    reel.dataset.index = String(index);
    reel.dataset.galleryIndex = String(index);
    faces.forEach((face, at) => face.classList.toggle('is-active', at === index));
    buttons.forEach((button, at) => button.setAttribute('aria-current', String(at === index)));
    count.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
    snapshotReady = false; detail.dataset.snapshot = 'false';
    updatePosters(); resize(); updateCaption();
  }

  function updateCaption() {
    const overview = stage === 'rotate';
    title.textContent = overview ? 'The workspace, from every angle.' : words[index][0];
    copy.textContent = overview
      ? 'Follow a closer look at each view, or choose one below to keep it open.'
      : words[index][1];
  }

  function updateState() {
    reel.dataset.stage = stage;
    reel.dataset.focusPanel = String(focusPanel);
    reel.dataset.userPaused = String(manualHold || hardPaused);
    reel.dataset.reduced = String(reduced());
    reel.dataset.inView = String(inView);
    reel.dataset.pageVisible = String(pageVisible);
    reel.dataset.auto = mayTick() ? 'running' : 'off';
    reel.dataset.state = reduced() ? 'still' : !visible() ? 'idle' : hardPaused ? 'paused'
      : stage === 'focus' ? (media?.playing ? 'playing' : 'holding') : 'rolling';
    pauseButton?.setAttribute('aria-pressed', String(manualHold || hardPaused || reduced()));
    if (pauseLabel) pauseLabel.textContent = reduced() ? 'Play the tour'
      : manualHold || hardPaused ? 'Resume tour' : 'Pause tour';
    const text = reduced() ? 'Static product overview' : hardPaused ? 'Tour paused'
      : stage === 'rotate' ? 'Explore Gene Studio' : stage === 'focus'
      ? faces[index].dataset.label + (media?.playing ? ' · a closer look' : ' · preview')
      : faces[index].dataset.label + (stage === 'collapse' ? ' · back to the workspace' : stage === 'slide' ? ' · next view' : ' · coming into view');
    if (status.textContent !== text) status.textContent = text;
  }

  function setStage(next) {
    stage = next; elapsed = 0; lastFocus = -1;
    reel.dataset.stage = stage;
    updateCaption(); updateState();
  }

  function pauseMedia() {
    video.pause();
    if (media) {
      media.playing = false; media.pending = false; media.attempt = (media.attempt || 0) + 1;
    }
    if (loop.hasAttribute('src')) loop.removeAttribute('src');
    loop.removeAttribute('data-ready');
    if (media?.phone) {
      sourceToken++; loop.onload = loop.onerror = null; media = null;
    }
    updateMediaVisibility();
  }

  function releaseMedia() {
    sourceToken++; video.onloadeddata = video.onerror = null;
    loop.onload = loop.onerror = null; pauseMedia();
    if (video.hasAttribute('src')) { video.removeAttribute('src'); video.load(); }
    video.removeAttribute('data-ready'); video.dataset.scene = '';
    media = null; reel.dataset.source = ''; updateMediaVisibility();
  }

  function updateMediaVisibility() {
    const native = stage === 'focus' && !media?.failed && !!media?.ready && (!media.phone || !!loop.getAttribute('src'));
    detail.dataset.detailLive = String(native);
    reel.dataset.videoReady = String(native);
    faces.forEach((face, at) => face.dataset.live = String(native && at === index));
    updateState();
  }

  function startMedia() {
    const owner = media;
    if (!owner || owner.failed || owner.pending || !mayPlay()) return;
    if (owner.phone) {
      if (loop.hasAttribute('src')) return;
      const token = owner.token;
      loop.onload = () => {
        if (media !== owner || sourceToken !== token || !mayPlay()) return;
        owner.ready = owner.playing = true; loop.dataset.ready = 'true'; updateMediaVisibility();
      };
      loop.onerror = () => {
        if (media !== owner || sourceToken !== token) return;
        owner.failed = true; owner.playing = false; updateMediaVisibility();
      };
      loop.src = owner.src;
      return;
    }
    if (!video.paused && owner.ready) { owner.playing = true; updateMediaVisibility(); return; }
    owner.pending = true;
    const attempt = owner.attempt = (owner.attempt || 0) + 1, token = owner.token;
    for (const other of document.querySelectorAll('video')) if (other !== video) other.pause();
    video.play().then(() => {
      if (owner !== media || token !== sourceToken || owner.attempt !== attempt) return;
      owner.pending = false;
      if (!mayPlay()) { pauseMedia(); return; }
      owner.ready = owner.playing = true; video.dataset.ready = 'true'; updateMediaVisibility();
    }).catch(() => {
      if (owner !== media || token !== sourceToken || owner.attempt !== attempt) return;
      owner.pending = false;
      if (!mayPlay()) return;
      owner.failed = true; owner.playing = false; updateMediaVisibility();
    });
  }

  function prepareMedia() {
    if (reduced()) { releaseMedia(); return; }
    const phone = compact.matches, key = index + ':' + phone;
    if (!media || media.key !== key) {
      releaseMedia();
      const src = phone ? faces[index].dataset.phoneAnim : faces[index].dataset.video;
      const owner = media = {key, phone, src, token:++sourceToken, ready:false, playing:false, pending:false, failed:false};
      reel.dataset.source = src; video.dataset.scene = faces[index].dataset.scene;
      if (!phone) {
        video.onloadeddata = () => {
          if (owner !== media || owner.token !== sourceToken) return;
          owner.ready = true; if (mayPlay()) startMedia();
        };
        video.onerror = () => {
          if (owner !== media || owner.token !== sourceToken) return;
          owner.failed = true; owner.playing = false; updateMediaVisibility();
        };
        video.src = src;
      }
    }
    if (mayPlay()) startMedia();
  }

  function snapshotSource() {
    if (detail.dataset.detailLive === 'true' && media?.ready && !media.failed) {
      if (compact.matches && loop.naturalWidth && loop.hasAttribute('src')) return loop;
      if (!compact.matches && video.readyState >= 2 && video.videoWidth) return video;
    }
    return poster.complete && poster.naturalWidth ? poster : null;
  }

  function drawContained(canvas, source, left, right) {
    const sourceWidth = source.videoWidth || source.naturalWidth;
    const sourceHeight = source.videoHeight || source.naturalHeight;
    const density = Math.min(2, devicePixelRatio || 1);
    const frameWidth = width * focusScale, frameHeight = fullHeight * focusScale;
    const pixelWidth = Math.ceil((right - left) * density), pixelHeight = Math.ceil(frameHeight * density);
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    const context = canvas.getContext('2d');
    context.fillStyle = '#f7fafc'; context.fillRect(0, 0, pixelWidth, pixelHeight);
    const scale = Math.min(frameWidth / sourceWidth, frameHeight / sourceHeight);
    const imageWidth = sourceWidth * scale, imageHeight = sourceHeight * scale;
    const imageLeft = (frameWidth - imageWidth) / 2, imageTop = (frameHeight - imageHeight) / 2;
    const a = Math.max(left, imageLeft), b = Math.min(right, imageLeft + imageWidth);
    if (b > a) context.drawImage(source, (a - imageLeft) / scale, 0,
      (b - a) / scale, sourceHeight, (a - left) * density, imageTop * density,
      (b - a) * density, imageHeight * density);
  }

  function takeSnapshot() {
    snapshotReady = false;
    const source = snapshotSource();
    if (!source) return;
    const frameWidth = width * focusScale;
    try {
      for (let at = 0; at < sliceCount; at++)
        drawContained(leaves[at].canvas, source, at * frameWidth / sliceCount - .5,
          (at + 1) * frameWidth / sliceCount + .5);
      snapshotReady = true;
    } catch { snapshotReady = false; }
    detail.dataset.snapshot = String(snapshotReady);
  }

  function beginSlide(scene, direction = 0) {
    const previous = index;
    scene = mod(scene, total);
    if (scene === previous) { setStage('focus'); prepareMedia(); return; }
    direction ||= scene > previous ? 1 : -1;
    const distance = direction > 0 ? mod(scene - previous, total) : -mod(previous - scene, total);
    gallerySlide = {fromIndex:previous, from:position, to:position + distance, direction};
    setStage('slide');
    outgoing.dataset.sourceIndex = String(previous);
    outgoing.dataset.scene = faces[previous].dataset.scene;
    outgoingPoster.src = sourcePoster(previous);
    let ready = false;
    const source = snapshotSource();
    if (source) {
      try { drawContained(outgoingCanvas, source, 0, width * focusScale); ready = true; } catch {}
    }
    outgoing.dataset.frameReady = String(ready);
    pauseMedia();
    focusPanel = mod(Math.round(gallerySlide.to), panelCount);
    choose(scene);
    prepareMedia(); render();
  }

  function renderGallery() {
    const sliding = stage === 'slide' && !!gallerySlide;
    if (!sliding) {
      if (lastSlideProgress === null) return;
      outgoing.dataset.visible = 'false';
      plane.style.transform = 'none'; outgoing.style.transform = 'none';
      reel.dataset.slideProgress = '0';
      lastSlideProgress = null;
      return;
    }
    const progress = ease(clamp(elapsed / slideDuration)), direction = gallerySlide.direction;
    if (progress === lastSlideProgress) return;
    outgoing.dataset.visible = 'true';
    lastSlideProgress = progress;
    plane.style.transform = 'translate3d(' + ((1 - progress) * direction * 100) + '%,0,0)';
    outgoing.style.transform = 'translate3d(' + (-progress * direction * 100) + '%,0,0)';
    reel.dataset.slideProgress = progress.toFixed(6);
    reel.dataset.slideDirection = String(direction);
  }

  function beginRotate(first = false) {
    focus = 0; velocity = first ? speed : 0; pendingScene = null; gallerySlide = null;
    const next = first ? 0 : mod(index + 1, total);
    let target = position + mod(next - position, total);
    while (target - position < 3) target += total;
    const accel = first ? 0 : accelerationDuration;
    const brakeDistance = speed * brakeDuration / 2;
    const constantDistance = target - position - speed * accel / 2 - brakeDistance;
    rotation = {from:position, target, next, accel, cruise:constantDistance / speed};
    setStage('rotate'); updateMediaVisibility();
  }

  function beginBrake(scene, target, manual = false) {
    choose(scene); focusPanel = mod(Math.round(target), panelCount);
    segment = {from:position, to:target, velocity, manual,
      duration:manual ? Math.min(1600, 1100 + Math.abs(target - position) * 130) : brakeDuration};
    setStage('brake');
    prepareMedia();
  }

  function beginExpand() {
    position = segment.to; velocity = 0; focus = 0;
    setStage('expand'); prepareMedia(); render();
  }

  function beginCollapse() {
    setStage('collapse');
    segment = {fromFocus:focus, duration:Math.max(350, collapseDuration * focus)};
    if (focus > .99) takeSnapshot();
    pauseMedia(); renderDetail();
  }

  function manualBrake(scene) {
    let target = position + mod(scene - position + total / 2, total) - total / 2;
    beginBrake(scene, target, true);
  }

  function requestScene(scene, direction = 0) {
    scene = mod(scene, total); manualHold = true; hardPaused = false;
    if (media) media.failed = false;
    if (reduced()) {
      pendingScene = null; gallerySlide = null; releaseMedia(); choose(scene);
      focusPanel = scene; position = scene; focus = 1;
      setStage('focus'); render(); return;
    }
    if (stage === 'slide' || stage === 'expand' || stage === 'collapse') {
      pendingScene = scene; pendingDirection = direction;
    } else if (stage === 'focus') {
      if (scene !== index) beginSlide(scene, direction);
      else prepareMedia();
    } else manualBrake(scene);
    reconcile();
  }

  function renderDetail() {
    if (!width || focus === lastFocus) return;
    lastFocus = focus;
    const active = stage === 'expand' || stage === 'focus' || stage === 'slide' || stage === 'collapse';
    detail.dataset.visible = String(active);
    detail.dataset.flat = String(focus === 1 && (stage === 'focus' || stage === 'slide'));
    reel.dataset.focusProgress = focus.toFixed(6);
    const f = focus, inverse = 1 - f;
    const scale = 1 / focusScale + (1 - 1 / focusScale) * f;
    detail.style.width = width * focusScale + 'px';
    detail.style.height = (height + (fullHeight - height) * f) * focusScale + 'px';
    detail.style.transform = 'translate3d(-50%,calc(-50% + ' + (.02 * viewHeight * f) +
      'px),' + (-radius * .18 * inverse) + 'px) rotateZ(' + (-16 * inverse) +
      'deg) rotateX(' + (-20 * inverse) + 'deg) translateZ(' + (radius * inverse) +
      'px) scale3d(' + scale + ',' + scale + ',' + scale + ')';
    veil.style.opacity = String(f);
    detail.style.setProperty('--snapshot-opacity', String(snapshotReady ? Math.min(1, f / .18) : 0));
    for (let at = 0; at < sliceCount; at++) {
      const angle = (at - 3.5) * bend / sliceCount * Math.PI / 180;
      const curvedX = radius * Math.sin(angle), flatX = (at - 3.5) * width / sliceCount;
      leaves[at].slice.style.transform = 'translate3d(' + ((curvedX * inverse + flatX * f) * focusScale) +
        'px,0,' + (radius * (Math.cos(angle) - 1) * inverse * focusScale) + 'px) rotateY(' +
        (angle * 180 / Math.PI * inverse) + 'deg)';
    }
    const extracted = active ? focusPanel : -1;
    if (extracted !== lastExtracted) {
      if (lastExtracted >= 0) panels[lastExtracted].face.removeAttribute('data-extracted');
      if (extracted >= 0) panels[extracted].face.dataset.extracted = 'true';
      lastExtracted = extracted;
    }
  }

  function render() {
    const angle = position * 360 / panelCount;
    if (angle !== lastAngle) {
      // Transform is not inherited. Updating an angle custom property here
      // invalidated the computed styles of every slice and light below it.
      ring.style.transform = 'translate3d(-50%,-50%,calc(var(--cylinder-radius,380px) * -.18)) ' +
        'rotateZ(var(--cylinder-roll)) rotateX(var(--cylinder-pitch)) rotateY(' + angle.toFixed(6) + 'deg)';
      reel.dataset.phase = mod(position, panelCount).toFixed(6);
      reel.dataset.angle = mod(angle, 360).toFixed(6);
      lastAngle = angle;
    }
    const front = mod(Math.round(position), panelCount);
    if (front !== lastFront) {
      if (lastFront >= 0) panels[lastFront].face.dataset.cylinderFront = 'false';
      panels[front].face.dataset.cylinderFront = 'true';
      lastFront = front;
    }
    renderDetail(); renderGallery();
  }

  function advance(delta) {
    elapsed += delta;
    if (stage === 'rotate') {
      const {from, target, next, accel, cruise} = rotation;
      if (accel && elapsed < accel) {
        const u = elapsed / accel;
        position = from + speed * accel * integral(u); velocity = speed * smooth(u);
      } else if (elapsed < accel + cruise) {
        position = from + speed * accel / 2 + speed * (elapsed - accel); velocity = speed;
      } else {
        position = target - speed * brakeDuration / 2; velocity = speed;
        const carry = elapsed - accel - cruise;
        beginBrake(next, target);
        if (carry > 0) advance(carry);
      }
    } else if (stage === 'brake') {
      const u = clamp(elapsed / segment.duration);
      if (segment.manual) {
        const d = segment.to - segment.from, v = segment.velocity * segment.duration;
        position = segment.from + v * u + (10*d-6*v)*u**3 + (-15*d+8*v)*u**4 + (6*d-3*v)*u**5;
        velocity = (v + 3*(10*d-6*v)*u**2 + 4*(-15*d+8*v)*u**3 + 5*(6*d-3*v)*u**4) / segment.duration;
      } else {
        position = segment.from + speed * segment.duration * (u - integral(u));
        velocity = speed * (1 - smooth(u));
      }
      if (u === 1) {
        const carry = elapsed - segment.duration;
        beginExpand();
        if (carry > 0) advance(carry);
      }
    } else if (stage === 'expand') {
      focus = ease(clamp(elapsed / expandDuration));
      if (focus === 1) {
        const carry = elapsed - expandDuration;
        setStage('focus');
        if (pendingScene !== null && pendingScene !== index) {
          const next = pendingScene, direction = pendingDirection; pendingScene = null;
          beginSlide(next, direction);
        } else { pendingScene = null; prepareMedia(); }
        if (carry > 0 && mayTick()) advance(carry);
      }
    } else if (stage === 'focus') {
      if (!manualHold && elapsed >= focusDuration) {
        const carry = elapsed - focusDuration;
        if (index < total - 1) beginSlide(index + 1, 1);
        else beginCollapse();
        if (carry > 0) advance(carry);
      }
    } else if (stage === 'slide') {
      const progress = ease(clamp(elapsed / slideDuration));
      position = gallerySlide.from + (gallerySlide.to - gallerySlide.from) * progress;
      if (elapsed >= slideDuration) {
        const carry = elapsed - slideDuration;
        position = gallerySlide.to;
        setStage('focus');
        if (pendingScene !== null && pendingScene !== index) {
          const next = pendingScene, direction = pendingDirection; pendingScene = null;
          beginSlide(next, direction);
        } else { pendingScene = null; prepareMedia(); }
        if (carry > 0 && mayTick()) advance(carry);
      }
    } else if (stage === 'collapse') {
      focus = segment.fromFocus * (1 - ease(clamp(elapsed / segment.duration)));
      if (focus === 0) {
        const carry = elapsed - segment.duration;
        snapshotReady = false; detail.dataset.snapshot = 'false';
        if (pendingScene !== null) {
          const next = pendingScene; pendingScene = null; manualBrake(next);
        } else beginRotate();
        if (carry > 0) advance(carry);
      }
    }
  }

  function tick(time) {
    frame = 0;
    if (!mayTick()) { previousTime = 0; return; }
    const delta = previousTime ? Math.min(64, Math.max(0, time - previousTime)) : 0;
    previousTime = time;
    advance(delta); render();
    if (mayTick()) frame = requestAnimationFrame(tick);
    else { previousTime = 0; updateState(); }
  }

  function reconcile() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; previousTime = 0;
    if (!visible() || hardPaused) pauseMedia();
    else if (stage === 'focus' || stage === 'slide' || stage === 'expand' || stage === 'brake') prepareMedia();
    updateState(); render();
    if (mayTick()) frame = requestAnimationFrame(tick);
  }

  pauseButton?.addEventListener('click', () => {
    if (reduced()) {
      root.classList.add('motion-on');
      try { localStorage.setItem('gs-site-motion', 'on'); } catch {}
      manualHold = hardPaused = false;
      beginCollapse(); dispatchEvent(new Event('gs-motion')); return;
    }
    if (hardPaused) hardPaused = false;
    else if (manualHold) {
      manualHold = false;
      if (stage === 'focus') elapsed = 0;
    } else hardPaused = true;
    if (media) media.failed = false;
    reconcile();
  });
  reel.querySelector('[data-reel-prev]')?.addEventListener('click', () => requestScene((pendingScene ?? index) - 1, -1));
  reel.querySelector('[data-reel-next]')?.addEventListener('click', () => requestScene((pendingScene ?? index) + 1, 1));
  buttons.forEach((button, at) => {
    button.addEventListener('click', () => requestScene(at));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowLeft') next = mod(at - 1, total);
      else if (event.key === 'ArrowRight') next = mod(at + 1, total);
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = total - 1;
      else return;
      event.preventDefault(); buttons[next].focus(); requestScene(next, event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : next > index ? 1 : -1);
    });
  });
  compact.addEventListener('change', () => {
    releaseMedia(); snapshotReady = false; detail.dataset.snapshot = 'false'; outgoing.dataset.frameReady = 'false';
    updatePosters(); resize(); reconcile();
  });
  reducedMedia.addEventListener('change', () => {
    if (reduced()) {
      releaseMedia(); manualHold = false; hardPaused = false; pendingScene = null; gallerySlide = null;
      position = index; focusPanel = index; focus = 1; velocity = 0;
      setStage('focus'); lastFocus = -1; render();
    } else if (stage === 'focus') beginCollapse();
    reconcile();
  });
  addEventListener('gs-motion', reconcile);
  document.addEventListener('visibilitychange', () => { pageVisible = !document.hidden; reconcile(); });
  addEventListener('pagehide', () => { pageVisible = false; reconcile(); });
  addEventListener('pageshow', () => { pageVisible = !document.hidden; reconcile(); });

  build(); choose(0); resize();
  if (reduced()) {
    position = 0; focus = 1; focusPanel = 0; velocity = 0; setStage('focus');
  } else beginRotate(true);
  lastFocus = -1; render(); updateState();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(viewport);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      const entry = entries[entries.length - 1];
      const next = entry.isIntersecting && entry.intersectionRatio >= .12;
      if (next === inView) return;
      inView = next; reconcile();
    }, {threshold:[0,.12]}).observe(viewport);
  } else { inView = true; reconcile(); }
})();
