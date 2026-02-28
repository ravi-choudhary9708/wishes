/* ============================================================
   BIRTHDAY — script.js   v2.0
   Cinematic Scroll · Grand Overlay · Fireworks · Mobile-Optimised
============================================================ */
'use strict';

/* ─── DEVICE DETECTION ─────────────────────────────────── */
const isMobile = ('ontouchstart' in window) || (window.innerWidth < 768);
const isLowEnd = isMobile && (navigator.hardwareConcurrency || 4) <= 4;

/* Adaptive counts */
const STAR_COUNT = isMobile ? 55 : 180;
const PARTICLE_COUNT = isMobile ? 28 : 100;
const BALLOON_COUNT = isMobile ? 7 : 12;
const HEART_COUNT = isMobile ? 12 : 22;
const STAR_EL_COUNT = isMobile ? 12 : 24;
const PETAL_COUNT = isMobile ? 9 : 18;
const SPARKLE_COUNT = isMobile ? 18 : 32;
const CONFETTI_COUNT = isMobile ? 90 : 260;
const GFW_BURST_CNT = isMobile ? 12 : 24;   // grand firework bursts

/* ─── UTILS ─────────────────────────────────────────────── */
const rand = (mn, mx) => Math.random() * (mx - mn) + mn;
const randInt = (mn, mx) => Math.floor(rand(mn, mx));

/* ─── SCROLL PROGRESS BAR ─────────────────────────────── */
(function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    bar.style.width = Math.min(pct * 100, 100) + '%';
  }, { passive: true });
})();

/* ─── CURSOR TRAIL (desktop only) ─────────────────────── */
if (!isMobile) {
  (function initCursor() {
    const cursor = document.getElementById('cursorTrail');
    if (!cursor) return;
    let mx = -200, my = -200, cx = -200, cy = -200;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });

    (function animateCursor() {
      cx += (mx - cx) * 0.14;
      cy += (my - cy) * 0.14;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      requestAnimationFrame(animateCursor);
    })();

    document.addEventListener('mousemove', throttle(e => {
      const dot = document.createElement('div');
      const clr = ['#f4a7b9', '#e8c77a', '#d4b8e0', '#fff', '#f7c5d0'][randInt(0, 5)];
      dot.style.cssText = `
        position:fixed;pointer-events:none;z-index:9997;
        width:5px;height:5px;border-radius:50%;background:${clr};
        left:${e.clientX}px;top:${e.clientY}px;
        transform:translate(-50%,-50%);
        box-shadow:0 0 8px 2px ${clr};
        transition:opacity .65s ease,transform .65s ease;opacity:.9;
      `;
      document.body.appendChild(dot);
      requestAnimationFrame(() => {
        dot.style.transform = `translate(${rand(-22, 22)}px,${rand(-32, 8)}px) scale(0)`;
        dot.style.opacity = '0';
      });
      setTimeout(() => dot.remove(), 750);
    }, 55));
  })();
}

/* ─── STARFIELD CANVAS ─────────────────────────────────── */
(function initStars() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', throttle(resize, 300));

  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: rand(0, 1), y: rand(0, 1),
    r: rand(0.3, 1.3),
    alpha: rand(0.05, 0.55),
    twinkleSpeed: rand(0.004, 0.018),
    twinkleOffset: rand(0, Math.PI * 2),
  }));

  let t = 0;
  (function loop() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';
    stars.forEach(s => {
      const a = s.alpha * (0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset));
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    t++;
    requestAnimationFrame(loop);
  })();
})();

/* ─── BOKEH PARTICLE CANVAS ────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', throttle(resize, 300));

  const COLORS = ['#f4a7b9', '#e8c77a', '#d4b8e0', '#f7c5d0', '#ffffff', '#fff6b0', '#c3a0d8'];

  class Particle {
    constructor(init = false) { this.reset(init); }
    reset(init = false) {
      this.x = rand(0, W);
      this.y = init ? rand(0, H) : rand(H * 0.88, H + 20);
      this.r = rand(1.5, 6.5);
      this.alpha = rand(0.04, 0.38);
      this.vx = rand(-0.18, 0.18);
      this.vy = rand(-0.5, -0.12);
      this.color = COLORS[randInt(0, COLORS.length)];
      this.life = 0;
      this.maxLife = rand(140, 320);
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life++;
      if (this.life > this.maxLife || this.y < -30) this.reset();
    }
    draw() {
      const fade = Math.min(this.life / 42, 1) * Math.min((this.maxLife - this.life) / 42, 1);
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 2.6);
      g.addColorStop(0, this.color); g.addColorStop(1, 'transparent');
      ctx.globalAlpha = this.alpha * fade;
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r * 2.6, 0, Math.PI * 2); ctx.fill();
    }
  }

  const parts = Array.from({ length: PARTICLE_COUNT }, () => new Particle(true));
  (function loop() {
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    parts.forEach(p => { p.update(); p.draw(); });
    ctx.restore();
    requestAnimationFrame(loop);
  })();
})();

/* ─── SPARKLES ─────────────────────────────────────────── */
(function initSparkles() {
  const c = document.getElementById('sparklesContainer');
  if (!c) return;
  for (let i = 0; i < SPARKLE_COUNT; i++) {
    const s = document.createElement('div');
    s.classList.add('sparkle');
    const sz = rand(3, 10);
    s.style.cssText = `left:${rand(5, 95)}%;top:${rand(5, 95)}%;width:${sz}px;height:${sz}px;--dur:${rand(2.5, 7)}s;--delay:${rand(0, 6)}s;`;
    c.appendChild(s);
  }
})();

