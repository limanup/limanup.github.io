/* Theme, header, selected-work tabs, footer year. No dependencies. */

(function () {
  'use strict';

  /* ---------- theme ---------- */
  /* Follows the OS setting, live. The toggle overrides it for this tab only;
     the next OS change (or a new tab) goes back to following the system. */

  var root = document.documentElement;
  var toggle = document.querySelector('[data-theme-toggle]');
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function systemTheme() {
    return mq && mq.matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    var dark = theme === 'dark';
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (themeMeta) themeMeta.setAttribute('content', dark ? '#121417' : '#faf7f2');
    if (toggle) {
      var icon = toggle.querySelector('[data-theme-icon]');
      if (icon) icon.textContent = dark ? '\u2600\uFE0F' : '\uD83C\uDF19';
      toggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
      toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  applyTheme(root.getAttribute('data-theme') || systemTheme());

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try {
        sessionStorage.setItem('theme', next);
      } catch (e) {}
    });
  }

  if (mq) {
    var onSystemChange = function () {
      try {
        sessionStorage.removeItem('theme');
      } catch (e) {}
      applyTheme(systemTheme());
    };
    if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
    else if (mq.addListener) mq.addListener(onSystemChange);
  }

  /* ---------- footer year ---------- */

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- header: scroll style + nav that collapses only when it must ---------- */

  var header = document.querySelector('.header');
  var nav = document.querySelector('.nav');
  var menuBtn = document.querySelector('[data-menu-toggle]');

  function closeMenu() {
    if (nav) nav.classList.remove('is-open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }

  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Try the full single-row nav first; if the header overflows, go compact.
  function fitNav() {
    if (!header || !nav) return;
    header.classList.remove('is-compact');
    var overflows = header.scrollWidth > header.clientWidth + 1;
    header.classList.toggle('is-compact', overflows);
    if (!overflows) closeMenu();
  }

  var fitQueued = false;
  function queueFit() {
    if (fitQueued) return;
    fitQueued = true;
    requestAnimationFrame(function () {
      fitQueued = false;
      fitNav();
    });
  }

  fitNav();
  window.addEventListener('resize', queueFit);
  window.addEventListener('load', queueFit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueFit);

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) closeMenu();
    });

    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !menuBtn.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
        menuBtn.focus();
      }
    });
  }

  /* ---------- selected work (tabs) ---------- */

  var explorer = document.querySelector('[data-explorer]');
  if (explorer) {
    var tabs = Array.prototype.slice.call(explorer.querySelectorAll('[role="tab"]'));
    var tablist = explorer.querySelector('[role="tablist"]');

    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) {
          panel.hidden = !on;
          panel.classList.toggle('is-active', on);
        }
      });
      if (focus) tab.focus();
    };

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        select(tab, false);
      });
    });

    tablist.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var next = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        select(next, true);
      }
    });
  }
})();
