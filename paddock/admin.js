// Admin Panel

const API_BASE = '/api';
let adminToken = null;

document.addEventListener('DOMContentLoaded', init);

function init() {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    renderLogin();
  } else {
    adminToken = token;
    renderDashboard();
  }
}

function renderLogin() {
  const app = document.getElementById('admin-app');
  app.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
      <div class="card" style="width: 400px;">
        <h1 style="text-align: center; margin-bottom: 2rem;">🔐 관리자 로그인</h1>
        <form onsubmit="submitLogin(event)">
          <div class="form-group">
            <label>관리자 비밀번호</label>
            <input type="password" id="admin-password" placeholder="비밀번호" required autofocus>
          </div>
          <button type="submit" class="btn" style="width: 100%;">로그인</button>
        </form>
      </div>
    </div>
  `;
}

function renderDashboard() {
  const app = document.getElementById('admin-app');
  app.innerHTML = `
    <header>
      <h1>🔐 관리자 대시보드</h1>
      <nav style="display: flex; gap: 1rem; justify-content: space-between; align-items: center;">
        <div>
          <a href="#" onclick="loadStats()" style="margin-right: 1rem; text-decoration: none;">통계</a>
          <a href="#" onclick="loadPosts()" style="text-decoration: none;">게시물 관리</a>
        </div>
        <button class="btn btn-small" onclick="logout()">로그아웃</button>
      </nav>
    </header>
    <div class="container">
      <div id="content"></div>
    </div>
  `;
  
  loadStats();
}

async function submitLogin(event) {
  event.preventDefault();
  
  const password = document.getElementById('admin-password').value;
  
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    
    const data = await res.json();
    
    if (data.success && data.token) {
      adminToken = data.token;
      localStorage.setItem('adminToken', adminToken);
      renderDashboard();
    } else {
      alert('비밀번호가 잘못되었습니다.');
    }
  } catch (e) {
    alert('오류: ' + e.message);
  }
}

async function loadStats() {
  const content = document.getElementById('content');
  content.innerHTML = '<div class="loader"></div> 로딩 중...';
  
  try {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { 'Authorization': adminToken }
    });
    
    const data = await res.json();
    
    if (data.success) {
      content.innerHTML = `
        <section class="section">
          <h2>📊 방문자 통계</h2>
          <table class="standings-table">
            <thead>
              <tr>
                <th>시간</th>
                <th>방문자</th>
                <th>평균 체류시간 (분)</th>
                <th>총 체류시간 (분)</th>
              </tr>
            </thead>
            <tbody>
              ${data.hourlyStats.map(stat => `
                <tr>
                  <td>${stat.hourLabel}</td>
                  <td>${stat.visitors}</td>
                  <td>${stat.avgDwellMinutes}</td>
                  <td>${stat.totalDwellMinutes}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>
      `;
    }
  } catch (e) {
    content.innerHTML = `<div class="error-message">오류: ${e.message}</div>`;
  }
}

async function loadPosts() {
  const content = document.getElementById('content');
  content.innerHTML = '<div class="loader"></div> 로딩 중...';
  
  try {
    const res = await fetch(`${API_BASE}/posts`);
    const data = await res.json();
    
    if (data.success) {
      content.innerHTML = `
        <section class="section">
          <h2>📝 게시물 관리</h2>
          <div class="grid">
            ${data.posts.map(post => `
              <div class="post">
                <div class="post-title">${post.title}</div>
                <div class="post-meta">작성자: ${post.authorName} | ${new Date(post.createdAt).toLocaleString('ko-KR')}</div>
                <div class="post-content">${post.content.substring(0, 100)}...</div>
                <button class="btn btn-small" onclick="deletePostAdmin('${post.id}')" style="background: #CC0000; margin-top: 1rem;">삭제</button>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }
  } catch (e) {
    content.innerHTML = `<div class="error-message">오류: ${e.message}</div>`;
  }
}

async function deletePostAdmin(postId) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  
  try {
    const res = await fetch(`${API_BASE}/admin/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Authorization': adminToken }
    });
    
    if (res.ok) {
      alert('게시물이 삭제되었습니다.');
      loadPosts();
    }
  } catch (e) {
    alert('오류: ' + e.message);
  }
}

function logout() {
  adminToken = null;
  localStorage.removeItem('adminToken');
  renderLogin();
}
