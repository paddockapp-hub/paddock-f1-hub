# PADDOCK F1 Hub - 실출시용 배포 가이드

## 📋 개요
PADDOCK F1 Hub는 F1 팬을 위한 올인원 커뮤니티 애플리케이션입니다. 실시간 순위표, 레이스 캘린더, 커뮤니티 기능을 제공합니다.

## 🚀 빠른 시작

### Windows 사용자
1. `start_server.bat` 파일을 더블클릭하세요
2. 자동으로 브라우저가 열리고 http://localhost:8888로 이동합니다

### macOS/Linux 사용자
1. 터미널을 열고 프로젝트 폴더로 이동하세요
2. `chmod +x start_server.sh` 실행 (권한 설정)
3. `./start_server.sh` 실행

### 수동 시작
```bash
# Node.js가 설치되어 있어야 합니다
node server.js
```

## 📦 시스템 요구사항

### 필수 요구사항
- **Node.js**: v14.0.0 이상
- **운영체제**: Windows, macOS, Linux
- **메모리**: 최소 512MB RAM
- **디스크 공간**: 최소 100MB

### 권장 사양
- **Node.js**: v18.0.0 이상
- **메모리**: 1GB RAM 이상
- **CPU**: 듀얼 코어 이상

## 🔧 설치 단계

### 1. Node.js 설치
- Windows: https://nodejs.org/ 에서 다운로드
- macOS: `brew install node`
- Linux: `sudo apt install nodejs npm`

### 2. 파일 배치
1. 이 폴더 전체를 서버에 업로드하세요
2. 폴더 구조를 유지하세요:
```
PADDOCK_PRODUCTION/
├── server.js
├── paddock/
│   ├── index.html
│   ├── admin.html
│   ├── css/
│   ├── js/
│   ├── manifest.json
│   └── sw.js
├── start_server.bat (Windows)
├── start_server.sh (macOS/Linux)
└── DEPLOYMENT_GUIDE.md
```

### 3. 포트 설정
- 기본 포트: 8888
- 포트 변경: 환경 변수 `PORT` 설정
```bash
# Windows
set PORT=3000 && node server.js

# macOS/Linux
PORT=3000 node server.js
```

## 🔒 보안 설정

### 관리자 비밀번호 변경
`server.js` 파일에서 다음 줄을 수정하세요:
```javascript
const ADMIN_PASS = process.env.ADMIN_PASS || 'ckdgh0828!';
```

환경 변수로 설정:
```bash
# Windows
set ADMIN_PASS=새비밀번호 && node server.js

# macOS/Linux
ADMIN_PASS=새비밀번호 node server.js
```

### 방화벽 설정
- 포트 8888 (또는 설정한 포트)를 열어두세요
- HTTPS 사용을 권장합니다 (역방향 프록시 필요)

## 🌐 인터넷 배포

### 로컬 네트워크 접속
1. 서버 IP 주소 확인: `ipconfig` (Windows) 또는 `ifconfig` (macOS/Linux)
2. 다른 기기에서 `http://서버IP:8888` 접속

### 클라우드 배포 (옵션)
1. **AWS EC2 / Lightsail**
   - Node.js 서버 인스턴스 생성
   - PM2 사용하여 프로세스 관리 권장
   ```bash
   npm install -g pm2
   pm2 start server.js --name paddock
   pm2 startup
   pm2 save
   ```

2. **Google Cloud Platform**
   - Compute Engine 인스턴스 생성
   - 방화벽 규칙에서 포트 8888 허용

3. **Heroku / Vercel**
   - `package.json` 파일 필요
   - 배포 플랫폼에 맞춰 설정 수정 필요

## 📱 모바일 앱으로 설치

### PWA 설치
1. 모바일 브라우저에서 http://서버주소:8888 접속
2. "홈 화면에 추가" 옵션 선택
3. 앱처럼 사용 가능

### 안드로이드
- Chrome 브라우저 사용
- 메뉴 > "홈 화면에 추가"

### iOS
- Safari 브라우저 사용
- 공유 버튼 > "홈 화면에 추가"

## 🔍 문제 해결

### 서버가 시작되지 않음
```bash
# Node.js 버전 확인
node --version

# 포트 충돌 확인
# 다른 포트 사용 시 PORT 환경 변수 변경
```

### 브라우저에서 접속 안됨
- 방화벽 설정 확인
- 포트가 올바르게 열려있는지 확인
- 서버가 실행 중인지 확인

### 데이터가 로드되지 않음
- 인터넷 연결 확인 (F1 API 사용)
- API 서버 상태 확인
- 브라우저 콘솔에서 오류 메시지 확인

### 모바일에서 레이아웃 깨짐
- 브라우저 캐시 삭제
- 최신 브라우저 사용 권장
- viewport 메타 태그 확인

## 📊 관리자 기능

### 관리자 패널 접속
1. http://localhost:8888/admin.html 접속
2. 기본 비밀번호: `ckdgh0828!`
3. 보안을 위해 비밀번호 변경 권장

### 관리자 기능
- 시간별 사용자 통계 확인
- 게시글 관리 및 삭제
- 트래픽 시각화

## 🔄 업데이트 및 유지보수

### 데이터 백업
중요 데이터는 자동으로 백업됩니다:
- `posts_db.json.bak` - 게시글 백업
- `analytics_db.json.bak` - 통계 백업

### 로그 확인
서버 로그는 터미널에서 실시간으로 확인 가능합니다.

### 정기 업데이트
- F1 데이터는 30초마다 자동 갱신
- 사용자 통계는 15초마다 기록

## 📞 지원

### 기술 지원
- 이메일: support@paddock-f1.com
- 문서: 이 가이드 파일 참조

### 버전 정보
- 현재 버전: 1.0.0
- 마지막 업데이트: 2026-09-06

## ⚠️ 중요 공지

1. **보안**: 기본 비밀번호를 반드시 변경하세요
2. **백업**: 정기적으로 데이터 폴더 백업 권장
3. **HTTPS**: 인터넷 배포 시 SSL 인증서 사용 권장
4. **법적 준수**: 사용자 데이터 처리 시 개인정보보호법 준수

---

**PADDOCK F1 Hub** - F1 팬을 위한 최고의 커뮤니티 플랫폼
