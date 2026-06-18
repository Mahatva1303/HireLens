/* ============================================================
   HIRELENS — script.js
   ============================================================ */

// ── Hide placeholder overlays once a video loads ──────────────
document.querySelectorAll('.media-wrapper video').forEach((video) => {
  const wrapper = video.closest('.media-wrapper');
  const placeholder = wrapper ? wrapper.querySelector('.media-placeholder') : null;

  if (!placeholder) return;

  // If the video source loads successfully, hide the placeholder
  video.addEventListener('loadeddata', () => {
    placeholder.style.display = 'none';
  });

  // If the video errors (e.g. file not found), keep placeholder visible
  video.addEventListener('error', () => {
    placeholder.style.display = 'flex';
  });

  // Force autoplay (some browsers are cautious)
  video.play().catch(() => {
    // Autoplay blocked — still silent, no controls shown
  });
});


// ── Scroll-triggered fade-in for feature cards ────────────────
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.feature-card, .feature-box, .step-card').forEach((el) => {
  el.classList.add('fade-up');
  observer.observe(el);
});

// ── Hero text stagger on load ──────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll(
    '.hero__badge, .hero__heading, .hero__sub, .btn-primary'
  );
  items.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity .55s ease ${i * 0.1 + 0.1}s, transform .55s ease ${i * 0.1 + 0.1}s`;
    // Trigger reflow then animate
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  });
});


// ── Scroll animation for How It Works cards ─────────────

document.querySelectorAll('.step-card').forEach((el) => {
  observer.observe(el);
});


