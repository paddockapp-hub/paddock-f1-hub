/* ===== community.js — Ultra-Premium DC Inside Style Authenticated Community ===== */

var CommunityPage = {
  posts: [],
  currentCategory: 'ALL',
  searchQuery: '',

  render: function() {
    return '<div class="page-container community-page fade-in">' +
      '<!-- Community Header -->' +
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem; flex-wrap:wrap; gap:12px;">' +
        '<div>' +
          '<h1 style="font-family: var(--font-heading); font-size: 2rem; font-weight:800;">🏎️ Paddock Fan Community</h1>' +
          '<p style="color: var(--text-secondary); font-size: 0.9rem;">DC Inside style authenticated posting with zero-loss backend storage.</p>' +
        '</div>' +
        '<button class="btn btn-primary" onclick="CommunityPage.toggleWriteForm()" style="font-size:0.95rem; font-weight:700;">' +
          '✏️ Write Post (글쓰기)' +
        '</button>' +
      '</div>' +

      '<!-- Category Filter & Search Bar -->' +
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:12px; background:rgba(255,255,255,0.02); border:1px solid var(--glass-border); padding:0.8rem 1.2rem; border-radius:14px;">' +
        '<div style="display:flex; gap:6px; flex-wrap:wrap;">' +
          '<button class="btn btn-sm ' + (this.currentCategory === 'ALL' ? 'btn-primary' : 'btn-secondary') + '" onclick="CommunityPage.setCategory(\'ALL\')">🌐 ALL (전체)</button>' +
          '<button class="btn btn-sm ' + (this.currentCategory === 'BEST' ? 'btn-primary' : 'btn-secondary') + '" onclick="CommunityPage.setCategory(\'BEST\')">🔥 HOT (인기글)</button>' +
          '<button class="btn btn-sm ' + (this.currentCategory === 'RACE' ? 'btn-primary' : 'btn-secondary') + '" onclick="CommunityPage.setCategory(\'RACE\')">🏎️ RACE (경기분석)</button>' +
          '<button class="btn btn-sm ' + (this.currentCategory === 'TALK' ? 'btn-primary' : 'btn-secondary') + '" onclick="CommunityPage.setCategory(\'TALK\')">💬 TALK (자유수다)</button>' +
        '</div>' +
        '<div style="display:flex; gap:6px; align-items:center;">' +
          '<input type="text" id="community-search-input" class="form-input" placeholder="Search posts..." style="padding:0.4rem 0.8rem; font-size:0.85rem; width:180px;" onkeyup="CommunityPage.onSearch(this.value)">' +
        '</div>' +
      '</div>' +

      '<!-- Write Post Container (Hidden by default) -->' +
      '<div class="card" id="write-card-box" style="display:none; margin-bottom: 2rem; border:1px solid var(--accent-red); background:var(--bg-secondary);">' +
        '<h3 style="margin-bottom: 1rem; color: var(--accent-red); font-family:var(--font-heading);">✍️ Create Authenticated Post (디시인사이드 방식)</h3>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:1rem;">' +
          '<div><label class="form-label">Nickname (닉네임)</label><input type="text" id="post-nick-input" class="form-input" placeholder="Enter nickname..."></div>' +
          '<div><label class="form-label">Identification Password (식별 비밀번호)</label><input type="password" id="post-pass-input" class="form-input" placeholder="Enter password..."></div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">Category</label>' +
          '<select id="post-category-select" class="form-input" style="padding:0.6rem;">' +
            '<option value="[🏎️ RACE]">[🏎️ RACE] 경기분석 & 세션 소식</option>' +
            '<option value="[👤 DRIVER]">[👤 DRIVER] 드라이버 & 팀 소식</option>' +
            '<option value="[💬 TALK]">[💬 TALK] 자유 수다 & 잡담</option>' +
            '<option value="[❓ Q&A]">[❓ Q&A] F1 규칙 질문</option>' +
          '</select>' +
        '</div>' +
        '<div class="form-group"><input type="text" id="post-title-input" class="form-input" placeholder="Title..."></div>' +
        '<div class="form-group"><textarea id="post-body-input" rows="5" class="form-textarea" placeholder="Write your post content..."></textarea></div>' +
        '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">' +
          '<label style="font-size:0.8rem; color:var(--text-muted); cursor:pointer;"><input type="checkbox" id="remember-auth-chk" checked> Auto-remember identity (다음에도 자동 입력)</label>' +
          '<div style="display:flex; gap:8px;">' +
            '<button class="btn btn-secondary" onclick="CommunityPage.toggleWriteForm()">Cancel</button>' +
            '<button class="btn btn-primary" onclick="CommunityPage.submitPost()">Publish Post (등록)</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<!-- Community Feed List -->' +
      '<div id="community-feed-list">' + this.renderFeed() + '</div>' +
    '</div>';
  },

  renderFeed: function() {
    var self = this;
    var filtered = this.posts.filter(function(p) {
      if (self.currentCategory === 'BEST') return (p.likes || 0) >= 3;
      if (self.currentCategory === 'RACE') return p.title.includes('[🏎️ RACE]') || p.content.includes('RACE');
      if (self.currentCategory === 'TALK') return !p.title.includes('[🏎️ RACE]');
      return true;
    });

    if (this.searchQuery) {
      var q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(function(p) {
        return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q);
      });
    }

    if (!filtered || filtered.length === 0) {
      return '<div style="text-align:center; padding:3.5rem; color:var(--text-muted); border:1px dashed var(--glass-border); border-radius:16px;">' +
        '<div style="font-size:2.5rem; margin-bottom:0.5rem;">🏎️</div>' +
        '<div style="font-size:1.1rem; font-weight:600;">No posts found</div>' +
        '<p style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">Be the first to write an authenticated post!</p>' +
      '</div>';
    }

    return filtered.map(function(p) {
      var commentCount = p.comments ? p.comments.length : 0;
      var dateStr = new Date(p.createdAt || Date.now()).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

      return '<div class="card post-card" style="margin-bottom:1rem; transition:var(--transition); cursor:pointer;" onclick="CommunityPage.openPostModal(\'' + p.id + '\')">' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:0.82rem;">' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            '<span style="color:var(--accent-red); font-weight:700; background:rgba(225,6,0,0.12); padding:2px 8px; border-radius:6px;">🏎️ ' + (p.authorName || 'Paddock Fan') + '</span>' +
            '<span style="color:var(--text-muted);">' + dateStr + '</span>' +
          '</div>' +
          '<span style="font-size:0.75rem; color:var(--text-muted); border:1px solid var(--glass-border); padding:2px 6px; border-radius:4px;">Verified Auth</span>' +
        '</div>' +
        '<h3 style="font-family:var(--font-heading); font-size:1.25rem; font-weight:700; color:white; margin-bottom:6px;">' + p.title + '</h3>' +
        '<p style="color:var(--text-secondary); font-size:0.92rem; margin-bottom:12px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">' + p.content + '</p>' +
        '<div style="display:flex; gap:16px; font-size:0.85rem; color:var(--text-muted); font-weight:600;">' +
          '<span style="color:#ff5577;">❤️ ' + (p.likes || 0) + ' Likes</span>' +
          '<span style="color:#6692FF;">💬 ' + commentCount + ' Comments</span>' +
        '</div>' +
      '</div>';
    }).join('');
  },

  setCategory: function(cat) {
    this.currentCategory = cat;
    var listEl = document.getElementById('community-feed-list');
    if (listEl) listEl.innerHTML = this.renderFeed();
  },

  onSearch: function(q) {
    this.searchQuery = q;
    var listEl = document.getElementById('community-feed-list');
    if (listEl) listEl.innerHTML = this.renderFeed();
  },

  toggleWriteForm: function() {
    var box = document.getElementById('write-card-box');
    if (box) {
      box.style.display = box.style.display === 'block' ? 'none' : 'block';
      var savedNick = localStorage.getItem('paddock_saved_nickname') || '';
      var savedPass = localStorage.getItem('paddock_saved_password') || '';
      var nickIn = document.getElementById('post-nick-input');
      var passIn = document.getElementById('post-pass-input');
      if (nickIn && savedNick) nickIn.value = savedNick;
      if (passIn && savedPass) passIn.value = savedPass;
    }
  },

  submitPost: function() {
    var self = this;
    var nick = (document.getElementById('post-nick-input').value || '').trim();
    var pass = (document.getElementById('post-pass-input').value || '').trim();
    var cat = document.getElementById('post-category-select').value;
    var titleRaw = (document.getElementById('post-title-input').value || '').trim();
    var content = (document.getElementById('post-body-input').value || '').trim();
    var rememberChk = document.getElementById('remember-auth-chk').checked;

    if (!nick || !pass || !titleRaw || !content) {
      alert('Please fill in Nickname, Password, Title, and Content!');
      return;
    }

    var fullTitle = cat + ' ' + titleRaw;

    if (rememberChk) {
      localStorage.setItem('paddock_saved_nickname', nick);
      localStorage.setItem('paddock_saved_password', pass);
    }

    fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName: nick, password: pass, title: fullTitle, content: content })
    }).then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success) {
          document.getElementById('post-title-input').value = '';
          document.getElementById('post-body-input').value = '';
          self.toggleWriteForm();
          self.fetchPostsFromAPI();
        } else {
          alert('Failed to publish post.');
        }
      }).catch(function() {});
  },

  openPostModal: function(id) {
    var p = this.posts.find(function(item) { return item.id === id; });
    if (!p) return;

    var savedPass = localStorage.getItem('paddock_saved_password') || '';
    var savedNick = localStorage.getItem('paddock_saved_nickname') || '';

    var modalHtml = '<div style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(10px); display:flex; justify-content:center; align-items:center; z-index:999999; padding:1rem;" id="post-detail-modal">' +
      '<div style="background:#12121a; border:1px solid var(--glass-border); border-radius:18px; width:100%; max-width:680px; max-height:85vh; overflow-y:auto; padding:2rem; position:relative;">' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">' +
          '<h2 style="font-family:var(--font-heading); font-size:1.4rem; color:white;">' + p.title + '</h2>' +
          '<button class="btn btn-secondary" onclick="document.getElementById(\'post-detail-modal\').remove()" style="min-height:36px; padding:0 12px;">✕</button>' +
        '</div>' +
        '<div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.2rem;">Author: <strong style="color:var(--accent-red);">' + p.authorName + '</strong></div>' +
        '<p style="color:var(--text-secondary); font-size:1rem; margin-bottom:1.5rem; line-height:1.7; white-space:pre-wrap;">' + p.content + '</p>' +

        '<!-- Like & Password Delete Bar -->' +
        '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; background:rgba(255,255,255,0.03); padding:1rem; border-radius:12px; margin-bottom:1.5rem;">' +
          '<button class="btn btn-secondary" onclick="CommunityPage.likePost(\'' + p.id + '\')">❤️ Like ' + (p.likes || 0) + '</button>' +
          '<div style="display:flex; gap:6px; align-items:center;">' +
            '<input type="password" id="modal-del-pass" class="form-input" value="' + savedPass + '" placeholder="Author Password..." style="width:130px; padding:0.4rem 0.6rem; font-size:0.8rem;">' +
            '<button class="btn btn-secondary" style="color:#ff5555; border-color:rgba(225,6,0,0.4);" onclick="CommunityPage.deletePostWithPassword(\'' + p.id + '\')">🗑️ Delete</button>' +
          '</div>' +
        '</div>' +

        '<!-- Comments Section -->' +
        '<div style="border-top:1px solid var(--glass-border); padding-top:1.2rem;">' +
          '<h4 style="margin-bottom:1rem; font-family:var(--font-heading);">💬 Comments (' + (p.comments ? p.comments.length : 0) + ')</h4>' +
          '<div style="margin-bottom:1rem;">' +
            (p.comments && p.comments.length > 0 ? p.comments.map(function(c) {
              return '<div style="padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05); font-size:0.9rem;"><strong style="color:var(--accent-red);">' + c.authorName + ':</strong> ' + c.content + '</div>';
            }).join('') : '<p style="color:var(--text-muted); font-size:0.85rem;">No comments yet. Write a comment below!</p>') +
          '</div>' +

          '<div style="display:flex; flex-direction:column; gap:8px;">' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">' +
              '<input type="text" id="c-nick-in" class="form-input" value="' + savedNick + '" placeholder="Nickname...">' +
              '<input type="password" id="c-pass-in" class="form-input" value="' + savedPass + '" placeholder="Password...">' +
            '</div>' +
            '<div style="display:flex; gap:8px;">' +
              '<input type="text" id="c-text-in" class="form-input" placeholder="Write a comment...">' +
              '<button class="btn btn-primary" onclick="CommunityPage.addComment(\'' + p.id + '\')">Submit</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

    var oldModal = document.getElementById('post-detail-modal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  likePost: function(id) {
    var self = this;
    fetch('/api/posts/' + id + '/like', { method: 'POST' })
      .then(function() {
        self.fetchPostsFromAPI(function() {
          self.openPostModal(id);
        });
      });
  },

  deletePostWithPassword: function(id) {
    var self = this;
    var pass = (document.getElementById('modal-del-pass').value || '').trim();
    if (!pass) { alert('Please enter author password'); return; }

    fetch('/api/posts/' + id + '/delete-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pass })
    }).then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success) {
          var modal = document.getElementById('post-detail-modal');
          if (modal) modal.remove();
          self.fetchPostsFromAPI();
        } else {
          alert('Incorrect password!');
        }
      });
  },

  addComment: function(id) {
    var self = this;
    var nick = (document.getElementById('c-nick-in').value || '').trim();
    var pass = (document.getElementById('c-pass-in').value || '').trim();
    var text = (document.getElementById('c-text-in').value || '').trim();

    if (!nick || !pass || !text) { alert('Nickname, password, and comment text required!'); return; }

    fetch('/api/posts/' + id + '/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName: nick, password: pass, content: text })
    }).then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success) {
          self.fetchPostsFromAPI(function() {
            self.openPostModal(id);
          });
        }
      });
  },

  fetchPostsFromAPI: function(cb) {
    var self = this;
    fetch('/api/posts')
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.posts) {
          self.posts = data.posts;
          var feed = document.getElementById('community-feed-list');
          if (feed) feed.innerHTML = self.renderFeed();
          if (cb) cb();
        }
      }).catch(function() {});
  },

  init: function() {
    this.fetchPostsFromAPI();
  },

  cleanup: function() {}
};
