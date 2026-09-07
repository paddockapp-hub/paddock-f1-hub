/* ===== auth.js — DC Inside Style Nickname + Password Auth Engine & Auto-Remember ===== */

var Auth = {
  userNickname: '',
  userPassword: '',

  init: function() {
    this.userNickname = localStorage.getItem('paddock_saved_nickname') || '';
    this.userPassword = localStorage.getItem('paddock_saved_password') || '';
    this.updateUI();
  },

  saveCredentials: function(nickname, password) {
    if (!nickname || !password) return;
    this.userNickname = nickname;
    this.userPassword = password;
    localStorage.setItem('paddock_saved_nickname', nickname);
    localStorage.setItem('paddock_saved_password', password);
    this.updateUI();
    this.showToast('Authentication saved! Auto-login active.', 'success');
  },

  clearCredentials: function() {
    this.userNickname = '';
    this.userPassword = '';
    localStorage.removeItem('paddock_saved_nickname');
    localStorage.removeItem('paddock_saved_password');
    this.updateUI();
    this.showToast('Signed out of nickname identity.', 'info');
  },

  updateUI: function() {
    var loggedOut = document.getElementById('auth-logged-out');
    var loggedIn = document.getElementById('auth-logged-in');
    var nameEl = document.getElementById('auth-name');

    if (this.userNickname && loggedIn && loggedOut) {
      loggedOut.style.display = 'none';
      loggedIn.style.display = 'flex';
      if (nameEl) nameEl.textContent = '🏎️ ' + this.userNickname + ' (Verified)';
    } else if (loggedOut && loggedIn) {
      loggedOut.style.display = 'flex';
      loggedIn.style.display = 'none';
    }
  },

  showToast: function(message, type) {
    var toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(function() { toast.style.display = 'none'; }, 3000);
  }
};

document.addEventListener('DOMContentLoaded', function() { Auth.init(); });
