/* DriftWall, adapted from the supplied React Bits component for the existing reviews. */
(() => {
  'use strict';

  function initReviewsDriftWall() {
    const section = document.querySelector('#recensioni');
    if (!section || section.dataset.driftWallReady) return;
    const sources = [...section.querySelectorAll('.reviews-with-photos, .reviews-grid')];
    const reviews = sources.flatMap(source => [...source.querySelectorAll('.review-card')]);
    if (!reviews.length || !window.matchMedia || !window.IntersectionObserver) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compact = window.matchMedia('(max-width: 700px)');
    let columns = [];
    let frame = 0;
    let lastTime = null;
    let inView = false;
    let listMode = false;
    let pointerInside = false;
    let hoveredColumn = -1;
    let lastColumnCount = 0;
    let returnFocus = null;

    const toolbar = document.createElement('div');
    toolbar.className = 'reviews-drift-toolbar';
    const hint = document.createElement('p');
    hint.className = 'reviews-drift-hint';
    hint.textContent = 'Passa su una recensione per fermare la colonna. Selezionala per leggerla.';
    const controls = document.createElement('div');
    controls.className = 'reviews-drift-controls';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'reviews-drift-control reviews-drift-control--read';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Leggi tutte le recensioni';
    controls.append(toggle);
    toolbar.append(hint, controls);

    const wall = document.createElement('div');
    wall.className = 'reviews-drift-wall';
    // The decorative looping copies never enter the accessibility tree or tab order.
    // The read-all control exposes the original, unique articles for keyboard/SR use.
    wall.setAttribute('aria-hidden', 'true');
    const plane = document.createElement('div');
    plane.className = 'reviews-drift-plane';
    wall.append(plane);
    sources[0].before(toolbar, wall);
    sources.forEach((source, index) => {
      source.classList.add('reviews-drift-source');
      if (!source.id) source.id = `reviews-drift-source-${index}`;
    });
    toggle.setAttribute('aria-controls', sources.map(source => source.id).join(' '));

    const dialog = document.createElement('dialog');
    dialog.className = 'reviews-drift-dialog';
    dialog.setAttribute('aria-labelledby', 'reviews-drift-dialog-title');
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'close-dialog icon-button';
    close.setAttribute('aria-label', 'Chiudi recensione');
    close.textContent = '×';
    const dialogContent = document.createElement('div');
    dialogContent.className = 'reviews-drift-dialog-content';
    dialog.append(close, dialogContent);
    document.body.append(dialog);

    const enabled = () => !compact.matches && !reduced.matches;
    const canAnimate = () => enabled() && !listMode && inView && !document.hidden && !dialog.open;
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastTime = null;
    };
    const planeTransform = () => {
      plane.style.transform = 'translate(-50%, -50%) scale(1.09) rotateX(12deg) rotateY(-10deg) translateZ(-65px)';
    };

    function tileFor(article, reviewIndex, columnIndex) {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.tabIndex = -1;
      tile.className = 'reviews-drift-tile';
      tile.dataset.driftReview = String(reviewIndex);
      tile.dataset.driftColumn = String(columnIndex);
      const inner = document.createElement('span');
      inner.className = 'reviews-drift-inner';
      const top = document.createElement('span');
      top.className = 'reviews-drift-tile-top';
      const stars = article.querySelector('.review-stars');
      if (stars) {
        const clone = stars.cloneNode(true);
        clone.removeAttribute('role');
        clone.removeAttribute('aria-label');
        top.append(clone);
      }
      if (!article.classList.contains('review-example')) {
        const label = document.createElement('span');
        label.className = 'reviews-drift-label';
        label.textContent = 'Recensione con foto';
        top.append(label);
      }
      const title = document.createElement('span');
      title.className = 'reviews-drift-title';
      title.textContent = article.querySelector('h3')?.textContent || 'Recensione';
      const text = document.createElement('span');
      text.className = 'reviews-drift-excerpt';
      const paragraphs = [...article.querySelectorAll('blockquote p, :scope > p:not(.review-fit)')];
      text.textContent = paragraphs.map(p => p.textContent.trim()).join(' ');
      inner.append(top, title);
      if (text.textContent) inner.append(text);
      const photos = [...article.querySelectorAll('.review-photo img')];
      if (photos.length) {
        tile.classList.add('reviews-drift-tile--photos');
        const strip = document.createElement('span');
        strip.className = 'reviews-drift-photos';
        photos.forEach(photo => {
          const img = document.createElement('img');
          img.src = photo.getAttribute('src');
          img.alt = '';
          img.loading = 'lazy';
          img.decoding = 'async';
          img.draggable = false;
          strip.append(img);
        });
        inner.append(strip);
      }
      const read = document.createElement('span');
      read.className = 'reviews-drift-read';
      read.textContent = 'Leggi la recensione';
      inner.append(read);
      tile.append(inner);
      return tile;
    }

    function buildColumns() {
      const count = section.clientWidth > 1100 ? 4 : 3;
      if (lastColumnCount === count && columns.length) return;
      lastColumnCount = count;
      const groups = Array.from({ length: count }, () => []);
      reviews.forEach((review, i) => groups[i % count].push({ review, index: i }));
      const fragment = document.createDocumentFragment();
      const unit = 292;
      columns = groups.map((group, c) => {
        const column = document.createElement('div');
        column.className = 'reviews-drift-column';
        column.dataset.driftColumn = String(c);
        const track = document.createElement('div');
        track.className = 'reviews-drift-track';
        const period = group.length * unit;
        const copies = Math.max(3, Math.ceil(1000 / period) + 1);
        for (let copy = 0; copy < copies; copy += 1) {
          group.forEach(({ review, index }) => track.append(tileFor(review, index, c)));
        }
        column.append(track);
        fragment.append(column);
        // Keep the two supplied photo reviews visible in the first view.
        const offset = c < 2 ? period - (240 + c * 80) : period * ((c * 0.37 + 0.08) % 1);
        track.style.transform = `translate3d(0, ${-offset}px, 0)`;
        const pseudo = ((c * 0.6180339887 + 0.35) % 1) * 2 - 1;
        return { element: column, track, period, offset, velocity: 0, speed: 26 * (1 + 0.35 * pseudo) * (c % 2 === 0 ? 1 : -1) };
      });
      hoveredColumn = -1;
      pointerInside = false;
      plane.replaceChildren(fragment);
      plane.style.setProperty('--reviews-drift-columns', String(count));
      planeTransform();
    }

    function animate(timestamp) {
      frame = 0;
      if (!canAnimate()) { stop(); return; }
      const dt = lastTime === null ? 0 : Math.min(0.05, (timestamp - lastTime) / 1000);
      lastTime = timestamp;
      columns.forEach((column, c) => {
        // Freeze the track immediately and exactly; no inertia or modulo rebase
        // while the pointer is in this column, including the gaps between cards.
        if (pointerInside && hoveredColumn === c) {
          column.velocity = 0;
          return;
        }
        column.velocity += (column.speed - column.velocity) * (1 - Math.exp(-dt / 0.28));
        column.offset = ((column.offset + column.velocity * dt) % column.period + column.period) % column.period;
        column.track.style.transform = `translate3d(0, ${-column.offset}px, 0)`;
      });
      frame = requestAnimationFrame(animate);
    }
    function syncAnimation() {
      if (canAnimate()) {
        if (!frame) { lastTime = null; frame = requestAnimationFrame(animate); }
      } else stop();
    }
    function syncMode() {
      const enhance = enabled();
      toolbar.hidden = !enhance;
      wall.hidden = !enhance || listMode;
      sources.forEach(source => { source.hidden = enhance && !listMode; });
      toggle.setAttribute('aria-expanded', String(enhance && listMode));
      toggle.textContent = listMode ? 'Torna alla parete' : 'Leggi tutte le recensioni';
      section.classList.toggle('has-reviews-drift-wall', enhance);
      if (enhance) buildColumns();
      syncAnimation();
    }
    function clearHover() {
      pointerInside = false;
      hoveredColumn = -1;
      columns.forEach(column => column.element.classList.remove('is-hovered'));
      plane.querySelector('.is-active')?.classList.remove('is-active');
    }

    wall.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const columnElement = event.target.closest('.reviews-drift-column');
      // Keep the current hover across the small visual gaps instead of toggling
      // it as the enlarged card crosses its stationary button's hit area.
      if (!columnElement || !plane.contains(columnElement)) return;
      const nextColumn = Number(columnElement.dataset.driftColumn);
      if (nextColumn !== hoveredColumn) {
        plane.querySelector('.is-active')?.classList.remove('is-active');
        columns.forEach((column, i) => column.element.classList.toggle('is-hovered', i === nextColumn));
      }
      pointerInside = true;
      hoveredColumn = nextColumn;
      columns[nextColumn].velocity = 0;
      const tile = event.target.closest('[data-drift-review]');
      if (!tile) return;
      const previous = plane.querySelector('.is-active');
      if (previous !== tile) {
        previous?.classList.remove('is-active');
        tile.classList.add('is-active');
      }
    });
    wall.addEventListener('pointerleave', clearHover);
    wall.addEventListener('pointercancel', clearHover);
    window.addEventListener('blur', clearHover);
    wall.addEventListener('click', event => {
      const tile = event.target.closest('[data-drift-review]');
      if (!tile) return;
      const article = reviews[Number(tile.dataset.driftReview)];
      if (!article) return;
      const clone = article.cloneNode(true);
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
      clone.querySelector('h3').id = 'reviews-drift-dialog-title';
      dialogContent.replaceChildren(clone);
      returnFocus = toggle;
      dialog.showModal();
      clearHover();
      syncAnimation();
    });
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      returnFocus?.focus({ preventScroll: true });
      syncAnimation();
    });
    toggle.addEventListener('click', () => { listMode = !listMode; clearHover(); syncMode(); });
    reduced.addEventListener('change', syncMode);
    compact.addEventListener('change', syncMode);
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearHover(); syncAnimation(); });
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      syncAnimation();
    }, { threshold: 0 }).observe(wall);
    if (window.ResizeObserver) new ResizeObserver(() => { if (enabled()) buildColumns(); }).observe(section);
    section.dataset.driftWallReady = 'true';
    syncMode();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initReviewsDriftWall, { once: true });
  else initReviewsDriftWall();
})();
