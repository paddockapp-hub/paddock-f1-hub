/* ===== home.js — Isolated Home Page (Countdown, Session Schedule & Top 5 Drivers Only) ===== */

var HomePage = {
  countdownInterval: null,
  syncTimer: null,
  nextRace: null,

  render: function() {
    return '<div class="page-container home-page fade-in">' +
      '<!-- TOP 5 Driver Standings Section Only -->' +
      '<section class="championship-section" style="max-width: 800px; margin: 0 auto;">' +
        '<div class="card" style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 1.5rem;">' +
          '<div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.8rem; border-bottom: 1px solid var(--glass-border);">' +
            '<h3 style="font-family: var(--font-heading); font-size: 1.3rem;">🏆 Driver Championship TOP 5 (드라이버 현황)</h3>' +
            '<a href="#standings" class="btn btn-secondary btn-sm" style="font-size: 0.8rem;">Full Standings →</a>' +
          '</div>' +
          '<div id="home-top5-drivers-list">' + this.renderTop5Drivers() + '</div>' +
        '</div>' +
      '</section>' +
      '<section class="championship-section" style="max-width: 800px; margin: 1.5rem auto 0;">' +
        '<div class="card" style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 1.5rem;">' +
          '<div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.8rem; border-bottom: 1px solid var(--glass-border);">' +
            '<h3 style="font-family: var(--font-heading); font-size: 1.3rem;">🏆 Constructor Championship (컨스트럭터 현황)</h3>' +
            '<a href="#standings" class="btn btn-secondary btn-sm" style="font-size: 0.8rem;">Full Standings →</a>' +
          '</div>' +
          '<div id="home-constructor-list">' + this.renderConstructors() + '</div>' +
        '</div>' +
      '</section>' +
    '</div>';
  },

  renderTop5Drivers: function() {
    var drivers = (typeof LOCAL_DRIVER_STANDINGS !== 'undefined' ? LOCAL_DRIVER_STANDINGS : []).slice(0, 5);

    if (!drivers || drivers.length === 0) {
      drivers = [
        { pos: 1, name: 'Kimi Antonelli', team: 'Mercedes', points: 204 },
        { pos: 2, name: 'Lewis Hamilton', team: 'Ferrari', points: 159 },
        { pos: 3, name: 'George Russell', team: 'Mercedes', points: 154 },
        { pos: 4, name: 'Charles Leclerc', team: 'Ferrari', points: 126 },
        { pos: 5, name: 'Lando Norris', team: 'McLaren', points: 103 }
      ];
    }

    var teamColors = typeof TEAM_COLORS !== 'undefined' ? TEAM_COLORS : {};

    return drivers.map(function(d, i) {
      var posColor = d.pos === 1 ? '#FFD700' : (d.pos === 2 ? '#C0C0C0' : (d.pos === 3 ? '#CD7F32' : 'var(--text-muted)'));
      return '<div class="mini-row" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 6px;">' +
        '<div style="display: flex; align-items: center; gap: 12px;">' +
          '<span style="font-family: var(--font-heading); font-weight: 800; font-size: 1.1rem; width: 24px; color: ' + posColor + ';">' + (d.pos || (i + 1)) + '</span>' +
          '<div class="team-bar" style="width: 4px; height: 20px; border-radius: 2px; background: ' + (teamColors[d.team] || '#888') + ';"></div>' +
          '<div>' +
            '<div style="font-weight: 600; font-size: 1rem; color: white;">' + d.name + '</div>' +
            '<div style="font-size: 0.78rem; color: var(--text-secondary);">' + d.team + '</div>' +
          '</div>' +
        '</div>' +
        '<span style="font-family: var(--font-heading); font-weight: 800; font-size: 1.2rem; color: var(--accent-red);">' + d.points + ' pts</span>' +
      '</div>';
    }).join('');
  },

  renderConstructors: function() {
    var constructors = (typeof ALL_CONSTRUCTOR_STANDINGS !== 'undefined' && ALL_CONSTRUCTOR_STANDINGS.length > 0)
      ? ALL_CONSTRUCTOR_STANDINGS.slice(0, 5) : [];
    if (constructors.length === 0) {
      return '<div class="empty-state">Loading live constructor standings...</div>';
    }
    return constructors.map(function(team, i) {
      var color = (typeof TEAM_COLORS !== 'undefined' && TEAM_COLORS[team.name]) ? TEAM_COLORS[team.name] : '#e10600';
      return '<div class="mini-row" style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem 1rem;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:6px;">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<span style="font-family:var(--font-heading);font-weight:800;font-size:1.1rem;width:24px;color:' + (i < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][i] : 'var(--text-muted)') + ';">' + team.pos + '</span>' +
          '<div class="team-bar" style="width:4px;height:20px;border-radius:2px;background:' + color + ';"></div>' +
          '<span style="font-weight:600;font-size:1rem;color:white;">' + team.name + '</span>' +
        '</div>' +
        '<span style="font-family:var(--font-heading);font-weight:800;font-size:1.2rem;color:var(--accent-red);">' + team.points + ' pts</span>' +
      '</div>';
    }).join('');
  },

  startCountdown: function() {
    var self = this;
    function updateClock() {
      var nextRaceDate = self.nextRace && self.nextRace.date ? new Date(self.nextRace.date) : null;
      var now = new Date();
      var diff = nextRaceDate ? nextRaceDate - now : 0;

      var days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
      var hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
      var mins = Math.max(0, Math.floor((diff / 1000 / 60) % 60));
      var secs = Math.max(0, Math.floor((diff / 1000) % 60));

      var dEl = document.getElementById('cd-days'); if (dEl) dEl.textContent = String(days).padStart(2, '0');
      var hEl = document.getElementById('cd-hours'); if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      var mEl = document.getElementById('cd-minutes'); if (mEl) mEl.textContent = String(mins).padStart(2, '0');
      var sEl = document.getElementById('cd-seconds'); if (sEl) sEl.textContent = String(secs).padStart(2, '0');
    }

    updateClock();
    this.countdownInterval = setInterval(updateClock, 1000);
  },

  fetchNextRace: function() {
    var self = this;
    return fetch('/api/races?ts=' + Date.now(), { cache: 'no-store' })
      .then(function(res) {
        if (!res.ok) throw new Error('Race API request failed');
        return res.json();
      })
      .then(function(data) {
        if (!data || !data.success || !data.races || data.races.length === 0) return;
        var race = data.nextRace || data.races.find(function(item) { return item.status === 'NEXT'; });
        if (!race) return;
        self.nextRace = race;
        var title = document.getElementById('home-gp-title');
        var circuit = document.getElementById('home-gp-circuit');
        var schedule = document.getElementById('home-session-list');
        var badge = document.querySelector('.live-badge');
        if (title) title.textContent = race.raceName || 'Next Grand Prix';
        if (circuit) {
          circuit.textContent = (race.circuitName || 'F1 Circuit') +
            (race.locality ? ' • ' + race.locality : '') +
            (race.country ? ', ' + race.country : '');
        }
        if (schedule) {
          var dateText = new Intl.DateTimeFormat(undefined, {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
          }).format(new Date(race.date));
          schedule.innerHTML = '<div style="padding:8px 10px; background:rgba(225,6,0,0.15); border:1px solid rgba(225,6,0,0.3); border-radius:6px; font-size:0.85rem;"><span>Race start</span><span style="float:right; font-weight:700; color:#ff5555;">' + dateText + '</span></div>';
        }
        if (badge) badge.lastChild.textContent = ' NEXT GRAND PRIX';
      })
      .catch(function() {});
  },

  fetchTop5FromAPI: function() {
    var self = this;
    fetch('/api/standings?ts=' + Date.now(), { cache: 'no-store' })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.success && data.standings && data.standings.length > 0) {
          var top5 = data.standings.slice(0, 5).map(function(item) {
            return {
              pos: parseInt(item.position),
              name: item.Driver.givenName + ' ' + item.Driver.familyName,
              team: item.Constructors[0] ? item.Constructors[0].name : 'F1 Team',
              points: parseFloat(item.points)
            };
          });
          var listEl = document.getElementById('home-top5-drivers-list');
          if (listEl) {
            listEl.innerHTML = top5.map(function(d) {
              var posColor = d.pos === 1 ? '#FFD700' : (d.pos === 2 ? '#C0C0C0' : (d.pos === 3 ? '#CD7F32' : 'var(--text-muted)'));
              return '<div class="mini-row" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 6px;">' +
                '<div style="display: flex; align-items: center; gap: 12px;">' +
                  '<span style="font-family: var(--font-heading); font-weight: 800; font-size: 1.1rem; width: 24px; color: ' + posColor + ';">' + d.pos + '</span>' +
                  '<div class="team-bar" style="width: 4px; height: 20px; border-radius: 2px; background: ' + (TEAM_COLORS[d.team] || '#888') + ';"></div>' +
                  '<div>' +
                    '<div style="font-weight: 600; font-size: 1rem; color: white;">' + d.name + '</div>' +
                    '<div style="font-size: 0.78rem; color: var(--text-secondary);">' + d.team + '</div>' +
                  '</div>' +
                '</div>' +
                '<span style="font-family: var(--font-heading); font-weight: 800; font-size: 1.2rem; color: var(--accent-red);">' + d.points + ' pts</span>' +
              '</div>';
            }).join('');
          }
        }
        if (data && data.success && data.constructorStandings && data.constructorStandings.length > 0) {
          window.ALL_CONSTRUCTOR_STANDINGS = data.constructorStandings.map(function(item) {
            return {
              pos: parseInt(item.position),
              name: item.Constructor ? item.Constructor.name : 'F1 Team',
              points: parseFloat(item.points)
            };
          });
          var constructorList = document.getElementById('home-constructor-list');
          if (constructorList) constructorList.innerHTML = self.renderConstructors();
        }
      }).catch(function() {});
  },

  init: function() {
    this.fetchTop5FromAPI();
    this.standingsSyncTimer = setInterval(this.fetchTop5FromAPI.bind(this), 30000);
  },

  cleanup: function() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    if (this.standingsSyncTimer) {
      clearInterval(this.standingsSyncTimer);
      this.standingsSyncTimer = null;
    }
  }
};
