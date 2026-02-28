/* ============================================================
   BIRTHDAY WEBSITE — script.js
   Particles · Cursor · Scroll Reveals · Confetti · Cake
============================================================ */

'use strict';

/* ─── UTILS ────────────────────────────────────────── */
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max));

/* ─── CURSOR TRAIL ─────────────────────────────────── */
(function initCursor() {
  const cursor = document.getElementById('cursorTrail');
  if (!cursor) return;
  let mx = -200, my = -200;
  let cx = -200, cy = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });

  function animateCursor() {
    cx += (mx - cx) * 0.15;
    cy += (my - cy) * 0.15;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Spawn small sparkle dots on move
  document.addEventListener('mousemove', throttle(spawnCursorSpark, 60));

  function spawnCursorSpark(e) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position:fixed; pointer-events:none; z-index:9997;
      width:5px; height:5px; border-radius:50%;
      background:${['#f4a7b9','#e8c77a','#d4b8e0','#fff'][randInt(0,4)]};
      left:${e.clientX}px; top:${e.clientY}px;
      transform:translate(-50%,-50%);
      box-shadow:0 0 8px 2px currentColor;
      transition: opacity 0.6s ease, transform 0.6s ease;
      opacity:0.85;
    `;
    document.body.appendChild(dot);
    requestAnimationFrame(() => {
      dot.style.transform = `translate(${rand(-20,20)}px, ${rand(-30,10)}px) scale(0)`;
      dot.style.opacity = '0';
    });
    setTimeout(() => dot.remove(), 700);
  }
})();

/* ─── BOKEH PARTICLE CANVAS ─────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#f4a7b9', '#e8c77a', '#d4b8e0', '#f7c5d0', '#ffffff', '#fff6b0'];
  const particles = [];

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x     = rand(0, canvas.width);
      this.y     = init ? rand(0, canvas.height) : rand(canvas.height * 0.9, canvas.height + 20);
      this.r     = rand(1.5, 6);
      this.alpha = rand(0.05, 0.45);
      this.vx    = rand(-0.2, 0.2);
      this.vy    = rand(-0.5, -0.15);
      this.color = COLORS[randInt(0, COLORS.length)];
      this.life  = 0;
      this.maxLife = rand(160, 320);
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -30) this.reset();
    }
    draw() {
      const fade = Math.min(this.life / 40, 1) * Math.min((this.maxLife - this.life) / 40, 1);
      ctx.save();
      ctx.globalAlpha = this.alpha * fade;
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 2.5);
      g.addColorStop(0, this.color);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ─── SPARKLES (fixed positions in hero) ─────────────── */
(function initSparkles() {
  const container = document.getElementById('sparklesContainer');
  if (!container) return;

  for (let i = 0; i < 28; i++) {
    const s = document.createElement('div');
    s.classList.add('sparkle');
    const size = rand(3, 9);
    s.style.cssText = `
      left:${rand(5, 95)}%;
      top:${rand(5, 95)}%;
      width:${size}px;
      height:${size}px;
      --dur:${rand(2.5, 6)}s;
      --delay:${rand(0, 5)}s;
    `;
    container.appendChild(s);
  }
})();

/* ─── BALLOONS ─────────────────────────────────────── */
(function initBalloons() {
  const container = document.getElementById('balloonsContainer');
  if (!container) return;
  const emojis = ['🎈','🎀','🌸','💕','✨','🎊','💫','🌷'];

  for (let i = 0; i < 10; i++) {
    const b = document.createElement('div');
    b.classList.add('balloon');
    b.textContent = emojis[i % emojis.length];
    b.style.cssText = `
      left:${rand(3, 93)}%;
      bottom:${rand(5, 80)}%;
      --dur:${rand(5, 11)}s;
      --delay:${rand(0, 8)}s;
      font-size:${rand(1.8, 3.8)}rem;
    `;
    container.appendChild(b);
  }
})();

/* ─── FLOATING HEARTS ──────────────────────────────── */
(function initFloatingHearts() {
  const container = document.getElementById('floatingHearts');
  if (!container) return;
  const icons = ['💕','🌸','💗','🌷','💖','✨','🩷'];

  for (let i = 0; i < 18; i++) {
    const h = document.createElement('span');
    h.classList.add('fheart');
    h.textContent = icons[i % icons.length];
    h.style.cssText = `
      left:${rand(0, 98)}%;
      top:${rand(10, 90)}%;
      --size:${rand(0.9, 2.2)}rem;
      --dur:${rand(5, 10)}s;
      --delay:${rand(0, 9)}s;
    `;
    container.appendChild(h);
  }
})();

/* ─── FLOATING STARS ────────────────────────────────── */
(function initFloatingStars() {
  const container = document.getElementById('floatingStars');
  if (!container) return;
  const icons = ['✨','⭐','🌟','💫','🪄','🌸'];

  for (let i = 0; i < 20; i++) {
    const s = document.createElement('span');
    s.classList.add('fstar');
    s.textContent = icons[i % icons.length];
    s.style.cssText = `
      left:${rand(2, 97)}%;
      top:${rand(5, 95)}%;
      --size:${rand(0.8, 1.8)}rem;
      --dur:${rand(3, 8)}s;
      --delay:${rand(0, 7)}s;
    `;
    container.appendChild(s);
  }
})();

/* ─── SCROLL REVEAL (Intersection Observer) ─────────── */
(function initScrollReveal() {
  const items = document.querySelectorAll('.reveal-up, .reveal-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  items.forEach(el => observer.observe(el));
})();

/* ─── PARALLAX (hero photo on scroll) ──────────────── */
(function initParallax() {
  const frame = document.querySelector('.hero-photo-frame');
  if (!frame) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        frame.style.transform = `translateY(${y * 0.3}px)`;
        ticking = false;
      });
      ticking = true;
    }
  });
})();

/* ─── BALLOON PARALLAX ON SCROLL ───────────────────── */
(function initBalloonParallax() {
  const balloons = document.querySelectorAll('.balloon');
  if (!balloons.length) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    balloons.forEach((b, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      b.style.transform = `translateY(${-y * 0.12 * dir}px)`;
    });
  });
})();

/* ─── CAKE CANDLE INTERACTION ───────────────────────── */
(function initCake() {
  const candles = document.querySelectorAll('.candle');
  if (!candles.length) return;

  let allLit = false;

  candles.forEach((candle, i) => {
    candle.addEventListener('click', () => {
      if (candle.classList.contains('lit')) {
        candle.classList.remove('lit');
        candle.dataset.lit = 'false';
      } else {
        candle.classList.add('lit');
        candle.dataset.lit = 'true';
      }
      checkAllLit();
    });
  });

  function lightCandlesSequentially() {
    candles.forEach((c, i) => {
      setTimeout(() => {
        c.classList.add('lit');
        c.dataset.lit = 'true';
      }, i * 200);
    });
    setTimeout(checkAllLit, candles.length * 200 + 100);
  }

  function checkAllLit() {
    const litCount = [...candles].filter(c => c.classList.contains('lit')).length;
    if (litCount === candles.length && !allLit) {
      allLit = true;
      setTimeout(triggerConfetti, 300);
    } else if (litCount < candles.length) {
      allLit = false;
    }
  }

  // Auto-light candles when section comes into view
  const cakeSection = document.getElementById('celebrate');
  if (cakeSection) {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        lightCandlesSequentially();
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(cakeSection);
  }
})();

/* ─── SURPRISE BUTTON + CONFETTI ────────────────────── */
(function initSurprise() {
  const btn    = document.getElementById('surpriseBtn');
  const canvas = document.getElementById('confettiCanvas');
  if (!btn || !canvas) return;

  btn.addEventListener('click', triggerConfetti);
})();

function triggerConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;

  canvas.style.display = 'block';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const ctx = canvas.getContext('2d');
  const COLORS = ['#f4a7b9','#e8c77a','#d4b8e0','#f7c5d0','#ff6b9d','#ffd700','#a8e6cf','#ff8b94','#c3a0d8'];
  const EMOJIS = ['🎉','🎊','🌸','💕','✨','🎈','💫','🎀'];

  const pieces = [];
  const count  = 200;

  class Piece {
    constructor() {
      this.x    = rand(0, canvas.width);
      this.y    = rand(-100, -10);
      this.w    = rand(6, 14);
      this.h    = rand(6, 14);
      this.angle  = rand(0, Math.PI * 2);
      this.speed  = rand(2, 7);
      this.drift  = rand(-1.5, 1.5);
      this.spin   = rand(-0.12, 0.12);
      this.color  = COLORS[randInt(0, COLORS.length)];
      this.shape  = randInt(0, 3); // 0:rect, 1:circle, 2:emoji
      this.emoji  = EMOJIS[randInt(0, EMOJIS.length)];
      this.opacity = 1;
    }
    update() {
      this.y     += this.speed;
      this.x     += this.drift;
      this.angle += this.spin;
      if (this.y > canvas.height + 20) {
        this.y = -10;
        this.x = rand(0, canvas.width);
        this.opacity = 1;
      }
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = this.color;

      if (this.shape === 0) {
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
      } else if (this.shape === 1) {
        ctx.beginPath();
        ctx.arc(0, 0, this.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.font = `${this.w + 6}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, 0, 0);
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < count; i++) pieces.push(new Piece());

  let frame = 0;
  let rafId;
  const DURATION = 280;

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      if (frame > DURATION - 60) {
        p.opacity = Math.max(0, (DURATION - frame) / 60);
      }
      p.update();
      p.draw();
    });
    frame++;
    if (frame < DURATION) {
      rafId = requestAnimationFrame(loop);
    } else {
      canvas.style.display = 'none';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  loop();

  // Spawn music-note emoji particles around the button
  const btn = document.getElementById('surpriseBtn');
  if (btn) {
    const notes = ['🎵','🎶','🎵','🎸','🎺','🎻'];
    for (let i = 0; i < 12; i++) {
      const note = document.createElement('span');
      const rect = btn.getBoundingClientRect();
      note.textContent = notes[i % notes.length];
      const angle = (i / 12) * Math.PI * 2;
      const dist  = rand(40, 120);
      note.style.cssText = `
        position:fixed;
        left:${rect.left + rect.width / 2}px;
        top:${rect.top + rect.height / 2}px;
        font-size:${rand(1, 2)}rem;
        pointer-events:none;
        z-index:9997;
        transition: all ${rand(0.6, 1.2)}s cubic-bezier(0.34,1.56,0.64,1);
        opacity:1;
      `;
      document.body.appendChild(note);
      requestAnimationFrame(() => {
        note.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 40}px) scale(1.5)`;
        note.style.opacity = '0';
      });
      setTimeout(() => note.remove(), 1400);
    }
  }
}

/* ─── THROTTLE HELPER ────────────────────────────────── */
function throttle(fn, delay) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/* ─── SMOOTH SCROLL FOR SCROLL CUE ────────────────────── */
(function initScrollCue() {
  const scrollCue = document.querySelector('.hero-scroll-cue');
  if (!scrollCue) return;
  scrollCue.style.cursor = 'pointer';
  scrollCue.addEventListener('click', () => {
    const memories = document.getElementById('memories');
    if (memories) memories.scrollIntoView({ behavior: 'smooth' });
  });
})();

/* ─── SECTION TRANSITION PARALLAX ──────────────────── */
(function initTransitionParallax() {
  const transitions = document.querySelectorAll('.section-transition');
  if (!transitions.length) return;
  window.addEventListener('scroll', () => {
    transitions.forEach(t => {
      const rect = t.getBoundingClientRect();
      const progress = 1 - (rect.top + rect.height) / (window.innerHeight + rect.height);
      const el = t.querySelector('.lens-flare, .light-leak');
      if (el) {
        el.style.opacity = Math.sin(progress * Math.PI) * 0.8;
      }
    });
  });
})();
