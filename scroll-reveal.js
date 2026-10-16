/* Inspired by React Bits AnimatedContent: vertical entry, power3.out, once. */
(() => {
  'use strict';

  const boot = () => {
    const hero = document.querySelector('.hero');
    if (!hero || hero.dataset.rpHeroRevealReady) return;
    hero.dataset.rpHeroRevealReady = 'true';

    // Keep the unenhanced page visible if the browser cannot run the effect.
    if (!('IntersectionObserver' in window) || !Element.prototype.animate || !CSS.supports('translate', '0 1px')) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pending = new Set();
    const active = new Map();
    const offsets = new WeakMap();
    let observer;

    const settle = (element) => {
      observer?.unobserve(element);
      pending.delete(element);
      element.dataset.rpHeroReveal = 'visible';
      const animation = active.get(element);
      active.delete(element);
      if (animation) animation.cancel();
    };

    const reveal = (element) => {
      if (!pending.has(element)) return;
      observer.unobserve(element);
      pending.delete(element);
      if (motion.matches || element.contains(document.activeElement)) {
        settle(element);
        return;
      }

      element.dataset.rpHeroReveal = 'playing';
      try {
        const animation = element.animate([
          { opacity: 0, translate: '0 64px' },
          { opacity: 1, translate: '0 0' }
        ], {
          duration: 800,
          delay: offsets.get(element) || 0,
          easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
          fill: 'both'
        });
        active.set(element, animation);
        animation.finished.then(() => settle(element), () => {});
      } catch (_) {
        settle(element);
      }
    };

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) reveal(entry.target);
      });
    }, { threshold: 0.1 });

    // Animate the photo wrapper, never the photo itself or its captions separately.
    const copy = hero.querySelector('.hero-copy');
    const copyElements = copy ? Array.from(copy.children).filter((element) => (
      element.matches('.eyebrow, h1, .hero-description, .button, .hero-note')
    )) : [];
    const photo = hero.querySelector('.hero-photo');
    const elements = [...copyElements, ...(photo ? [photo] : [])];

    elements.forEach((element, index) => {
      offsets.set(element, element === photo ? 80 : Math.min(index * 80, 300));
      element.dataset.rpHeroReveal = motion.matches ? 'visible' : 'pending';
      if (motion.matches) return;
      pending.add(element);
      observer.observe(element);
    });

    // Keyboard users never land on an invisible CTA, even before intersection.
    hero.addEventListener('focusin', (event) => {
      const target = event.target.closest('[data-rp-hero-reveal]');
      if (target && hero.contains(target)) settle(target);
    });

    const onMotionChange = () => {
      if (!motion.matches) return;
      [...pending, ...active.keys()].forEach(settle);
      observer.disconnect();
    };
    motion.addEventListener?.('change', onMotionChange);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
