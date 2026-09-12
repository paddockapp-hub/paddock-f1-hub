// PADDOCK F1 Hub - Main Application

const API_BASE = '/api';
let currentTab = 'home';
let adminToken = null;

// Initialize app
document.addEventListener('DOMContentLoaded', init);

function init() {
  renderApp();
  loadRaces();
  loadStandings();
  loadPosts();
  setupEventListeners();
  checkAdminStatus();
}

function setupEventListeners() {
  const app = document.getElementById('app');
  app.addEventListener('click', handleNavigation);
}

function handleNavigation(e) {
  if (e.target.tagName === 'A' && e.target.getAttribute('data-tab')) {
    e.preventDefault();
    currentTab = e.target.getAttribute('data-tab');
    renderApp();
  }
}

function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header>
      <h1>🏎️ PADDOCK F1 Hub</h1>
      <nav class="navigation">
        <a href="#" data-tab="home">홈</a>
        <a href="#" data-tab="standings">순위표</a>
        <a href="#" data-tab="races">레이스</a>
        <a href="#" data-tab="community">커뮤니티</a>
        <a href="#" data-tab="admin" id="admin-link" style="display:none;">관리자</a>
      </nav>
    </header>
    <div class="container">${renderTabContent()}</div>
    <footer>
      <p>&copy; 2026 PADDOCK F1 Hub - F1 팬을 위한 최고의 커뮤니티</p>
      <p><a href="https://github.com/paddockapp-hub/paddock-f1-hub">GitHub Repository</a></p>
    </footer>
  `;
}

function renderTabContent() {
  switch (currentTab) {
    case 'home':
      return renderHome();
    case 'standings':
      return renderStandings();
    case 'races':
      return renderRaces();
    case 'community':
      return renderCommunity();
    case 'admin':
      return adminToken ? renderAdmin() : renderAdminLogin();
    default:
      return renderHome();
  }
}

function renderHome() {
  return `
    <section class="section">
      <h2>🏁 현재 경주 상황</h2>
      <div id="current-race" class="card">
        <div class="loader"></div> 로딩 중...
      </div>
    </section>
    <section class="section">
      <h2>📊 주요 기능</h2>
      <div class="grid">
        <div class="card">
          <h3>🏆 실시간 순위표</h3>
          <p>드라이버 및 컨스트럭터 순위를 실시간으로 확인하세요</p>
        </div>
        <div class="card">
          <h3>📅 레이스 캘린더</h3>
          <p>2026 시즌의 모든 레이스 일정을 확인하세요</p>
        </div>
        <div class="card">
          <h3>💬 팬 커뮤니티</h3>
          <p>다른 F1 팬들과 의견을 나누세요</p>
        </div>
      </div>
    </section>
  `;
}

function renderStandings() {
  return `
    <section class="section">
      <h2>🏆 드라이버 순위표</h2>
      <div id="driver-standings" class="card">
        <div class="loader"></div> 로딩 중...
      </div>
    </section>
    <section class="section">
      <h2>🏭 컨스트럭터 순위표</h2>
      <div id="constructor-standings" class="card">
        <div class="loader"></div> 로딩 중...
      </div>
    </section>
  `;
}

function renderRaces() {
  return `
    <section class="section">
      <h2>📅 2026 시즌 레이스</h2>
      <div id="races-list" class="grid">
        <div class="loader"></div> 로딩 중...
      </div>
    </section>
  `;
}

function renderCommunity() {
  return `
    <section class="section">
      <h2>💬 팬 커뮤니티</h2>
      <div id="new-post-form">
        <h3>새 게시물 작성</h3>
        <form onsubmit="submitPost(event)">
          <div class="form-group">
            <label>닉네임</label>
            <input type="text" id="author-name" placeholder="닉네임" required>
          </div>
          <div class="form-group">
            <label>제목</label>
            <input type="text" id="post-title" placeholder="제목" required>
          </div>
          <div class="form-group">
            <label>내용</label>
            <textarea id="post-content" placeholder="내용을 입력하세요" required></textarea>
          </div>
          <div class="form-group">
            <label>비밀번호 (삭제시 필요)</label>
            <input type="password" id="post-password" placeholder="비밀번호" required>
          </div>
          <button type="submit" class="btn">게시물 작성</button>
        </form>
      </div>
      <hr style="margin: 2rem 0; border: none; border-top: 1px solid #555;">
      <div id="posts-container" class="grid">
        <div class="loader"></div> 로딩 중...
      </div>
    </section>
  `;
}

function renderAdminLogin() {
  return `
    <section class="section">
      <h2>🔐 관리자 로그인</h2>
      <div class="card" style="max-width: 400px;">
        <form onsubmit="submitAdminLogin(event)">
          <div class="form-group">
            <label>관리자 비밀번호</label>
            <input type="password" id="admin-password" placeholder="비밀번호" required>
          </div>
          <button type="submit" class="btn">로그인</button>
        </form>
      </div>
    </section>
  `;
}

function renderAdmin() {
  return `
    <section class="section">
      <h2>📊 관리자 대시보드</h2>
      <button class="btn btn-small" onclick="logoutAdmin()" style="margin-bottom: 1rem;">로그아웃</button>
      <div class="card">
        <h3>방문자 통계</h3>
        <div id="admin-stats"><div class="loader"></div> 로딩 중...</div>
      </div>
    </section>
  `;
}

async function loadRaces() {
  try {
    const res = await fetch(`${API_BASE}/races`);
    const data = await res.json();
    
    if (data.races && data.races.length > 0) {
      const nextRace = data.nextRace || data.races.find(r => r.status === 'NEXT');
      if (nextRace && currentTab === 'home') {
        const elem = document.getElementById('current-race');
        if (elem) {
          elem.innerHTML = `
            <h3>${nextRace.raceName}</h3>
            <p><strong>회전:</strong> ${nextRace.round}</p>
            <p><strong>위치:</strong> ${nextRace.locality}, ${nextRace.country}</p>
            <p><strong>날짜:</strong> ${new Date(nextRace.date).toLocaleDateString('ko-KR')}</p>
            <p><strong>상태:</strong> <span style="color: #FFD700;">${nextRace.status === 'NEXT' ? '다음 경주' : nextRace.status === 'COMPLETED' ? '완료됨' : '예정'}</span></p>
          `;
        }
      }
      
      if (currentTab === 'races') {
        const racesContainer = document.getElementById('races-list');
        if (racesContainer) {
          racesContainer.innerHTML = data.races.map(race => `
            <div class="card">
              <h3>${race.raceName}</h3>
              <p><strong>회전:</strong> ${race.round}</p>
              <p><strong>위치:</strong> ${race.locality}, ${race.country}</p>
              <p><strong>날짜:</strong> ${new Date(race.date).toLocaleDateString('ko-KR')}</p>
              <p><strong>상태:</strong> <span style="color: ${race.status === 'NEXT' ? '#FFD700' : race.status === 'COMPLETED' ? '#00DD00' : '#DDDDDD'};">${race.status}</span></p>
              ${race.winner ? `<p><strong>우승자:</strong> ${race.winner} (${race.winnerTeam})</p>` : ''}
            </div>
          `).join('');
        }
      }
    }
  } catch (e) {
    console.error('Error loading races:', e);
  }
}

async function loadStandings() {
  try {
    const res = await fetch(`${API_BASE}/standings`);
    const data = await res.json();
    
    if (currentTab === 'standings' && data.standings) {
      const driverElem = document.getElementById('driver-standings');
      if (driverElem && data.standings.length > 0) {
        driverElem.innerHTML = `
          <table class="standings-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>드라이버</th>
                <th>팀</th>
                <th>포인트</th>
              </tr>
            </thead>
            <tbody>
              ${data.standings.slice(0, 20).map(driver => `
                <tr>
                  <td><strong>${driver.position}</strong></td>
                  <td>${driver.Driver.givenName} ${driver.Driver.familyName}</td>
                  <td>${driver.Constructors?.[0]?.name || 'N/A'}</td>
                  <td><strong>${driver.points}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
      
      const constructorElem = document.getElementById('constructor-standings');
      if (constructorElem && data.constructorStandings) {
        constructorElem.innerHTML = `
          <table class="standings-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>팀</th>
                <th>포인트</th>
              </tr>
            </thead>
            <tbody>
              ${data.constructorStandings.slice(0, 20).map(constructor => `
                <tr>
                  <td><strong>${constructor.position}</strong></td>
                  <td>${constructor.Constructor.name}</td>
                  <td><strong>${constructor.points}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    }
  } catch (e) {
    console.error('Error loading standings:', e);
  }
}

async function loadPosts() {
  try {
    const res = await fetch(`${API_BASE}/posts`);
    const data = await res.json();
    
    if (currentTab === 'community' && data.posts) {
      const postsContainer = document.getElementById('posts-container');
      if (postsContainer) {
        postsContainer.innerHTML = data.posts.map(post => `
          <div class="post">
            <div class="post-title">${post.title}</div>
            <div class="post-meta">작성자: ${post.authorName} | ${new Date(post.createdAt).toLocaleString('ko-KR')}</div>
            <div class="post-content">${post.content}</div>
            <div class="post-actions">
              <button class="btn btn-small" onclick="toggleComments('${post.id}')">댓글 (${post.comments?.length || 0})</button>
              <button class="btn btn-small" onclick="toggleDeleteForm('${post.id}')">삭제</button>
            </div>
            <div id="delete-form-${post.id}" style="display:none; margin-top: 1rem;">
              <input type="password" id="delete-pass-${post.id}" placeholder="비밀번호 입력" style="width: calc(100% - 2rem); margin-bottom: 0.5rem;">
              <button class="btn btn-small" onclick="deletePost('${post.id}')">확인</button>
            </div>
          </div>
        `).join('');
      }
    }
  } catch (e) {
    console.error('Error loading posts:', e);
  }
}

async function submitPost(event) {
  event.preventDefault();
  
  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;
  const authorName = document.getElementById('author-name').value;
  const password = document.getElementById('post-password').value;
  
  try {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, authorName, password })
    });
    
    if (res.ok) {
      alert('게시물이 작성되었습니다!');
      document.querySelector('#new-post-form form').reset();
      loadPosts();
    } else {
      alert('게시물 작성에 실패했습니다.');
    }
  } catch (e) {
    alert('오류: ' + e.message);
  }
}

async function deletePost(postId) {
  const password = document.getElementById(`delete-pass-${postId}`).value;
  
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/delete-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    
    if (res.ok) {
      alert('게시물이 삭제되었습니다.');
      loadPosts();
    } else {
      alert('비밀번호가 잘못되었습니다.');
    }
  } catch (e) {
    alert('오류: ' + e.message);
  }
}

function toggleDeleteForm(postId) {
  const form = document.getElementById(`delete-form-${postId}`);
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function toggleComments(postId) {
  alert('댓글 기능은 향후 업데이트 예정입니다.');
}

async function submitAdminLogin(event) {
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
      renderApp();
      loadAdminStats();
    } else {
      alert('관리자 비밀번호가 잘못되었습니다.');
    }
  } catch (e) {
    alert('오류: ' + e.message);
  }
}

function logoutAdmin() {
  adminToken = null;
  localStorage.removeItem('adminToken');
  renderApp();
}

async function checkAdminStatus() {
  const token = localStorage.getItem('adminToken');
  if (token) {
    try {
      const res = await fetch(`${API_BASE}/admin/session`, {
        headers: { 'Authorization': token }
      });
      
      if (res.ok) {
        adminToken = token;
        const adminLink = document.getElementById('admin-link');
        if (adminLink) adminLink.style.display = 'inline-block';
      } else {
        localStorage.removeItem('adminToken');
      }
    } catch (e) {}
  }
}

async function loadAdminStats() {
  if (!adminToken) return;
  
  try {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { 'Authorization': adminToken }
    });
    
    const data = await res.json();
    
    if (data.success && currentTab === 'admin') {
      const statsElem = document.getElementById('admin-stats');
      if (statsElem && data.hourlyStats) {
        statsElem.innerHTML = `
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
        `;
      }
    }
  } catch (e) {
    console.error('Error loading admin stats:', e);
  }
}
