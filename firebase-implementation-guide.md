# Firebase 백엔드 연동 가이드

## 📋 Firebase 프로젝트 설정

### 1. Firebase 콘솔에서 프로젝트 생성
1. https://console.firebase.google.com/ 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `paddock-f1-hub`
4. Google Analytics: 선택 사항 (나중에 추가 가능)
5. "프로젝트 만들기" 클릭

### 2. 웹 앱 추가
1. Firebase 콘솔에서 프로젝트 선택
2. 프로젝트 개요 페이지에서 "웹" 아이콘 (</>) 클릭
3. 앱 닉네임: `Paddock F1 Hub`
4. "앱 등록" 클릭
5. Firebase SDK 구성 코드가 표시됨

### 3. Firebase SDK 설정
`paddock/js/firebase-config.js` 파일에서 아래 설정을 업데이트하세요:

```javascript
var FirebaseConfig = {
  config: {
    apiKey: "YOUR_API_KEY",           // Firebase 콘솔에서 가져온 값
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",    // 프로젝트 ID
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"             // 앱 ID
  }
};
```

### 4. Firestore Database 활성화
1. Firebase 콘솔 → "Firestore Database"
2. "데이터베이스 만들기" 클릭
3. 위치: "asia-northeast3" (서울) 또는 가까운 지역 선택
4. 보안 규칙: "테스트 모드"로 시작 (나중에 프로덕션 규칙으로 변경)
5. "만들기" 클릭

### 5. 보안 규칙 설정 (프로덕션용)
Firestore 보안 규칙 탭에서 다음 규칙 적용:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 게시글 읽기: 모두 가능
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // 댓글 읽기: 모두 가능
    match /posts/{postId}/comments/{commentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // 통계 데이터: 인증된 사용자만
    match /analytics/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 6. Firebase SDK 스크립트 추가
`paddock/index.html`의 `<head>` 섹션에 추가:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-auth-compat.js"></script>
```

### 7. 인증 설정 (선택 사항)
Firebase 콘솔 → "Authentication" → "시작하기"
- 이메일/비밀번호: 활성화
- Google 로그인: 활성화 (선택 사항)

## 🔧 백엔드 연동 코드

### Firebase로 데이터 저장
기존 파일 시스템 대신 Firebase를 사용하려면 `server.js`를 수정해야 합니다.

현재는 로컬 JSON 파일을 사용하지만, Firebase를 연동하면:
- 실시간 동기화
- 클라우드 저장
- 여러 사용자 동시 접속
- 자동 백업

기능이 가능해집니다.

## 📊 데이터 구조 (Firestore)

### posts 컬렉션
```
posts/{postId}
  - title: string
  - content: string
  - authorName: string
  - passwordHash: string
  - createdAt: timestamp
  - likes: number
  - comments: array
```

### analytics 컬렉션
```
analytics/hourlyData/{dateHour}
  - hourLabel: string
  - visitors: number
  - totalDwellSeconds: number
  - uniqueSessions: array
```

## 🚀 테스트

1. Firebase 설정 완료 후 서버 재시작
2. 브라우저 콘솔에서 확인:
```javascript
// Firebase 연결 확인
console.log('Firebase enabled:', FirebaseConfig.isEnabled);
```

3. 게시글 작성 테스트
4. Firestore 콘솔에서 데이터 확인

## 📝 참고 사항

- Firebase 무료 플랜으로 시작 가능
- 트래픽이 많아지면 유료 플랜 고려
- 보안 규칙을 프로덕션용으로 변경 필수
- 정기적으로 백업 권장

---

**다음 단계: GitHub 연동**
