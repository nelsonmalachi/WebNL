/* =========================================================================
   Hauptskript fuer lankanesan.ch
   Keine Abhaengigkeiten, keine Build-Kette. Aufbau:
   #region Konstanten / Theme / Sprache / Navigation / Scroll / Init
   ========================================================================= */
(function () {
  'use strict';

  /* #region Konstanten --------------------------------------------------- */
  var STORAGE_THEME = 'nl-theme';
  var STORAGE_LANG = 'nl-lang';
  var root = document.documentElement;
  var dict = window.NL_I18N || { de: {}, en: {} };
  /* #endregion */

  /* #region Hilfsfunktionen ---------------------------------------------- */

  /** Liest einen Wert aus dem localStorage, ohne bei Blockierung zu scheitern. */
  function readStore(key) {
    try { return window.localStorage.getItem(key); } catch (error) { return null; }
  }

  /** Schreibt einen Wert in den localStorage, ohne bei Blockierung zu scheitern. */
  function writeStore(key, value) {
    try { window.localStorage.setItem(key, value); } catch (error) { /* bewusst ignoriert */ }
  }

  function selectAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }
  /* #endregion */

  /* #region Theme -------------------------------------------------------- */

  /** Setzt das Farbschema und passt die theme-color-Angabe des Browsers an. */
  function applyTheme(theme) {
    root.dataset.theme = theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) { meta.setAttribute('content', theme === 'light' ? '#f6f8fc' : '#0b0f16'); }
  }

  function initTheme() {
    var toggle = document.getElementById('themeToggle');
    if (!toggle) { return; }

    applyTheme(root.dataset.theme === 'light' ? 'light' : 'dark');

    toggle.addEventListener('click', function () {
      var next = root.dataset.theme === 'light' ? 'dark' : 'light';
      applyTheme(next);
      writeStore(STORAGE_THEME, next);
    });
  }
  /* #endregion */

  /* #region Sprache ------------------------------------------------------ */

  /**
   * Uebersetzt alle markierten Elemente.
   * data-i18n      - Textinhalt
   * data-i18n-html - HTML-Inhalt aus dem eigenen Woerterbuch (keine Fremddaten)
   * data-i18n-attr - Attributliste im Format "attribut:schluessel", kommagetrennt
   */
  function applyLanguage(lang) {
    var table = dict[lang] || dict.de;
    root.lang = lang;

    selectAll('[data-i18n]').forEach(function (node) {
      var value = table[node.getAttribute('data-i18n')];
      if (typeof value === 'string') { node.textContent = value; }
    });

    selectAll('[data-i18n-html]').forEach(function (node) {
      var value = table[node.getAttribute('data-i18n-html')];
      if (typeof value === 'string') { node.innerHTML = value; }
    });

    selectAll('[data-i18n-attr]').forEach(function (node) {
      node.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var parts = pair.split(':');
        if (parts.length !== 2) { return; }
        var value = table[parts[1].trim()];
        if (typeof value === 'string') { node.setAttribute(parts[0].trim(), value); }
      });
    });

    if (table['meta.title']) { document.title = table['meta.title']; }
    var description = document.querySelector('meta[name="description"]');
    if (description && table['meta.description']) {
      description.setAttribute('content', table['meta.description']);
    }

    var label = document.getElementById('langLabel');
    if (label) { label.textContent = lang === 'de' ? 'EN' : 'DE'; }
  }

  function initLanguage() {
    var toggle = document.getElementById('langToggle');
    var stored = readStore(STORAGE_LANG);
    var initial = stored === 'en' || stored === 'de' ? stored : 'de';

    applyLanguage(initial);

    if (!toggle) { return; }
    toggle.addEventListener('click', function () {
      var next = root.lang === 'de' ? 'en' : 'de';
      applyLanguage(next);
      writeStore(STORAGE_LANG, next);
    });
  }
  /* #endregion */

  /* #region Navigation --------------------------------------------------- */
  function initMenu() {
    var button = document.getElementById('menuToggle');
    var nav = document.getElementById('primaryNav');
    var header = document.getElementById('siteHeader');
    if (!button || !nav) { return; }

    /** Haelt Navigation, Schaltflaeche und Kopfzeile im selben Zustand. */
    function setMenu(open) {
      nav.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (header) { header.classList.toggle('is-menu-open', open); }
    }

    function closeMenu() { setMenu(false); }

    button.addEventListener('click', function () {
      setMenu(!nav.classList.contains('is-open'));
    });

    nav.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') { closeMenu(); }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { closeMenu(); }
    });

    // Breakpoint aus dem Stylesheet spiegeln, statt eine Zahl doppelt zu pflegen
    var mobileQuery = window.matchMedia('(max-width: 900px)');
    var onChange = function (event) { if (!event.matches) { closeMenu(); } };
    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener('change', onChange);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(onChange);
    }
  }

  /** Markiert den Navigationspunkt des Abschnitts, der gerade sichtbar ist. */
  function initScrollSpy() {
    var links = selectAll('.nav a[href^="#"]');
    var sections = links
      .map(function (link) { return document.querySelector(link.getAttribute('href')); })
      .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) { return; }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        links.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  }
  /* #endregion */

  /* #region Scroll ------------------------------------------------------- */

  /** Blendet Inhalte beim Scrollen ein - einmalig pro Element. */
  function initReveal() {
    var items = selectAll('.reveal');

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (item) { item.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, self) {
      entries.forEach(function (entry, index) {
        if (!entry.isIntersecting) { return; }
        var delay = Math.min(index, 5) * 70;
        window.setTimeout(function () { entry.target.classList.add('is-visible'); }, delay);
        self.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });

    items.forEach(function (item) { observer.observe(item); });
  }

  /** Setzt einen Rahmen unter den Header, sobald die Seite gescrollt wurde. */
  function initStickyHeader() {
    var header = document.getElementById('siteHeader');
    if (!header) { return; }

    var ticking = false;
    function update() {
      header.classList.toggle('is-stuck', window.scrollY > 12);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) { return; }
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    update();
  }
  /* #endregion */

  /* #region Init --------------------------------------------------------- */
  function init() {
    var year = document.getElementById('footerYear');
    if (year) { year.textContent = String(new Date().getFullYear()); }

    initTheme();
    initLanguage();
    initMenu();
    initScrollSpy();
    initReveal();
    initStickyHeader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  /* #endregion */
})();
