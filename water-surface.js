/* Riflessi d'acqua leggeri, condivisi da card e header. */
(() => {
  'use strict';
  const surfaces = new Map();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => entries.forEach(entry => {
        const surface = surfaces.get(entry.target);
        if (surface) surface.visible = entry.isIntersecting;
      }), { rootMargin: '120px' })
    : null;
  const resizeObserver = 'ResizeObserver' in window
    ? new ResizeObserver(entries => entries.forEach(entry => {
        const surface = surfaces.get(entry.target);
        if (surface) resize(surface);
      }))
    : null;

  function resize(surface) {
    const { element, canvas, context } = surface;
    const width = element.clientWidth;
    const height = element.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    surface.width = width;
    surface.height = height;
    draw(surface, performance.now() / 1000);
  }

  function wave(context, width, height, time, index, header) {
    const spacing = header ? 29 : 49;
    const y = index * spacing - 30;
    const sway = Math.sin(time * .35 + index * 1.2) * (header ? 7 : 16);
    const amplitude = header ? 7 : 12;
    context.beginPath();
    for (let x = -24; x <= width + 24; x += 6) {
      const curve = Math.sin(x * .015 + time * .7 + index * 1.18) * amplitude
        + Math.sin(x * .037 - time * .48 + index * .38) * amplitude * .36;
      if (x === -24) context.moveTo(x, y + curve + sway);
      else context.lineTo(x, y + curve + sway);
    }
    context.lineWidth = header ? 9 : 13;
    context.strokeStyle = '#56d6d7';
    context.globalAlpha = header ? .075 : .055;
    context.stroke();
    context.lineWidth = header ? 1.7 : 2.2;
    context.strokeStyle = index % 2 ? '#a7fff1' : '#64dbeb';
    context.globalAlpha = header ? .31 : .22;
    context.shadowColor = '#97f3ed';
    context.shadowBlur = header ? 8 : 12;
    context.stroke();
    context.shadowBlur = 0;
  }

  function draw(surface, time) {
    const { context: ctx, width: w, height: h } = surface;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const header = surface.element.dataset.water === 'header';

    // La luce si muove sotto la superficie come un riflesso di sole sul mare.
    const glintX = w * (.5 + .32 * Math.sin(time * .28));
    const glintY = h * (.38 + .2 * Math.cos(time * .4));
    const glow = ctx.createRadialGradient(glintX, glintY, 0, glintX, glintY, Math.max(w, h) * .55);
    glow.addColorStop(0, header ? 'rgba(128,240,231,.20)' : 'rgba(161,246,237,.12)');
    glow.addColorStop(1, 'rgba(34,159,177,0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < Math.ceil(h / (header ? 29 : 49)) + 2; i++) wave(ctx, w, h, time, i, header);

    const now = performance.now();
    surface.ripples = surface.ripples.filter(ripple => now - ripple.start < 1500);
    for (const ripple of surface.ripples) {
      const progress = (now - ripple.start) / 1500;
      const radius = 5 + progress * (header ? 108 : 92);
      for (let ring = 0; ring < 3; ring++) {
        ctx.beginPath();
        ctx.ellipse(ripple.x, ripple.y, radius + ring * 15, (radius + ring * 15) * .58, 0, 0, Math.PI * 2);
        ctx.strokeStyle = ring === 0 ? '#effff7' : '#75e0e9';
        ctx.globalAlpha = (1 - progress) * (ripple.strong ? .65 : .42) / (1 + ring * .48);
        ctx.lineWidth = ring === 0 ? 2 : 1.2;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function ripple(surface, event, strong = false) {
    const bounds = surface.element.getBoundingClientRect();
    surface.ripples.push({ x: event.clientX - bounds.left, y: event.clientY - bounds.top, start: performance.now(), strong });
    if (surface.ripples.length > 6) surface.ripples.shift();
    if (reducedMotion.matches) draw(surface, performance.now() / 1000);
  }

  function attach(element) {
    if (surfaces.has(element)) return;
    const canvas = element.querySelector(':scope > .water-canvas');
    const context = canvas?.getContext('2d');
    if (!context) return;
    const surface = { element, canvas, context, width: 0, height: 0, visible: true, ripples: [], lastRipple: 0 };
    surfaces.set(element, surface);
    element.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      const now = performance.now();
      if (now - surface.lastRipple > 145) {
        ripple(surface, event);
        surface.lastRipple = now;
      }
    }, { passive: true });
    element.addEventListener('pointerdown', event => ripple(surface, event, true), { passive: true });
    observer?.observe(element);
    resizeObserver?.observe(element);
    resize(surface);
  }

  window.refreshWaterSurfaces = () => {
    for (const [element] of surfaces) {
      if (!element.isConnected) {
        observer?.unobserve(element);
        resizeObserver?.unobserve(element);
        surfaces.delete(element);
      }
    }
    document.querySelectorAll('.water-surface').forEach(attach);
  };

  let lastFrame = 0;
  function animate(timestamp) {
    requestAnimationFrame(animate);
    if (document.hidden || reducedMotion.matches || timestamp - lastFrame < 32) return;
    lastFrame = timestamp;
    for (const surface of surfaces.values()) if (surface.visible) draw(surface, timestamp / 1000);
  }
  window.refreshWaterSurfaces();
  requestAnimationFrame(animate);
  window.addEventListener('resize', () => { if (!resizeObserver) for (const surface of surfaces.values()) resize(surface); }, { passive: true });
  reducedMotion.addEventListener?.('change', () => { for (const surface of surfaces.values()) draw(surface, performance.now() / 1000); });
})();