/* ─── BALLOONS ─────────────────────────────────────────── */
(function initBalloons() {
  const c = document.getElementById('balloonsContainer');
  if (!c) return;
  const emojis = ['🎈', '🎀', '🌸', '💕', '✨', '🎊', '💫', '🌷', '🎁', '🌺'];
  for (let i = 0; i < BALLOON_COUNT; i++) {
    const b = document.createElement('div');
    b.classList.add('balloon');
    b.textContent = emojis[i % emojis.length];
    b.style.cssText = `left:${rand(3, 93)}%;bottom:${rand(2, 75)}%;--dur:${rand(5, 12)}s;--delay:${rand(0, 9)}s;font-size:${rand(1.7, 3.6)}rem;`;
    c.appendChild(b);
  }
})();

/* ─── FLOATING HEARTS ──────────────────────────────────── */
(function initFloatingHearts() {
  const c = document.getElementById('floatingHearts');
  if (!c) return;
  const icons = ['💕', '🌸', '💗', '🌷', '💖', '✨', '🩷', '🌼'];
  for (let i = 0; i < HEART_COUNT; i++) {
    const h = document.createElement('span');
    h.classList.add('fheart');
    h.textContent = icons[i % icons.length];
    h.style.cssText = `left:${rand(1, 98)}%;top:${rand(10, 90)}%;--size:${rand(0.9, 2.2)}rem;--dur:${rand(5, 11)}s;--delay:${rand(0, 10)}s;`;
    c.appendChild(h);
  }
})();

/* ─── PETAL RAIN ───────────────────────────────────────── */
(function initPetals() {
  const c = document.getElementById('petalContainer');
  if (!c) return;
  const petals = ['🌸', '🌺', '🌷', '🌼', '🩷'];
  for (let i = 0; i < PETAL_COUNT; i++) {
    const p = document.createElement('span');
    p.classList.add('petal');
    p.textContent = petals[i % petals.length];
    p.style.cssText = `left:${rand(1, 99)}%;--size:${rand(0.8, 1.6)}rem;--dur:${rand(7, 14)}s;--delay:${rand(0, 12)}s;--drift:${rand(-80, 80)}px;`;
    c.appendChild(p);
  }
})();

/* ─── FLOATING STARS ───────────────────────────────────── */
(function initFloatingStars() {
  const c = document.getElementById('floatingStars');
  if (!c) return;
  const icons = ['✨', '⭐', '🌟', '💫', '🪄', '🌸'];
  for (let i = 0; i < STAR_EL_COUNT; i++) {
    const s = document.createElement('span');
    s.classList.add('fstar');
    s.textContent = icons[i % icons.length];
    s.style.cssText = `left:${rand(2, 97)}%;top:${rand(4, 96)}%;--size:${rand(0.75, 1.8)}rem;--dur:${rand(3, 9)}s;--delay:${rand(0, 8)}s;`;
    c.appendChild(s);
  }
})();

/* ─── SCROLL REVEAL ────────────────────────────────────── */
(function initScrollReveal() {
  const items = document.querySelectorAll('.reveal-up, .reveal-card');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  items.forEach(el => obs.observe(el));
})();

/* ─── LETTER LINE-BY-LINE REVEAL ──────────────────────── */
(function initLetterReveal() {
  const lines = document.querySelectorAll('.letter-line');
  if (!lines.length) return;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      lines.forEach((line, i) => {
        setTimeout(() => line.classList.add('is-revealed'), i * 110);
      });
      obs.disconnect();
    }
  }, { threshold: 0.18 });
  const container = document.getElementById('letterLines');
  if (container) obs.observe(container);
})();

