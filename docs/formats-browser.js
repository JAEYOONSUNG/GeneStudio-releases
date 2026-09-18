/* One file family at a time. The real preview glyph travels from its tab,
   while complete neighbouring panels remain available until the handoff ends. */
(() => {
  'use strict';
  const browser = document.querySelector('[data-format-browser]');
  if (!browser || browser.classList.contains('formats-ready')) return;
  const stage = browser.querySelector('[data-format-stage]');
  const tablist = browser.querySelector('[role="tablist"]');
  const tabs = [...browser.querySelectorAll('[data-format-tab]')];
  const panels = tabs.map(tab => [...browser.querySelectorAll('[data-format-panel]')]
    .find(panel => panel.dataset.formatPanel === tab.dataset.formatTab));
  if (!stage || !tablist || tabs.length < 2 || panels.some(panel => !panel) ||
      new Set(tabs.map(tab => tab.dataset.formatTab)).size !== tabs.length) return;

  const root = document.documentElement;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => window.gsMotion ? window.gsMotion.matches :
    preference.matches && !root.classList.contains('motion-on');
  const key = index => tabs[index].dataset.formatTab;
  const icon = node => node?.querySelector('[data-glyph]') || node?.querySelector('svg');
  const previews = panels.map(panel => icon(panel.querySelector('[data-format-preview]')));
  const duration = 650, easing = 'cubic-bezier(.22,.72,.2,1)';
  let active = Math.max(0, tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true'));
  let wanted = active, moving = null, growing = null, lastHeight = 0, lastWidth = 0;
  let lastTheme = root.dataset.theme || '', lastReduced = reduced();

  function mayAnimate() {
    if (document.hidden || reduced() || typeof stage.animate !== 'function') return false;
    const box = browser.getBoundingClientRect();
    return box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < innerHeight;
  }
  function stageInsets() {
    const style = getComputedStyle(stage);
    return ['paddingTop','paddingBottom','borderTopWidth','borderBottomWidth']
      .reduce((sum, property) => sum + (parseFloat(style[property]) || 0), 0);
  }
  function naturalHeight(panel = panels[active]) {
    const style = getComputedStyle(panel);
    return panel.getBoundingClientRect().height + stageInsets() +
      (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);
  }
  function cssHeight(height) {
    return Math.max(0, height - (getComputedStyle(stage).boxSizing === 'border-box' ? 0 : stageInsets())) + 'px';
  }
  function mark(outgoing = -1) {
    tabs.forEach((tab, index) => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(index === active));
      tab.tabIndex = index === active ? 0 : -1;
      panels[index].hidden = index !== active && index !== outgoing;
      panels[index].inert = index !== active;
      panels[index].setAttribute('aria-hidden', String(index !== active));
      panels[index].tabIndex = index === active ? 0 : -1;
    });
    browser.dataset.formatActive = key(active);
  }
  function cancelGrowth() {
    const previous = growing; growing = null;
    previous?.animation.cancel();
    browser.dataset.formatHeightTransition = 'false';
  }
  function clearFlight() {
    previews.forEach(preview => preview?.removeAttribute('data-format-flight'));
    panels.forEach(panel => panel.classList.remove('is-entering', 'is-leaving'));
  }
  function rest() {
    clearFlight(); mark();
    stage.style.removeProperty('height');
    lastHeight = stage.getBoundingClientRect().height;
    lastWidth = stage.getBoundingClientRect().width;
    browser.dataset.formatTransition = 'false';
    delete browser.dataset.formatPending;
  }
  function settle(index = wanted) {
    const previous = moving; moving = null;
    previous?.animations.forEach(animation => animation.cancel());
    cancelGrowth(); active = wanted = index; rest();
    // Tab borders/underlines and the shared tint use CSS transitions. They
    // must settle too when the page hides or geometry becomes obsolete.
    for (const animation of browser.getAnimations?.({subtree:true}) || []) {
      if (typeof animation.transitionProperty !== 'string') continue;
      try { animation.finish(); } catch { animation.cancel(); }
    }
  }
  function finish(run) {
    if (moving !== run) return;
    moving = null;
    run.animations.forEach(animation => animation.cancel());
    rest();
    if (wanted !== active) begin(wanted);
  }

  function revealTab(index) {
    // Scroll only the narrow tab rail, never the document or selected panel.
    const tab = tabs[index].getBoundingClientRect(), rail = tablist.getBoundingClientRect();
    if (tablist.scrollWidth <= tablist.clientWidth + 1) return;
    let left = tablist.scrollLeft;
    if (tab.left < rail.left) left -= rail.left - tab.left + 6;
    else if (tab.right > rail.right) left += tab.right - rail.right + 6;
    if (left !== tablist.scrollLeft) tablist.scrollTo({left, behavior:'instant'});
  }
  function begin(index, fromHeight = stage.getBoundingClientRect().height) {
    if (index === active) return;
    if (!mayAnimate()) { settle(index); return; }
    const previous = active, outgoing = panels[previous], incoming = panels[index];
    cancelGrowth();
    stage.style.height = cssHeight(fromHeight);
    outgoing.classList.add('is-leaving'); incoming.classList.add('is-entering');
    active = index; mark(previous); revealTab(index);
    const targetHeight = naturalHeight(incoming), preview = previews[index], source = icon(tabs[index]);
    const targetBox = preview?.getBoundingClientRect(), sourceBox = source?.getBoundingClientRect();
    if (!preview || !sourceBox?.width || !targetBox?.width) { settle(index); return; }
    const x = sourceBox.x + sourceBox.width / 2 - targetBox.x - targetBox.width / 2,
      y = sourceBox.y + sourceBox.height / 2 - targetBox.y - targetBox.height / 2,
      scale = sourceBox.width / targetBox.width;
    const run = {animations:[], targetHeight}; moving = run;
    preview.dataset.formatFlight = 'true';
    browser.dataset.formatTransition = 'true';
    delete browser.dataset.formatPending;
    try {
      run.animations.push(preview.animate([
        {transform:`translate(${x}px,${y}px) scale(${scale})`, transformOrigin:'50% 50%', opacity:0},
        {opacity:1, offset:.18},
        {transform:'translate(0,0) scale(1)', transformOrigin:'50% 50%', opacity:1}
      ], {duration, easing, fill:'both'}));
      if (previews[previous]) run.animations.push(previews[previous].animate([
        {transform:'translateY(0) scale(1)', opacity:1},
        {transform:'translateY(-9px) scale(.92)', opacity:0}
      ], {duration:230, easing:'ease-out', fill:'both'}));
      for (const node of outgoing.querySelectorAll('[data-format-copy]'))
        run.animations.push(node.animate([{opacity:1, transform:'translateY(0)'},
          {opacity:0, transform:'translateY(-6px)'}], {duration:170, easing:'ease-out', fill:'both'}));
      [...incoming.querySelectorAll('[data-format-copy]')].forEach((node, at) => {
        run.animations.push(node.animate([{opacity:0, transform:'translateY(10px)'},
          {opacity:1, transform:'translateY(0)'}], {duration:410, delay:100 + Math.min(at,3) * 25,
          easing, fill:'both'}));
      });
      run.animations.push(stage.animate([{height:cssHeight(fromHeight)}, {height:cssHeight(targetHeight)}],
        {duration, easing, fill:'both'}));
      Promise.all(run.animations.map(animation => animation.finished)).then(() => finish(run)).catch(() => {
        if (moving === run) settle(wanted);
      });
    } catch { settle(wanted); }
  }
  function request(index, focus = false) {
    wanted = (index + tabs.length) % tabs.length;
    if (focus) tabs[wanted].focus({preventScroll:true});
    revealTab(wanted);
    if (moving) {
      if (wanted !== active) browser.dataset.formatPending = key(wanted);
      else delete browser.dataset.formatPending;
      return;
    }
    if (wanted === active) return;
    const fromHeight = stage.getBoundingClientRect().height;
    cancelGrowth(); begin(wanted, fromHeight);
  }

  function fitHeight() {
    const width = stage.getBoundingClientRect().width;
    if (Math.abs(width - lastWidth) > .5) { settle(wanted); return; }
    const target = naturalHeight();
    if (moving) {
      if (Math.abs(target - moving.targetHeight) > 1) settle(wanted);
      return;
    }
    if (Math.abs(target - (growing?.target || lastHeight)) < .5) return;
    const from = growing ? stage.getBoundingClientRect().height : lastHeight;
    cancelGrowth();
    if (!mayAnimate() || !from) { rest(); return; }
    stage.style.height = cssHeight(from);
    const animation = stage.animate([{height:cssHeight(from)}, {height:cssHeight(target)}],
      {duration:360, easing, fill:'both'}), run = {animation, target};
    growing = run; browser.dataset.formatHeightTransition = 'true';
    animation.finished.then(() => {
      if (growing !== run) return;
      cancelGrowth(); rest();
    }).catch(() => {});
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => request(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = index + 1;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = index - 1;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault(); request(next, true);
    });
  });
  panels.forEach(panel => panel.querySelectorAll('details').forEach(details =>
    details.addEventListener('toggle', () => { if (panel === panels[active]) fitHeight(); })));
  browser.classList.add('formats-ready'); rest();
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(fitHeight);
    observer.observe(stage); panels.forEach(panel => observer.observe(panel));
  }
  addEventListener('resize', () => settle(wanted), {passive:true});
  preference.addEventListener('change', () => { lastReduced = reduced(); settle(wanted); });
  addEventListener('gs-motion', () => { lastReduced = reduced(); settle(wanted); });
  document.addEventListener('visibilitychange', () => settle(wanted));
  addEventListener('pagehide', () => settle(wanted));
  addEventListener('pageshow', () => settle(wanted));
  new MutationObserver(() => {
    const theme = root.dataset.theme || '', still = reduced();
    if (theme !== lastTheme || still !== lastReduced) {
      lastTheme = theme; lastReduced = still; settle(wanted);
    }
  }).observe(root, {attributes:true, attributeFilter:['data-theme','class']});
})();
