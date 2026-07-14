// ===== Page fade-in =====
document.documentElement.style.scrollBehavior = document.documentElement.style.scrollBehavior;
window.addEventListener('load', () => {
  requestAnimationFrame(() => document.body.classList.add('loaded'));
});
// Fallback in case 'load' already fired
if (document.readyState === 'complete') {
  document.body.classList.add('loaded');
}

document.addEventListener('DOMContentLoaded', () => {
  // ===== Scroll progress bar =====
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progressBar.style.width = (isFinite(scrolled) ? scrolled : 0) + '%';
  }, {passive:true});

  // ===== Decorative blobs + cursor glow in hero / page-banner =====
  document.querySelectorAll('.hero, .page-banner').forEach(section => {
    const layer = document.createElement('div');
    layer.className = 'blob-layer';
    layer.innerHTML = '<div class="blob blob-amber"></div><div class="blob blob-cobalt"></div>';
    section.insertBefore(layer, section.firstChild);
  });
  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    heroEl.insertBefore(glow, heroEl.firstChild);
    heroEl.addEventListener('mousemove', e => {
      const rect = heroEl.getBoundingClientRect();
      glow.style.setProperty('--gx', ((e.clientX - rect.left) / rect.width * 100) + '%');
      glow.style.setProperty('--gy', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
  }

  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.navlinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  // Highlight active nav link based on current page
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navlinks a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // ===== Before/after slider (home page only) =====
  const frame = document.getElementById('sliderFrame');
  if (frame) {
    const paneOld = document.getElementById('paneOld');
    const handle = document.getElementById('dividerHandle');
    const range = document.getElementById('sliderRange');

    function setSplit(pct) {
      pct = Math.max(0, Math.min(100, pct));
      paneOld.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left = pct + '%';
      range.value = pct;
    }
    setSplit(50);
    range.addEventListener('input', e => setSplit(parseFloat(e.target.value)));

    let dragging = false;
    handle.addEventListener('mousedown', () => dragging = true);
    window.addEventListener('mouseup', () => dragging = false);
    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      const rect = frame.getBoundingClientRect();
      setSplit(((e.clientX - rect.left) / rect.width) * 100);
    });
    handle.addEventListener('touchstart', () => dragging = true, {passive:true});
    window.addEventListener('touchend', () => dragging = false);
    window.addEventListener('touchmove', e => {
      if (!dragging) return;
      const rect = frame.getBoundingClientRect();
      const touch = e.touches[0];
      setSplit(((touch.clientX - rect.left) / rect.width) * 100);
    }, {passive:true});
  }

  // ===== Scroll reveal =====
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, {threshold: 0.1});
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // ===== FAQ accordion =====
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        a.style.maxHeight = null;
      } else {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  // ===== Currency toggle (INR default, USD approx alternate) =====
  const currencyButtons = document.querySelectorAll('.currency-toggle button');
  const priceEls = document.querySelectorAll('[data-inr]');
  function applyCurrency(cur) {
    priceEls.forEach(el => {
      el.textContent = cur === 'usd' ? el.dataset.usd : el.dataset.inr;
    });
    currencyButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.currency === cur));
  }
  currencyButtons.forEach(btn => {
    btn.addEventListener('click', () => applyCurrency(btn.dataset.currency));
  });
  if (currencyButtons.length) applyCurrency('inr');
});