/* ─── HERO PARALLAX ─────────────────────────────────────── */
(function initParallax() {
  if (isMobile) return;   // skip on mobile — saves paint
  const frame = document.getElementById('heroPhotoFrame');
  if (!frame) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          frame.style.transform = `translateY(${y * 0.28}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ─── MEMORIES BG PARALLAX (desktop) ───────────────────── */
(function initMemParallax() {
  if (isMobile) return;
  const el = document.getElementById('memBgParallax');
  if (!el) return;
  window.addEventListener('scroll', () => {
    const rect = el.parentElement.getBoundingClientRect();
    el.style.transform = `translateY(${(-rect.top / window.innerHeight) * 40}px)`;
  }, { passive: true });
})();

/* ─── SCROLL CUE CLICK ─────────────────────────────────── */
(function initScrollCue() {
  const cue = document.getElementById('scrollCue');
  if (!cue) return;
  cue.style.cursor = 'pointer';
  cue.addEventListener('click', () => {
    document.getElementById('memories')?.scrollIntoView({ behavior: 'smooth' });
  });
})();

/* ─── CARD HOVER SPARKLES (desktop only) ───────────────── */
if (!isMobile) {
  (function initCardSparkles() {
    document.querySelectorAll('.film-card-inner').forEach(card => {
      card.addEventListener('mouseenter', () => {
        const layer = card.querySelector('.card-sparkle-layer');
        if (!layer) return;
        for (let i = 0; i < 8; i++) {
          setTimeout(() => {
            const d = document.createElement('span');
            d.textContent = ['✨', '💕', '🌸', '⭐'][randInt(0, 4)];
            d.style.cssText = `
              position:absolute;pointer-events:none;
              font-size:${rand(0.8, 1.6)}rem;
              left:${rand(5, 90)}%;top:${rand(5, 85)}%;
              opacity:0;z-index:10;
              animation:cardSparkleUp .9s ease forwards;
            `;
            layer.appendChild(d);
            setTimeout(() => d.remove(), 1000);
          }, i * 80);
        }
      });
    });
    if (!document.getElementById('cardSparkleStyle')) {
      const st = document.createElement('style');
      st.id = 'cardSparkleStyle';
      st.textContent = `@keyframes cardSparkleUp{0%{opacity:0;transform:translateY(0) scale(0.2)}30%{opacity:1}100%{opacity:0;transform:translateY(-40px) scale(1.2)}}`;
      document.head.appendChild(st);
    }
  })();
}

/* ─── CAKE & CANDLES ───────────────────────────────────── */
(function initCake() {
  const candles = document.querySelectorAll('.candle');
  if (!candles.length) return;
  let allLit = false;

  candles.forEach(c => {
    c.addEventListener('click', () => {
      c.classList.toggle('lit');
      c.dataset.lit = c.classList.contains('lit') ? 'true' : 'false';
      checkAllLit();
    });
  });

  function lightSequentially() {
    candles.forEach((c, i) => setTimeout(() => { c.classList.add('lit'); c.dataset.lit = 'true'; }, i * 220));
    setTimeout(checkAllLit, candles.length * 220 + 120);
  }

  function checkAllLit() {
    const lit = [...candles].filter(c => c.classList.contains('lit')).length;
    if (lit === candles.length && !allLit) { allLit = true; setTimeout(() => openGrandOverlay(), 300); }
    else if (lit < candles.length) allLit = false;
  }

  const section = document.getElementById('celebrate');
  if (section) {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { lightSequentially(); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(section);
  }
})();

/* ─── SURPRISE BUTTON ──────────────────────────────────── */
(function initSurprise() {
  const btn = document.getElementById('surpriseBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    openGrandOverlay();
    // Also play music if not already playing
    const audio = document.getElementById('bgMusic');
    if (audio && audio.paused) { audio.volume = 0.55; audio.play().catch(() => { }); }
  });
})();

/* ────────────────────────────────────────────────────────
   GRAND OVERLAY — open / close / fireworks
──────────────────────────────────────────────────────── */

let grandOverlayOpen = false;
let grandFwRaf = null;

function openGrandOverlay() {
  const overlay = document.getElementById('grandOverlay');
  if (!overlay || grandOverlayOpen) return;
  grandOverlayOpen = true;
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('is-open');

  // Also ensure music plays
  const audio = document.getElementById('bgMusic');
  if (audio && audio.paused) { audio.volume = 0.55; audio.play().catch(() => { }); }

  // Spawn emoji rain in overlay
  spawnGrandEmojis();

  // Fire the grand fireworks
  startGrandFireworks();

  // Show bottom confetti too
  triggerConfetti();

  // Also show the "I love you forever" section
  setTimeout(() => {
    const msg = document.getElementById('finalMessage');
    if (msg) { msg.setAttribute('aria-hidden', 'false'); msg.classList.add('is-visible'); }
  }, 1400);

  // Close on tap/click anywhere
  function closeHandler() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    grandOverlayOpen = false;
    cancelAnimationFrame(grandFwRaf);
    clearGrandCanvas();
    overlay.removeEventListener('click', closeHandler);
    overlay.removeEventListener('touchend', closeHandler);
    // Clear emoji rain
    const eq = document.getElementById('grandEmojis');
    if (eq) eq.innerHTML = '';
  }

  setTimeout(() => {
    overlay.addEventListener('click', closeHandler);
    overlay.addEventListener('touchend', closeHandler, { passive: true });
  }, 600); // brief delay so the open-click doesn't immediately close
}

function clearGrandCanvas() {
  const c = document.getElementById('grandFireCanvas');
  if (!c) return;
  c.getContext('2d').clearRect(0, 0, c.width, c.height);
}

/* ─── GRAND FIREWORKS ENGINE ─────────────────────────── */
function startGrandFireworks() {
  const canvas = document.getElementById('grandFireCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
  }
  resize();

  const FW_COLORS = [
    '#f4a7b9', '#e8c77a', '#d4b8e0', '#f7c5d0',
    '#ffd700', '#c3a0d8', '#ff6b9d', '#fffae0',
    '#ff9de2', '#7fffd4', '#ffa500', '#e0bbff',
  ];

  class Spark {
    constructor(x, y, color) {
      const a = rand(0, Math.PI * 2);
      const spd = rand(1.8, isLowEnd ? 5 : 8);
      this.x = x; this.y = y;
      this.vx = Math.cos(a) * spd;
      this.vy = Math.sin(a) * spd;
      this.r = rand(1.5, isLowEnd ? 2.8 : 3.8);
      this.alpha = 1;
      this.color = color;
      this.trail = !isLowEnd; // trails only on capable devices
      this.px = x; this.py = y;
    }
    update() {
      this.px = this.x; this.py = this.y;
      this.x += this.vx; this.y += this.vy;
      this.vy += 0.065;     // gravity
      this.vx *= 0.97; this.vy *= 0.97;
      this.alpha -= 0.017;
    }
    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      if (this.trail) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.r * 0.7;
        ctx.shadowColor = this.color; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.moveTo(this.px, this.py); ctx.lineTo(this.x, this.y); ctx.stroke();
      }
      ctx.shadowColor = this.color; ctx.shadowBlur = 10;
      ctx.fillStyle = this.color;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    isDead() { return this.alpha <= 0; }
  }

  class Burst {
    constructor(delay = 0) {
      this.delay = delay;
      this.sparked = false;
      this.sparks = [];
      this.color = FW_COLORS[randInt(0, FW_COLORS.length)];
      this.x = rand(canvas.width * 0.1, canvas.width * 0.9);
      this.y = rand(canvas.height * 0.05, canvas.height * 0.55);
    }
    spark() {
      const count = isLowEnd ? 35 : 70;
      for (let i = 0; i < count; i++) this.sparks.push(new Spark(this.x, this.y, this.color));
      // Ring of gold sparks for premium feel
      if (!isLowEnd) {
        const goldCount = 20;
        for (let i = 0; i < goldCount; i++) {
          const s = new Spark(this.x, this.y, '#ffd700');
          s.r = rand(0.8, 1.5);
          this.sparks.push(s);
        }
      }
    }
    update() { this.sparks.forEach(s => s.update()); this.sparks = this.sparks.filter(s => !s.isDead()); }
    draw() { this.sparks.forEach(s => s.draw()); }
    isEmpty() { return this.sparked && this.sparks.length === 0; }
  }

  const bursts = [];
  const W = canvas.width, H = canvas.height;
  let frameNum = 0;
  const TOTAL_FRAMES = isLowEnd ? 200 : 340;

  // Schedule burst launches
  const launchSchedule = Array.from({ length: GFW_BURST_CNT }, (_, i) => Math.floor(i * (TOTAL_FRAMES / GFW_BURST_CNT * 0.75)));
  launchSchedule.forEach(f => bursts.push(new Burst(f)));

  function loop() {
    // Fade-trail (not full clear = motion blur effect on desktop, full clear on mobile)
    if (isMobile) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Launch bursts at their scheduled frame
    bursts.forEach(b => {
      if (!b.sparked && frameNum >= b.delay) { b.spark(); b.sparked = true; }
      b.update();
      b.draw();
    });

    frameNum++;
    if (frameNum < TOTAL_FRAMES + 60) {
      grandFwRaf = requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  loop();
}

/* ─── GRAND EMOJI RAIN ─────────────────────────────────── */
function spawnGrandEmojis() {
  const container = document.getElementById('grandEmojis');
  if (!container) return;
  const EMOJIS = ['🎉', '🎊', '🌸', '💕', '✨', '🎈', '💫', '🎀', '⭐', '🌟', '🩷', '🎂', '🥳', '🎇', '🎆'];
  const count = isMobile ? 20 : 40;
  for (let i = 0; i < count; i++) {
    const e = document.createElement('span');
    e.classList.add('grand-emoji');
    e.textContent = EMOJIS[randInt(0, EMOJIS.length)];
    e.style.cssText = `
      left:${rand(2, 98)}%;
      top:${rand(60, 100)}%;
      --size:${rand(1.1, isMobile ? 2.2 : 2.8)}rem;
      --dur:${rand(2.5, 5)}s;
      --delay:${rand(0, 2.5)}s;
    `;
    container.appendChild(e);
    // Remove after animation finishes to avoid DOM bloat
    setTimeout(() => e.remove(), (parseFloat(e.style.getPropertyValue('--dur')) + parseFloat(e.style.getPropertyValue('--delay'))) * 1000 + 200);
  }
}

/* ─── CONFETTI (celebration section, below overlay) ────── */
function triggerConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  canvas.style.display = 'block';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  const COLORS = ['#f4a7b9', '#e8c77a', '#d4b8e0', '#f7c5d0', '#ff6b9d', '#ffd700', '#a8e6cf', '#ff8b94', '#c3a0d8'];
  const EMOJIS = ['🎉', '🎊', '🌸', '💕', '✨', '🎈', '💫', '🎀'];

  const pieces = Array.from({ length: CONFETTI_COUNT }, () => ({
    x: rand(0, canvas.width), y: rand(-120, -8),
    w: rand(6, 15), h: rand(6, 15),
    angle: rand(0, Math.PI * 2),
    speed: rand(2.5, isMobile ? 5 : 8),
    drift: rand(-1.8, 1.8), spin: rand(-0.13, 0.13),
    color: COLORS[randInt(0, COLORS.length)],
    shape: randInt(0, isMobile ? 2 : 3),  // no emoji shape on mobile (expensive)
    emoji: EMOJIS[randInt(0, EMOJIS.length)],
    opacity: 1,
  }));

  let frame = 0;
  const DURATION = isMobile ? 200 : 320;

  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.speed; p.x += p.drift; p.angle += p.spin;
      if (p.y > canvas.height + 20) { p.y = -10; p.x = rand(0, canvas.width); p.opacity = 1; }
      if (frame > DURATION - 70) p.opacity = Math.max(0, (DURATION - frame) / 70);

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y); ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      if (p.shape === 0) { ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
      else if (p.shape === 1) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
      else { ctx.font = `${p.w + 7}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.emoji, 0, 0); }
      ctx.restore();
    });
    frame++;
    if (frame < DURATION) requestAnimationFrame(loop);
    else { canvas.style.display = 'none'; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  })();
}

