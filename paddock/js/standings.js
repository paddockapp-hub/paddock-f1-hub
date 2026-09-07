/* ===== standings.js — 100% Robust Standings Module ===== */

var DEFAULT_DRIVERS = [
  { pos: 1, name: 'Kimi Antonelli', team: 'Mercedes', points: 204, num: 12, nat: '🇮🇹' },
  { pos: 2, name: 'Lewis Hamilton', team: 'Ferrari', points: 159, num: 44, nat: '🇬🇧' },
  { pos: 3, name: 'George Russell', team: 'Mercedes', points: 154, num: 63, nat: '🇬🇧' },
  { pos: 4, name: 'Charles Leclerc', team: 'Ferrari', points: 126, num: 16, nat: '🇲🇨' },
  { pos: 5, name: 'Lando Norris', team: 'McLaren', points: 103, num: 4, nat: '🇬🇧' },
  { pos: 6, name: 'Oscar Piastri', team: 'McLaren', points: 92, num: 81, nat: '🇦🇺' },
  { pos: 7, name: 'Max Verstappen', team: 'Red Bull Racing', points: 91, num: 1, nat: '🇳🇱' },
  { pos: 8, name: 'Isack Hadjar', team: 'Red Bull Racing', points: 60, num: 6, nat: '🇫🇷' },
  { pos: 9, name: 'Pierre Gasly', team: 'Alpine', points: 42, num: 10, nat: '🇫🇷' },
  { pos: 10, name: 'Liam Lawson', team: 'Racing Bulls', points: 39, num: 30, nat: '🇳🇿' }
];

var DEFAULT_CONSTRUCTORS = [
  { pos: 1, name: 'Mercedes', points: 358 },
  { pos: 2, name: 'Ferrari', points: 285 },
  { pos: 3, name: 'McLaren', points: 195 },
  { pos: 4, name: 'Red Bull Racing', points: 151 },
  { pos: 5, name: 'Alpine', points: 61 },
  { pos: 6, name: 'Racing Bulls', points: 61 },
  { pos: 7, name: 'Haas', points: 21 },
  { pos: 8, name: 'Williams', points: 11 }
];

