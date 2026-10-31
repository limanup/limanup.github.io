/* Selected-work carousel + footer year. No dependencies. */

(function () {
  'use strict';

  /* ---------- theme ---------- */

  var root = document.documentElement;
  var toggle = document.querySelector('[data-theme-toggle]');

  if (toggle) {
    var icon = toggle.querySelector('[data-theme-icon]');

    var apply = function (theme) {
      var dark = theme === 'dark';
      root.setAttribute('data-theme', dark ? 'dark' : 'light');
      if (icon) icon.textContent = dark ? '\u2600\uFE0F' : '\uD83C\uDF19';
      toggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
      toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    };

    apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      try {
        localStorage.setItem('theme', next);
      } catch (e) {}
    });
  }

  /* ---------- footer year ---------- */

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- header scroll ---------- */
  var header = document.querySelector('.header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- carousel ---------- */

  var carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;

  var track = carousel.querySelector('[data-track]');
  var slides = Array.prototype.slice.call(track.children);
  var prevBtn = carousel.querySelector('[data-prev]');
  var nextBtn = carousel.querySelector('[data-next]');
  var dotsWrap = carousel.querySelector('[data-dots]');

  if (!track || slides.length === 0) return;

  var index = 0;
  var dots = [];

  function goTo(next, announce) {
    index = Math.max(0, Math.min(slides.length - 1, next));

    track.style.transform = 'translate3d(' + -index * 100 + '%, 0, 0)';

    dots.forEach(function (dot, i) {
      var active = i === index;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
      dot.tabIndex = active ? 0 : -1;
    });

    slides.forEach(function (slide, i) {
      slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      // Keep off-screen slides out of the tab order.
      Array.prototype.forEach.call(slide.querySelectorAll('a, button'), function (el) {
        el.tabIndex = i === index ? 0 : -1;
      });
    });

    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === slides.length - 1;

    if (announce) {
      var live = carousel.querySelector('[data-live]');
      if (live) live.textContent = 'Slide ' + (index + 1) + ' of ' + slides.length;
    }
  }

  /* dots */

  if (dotsWrap) {
    slides.forEach(function (slide, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Project ' + (i + 1) + ' of ' + slides.length);
      dot.addEventListener('click', function () {
        goTo(i, true);
      });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });
  }

  /* buttons */

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      goTo(index - 1, true);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      goTo(index + 1, true);
    });
  }

  /* keyboard: only when focus is inside the carousel */

  carousel.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(index - 1, true);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(index + 1, true);
    }
  });

  /* touch swipe */

  var startX = 0;
  var startY = 0;
  var tracking = false;

  carousel.addEventListener(
    'touchstart',
    function (event) {
      if (event.touches.length !== 1) return;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      tracking = true;
    },
    { passive: true }
  );

  carousel.addEventListener(
    'touchend',
    function (event) {
      if (!tracking) return;
      tracking = false;

      var touch = event.changedTouches[0];
      var dx = touch.clientX - startX;
      var dy = touch.clientY - startY;

      // Ignore mostly-vertical gestures so the page can still scroll.
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;

      goTo(dx < 0 ? index + 1 : index - 1, true);
    },
    { passive: true }
  );

  goTo(0, false);

  /* ---------- menu ---------- */
  var menuBtn = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('.nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.addEventListener('click', function (e) {
    if (nav && nav.classList.contains('is-open')) {
      if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
        nav.classList.remove('is-open');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
      }
    }
  });
})();