/* ─── MUSIC NOTE BURST ─────────────────────────────────── */
function spawnMusicNotes(btn) {
  const notes = ['🎵', '🎶', '🎵', '🎸', '🎺', '🎻', '🎼', '🎹'];
  const rect = btn.getBoundingClientRect();
  const count = isMobile ? 8 : 14;
  for (let i = 0; i < count; i++) {
    const note = document.createElement('span');
    const angle = (i / count) * Math.PI * 2;
    note.textContent = notes[i % notes.length];
    note.style.cssText = `
      position:fixed;left:${rect.left + rect.width / 2}px;top:${rect.top + rect.height / 2}px;
      font-size:${rand(1, 2.2)}rem;pointer-events:none;z-index:9997;
      transition:all ${rand(.6, 1.3)}s cubic-bezier(0.34,1.56,0.64,1);opacity:1;
    `;
    document.body.appendChild(note);
    requestAnimationFrame(() => {
      const dist = rand(50, 140);
      note.style.transform = `translate(${Math.cos(angle) * dist}px,${Math.sin(angle) * dist - 50}px) scale(1.5)`;
      note.style.opacity = '0';
    });
    setTimeout(() => note.remove(), 1500);
  }
}

/* ─── THROTTLE ─────────────────────────────────────────── */
function throttle(fn, delay) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= delay) { last = now; fn.apply(this, args); }
  };
}
