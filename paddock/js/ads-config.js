/* ===== ads-config.js — 광고/스폰서 배너 플레이스홀더 ===== */

var SponsorAdsConfig = {
  renderBanner: function(elementId) {
    var el = document.getElementById(elementId);
    if (!el) return;

    el.innerHTML =
      '<div class="ad-banner-placeholder" style="background:rgba(255,255,255,0.02); border:1px dashed var(--glass-border); border-radius:var(--border-radius-lg); padding:1.2rem; text-align:center; color:var(--text-muted); font-size:0.85rem; margin:1.5rem 0;">' +
        '<strong style="color:var(--text-primary); display:block; margin-bottom:4px;">📢 AD / SPONSOR BANNER SPACE</strong>' +
        '<span>Reserved slot for future advertisements or sponsorships</span>' +
      '</div>';
  }
};
