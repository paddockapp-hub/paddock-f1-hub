/* ===== app.js — Flawless Mobile Menu Event Controller ===== */

var App = {
  currentLang: 'en',
  currentPage: null,
  sessionId: null,

  init: function() {
    this.initSession();
    window.addEventListener('hashchange', function() { App.navigate(); });
    App.navigate();
    App.setupHamburger();
    App.startDwellTimePing();
    
    // Handle initial language from URL if present
    if (window.location.search.includes('lang=ko')) {
      this.currentLang = 'ko';
    } else if (window.location.search.includes('lang=en')) {
      this.currentLang = 'en';
    }
  },

  initSession: function() {
    this.sessionId = sessionStorage.getItem('paddock_session_id');
    if (!this.sessionId) {
      this.sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      sessionStorage.setItem('paddock_session_id', this.sessionId);
    }
  },

  startDwellTimePing: function() {
    var self = this;
    function sendPing() {
      if (!self.sessionId) return;
      fetch('/api/analytics/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: self.sessionId })
      }).catch(function() {});
    }
    sendPing();
    setInterval(sendPing, 15000);
  },

  getPage: function(hash) {
    switch (hash) {
      case 'calendar': return typeof CalendarPage !== 'undefined' ? CalendarPage : null;
      case 'standings': return typeof StandingsPage !== 'undefined' ? StandingsPage : null;
      case 'community': return typeof CommunityPage !== 'undefined' ? CommunityPage : null;
      case 'home': default: return typeof HomePage !== 'undefined' ? HomePage : null;
    }
  },

  navigate: function() {
    var hash = window.location.hash.slice(1) || 'home';
    var page = this.getPage(hash);
    if (!page) { hash = 'home'; page = this.getPage('home'); }

    if (this.currentPage && this.currentPage.cleanup) {
      try { this.currentPage.cleanup(); } catch (e) {}
    }

    var links = document.querySelectorAll('.nav-link');
    for (var i = 0; i < links.length; i++) links[i].classList.remove('active');

    var activeLink = document.querySelector('[data-page="' + hash + '"]');
    if (activeLink) activeLink.classList.add('active');

    var main = document.getElementById('main-content');
    if (main && page) {
      try {
        main.innerHTML = page.render();
        if (page.init) page.init();
        this.currentPage = page;
      } catch (err) {}
    }

    this.closeMenu();

    window.scrollTo(0, 0);
  },

  setupHamburger: function() {
    var self = this;
    var links = document.getElementById('nav-links');
    var button = document.getElementById('nav-hamburger');
    if (!links || !button) return;

    button.addEventListener('click', function() {
      var isOpen = links.classList.toggle('open');
      button.classList.toggle('active', isOpen);
      button.setAttribute('aria-expanded', String(isOpen));
      links.setAttribute('aria-hidden', String(!isOpen));
    });

    links.addEventListener('click', function(event) {
      if (event.target.closest('.nav-link, .nav-logo, .mobile-extra-controls a')) {
        self.closeMenu();
      }
    });

    document.addEventListener('click', function(event) {
      if (!links.classList.contains('open')) return;
      if (!links.contains(event.target) && !button.contains(event.target)) {
        self.closeMenu();
      }
    });

    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') self.closeMenu();
    });
  },

  closeMenu: function() {
    var links = document.getElementById('nav-links');
    var button = document.getElementById('nav-hamburger');
    if (links) links.classList.remove('open');
    if (button) {
      button.classList.remove('active');
      button.setAttribute('aria-expanded', 'false');
    }
    if (links) links.setAttribute('aria-hidden', 'true');
  },

  toggleLanguage: function() {
    this.currentLang = this.currentLang === 'en' ? 'ko' : 'en';
    // Re-render current page with new language
    if (this.currentPage && this.currentPage.render) {
      var main = document.getElementById('main-content');
      if (main) {
        try {
          main.innerHTML = this.currentPage.render();
          if (this.currentPage.init) this.currentPage.init();
        } catch (err) {}
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', function() { App.init(); });