var StandingsPage = {
  currentTab: 'drivers',
  autoSyncTimer: null,

  render: function() {
    var lang = (typeof App !== 'undefined' && App.currentLang) ? App.currentLang : 'en';
    var t = typeof i18n !== 'undefined' ? i18n[lang] : { stTitle: '2026 Championship Standings', stSub: 'Automated live background synchronization via Node.js API.' };

    return '<div class="page-container standings-page">' +
      '<div style="margin-bottom:1.2rem;">' +
        '<h1 class="page-title">' + (t.stTitle || '2026 Championship Standings') + '</h1>' +
        '<p class="page-subtitle" id="st-status-text">' + (t.stSub || 'Automated live background synchronization via Node.js API.') + '</p>' +
      '</div>' +
      '<div class="tabs">' +
        '<button class="tab active" data-tab="drivers" onclick="StandingsPage.switchTab(\'drivers\')">' + (lang === 'ko' ? '드라이버' : 'Drivers') + '</button>' +
        '<button class="tab" data-tab="constructors" onclick="StandingsPage.switchTab(\'constructors\')">' + (lang === 'ko' ? '컨스트럭터' : 'Constructors') + '</button>' +
      '</div>' +
      '<div id="standings-content">' + this.renderDrivers() + '</div>' +
    '</div>';
  },

  switchTab: function(tab) {
    this.currentTab = tab;
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
    var activeTab = document.querySelector('[data-tab="' + tab + '"]');
    if (activeTab) activeTab.classList.add('active');
    var content = document.getElementById('standings-content');
    if (content) {
      content.innerHTML = tab === 'drivers' ? this.renderDrivers() : this.renderConstructors();
      this.animateBars();
    }
  },

  autoFetchApiData: function() {
    var self = this;
    fetch('/api/standings')
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.success && data.standings && data.standings.length > 0) {
          DEFAULT_DRIVERS = data.standings.map(function(item) {
            return {
              pos: parseInt(item.position),
              name: item.Driver.givenName + ' ' + item.Driver.familyName,
              team: item.Constructors[0] ? item.Constructors[0].name : 'F1 Team',
              points: parseFloat(item.points),
              num: item.permanentNumber || item.position,
              nat: '🏁'
            };
          });
          // Make standings available globally for other modules
          window.LOCAL_DRIVER_STANDINGS = DEFAULT_DRIVERS;
          window.ALL_DRIVER_STANDINGS = DEFAULT_DRIVERS;
          var content = document.getElementById('standings-content');
          if (content) {
            content.innerHTML = self.currentTab === 'drivers' ? self.renderDrivers() : self.renderConstructors();
            self.animateBars();
          }
        }
      })
      .catch(function(err) {});
  },

  renderDrivers: function() {
    var drivers = (typeof ALL_DRIVER_STANDINGS !== 'undefined' && ALL_DRIVER_STANDINGS.length > 0) ? ALL_DRIVER_STANDINGS : DEFAULT_DRIVERS;
    var maxPts = drivers.length > 0 ? drivers[0].points : 1;
    var teamColors = typeof TEAM_COLORS !== 'undefined' ? TEAM_COLORS : {};

    return '<div class="standings-table fade-in">' +
      drivers.map(function(d, i) {
        var color = teamColors[d.team] || '#e10600';
        var posClass = d.pos <= 3 ? ' top-' + d.pos : '';
        var pct = maxPts > 0 ? (d.points / maxPts * 100) : 0;
        return '<div class="standing-row slide-up" style="animation-delay:' + (i * 0.02) + 's">' +
          '<div class="standing-pos' + posClass + '">' + d.pos + '</div>' +
          '<div class="team-color-bar" style="background:' + color + '"></div>' +
          '<div class="standing-info">' +
            '<span class="standing-number">#' + (d.num || d.pos) + '</span>' +
            '<span class="standing-name">' + d.name + '</span>' +
            '<span class="standing-team" style="color:' + color + '">' + d.team + '</span>' +
          '</div>' +
          '<div class="standing-points-area">' +
            '<div class="points-bar-container">' +
              '<div class="points-bar" style="width:0%;background:' + color + '" data-target-width="' + pct + '%"></div>' +
            '</div>' +
            '<span class="standing-points">' + d.points + '</span>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
  },

  renderConstructors: function() {
    var constructors = (typeof ALL_CONSTRUCTOR_STANDINGS !== 'undefined' && ALL_CONSTRUCTOR_STANDINGS.length > 0) ? ALL_CONSTRUCTOR_STANDINGS : DEFAULT_CONSTRUCTORS;
    var maxPts = constructors.length > 0 ? constructors[0].points : 1;
    var teamColors = typeof TEAM_COLORS !== 'undefined' ? TEAM_COLORS : {};

    return '<div class="standings-table fade-in">' +
      constructors.map(function(c, i) {
        var color = teamColors[c.name] || '#e10600';
        var posClass = c.pos <= 3 ? ' top-' + c.pos : '';
        var pct = maxPts > 0 ? (c.points / maxPts * 100) : 0;
        var gap = c.pos === 1 ? 'Leader' : '-' + (maxPts - c.points) + 'pts';
        return '<div class="standing-row slide-up" style="animation-delay:' + (i * 0.03) + 's">' +
          '<div class="standing-pos' + posClass + '">' + c.pos + '</div>' +
          '<div class="team-color-bar wide" style="background:' + color + '"></div>' +
          '<div class="standing-info">' +
            '<span class="standing-name">' + c.name + '</span>' +
            '<span class="standing-gap">' + gap + '</span>' +
          '</div>' +
          '<div class="standing-points-area">' +
            '<div class="points-bar-container">' +
              '<div class="points-bar" style="width:0%;background:' + color + '" data-target-width="' + pct + '%"></div>' +
            '</div>' +
            '<span class="standing-points">' + c.points + '</span>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
  },

  animateBars: function() {
    setTimeout(function() {
      var bars = document.querySelectorAll('.points-bar');
      for (var i = 0; i < bars.length; i++) {
        bars[i].style.transition = 'width 1s cubic-bezier(0.4, 0, 0.2, 1)';
        bars[i].style.width = bars[i].getAttribute('data-target-width');
      }
    }, 50);
  },

  init: function() {
    this.animateBars();
    this.autoFetchApiData();
    if (this.autoSyncTimer) clearInterval(this.autoSyncTimer);
    this.autoSyncTimer = setInterval(this.autoFetchApiData.bind(this), 30000);
  },

  cleanup: function() {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
    }
  }
};
