/* ============================================================
   MUKESH KUMAR PORTFOLIO — script.js
   Handles: navbar, mobile menu, particles (desktop only),
            scroll reveal, typewriter, active nav, contact form
   ============================================================ */

'use strict';

const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelectorAll('.nav-links a');
const revealEls = document.querySelectorAll('.reveal');
const contactForm = document.getElementById('contact-form');
const formFeedback = document.getElementById('form-feedback');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width: 768px)').matches;

/* ═══════════════════════════════════════════════════════════════
   1. PARTICLE CANVAS — desktop only, skipped on mobile and
      when the user has requested reduced motion
═══════════════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas || isMobile || prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;
  const PARTICLE_COUNT = 50; // reduced from 90 — same visual density, less CPU
  const LINK_DIST = 90;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 4;
      this.r = Math.random() * 1.3 + 0.4;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = -(Math.random() * 0.4 + 0.12);
      this.alpha = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -4) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,179,57,${this.alpha})`;
      ctx.fill();
    }
  }

  function init() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(232,179,57,${0.05 * (1 - dist / LINK_DIST)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    animId = requestAnimationFrame(loop);
  }

  // Pause the loop when the tab isn't visible — saves battery on laptops
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      loop();
    }
  });

  resize();
  init();
  loop();

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      cancelAnimationFrame(animId);
      resize();
      init();
      loop();
    }, 200);
  });
})();

/* ═══════════════════════════════════════════════════════════════
   2. NAVBAR SCROLL EFFECT + ACTIVE LINK
═══════════════════════════════════════════════════════════════ */
function updateNavbar() {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}

function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 90;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
}

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      updateNavbar();
      updateActiveLink();
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

updateNavbar();
updateActiveLink();

/* ═══════════════════════════════════════════════════════════════
   3. MOBILE MENU TOGGLE
═══════════════════════════════════════════════════════════════ */
function toggleMenu(open) {
  hamburger.classList.toggle('open', open);
  mobileMenu.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
}

hamburger.addEventListener('click', () => {
  toggleMenu(!mobileMenu.classList.contains('open'));
});

document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => toggleMenu(false));
});

document.addEventListener('click', (e) => {
  if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
    toggleMenu(false);
  }
});

/* ═══════════════════════════════════════════════════════════════
   4. SCROLL REVEAL
═══════════════════════════════════════════════════════════════ */
if (prefersReducedMotion) {
  // Skip the animation entirely — show everything immediately
  revealEls.forEach(el => el.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach(el => revealObserver.observe(el));
}

/* ═══════════════════════════════════════════════════════════════
   5. TYPEWRITER EFFECT on HERO NAME
═══════════════════════════════════════════════════════════════ */
(function typewriterEffect() {
  const nameEl = document.getElementById('hero-name');
  if (!nameEl) return;

  if (prefersReducedMotion) {
    nameEl.textContent = 'Mukesh Kumar';
    return;
  }

  const fullText = 'Mukesh Kumar';
  let index = 0;

  const cursor = document.createElement('span');
  cursor.className = 'cursor-blink';
  nameEl.textContent = '';
  nameEl.appendChild(cursor);

  function tick() {
    if (index <= fullText.length) {
      nameEl.textContent = fullText.slice(0, index);
      nameEl.appendChild(cursor);
      index++;
      setTimeout(tick, 75);
    }
  }

  setTimeout(tick, 450);
})();

/* ═══════════════════════════════════════════════════════════════
   6. STAT COUNTER ANIMATION
═══════════════════════════════════════════════════════════════ */
(function animateCounters() {
  if (prefersReducedMotion) return; // numbers already show final values in HTML

  const stats = [
    { selector: '.stat-card:nth-child(1) .stat-number', target: 8.909, decimals: 3 },
    { selector: '.stat-card:nth-child(2) .stat-number', target: 2, decimals: 0, suffix: '+' },
  ];

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const targetVal = parseFloat(el.dataset.target);
      const decimals = parseInt(el.dataset.decimals, 10) || 0;
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const duration = 1100;
      const step = 16;
      const increment = targetVal / (duration / step);

      const timer = setInterval(() => {
        current = Math.min(current + increment, targetVal);
        el.textContent = current.toFixed(decimals) + suffix;
        if (current >= targetVal) clearInterval(timer);
      }, step);

      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(({ selector, target, decimals, suffix = '' }) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.dataset.target = target;
    el.dataset.decimals = decimals;
    el.dataset.suffix = suffix;
    counterObserver.observe(el);
  });
})();

/* ═══════════════════════════════════════════════════════════════
   7. CONTACT FORM (Web3Forms API)
═══════════════════════════════════════════════════════════════ */
if (contactForm) {
  const submitBtn  = document.getElementById('btn-submit');
  const submitText = document.getElementById('submit-text');

  // Create spinner element once, reuse it
  const spinner = document.createElement('span');
  spinner.className = 'btn-spinner';
  spinner.setAttribute('aria-hidden', 'true');

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    if (isLoading) {
      submitText.textContent = 'Sending…';
      submitBtn.insertBefore(spinner, submitText);
    } else {
      submitText.textContent = 'Send message';
      if (spinner.parentNode === submitBtn) submitBtn.removeChild(spinner);
    }
  }

  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name    = document.getElementById('form-name').value.trim();
    const email   = document.getElementById('form-email').value.trim();
    const subject = document.getElementById('form-subject').value.trim();
    const message = document.getElementById('form-message').value.trim();

    // ─ Validation ────────────────────────────────────────────────────
    if (!name || !email || !subject || !message) {
      showFeedback('Please fill in all fields.', '#e8b339');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFeedback('Please enter a valid email address.', '#e8b339');
      return;
    }

    // ─ Loading state ────────────────────────────────────────────────
    setLoading(true);

    // ─ Build payload from FormData ──────────────────────────────────
    const payload = Object.fromEntries(new FormData(contactForm));

    try {
      const res  = await fetch('https://api.web3forms.com/submit', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body   : JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showFeedback("Message sent! I'll get back to you soon.", '#6fae6f');
        contactForm.reset();
      } else {
        throw new Error(data.message || 'API error');
      }
    } catch (_err) {
      showFeedback(
        'Something went wrong. Please email me directly at mukesh_cse_27@msit.in or mukesh5112002@gmail.com',
        '#e8b339'
      );
    } finally {
      // Restore button regardless of success or failure
      setLoading(false);
    }
  });
}

function showFeedback(msg, color) {
  formFeedback.textContent = msg;
  formFeedback.style.color = color;
  formFeedback.style.display = 'block';
  setTimeout(() => { formFeedback.style.display = 'none'; }, 6000);
}

/* ═══════════════════════════════════════════════════════════════
   8. SMOOTH SCROLL for anchor links
═══════════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const navH = navbar.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navH - 10;
    window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
});

console.log('%cHey! Portfolio built by Mukesh Kumar', 'color:#e8b339;font-size:13px;font-weight:bold;');