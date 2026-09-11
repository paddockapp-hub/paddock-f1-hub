# 🏎️ PADDOCK F1 Hub

## 빠른 시작

### Windows 사용자
```
start_server.bat 더블클릭
```

### macOS/Linux 사용자
```bash
chmod +x start_server.sh
./start_server.sh
```

### 수동 시작
```bash
node server.js
```

## 접속 정보
- **주소**: http://localhost:8888
- **관리자 패널**: http://localhost:8888/admin.html
- **관리자 비밀번호**: `ADMIN_PASS` 환경변수로 설정

## 주요 기능
- 🏆 실시간 F1 드라이버/팀 순위표
- 📅 2026 시즌 레이스 캘린더
- 💬 팬 커뮤니티 게시판
- 📊 관리자 통계 대시보드
- 📱 모바일 앱 (PWA)

## 시스템 요구사항
- Node.js 14.0.0 이상
- 512MB RAM 이상
- 100MB 디스크 공간

## 상세 가이드
`DEPLOYMENT_GUIDE.md` 파일을 참조하세요.

## 문제 해결
서버가 시작되지 않으면:
1. Node.js 설치 확인: `node --version`
2. 포트 충돌 확인
3. 방화벽 설정 확인

---

**PADDOCK F1 Hub v1.0.0** - F1 팬을 위한 최고의 커뮤니티
