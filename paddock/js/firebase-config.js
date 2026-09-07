/* ===== firebase-config.js ===== */
var FirebaseConfig = {
  db: null,
  auth: null,
  isEnabled: false,
  sessionId: null,
  sessionStart: null,

  config: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  },

  init: function() {
    try {
      if (typeof firebase === 'undefined') {
        console.warn('[Paddock] Firebase SDK not loaded → local data mode');
        this.isEnabled = false;
        return;
      }
      if (this.config.apiKey === 'YOUR_API_KEY') {
        console.warn('[Paddock] Firebase not configured → local data mode');
        this.isEnabled = false;
        return;
      }
      firebase.initializeApp(this.config);
      this.db = firebase.firestore();
      this.auth = firebase.auth();
      this.isEnabled = true;
      console.log('[Paddock] Firebase initialized successfully');
    } catch(e) {
      console.warn('[Paddock] Firebase initialization failed:', e);
      this.isEnabled = false;
    }
  },

  trackPageView: function(page) {
    if (!this.isEnabled) return;
    try {
      this.db.collection('analytics').doc('pageViews').collection('logs').add({
        page: page,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        sessionId: this.sessionId,
        userId: this.auth.currentUser ? this.auth.currentUser.uid : 'anonymous'
      });
    } catch(e) { /* silent */ }
  },

  trackSessionStart: function() {
    this.sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    this.sessionStart = Date.now();
  },

  trackSessionEnd: function() {
    // placeholder for Firestore session tracking
  },

  // Firebase 게시글 저장 함수
  savePost: function(postData) {
    if (!this.isEnabled) return Promise.reject('Firebase not enabled');
    return this.db.collection('posts').add(postData);
  },

  // Firebase 게시글 가져오기 함수
  getPosts: function() {
    if (!this.isEnabled) return Promise.reject('Firebase not enabled');
    return this.db.collection('posts')
      .orderBy('createdAt', 'desc')
      .get()
      .then(snapshot => {
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      });
  },

  // Firebase 통계 저장 함수
  saveAnalytics: function(analyticsData) {
    if (!this.isEnabled) return Promise.reject('Firebase not enabled');
    return this.db.collection('analytics').doc('current').set(analyticsData);
  }
};

FirebaseConfig.init();
