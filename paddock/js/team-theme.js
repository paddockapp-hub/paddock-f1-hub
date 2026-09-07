/* ===== team-theme.js — 100% Full F1 Grid 11 Team Theme Engine (Hardened) ===== */

/* home.js / standings.js가 순위표 팀 컬러바에 사용하는 전역 변수.
   이게 없으면 fetch 콜백 안에서 ReferenceError가 나서 실시간 순위 갱신이 조용히 실패합니다. */
var TEAM_COLORS = {
  'Mercedes': '#27F4D2', 'Ferrari': '#E8002D', 'McLaren': '#FF8000',
  'Red Bull Racing': '#3671C6', 'Red Bull': '#3671C6', 'Alpine': '#FF87BC',
  'Racing Bulls': '#6692FF', 'RB': '#6692FF', 'Haas': '#B6BABD', 'Haas F1 Team': '#B6BABD',
  'Audi': '#00E701', 'Sauber': '#00E701', 'Kick Sauber': '#00E701',
  'Williams': '#1868DB', 'Aston Martin': '#229971', 'Cadillac': '#FFD700'
};

var TeamThemeEngine = {
  themes: {
    ferrari: { name: '🔴 Ferrari (Scuderia Red)', red: '#E8002D', grad: 'linear-gradient(135deg, #E8002D, #ff4444)' },
    mercedes: { name: '🟢 Mercedes (Silver Teal)', red: '#27F4D2', grad: 'linear-gradient(135deg, #27F4D2, #00b395)' },
    mclaren: { name: '🟠 McLaren (Papaya Orange)', red: '#FF8000', grad: 'linear-gradient(135deg, #FF8000, #ffaa44)' },
    redbull: { name: '🔵 Red Bull (Navy Blue)', red: '#3671C6', grad: 'linear-gradient(135deg, #3671C6, #1868DB)' },
    alpine: { name: '💗 Alpine (BWT Pink)', red: '#FF87BC', grad: 'linear-gradient(135deg, #FF87BC, #ff5599)' },
    racingbulls: { name: '💙 Racing Bulls (RB Blue)', red: '#6692FF', grad: 'linear-gradient(135deg, #6692FF, #3366ff)' },
    haas: { name: '🔴 Haas (MoneyGram Red)', red: '#E60000', grad: 'linear-gradient(135deg, #E60000, #ff3333)' },
    astonmartin: { name: '💚 Aston Martin (Racing Green)', red: '#229971', grad: 'linear-gradient(135deg, #229971, #11bb88)' },
    williams: { name: '🔷 Williams (Heritage Blue)', red: '#1868DB', grad: 'linear-gradient(135deg, #1868DB, #0044bb)' },
    audi: { name: '💚 Audi Sauber (Neon Green)', red: '#00E701', grad: 'linear-gradient(135deg, #00E701, #00b800)' },
    cadillac: { name: '💛 Cadillac (Gold Racing)', red: '#FFD700', grad: 'linear-gradient(135deg, #FFD700, #ffaa00)' }
  },

  init: function() {
    var savedTheme = localStorage.getItem('paddock_team_theme') || 'ferrari';
    this.applyTheme(savedTheme);
  },

  applyTheme: function(themeKey) {
    var t = this.themes[themeKey] || this.themes.ferrari;
    document.documentElement.style.setProperty('--accent-red', t.red);
    document.documentElement.style.setProperty('--accent-gradient', t.grad);
    localStorage.setItem('paddock_team_theme', themeKey);

    // Sync all dropdown selectors on screen
    var selectors = document.querySelectorAll('#theme-selector, #theme-select');
    selectors.forEach(function(s) {
      if (s && s.value !== themeKey) s.value = themeKey;
    });
  }
};

document.addEventListener('DOMContentLoaded', function() {
  TeamThemeEngine.init();
});
