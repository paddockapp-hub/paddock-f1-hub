/* ===== server.js — Enterprise 100% Production Ready F1 Backend Engine ===== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const cluster = require('cluster');
const os = require('os');
const zlib = require('zlib');
const crypto = require('crypto');

const PORT = process.env.PORT || 8888;
const IS_SERVERLESS = Boolean(process.env.VERCEL);
const IS_PROD = process.env.NODE_ENV === 'production';
const PUBLIC_DIR = path.join(__dirname, 'paddock');
const DB_FILE = path.join(__dirname, 'posts_db.json');
const DB_BACKUP_FILE = path.join(__dirname, 'posts_db.json.bak');
const ANALYTICS_FILE = path.join(__dirname, 'analytics_db.json');
const ANALYTICS_BACKUP_FILE = path.join(__dirname, 'analytics_db.json.bak');
const ADMIN_PASS = process.env.ADMIN_PASS;
const SALT = process.env.APP_SALT;

if (!ADMIN_PASS || !SALT) {
  throw new Error('ADMIN_PASS and APP_SALT environment variables are required.');
}

// Salted Password Hash
function hashPassword(pass) {
  if (!pass) return '';
  return crypto.createHash('sha256').update(String(pass) + SALT).digest('hex');
}

function createAdminToken() {
  const payload = Buffer.from(JSON.stringify({
    role: 'admin',
    expiresAt: Date.now() + 8 * 60 * 60 * 1000
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', SALT).update(payload).digest('base64url');
  return payload + '.' + signature;
}

function isValidAdminToken(token) {
  if (!token) return false;
  const parts = String(token).split('.');
  if (parts.length !== 2) return false;

  const expectedSignature = crypto.createHmac('sha256', SALT).update(parts[0]).digest('base64url');
  const received = Buffer.from(parts[1]);
  const expected = Buffer.from(expectedSignature);
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return false;

  try {
    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    return payload.role === 'admin' && Number(payload.expiresAt) > Date.now();
  } catch (e) {
    return false;
  }
}

// XSS Sanitization
function sanitizeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Safe DB Initializer & Auto-Recovery
function safeInitDB() {
  if (!fs.existsSync(DB_FILE)) {
    if (fs.existsSync(DB_BACKUP_FILE)) {
      try { fs.copyFileSync(DB_BACKUP_FILE, DB_FILE); } catch (e) {
        fs.writeFileSync(DB_FILE, JSON.stringify([]), 'utf8');
      }
    } else {
      try { fs.writeFileSync(DB_FILE, JSON.stringify([]), 'utf8'); } catch (e) {}
    }
  }

  if (!fs.existsSync(ANALYTICS_FILE)) {
    if (fs.existsSync(ANALYTICS_BACKUP_FILE)) {
      try { fs.copyFileSync(ANALYTICS_BACKUP_FILE, ANALYTICS_FILE); } catch (e) {
        fs.writeFileSync(ANALYTICS_FILE, JSON.stringify({ hourlyData: {}, activeSessions: {} }), 'utf8');
      }
    } else {
      try {
        fs.writeFileSync(ANALYTICS_FILE, JSON.stringify({ hourlyData: {}, activeSessions: {} }, null, 2), 'utf8');
      } catch (e) {}
    }
  }
}
safeInitDB();

function readPostsDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || '[]');
    }
  } catch (e) {
    if (fs.existsSync(DB_BACKUP_FILE)) {
      try { return JSON.parse(fs.readFileSync(DB_BACKUP_FILE, 'utf8') || '[]'); } catch (err) {}
    }
  }
  return [];
}

function writePostsDB(posts) {
  try {
    const tmp = DB_FILE + '.tmp';
    const jsonStr = JSON.stringify(posts, null, 2);
    fs.writeFileSync(tmp, jsonStr, 'utf8');
    fs.renameSync(tmp, DB_FILE);
    try { fs.copyFileSync(DB_FILE, DB_BACKUP_FILE); } catch (err) {}
  } catch (e) {
    try { fs.writeFileSync(DB_FILE, JSON.stringify(posts, null, 2), 'utf8'); } catch (err) {}
  }
}

function readAnalyticsDB() {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8') || '{"hourlyData":{},"activeSessions":{}}');
    }
  } catch (e) {}
  return { hourlyData: {}, activeSessions: {} };
}

function writeAnalyticsDB(analytics) {
  try {
    const tmp = ANALYTICS_FILE + '.tmp';
    const jsonStr = JSON.stringify(analytics, null, 2);
    fs.writeFileSync(tmp, jsonStr, 'utf8');
    fs.renameSync(tmp, ANALYTICS_FILE);
    try { fs.copyFileSync(ANALYTICS_FILE, ANALYTICS_BACKUP_FILE); } catch (err) {}
  } catch (e) {
    try { fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2), 'utf8'); } catch (err) {}
  }
}

function recordUserPing(sessionId) {
  if (!sessionId) return;
  const analytics = readAnalyticsDB();
  const now = new Date();
  const dateKey = now.toISOString().split('T')[0];
  const hourKey = dateKey + ' ' + String(now.getHours()).padStart(2, '0') + ':00';

  if (!analytics.hourlyData[hourKey]) {
    analytics.hourlyData[hourKey] = {
      hourLabel: hourKey,
      visitors: 0,
      totalDwellSeconds: 0,
      uniqueSessions: []
    };
  }

  const hourRecord = analytics.hourlyData[hourKey];

  if (!hourRecord.uniqueSessions.includes(sessionId)) {
    hourRecord.uniqueSessions.push(sessionId);
    hourRecord.visitors = hourRecord.uniqueSessions.length;
  }

  if (!analytics.activeSessions) analytics.activeSessions = {};

  if (!analytics.activeSessions[sessionId]) {
    analytics.activeSessions[sessionId] = {
      startTime: now.getTime(),
      lastPing: now.getTime(),
      dwellSeconds: 0
    };
  } else {
    const session = analytics.activeSessions[sessionId];
    const diffSec = Math.min(30, Math.floor((now.getTime() - session.lastPing) / 1000));
    session.dwellSeconds += diffSec;
    session.lastPing = now.getTime();
    hourRecord.totalDwellSeconds += diffSec;
  }

  writeAnalyticsDB(analytics);
}

// Fetch with Timeout Guard
async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}

// ==========================================
// 1. MASTER PROCESS (Production Orchestrator)
// ==========================================
if (!IS_SERVERLESS && (cluster.isMaster || cluster.isPrimary)) {
  const numCpus = Math.min(2, Math.max(1, os.cpus().length));
  console.log(`[Master Production Engine] Launching ${numCpus} Cluster Worker Threads...`);

  let globalStandingsCache = null;
  let globalConstructorStandingsCache = null;
  let globalRacesCache = null;
  let lastSyncTime = Date.now();

  async function syncFIALiveData() {
    const currentYear = new Date().getFullYear();
    try {
      let racesData = [];
      const calRes = await fetchWithTimeout(`https://api.jolpi.ca/ergast/f1/${currentYear}.json`, {}, 6000);
      if (calRes && calRes.ok) {
        const calJson = await calRes.json().catch(() => null);
        if (calJson && calJson.MRData && calJson.MRData.RaceTable) {
          racesData = calJson.MRData.RaceTable.Races || [];
        }
      }

      let raceResultsMap = {};
      const resultsRes = await fetchWithTimeout(`https://api.jolpi.ca/ergast/f1/${currentYear}/results.json?limit=100`, {}, 6000);
      if (resultsRes && resultsRes.ok) {
        const resJson = await resultsRes.json().catch(() => null);
        if (resJson && resJson.MRData && resJson.MRData.RaceTable && resJson.MRData.RaceTable.Races) {
          resJson.MRData.RaceTable.Races.forEach(r => {
            if (r.Results && r.Results[0]) {
              raceResultsMap[r.round] = {
                winner: r.Results[0].Driver.givenName + ' ' + r.Results[0].Driver.familyName,
                winnerTeam: r.Results[0].Constructor ? r.Results[0].Constructor.name : '',
                winnerPoints: r.Results[0].points || '25'
              };
            }
          });
        }
      }

      const now = new Date();
      let foundNext = false;

      if (racesData && racesData.length > 0) {
        globalRacesCache = racesData.map(race => {
          const raceDate = new Date(race.date + 'T' + (race.time || '12:00:00Z'));
          const isPast = raceDate < now;
          const result = raceResultsMap[race.round];

          let status = 'UPCOMING';
          if (isPast) status = 'COMPLETED';
          else if (!foundNext) { status = 'NEXT'; foundNext = true; }

          return {
            round: parseInt(race.round),
            raceName: race.raceName,
            circuitName: race.Circuit ? race.Circuit.circuitName : 'F1 Circuit',
            locality: race.Circuit && race.Circuit.Location ? race.Circuit.Location.locality : '',
            country: race.Circuit && race.Circuit.Location ? race.Circuit.Location.country : '',
            date: race.date + 'T' + (race.time || '12:00:00Z'),
            status: status,
            isCompleted: isPast,
            winner: result ? result.winner : null,
            winnerTeam: result ? result.winnerTeam : null,
            winnerPoints: result ? result.winnerPoints : null
          };
        });
      }

      const stRes = await fetchWithTimeout(`https://api.jolpi.ca/ergast/f1/${currentYear}/driverstandings.json`, {}, 6000);
      if (stRes && stRes.ok) {
        const stJson = await stRes.json().catch(() => null);
        if (stJson && stJson.MRData && stJson.MRData.StandingsTable && stJson.MRData.StandingsTable.StandingsLists.length > 0) {
          globalStandingsCache = stJson.MRData.StandingsTable.StandingsLists[0].DriverStandings;
        }
      }

      const constructorRes = await fetchWithTimeout(`https://api.jolpi.ca/ergast/f1/${currentYear}/constructorstandings.json`, {}, 6000);
      if (constructorRes && constructorRes.ok) {
        const constructorJson = await constructorRes.json().catch(() => null);
        if (constructorJson && constructorJson.MRData &&
            constructorJson.MRData.StandingsTable &&
            constructorJson.MRData.StandingsTable.StandingsLists &&
            constructorJson.MRData.StandingsTable.StandingsLists.length > 0) {
          globalConstructorStandingsCache =
            constructorJson.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
        }
      }

      lastSyncTime = Date.now();
      broadcastCacheToWorkers();
    } catch (err) {}
  }

  function broadcastCacheToWorkers() {
    const nextRace = globalRacesCache ? globalRacesCache.find(race => race.status === 'NEXT') || null : null;
    for (const id in cluster.workers) {
      if (cluster.workers[id] && cluster.workers[id].isConnected()) {
        cluster.workers[id].send({
          type: 'CACHE_UPDATE',
          standings: globalStandingsCache,
          constructorStandings: globalConstructorStandingsCache,
          races: globalRacesCache,
          nextRace: nextRace,
          updatedAt: lastSyncTime
        });
      }
    }
  }

  syncFIALiveData();
  setInterval(syncFIALiveData, 30000);

  for (let i = 0; i < numCpus; i++) {
    const worker = cluster.fork();
    worker.on('message', (msg) => {
      if (msg && msg.type === 'REQUEST_CACHE') {
        worker.send({
          type: 'CACHE_UPDATE',
          standings: globalStandingsCache,
          constructorStandings: globalConstructorStandingsCache,
          races: globalRacesCache,
          nextRace: globalRacesCache ? globalRacesCache.find(race => race.status === 'NEXT') || null : null,
          updatedAt: lastSyncTime
        });
      }
    });
  }

  cluster.on('exit', (worker) => {
    console.log(`[Master Engine] Worker ${worker.process.pid} died. Restarting new worker...`);
    const newWorker = cluster.fork();
    newWorker.send({
      type: 'CACHE_UPDATE',
      standings: globalStandingsCache,
      constructorStandings: globalConstructorStandingsCache,
      races: globalRacesCache,
      nextRace: globalRacesCache ? globalRacesCache.find(race => race.status === 'NEXT') || null : null,
      updatedAt: lastSyncTime
    });
  });

  return;
}

// ==========================================
// 2. WORKER PROCESS (Production Http Server)
// ==========================================

let localStandingsCache = null;
let localConstructorStandingsCache = null;
let localRacesCache = null;
let localNextRace = null;
let localCacheUpdatedAt = Date.now();

try { process.send({ type: 'REQUEST_CACHE' }); } catch (e) {}

process.on('message', (msg) => {
  if (msg && msg.type === 'CACHE_UPDATE') {
    if (msg.standings) localStandingsCache = msg.standings;
    if (msg.constructorStandings) localConstructorStandingsCache = msg.constructorStandings;
    if (msg.races) localRacesCache = msg.races;
    if (msg.nextRace !== undefined) localNextRace = msg.nextRace;
    if (msg.updatedAt) localCacheUpdatedAt = msg.updatedAt;
  }
});

const ipRateMap = new Map();
setInterval(() => ipRateMap.clear(), 10000);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  const reqCount = (ipRateMap.get(ip) || 0) + 1;
  ipRateMap.set(ip, reqCount);
  if (reqCount > 250) {
    res.writeHead(429, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('429 Too Many Requests');
    return;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400 Bad Request');
    return;
  }

  const pathname = parsedUrl.pathname;
  const method = req.method;

  function sendJSON(data, status = 200) {
    const jsonStr = JSON.stringify(data);
    const etag = 'W/"' + jsonStr.length + '-' + Buffer.from(jsonStr.substring(0, 40)).toString('base64') + '"';

    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304);
      res.end();
      return;
    }

    const acceptEncoding = req.headers['accept-encoding'] || '';
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Cache-Control': 'no-cache',
      'ETag': etag
    };

    if (acceptEncoding.includes('gzip')) {
      headers['Content-Encoding'] = 'gzip';
      res.writeHead(status, headers);
      zlib.gzip(Buffer.from(jsonStr), (err, compressed) => {
        if (err) res.end(jsonStr);
        else res.end(compressed);
      });
    } else {
      res.writeHead(status, headers);
      res.end(jsonStr);
    }
  }

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // ===== API ENDPOINTS =====

  if (pathname === '/healthz' && method === 'GET') {
    sendJSON({ status: 'ok', updatedAt: localCacheUpdatedAt });
    return;
  }

  // Analytics Ping API
  if (pathname === '/api/analytics/ping' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.sessionId) recordUserPing(String(data.sessionId));
        sendJSON({ success: true });
      } catch (e) { sendJSON({ success: false }, 400); }
    });
    return;
  }

  // Admin Login API
  if (pathname === '/api/admin/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.password === ADMIN_PASS) {
          sendJSON({ success: true, token: createAdminToken() });
        } else {
          sendJSON({ success: false, error: 'Incorrect Admin Password' }, 401);
        }
      } catch (e) { sendJSON({ success: false, error: 'Invalid Payload' }, 400); }
    });
    return;
  }

  // Admin Stats API
  if (pathname === '/api/admin/session' && method === 'GET') {
    const valid = isValidAdminToken(req.headers['authorization'] || '');
    sendJSON({ success: valid }, valid ? 200 : 401);
    return;
  }

  if (pathname === '/api/admin/stats' && method === 'GET') {
    const authHeader = req.headers['authorization'] || '';
    if (!isValidAdminToken(authHeader)) {
      sendJSON({ success: false, error: 'Unauthorized Admin Access' }, 401);
      return;
    }

    const analytics = readAnalyticsDB();
    const hourlyList = Object.values(analytics.hourlyData || {}).map(h => {
      const avgDwellMin = h.visitors > 0 ? ((h.totalDwellSeconds / h.visitors) / 60).toFixed(1) : '0';
      return {
        hourLabel: h.hourLabel,
        visitors: h.visitors,
        avgDwellMinutes: avgDwellMin,
        totalDwellMinutes: (h.totalDwellSeconds / 60).toFixed(1)
      };
    });
    sendJSON({ success: true, hourlyStats: hourlyList });
    return;
  }

  // Admin Force Delete API
  if (pathname.match(/^\/api\/admin\/posts\/[^\/]+$/) && method === 'DELETE') {
    const authHeader = req.headers['authorization'] || '';
    if (!isValidAdminToken(authHeader)) {
      sendJSON({ success: false, error: 'Unauthorized Admin Access' }, 401);
      return;
    }
    const postId = pathname.split('/')[4];
    const posts = readPostsDB();
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      posts.splice(index, 1);
      writePostsDB(posts);
      sendJSON({ success: true, message: 'Post permanently deleted by admin' });
    } else {
      sendJSON({ success: false, error: 'Post not found' }, 404);
    }
    return;
  }

  // FIA Live Schedule & Race API
  if (pathname === '/api/races' && method === 'GET') {
    sendJSON({
      success: Array.isArray(localRacesCache) && localRacesCache.length > 0,
      races: localRacesCache || [],
      nextRace: localNextRace,
      updatedAt: localCacheUpdatedAt
    });
    return;
  }

  // FIA Live Driver & Constructor Standings API
  if (pathname === '/api/standings' && method === 'GET') {
    sendJSON({
      success: true,
      standings: localStandingsCache,
      constructorStandings: localConstructorStandingsCache,
      updatedAt: localCacheUpdatedAt
    });
    return;
  }

  // DC Inside Style Create Post
  if (pathname === '/api/posts' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (!data.title || !data.content || !data.authorName || !data.password) {
          sendJSON({ success: false, error: 'Title, content, nickname, and password required' }, 400);
          return;
        }

        const sanitizedTitle = sanitizeHTML(data.title.trim());
        const sanitizedContent = sanitizeHTML(data.content.trim());
        const sanitizedAuthor = sanitizeHTML(data.authorName.trim());

        if (sanitizedTitle.length === 0 || sanitizedContent.length === 0) {
          sendJSON({ success: false, error: 'Content cannot be empty' }, 400);
          return;
        }

        const newPost = {
          id: 'post_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          title: sanitizedTitle,
          content: sanitizedContent,
          authorName: sanitizedAuthor,
          passwordHash: hashPassword(data.password),
          createdAt: new Date().toISOString(),
          likes: 0,
          comments: []
        };
        const posts = readPostsDB();
        posts.unshift(newPost);
        writePostsDB(posts);

        const publicPost = { ...newPost };
        delete publicPost.passwordHash;
        sendJSON({ success: true, post: publicPost }, 201);
      } catch (e) { sendJSON({ success: false, error: 'Invalid Payload' }, 400); }
    });
    return;
  }

  // DC Inside Style Delete Post
  if (pathname.match(/^\/api\/posts\/[^\/]+\/delete-auth$/) && method === 'POST') {
    const postId = pathname.split('/')[3];
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const posts = readPostsDB();
        const index = posts.findIndex(p => p.id === postId);
        if (index !== -1) {
          const post = posts[index];
          const inputHash = hashPassword(data.password);
          if (post.passwordHash && post.passwordHash === inputHash) {
            posts.splice(index, 1);
            writePostsDB(posts);
            sendJSON({ success: true, message: 'Post deleted successfully' });
          } else {
            sendJSON({ success: false, error: 'Incorrect Password' }, 401);
          }
        } else {
          sendJSON({ success: false, error: 'Post not found' }, 404);
        }
      } catch (e) { sendJSON({ success: false, error: 'Invalid Payload' }, 400); }
    });
    return;
  }

  // DC Inside Style Add Comment
  if (pathname.match(/^\/api\/posts\/[^\/]+\/comments$/) && method === 'POST') {
    const postId = pathname.split('/')[3];
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (!data.content || !data.authorName || !data.password) {
          sendJSON({ success: false, error: 'Comment, nickname, and password required' }, 400);
          return;
        }

        const sanitizedContent = sanitizeHTML(data.content.trim());
        const sanitizedAuthor = sanitizeHTML(data.authorName.trim());

        if (sanitizedContent.length === 0) {
          sendJSON({ success: false, error: 'Comment content cannot be empty' }, 400);
          return;
        }

        const posts = readPostsDB();
        const post = posts.find(p => p.id === postId);
        if (post) {
          if (!post.comments) post.comments = [];
          const comment = {
            id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            authorName: sanitizedAuthor,
            passwordHash: hashPassword(data.password),
            content: sanitizedContent,
            createdAt: new Date().toISOString()
          };
          post.comments.push(comment);
          writePostsDB(posts);

          sendJSON({ success: true, comment: { id: comment.id, authorName: comment.authorName, content: comment.content, createdAt: comment.createdAt } });
        } else {
          sendJSON({ success: false, error: 'Post not found' }, 404);
        }
      } catch (e) { sendJSON({ success: false, error: 'Invalid Payload' }, 400); }
    });
    return;
  }

  if (pathname === '/api/posts' && method === 'GET') {
    const rawPosts = readPostsDB();
    const publicPosts = rawPosts.map(p => {
      const copy = { ...p };
      delete copy.passwordHash;
      if (copy.comments) {
        copy.comments = copy.comments.map(c => {
          const cCopy = { ...c };
          delete cCopy.passwordHash;
          return cCopy;
        });
      }
      return copy;
    });
    sendJSON({ success: true, posts: publicPosts });
    return;
  }

  if (pathname.match(/^\/api\/posts\/[^\/]+\/like$/) && method === 'POST') {
    const postId = pathname.split('/')[3];
    const posts = readPostsDB();
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.likes = (post.likes || 0) + 1;
      writePostsDB(posts);
      sendJSON({ success: true, likes: post.likes });
    } else { sendJSON({ success: false, error: 'Post not found' }, 404); }
    return;
  }

  // Static File Serving
  let reqUrl = pathname;
  if (reqUrl === '/') reqUrl = '/index.html';

  let filePath = path.join(PUBLIC_DIR, reqUrl);
  let ext = path.extname(filePath);
  let contentType = MIME_TYPES[ext] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
    } else {
      const acceptEncoding = req.headers['accept-encoding'] || '';
      const staticHeaders = {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      };

      if (acceptEncoding.includes('gzip') && contentType.startsWith('text')) {
        staticHeaders['Content-Encoding'] = 'gzip';
        res.writeHead(200, staticHeaders);
        zlib.gzip(content, (gzipErr, compressed) => {
          if (gzipErr) res.end(content);
          else res.end(compressed);
        });
      } else {
        res.writeHead(200, staticHeaders);
        res.end(content);
      }
    }
  });
});

server.maxConnections = 20000;
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Production Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('[Worker] SIGTERM received. Closing server gracefully...');
  server.close(() => { process.exit(0); });
});

if (IS_SERVERLESS) {
  module.exports = server;
} else {
  server.listen(PORT, () => {
    console.log(`[Production Worker Thread ${process.pid}] Server Ready at http://localhost:${PORT}`);
  });
}
