# GitHub 연동 가이드

## 📋 GitHub 리포지토리 생성

### 1. GitHub에서 새 리포지토리 생성
1. https://github.com/new 접속
2. 리포지토리 이름: `paddock-f1-hub`
3. 설명: `PADDOCK - All-in-one F1 Fan Community & Live Real-time Engine`
4. Public/Private 선택 (Public 권장)
5. "Initialize this repository with a README" 체크 해제
6. "Create repository" 클릭

### 2. Git 초기화 및 연동

#### Windows 사용자:
```bash
# 프로젝트 폴더로 이동
cd C:\Users\jae55\Downloads\PADDOCK_PRODUCTION

# Git 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: PADDOCK F1 Hub v1.0.0"

# GitHub 리모트 추가
git remote add origin https://github.com/YOUR_USERNAME/paddock-f1-hub.git

# 메인 브랜치 설정
git branch -M main

# GitHub에 푸시
git push -u origin main
```

#### macOS/Linux 사용자:
```bash
# 프로젝트 폴더로 이동
cd /path/to/PADDOCK_PRODUCTION

# Git 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: PADDOCK F1 Hub v1.0.0"

# GitHub 리모트 추가
git remote add origin https://github.com/YOUR_USERNAME/paddock-f1-hub.git

# 메인 브랜치 설정
git branch -M main

# GitHub에 푸시
git push -u origin main
```

### 3. GitHub Pages 배포 (선택 사항)

#### 정적 사이트 배포:
1. GitHub 리포지토리에서 "Settings" → "Pages"
2. Source: "Deploy from a branch"
3. Branch: `main` → `/ (root)`
4. "Save" 클릭

**주의**: GitHub Pages는 정적 사이트만 지원하므로, 현재 Node.js 서버는 배포할 수 없습니다.
대신 Vercel, Netlify, Railway 등의 플랫폼을 추천합니다.

### 4. Vercel에 배포 (권장)

#### Vercel을 통한 전체 앱 배포:
1. https://vercel.com/signup 가입
2. "New Project" 클릭
3. GitHub 리포지토리 가져오기
4. 프레임워크: "Other"
5. 빌드 명령어: (없음)
6. 출력 디렉토리: (없음)
7. 환경 변수:
   - `PORT`: 8888
   - `ADMIN_PASS`: (원하는 비밀번호)
8. "Deploy" 클릭

### 5. Railway에 배드 (대안)

#### Railway를 통한 Node.js 배포:
1. https://railway.app/ 가입
2. "New Project" → "Deploy from GitHub repo"
3. 리포지토리 선택
4. 환경 변수 설정:
   - `PORT`: 8888
   - `ADMIN_PASS`: (원하는 비밀번호)
5. "Deploy" 클릭

## 🔧 배포 후 설정

### 1. 환경 변수 설정
배포 플랫폼에서 다음 환경 변수를 설정하세요:
- `PORT`: 8888 (또는 플랫폼 기본값)
- `ADMIN_PASS`: 안전한 비밀번호
- `NODE_ENV`: production

### 2. 도메인 설정 (선택 사항)
- Vercel/Railway에서 무료 도메인 제공
- 또는 자체 도메인 연결 가능

### 3. HTTPS 설정
- 대부분의 플랫폼에서 자동 HTTPS 제공
- 무료 SSL 인증서 자동 발급

## 📊 배포 확인

### 로컬 테스트:
```bash
# 서버 중지
Ctrl+C

# 다시 시작
node server.js
```

### 배포된 서버 테스트:
- 배포된 URL 접속
- 모든 기능 작동 확인
- 모바일 반응형 테스트

## 🔄 지속적 배포 (CI/CD)

### 자동 배포 설정:
1. GitHub 리포지토리에서 "Actions" 탭
2. "New workflow" 클릭
3. Vercel/Railway와 GitHub 연동
4. 푸시 시 자동 배포 설정

## 📝 커밋 메시지 규칙

```bash
# 기능 추가
git commit -m "feat: add user authentication"

# 버그 수정
git commit -m "fix: resolve mobile navigation issue"

# 문서 업데이트
git commit -m "docs: update deployment guide"

# 스타일 변경
git commit -m "style: format code"
```

## 🚀 전체 배포 흐름

1. **로컬 개발**: `node server.js`
2. **커밋**: `git add . && git commit -m "message"`
3. **푸시**: `git push origin main`
4. **자동 배포**: Vercel/Railway가 자동으로 배포
5. **테스트**: 배포된 URL에서 테스트

---

**다음 단계: 전체 패키지 압축 및 배포 준비**
