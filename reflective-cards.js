(() => {
  'use strict';

  const selector = '.catalog-image-button[data-reflective-card]';
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cards = new Map();
  const settling = new Set();
  const properties = ['x', 'y', 'rx', 'ry', 'lift', 'active', 'angle'];
  const rest = () => ({ x: 50, y: 50, rx: 0, ry: 0, lift: 0, active: 0, angle: 125 });
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  let frame = 0;
  let previousTime = 0;

  const allowed = event => finePointer.matches && !reducedMotion.matches && !document.hidden && (!event || event.pointerType === 'mouse');

  function paint(state) {
    const { current, element } = state;
    element.style.setProperty('--reflect-x', `${current.x.toFixed(3)}%`);
    element.style.setProperty('--reflect-y', `${current.y.toFixed(3)}%`);
    element.style.setProperty('--reflect-rx', `${current.rx.toFixed(3)}deg`);
    element.style.setProperty('--reflect-ry', `${current.ry.toFixed(3)}deg`);
    element.style.setProperty('--reflect-lift', `${current.lift.toFixed(3)}px`);
    element.style.setProperty('--reflect-active', current.active.toFixed(4));
    element.style.setProperty('--reflect-angle', `${current.angle.toFixed(3)}deg`);
  }

  function tick(time) {
    frame = 0;
    const elapsed = previousTime ? clamp(time - previousTime, 8, 40) : 16.67;
    previousTime = time;
    const easing = 1 - Math.exp(-elapsed / 75);
    for (const state of settling) {
      if (!state.element.isConnected) {
        dispose(state);
        continue;
      }
      let moving = false;
      for (const key of properties) {
        const difference = state.target[key] - state.current[key];
        const threshold = key === 'active' ? 0.001 : 0.012;
        if (Math.abs(difference) > threshold) {
          state.current[key] += difference * easing;
          moving = true;
        } else {
          state.current[key] = state.target[key];
        }
      }
      paint(state);
      if (!moving) {
        settling.delete(state);
        if (!state.current.active) state.element.classList.remove('is-reflecting');
      }
    }
    if (settling.size) frame = requestAnimationFrame(tick);
    else previousTime = 0;
  }

  function schedule(state) {
    settling.add(state);
    if (!frame) frame = requestAnimationFrame(tick);
  }

  function reset(state, immediately = false) {
    state.target = rest();
    state.bounds = null;
    if (immediately) {
      state.current = rest();
      settling.delete(state);
      state.element.classList.remove('is-reflecting');
      paint(state);
    } else {
      schedule(state);
    }
  }

  function update(state, event) {
    if (!allowed(event)) return;
    if (!state.bounds) state.bounds = state.element.getBoundingClientRect();
    const bounds = state.bounds;
    if (!bounds.width || !bounds.height) return;
    const x = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
    const y = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
    state.target = {
      x: x * 100,
      y: y * 100,
      rx: (0.5 - y) * 10,
      ry: (x - 0.5) * 10,
      lift: -3,
      active: 0.72,
      angle: 125 + (x - 0.5) * 32 + (y - 0.5) * 12
    };
    state.element.classList.add('is-reflecting');
    schedule(state);
  }

  function dispose(state) {
    for (const [type, handler] of Object.entries(state.handlers)) state.element.removeEventListener(type, handler);
    settling.delete(state);
    cards.delete(state.element);
  }

  function refresh() {
    for (const state of cards.values()) {
      if (!state.element.isConnected || !state.element.matches(selector)) dispose(state);
    }
    document.querySelectorAll(selector).forEach(element => {
      if (cards.has(element)) return;
      const state = { element, current: rest(), target: rest(), bounds: null, handlers: {} };
      state.handlers = {
        pointerenter: event => update(state, event),
        pointermove: event => update(state, event),
        pointerleave: () => reset(state),
        pointercancel: () => reset(state),
        blur: () => reset(state)
      };
      for (const [type, handler] of Object.entries(state.handlers)) element.addEventListener(type, handler, { passive: true });
      cards.set(element, state);
    });
  }

  function resetAll() {
    for (const state of cards.values()) reset(state, true);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
  }

  finePointer.addEventListener('change', resetAll);
  reducedMotion.addEventListener('change', resetAll);
  window.addEventListener('resize', resetAll, { passive: true });
  window.addEventListener('scroll', resetAll, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) resetAll(); });

  window.refreshReflectiveCards = refresh;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh, { once: true });
  else refresh();
})();
