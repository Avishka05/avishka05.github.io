// Utility: announce for screen readers
function announce(message) {
  const live = document.getElementById('srLive');
  if (!live) return;
  live.textContent = '';
  setTimeout(() => (live.textContent = message), 0);
}

// Easing function for manual animations
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

// Microinteraction A: click to like with particle burst and rolling count
(function setupMicroA() {
  const btn = document.getElementById('likeA');
  const burst = document.getElementById('burstA');
  const ticker = document.getElementById('countA');
  const current = ticker.querySelector('.current');
  const next = ticker.querySelector('.next');
  let count = Number(ticker.dataset.count || '0');

  function createBurst(x, y, opts = {}) {
    const colors = opts.colors || ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899'];
    const extraClass = opts.extraClass || '';
    const num = 14;
    const rect = btn.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const originX = typeof x === 'number' ? x : cx;
    const originY = typeof y === 'number' ? y : cy;

    for (let i = 0; i < num; i++) {
      const p = document.createElement('span');
      p.className = 'particle' + (extraClass ? ' ' + extraClass : '');
      const angle = (i / num) * Math.PI * 2;
      const radius = 28 + Math.random() * 12;
      const dx = Math.cos(angle) * radius;
      const dy = Math.sin(angle) * radius;
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.style.setProperty('--color', color);
      p.style.left = originX + 'px';
      p.style.top = originY + 'px';
      burst.appendChild(p);
      // animate
      const start = performance.now();
      const duration = 520;
      function frame(now) {
        const t = Math.min(1, (now - start) / duration);
        const e = easeOutCubic(t);
        const tx = originX + dx * e;
        const ty = originY + dy * e;
        p.style.transform = `translate(${tx - originX}px, ${ty - originY}px) scale(${1 - 0.4 * e})`;
        p.style.opacity = String(1 - t);
        if (t < 1) requestAnimationFrame(frame); else p.remove();
      }
      requestAnimationFrame(frame);
    }
  }

  function rollTicker(newValue) {
    next.textContent = String(newValue);
    ticker.classList.add('roll');
    const onAnimEnd = () => {
      ticker.classList.remove('roll');
      current.textContent = String(newValue);
    };
    setTimeout(onAnimEnd, 300);
  }

  function likeOnce(event) {
    count += 1;
    ticker.dataset.count = String(count);
    rollTicker(count);
    btn.classList.add('liked');
    createBurst(
      event && 'offsetX' in event ? event.offsetX : undefined,
      event && 'offsetY' in event ? event.offsetY : undefined
    );
    announce(`Liked. Total likes ${count}.`);
  }

  function dislikeOnce(event) {
    if (count <= 0) {
      // Still provide feedback without changing count
      createBurst(
        event && 'offsetX' in event ? event.offsetX : undefined,
        event && 'offsetY' in event ? event.offsetY : undefined,
        { colors: ['#60a5fa', '#38bdf8', '#22d3ee', '#a78bfa'], extraClass: 'dislike' }
      );
      announce('Minimum likes reached.');
      return;
    }
    count -= 1;
    ticker.dataset.count = String(count);
    // Update instantly without roll
    ticker.classList.remove('roll');
    current.textContent = String(count);
    next.textContent = String(count + 1);
    // Particle-only feedback with cool palette
    createBurst(
      event && 'offsetX' in event ? event.offsetX : undefined,
      event && 'offsetY' in event ? event.offsetY : undefined,
      { colors: ['#60a5fa', '#38bdf8', '#22d3ee', '#a78bfa'], extraClass: 'dislike' }
    );
    // Do not toggle/remove liked state explicitly; dislike is separate
    announce(`Disliked. Total likes ${count}.`);
  }

  // Click vs double-click discrimination
  let singleClickTimer = 0;
  const LIKE_DELAY = 250;

  btn.addEventListener('click', (e) => {
    if (singleClickTimer) clearTimeout(singleClickTimer);
    singleClickTimer = setTimeout(() => {
      likeOnce(e);
      singleClickTimer = 0;
    }, LIKE_DELAY);
  });

  btn.addEventListener('dblclick', (e) => {
    e.preventDefault();
    if (singleClickTimer) {
      clearTimeout(singleClickTimer);
      singleClickTimer = 0;
    }
    dislikeOnce(e);
  });

  // Keyboard activation retains single-like behavior
  btn.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    likeOnce();
  });
})();

// Microinteraction B: long-press to like once with progress ring
(function setupMicroB() {
  const btn = document.getElementById('likeB');
  const ticker = document.getElementById('countB');
  const current = ticker.querySelector('.current');
  const next = ticker.querySelector('.next');
  let count = Number(ticker.dataset.count || '0');

  const HOLD_MS = 650;
  let holdStart = 0;
  let raf = 0;
  let fired = false;

  function setProgress(p) {
    const pct = Math.round(p * 100);
    btn.style.setProperty('--p', pct + '%');
  }

  function likeOnce() {
    if (fired) return; // single like per hold
    fired = true;
    count += 1;
    ticker.dataset.count = String(count);
    next.textContent = String(count);
    ticker.classList.add('roll');
    setTimeout(() => {
      ticker.classList.remove('roll');
      current.textContent = String(count);
    }, 300);
    btn.classList.add('liked');
    announce(`Long-press like added. Total ${count}.`);
  }

  function startHold() {
    holdStart = performance.now();
    fired = false;
    btn.classList.add('holding');
    const tick = (now) => {
      const t = Math.min(1, (now - holdStart) / HOLD_MS);
      setProgress(easeOutCubic(t));
      if (t >= 1) {
        likeOnce();
        endHold();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  function endHold(cancelOnly) {
    btn.classList.remove('holding');
    btn.style.removeProperty('--p');
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (cancelOnly) fired = false;
  }

  // Pointer events (mouse/touch)
  btn.addEventListener('pointerdown', (e) => {
    // only main button
    if (e.button !== 0) return;
    btn.setPointerCapture(e.pointerId);
    startHold();
  });
  btn.addEventListener('pointerup', (e) => {
    btn.releasePointerCapture(e.pointerId);
    endHold(true);
  });
  btn.addEventListener('pointercancel', () => endHold(true));
  btn.addEventListener('pointerleave', () => endHold(true));

  // Keyboard long-press (Space/Enter)
  btn.addEventListener('keydown', (e) => {
    if (e.repeat) return; // avoid key repeat restarting
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      startHold();
    }
  });
  btn.addEventListener('keyup', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      endHold(true);
    }
  });
})();


