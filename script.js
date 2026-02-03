// script.js — clean, shared logic for all pages

(() => {
  // ---------- Helpers ----------
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ---------- Elements (may not exist on every page) ----------
  const sidebar     = $('#sidebar');
  const burger      = $('#burger');
  const menu        = $('#menu');
  const themeBtn    = $('#themeBtn');   // optional text button
  const themeSwitch = $('#switch');     // the Uiverse checkbox
  const yearEl      = $('#year');
  const toTop       = $('#toTop');

  // ---------- Footer year ----------
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ---------- Mobile sidebar / burger ----------
  if (burger && sidebar && menu) {
    burger.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(isOpen));
    });

    // close sidebar when clicking a menu item (mobile)
    menu.addEventListener('click', (e) => {
      const link = e.target.closest('.menu-item');
      if (!link) return;
      if (window.innerWidth <= 900 && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---------- Theme handling ----------
  const THEME_KEY = 'portfolio-theme';

  const prefersDark = () =>
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const applyTheme = (theme, { persist = true } = {}) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeBtn) themeBtn.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    if (themeSwitch) themeSwitch.checked = theme === 'light';
    if (persist) localStorage.setItem(THEME_KEY, theme);
  };

  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme || (prefersDark() ? 'dark' : 'light'), { persist: false });

  // toggle via optional button
  themeBtn?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });

  // toggle via big round switch
  themeSwitch?.addEventListener('change', () =>
    applyTheme(themeSwitch.checked ? 'light' : 'dark')
  );

  // listen for OS theme change only if user hasn't chosen manually
  try {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener?.('change', (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light', { persist: false });
      }
    });
  } catch {
    // ignore
  }

  // ---------- Back to top ----------
  if (toTop) {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      toTop.style.display = y > 120 ? 'grid' : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();  // end of IIFE core logic



// ================== GSAP animations (run once GSAP is loaded) ==================
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  // Hero title
  gsap.from('.about-hero .title', {
    y: 40,
    opacity: 0,
    duration: 1,
    delay: 0.15,
    ease: 'power3.out'
  });

  // Hero subtitle
  gsap.from('.about-hero .subtitle', {
    y: 20,
    opacity: 0,
    duration: 0.9,
    delay: 0.25,
    ease: 'power3.out'
  });

  // Hero image
  gsap.from('.about-hero .imag img', {
    scrollTrigger: {
      trigger: '.about-hero',
      start: 'top 85%',
    },
    x: -40,
    opacity: 0,
    duration: 1,
    ease: 'power2.out'
  });

  // About section image + text
  gsap.from('.about-main .image img', {
    scrollTrigger: {
      trigger: '.about-main .image',
      start: 'top 80%',
    },
    x: -40,
    opacity: 0,
    duration: 1,
    ease: 'power2.out'
  });

  gsap.from('.about-main .text', {
    scrollTrigger: {
      trigger: '.about-main .text',
      start: 'top 80%',
    },
    x: 40,
    opacity: 0,
    duration: 1,
    ease: 'power2.out'
  });

  // Skills bars – animate width based on aria-valuenow
  gsap.utils.toArray('.skill-per').forEach((bar) => {
    const el = bar;
    const raw =
      el.getAttribute('aria-valuenow') ||
      el.dataset.percentage ||
      (el.querySelector('.tooltip')?.textContent || '').replace('%', '');
    const percent = Number(raw) || 0;

    // start with 0 width
    gsap.set(el, { width: '0%', opacity: 1 });

    gsap.to(el, {
      width: percent + '%',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      duration: 1.2,
      ease: 'power2.out',
    });
  });

  // Cards (projects, AI cards, generic .card)
  gsap.utils.toArray('.card').forEach((card) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0,
      y: 30,
      scale: 0.97,
      rotateX: 3,
      duration: 0.8,
      ease: 'power2.out',
    });
  });
}



// ================== Contact form (Formspree) ==================
document.addEventListener('DOMContentLoaded', () => {
  const form       = document.querySelector('#contactForm');
  if (!form) return;

  const statusMsg  = document.querySelector('#formStatus');
  const successMsg = document.querySelector('[data-formspree-success]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (statusMsg) {
      statusMsg.textContent = 'Sending...';
    }
    if (successMsg) {
      successMsg.style.display = 'none';
    }

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method || 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        if (successMsg) successMsg.style.display = 'block';
        if (statusMsg) statusMsg.textContent = '';
        form.reset();
      } else {
        let msg = 'Υπήρξε πρόβλημα. Προσπάθησε ξανά.';
        try {
          const data = await response.json();
          if (data.error) msg = data.error;
        } catch {
          // ignore
        }
        if (statusMsg) statusMsg.textContent = msg;
        if (successMsg) successMsg.style.display = 'none';
      }
    } catch (err) {
      if (statusMsg) {
        statusMsg.textContent = 'Υπήρξε σφάλμα αποστολής. Προσπάθησε ξανά.';
      }
      if (successMsg) successMsg.style.display = 'none';
    }
  });
});

// Skills meter reveal (safe)
(() => {
  const meters = document.querySelectorAll(".meter");
  if (!meters.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("on");
    });
  }, { threshold: 0.25 });

  meters.forEach(m => io.observe(m));
})();
