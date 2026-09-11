/* ===== calendar.js — Hardened Real-time FIA Grand Prix Engine ===== */

var CalendarPage = {
  races: [],
  syncTimer: null,

  render: function() {
    var seasonYear = new Date().getFullYear();
    return '<div class="page-container calendar-page">' +
      '<div style="margin-bottom: 1.5rem;">' +
        '<h1 class="page-title">' + seasonYear + ' F1 Season Calendar</h1>' +
        '<p class="page-subtitle">Real-time automated FIA circuit schedule & race status engine.</p>' +
      '</div>' +
      '<div class="calendar-grid" id="calendar-grid-container">' + this.renderRaceCards() + '</div>' +
    '</div>';
  },

  renderRaceCards: function() {
    var races = this.races.length > 0 ? this.races : typeof LOCAL_RACES !== 'undefined' ? LOCAL_RACES : [];
    if (!races || races.length === 0) {
      return '<div style="text-align:center; padding:3rem; color:var(--text-muted);">Loading live FIA calendar...</div>';
    }

    return races.map(function(race, i) {
      var raceDate = new Date(race.date || race.raceTime);
      var isPast = race.isCompleted || race.status === 'COMPLETED';
      var isNext = race.status === 'NEXT';

      var statusClass = isPast ? 'completed' : (isNext ? 'next' : 'upcoming');
      var badgeHTML = isPast
        ? '<span class="badge badge-completed">COMPLETED</span>'
        : (isNext ? '<span class="badge badge-live">NEXT RACE</span>' : '<span class="badge badge-upcoming">UPCOMING</span>');

      var sprintBadge = race.isSprint ? '<span class="badge badge-sprint" style="margin-left:4px;">SPRINT</span>' : '';

      var formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit'
      }).format(raceDate);

      var winnerHTML = (isPast && race.winner) ?
        '<div style="margin-top:0.8rem; padding:0.6rem; background:rgba(255, 215, 0, 0.1); border:1px solid rgba(255, 215, 0, 0.3); border-radius:8px; font-size:0.8rem;">' +
          '<div style="color:#FFD700; font-weight:700; display:flex; justify-content:space-between; align-items:center;">' +
            '<span>🏆 Winner: ' + race.winner + '</span>' +
            '<span style="font-family:var(--font-heading); font-weight:800; background:#FFD700; color:black; padding:1px 6px; border-radius:4px;">+' + (race.winnerPoints || '25') + ' pts</span>' +
          '</div>' +
          (race.winnerTeam ? '<div style="color:var(--text-secondary); font-size:0.75rem; margin-top:2px;">' + race.winnerTeam + '</div>' : '') +
        '</div>' : '';

      return '<div class="race-card ' + statusClass + ' slide-up" style="animation-delay: ' + (i * 0.03) + 's">' +
        '<div class="race-card-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">' +
          '<div class="race-round" style="font-family:var(--font-heading); font-weight:800; color:var(--accent-red);">R' + String(race.round).padStart(2, '0') + '</div>' +
          '<div>' + badgeHTML + sprintBadge + '</div>' +
        '</div>' +
        '<div class="race-card-body">' +
          '<div class="race-flag" style="font-size:1.8rem;">' + (race.flag || '🏎️') + '</div>' +
          '<h3 class="race-name" style="font-family:var(--font-heading); font-size:1.15rem; margin:4px 0;">' + (race.name || race.raceName) + '</h3>' +
          '<p class="race-circuit" style="color:var(--text-secondary); font-size:0.85rem;">' + (race.circuit || race.circuitName) + (race.country ? ' • ' + race.country : '') + '</p>' +
          '<div style="font-size:0.8rem; color:white; background:rgba(255,255,255,0.05); padding:6px 10px; border-radius:6px; margin-top:8px;">⏰ ' + formattedDate + '</div>' +
          winnerHTML +
        '</div>' +
      '</div>';
    }).join('');
  },

  fetchRacesFromAPI: function() {
    var self = this;
    fetch('/api/races?ts=' + Date.now(), { cache: 'no-store' })
      .then(function(res) {
        if (!res.ok) throw new Error('Calendar API request failed');
        return res.json();
      })
      .then(function(data) {
        if (data && data.success && data.races && data.races.length > 0) {
          self.races = data.races;
          // Make races available globally for other modules
          window.LOCAL_RACES = data.races;
          var container = document.getElementById('calendar-grid-container');
          if (container) container.innerHTML = self.renderRaceCards();
        }
      })
      .catch(function(e) {
        var container = document.getElementById('calendar-grid-container');
        if (container && self.races.length === 0) {
          container.innerHTML = '<div class="empty-state">Live calendar is temporarily unavailable. Retrying...</div>';
        }
      });
  },

  init: function() {
    if (this.syncTimer) clearInterval(this.syncTimer);
    this.fetchRacesFromAPI();
    this.syncTimer = setInterval(this.fetchRacesFromAPI.bind(this), 30000);
  },

  cleanup: function() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
};
