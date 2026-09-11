# PADDOCK 무료 출시 가이드

이 문서는 도메인을 사지 않고, 현재 프로젝트 파일 그대로 PADDOCK를 인터넷에 공개하는 방법입니다.

## 예상 시간

처음 하는 경우 보통 **20~40분** 정도 걸립니다.

- Node.js가 이미 설치되어 있으면: 약 10~20분
- Node.js와 Cloudflare Tunnel을 모두 설치해야 하면: 약 20~40분
- GitHub에 파일이 이미 올라가 있어도, `server.js`를 실행하는 컴퓨터는 따로 필요합니다.

## 먼저 알아둘 것

- GitHub는 파일을 보관하는 곳입니다.
- `server.js`를 실행하는 컴퓨터가 백엔드 서버입니다.
- 컴퓨터가 꺼지거나 인터넷이 끊기면 앱도 접속할 수 없습니다.
- Firebase는 현재 출시할 때 필요하지 않습니다.
- 도메인을 구매하지 않아도 됩니다.

## 1. Node.js 확인

Windows PowerShell을 열고 다음을 입력합니다.

```powershell
node --version
```

버전이 나오면 다음 단계로 이동합니다.

`node`를 찾을 수 없다는 메시지가 나오면 Node.js LTS를 설치합니다.

```text
https://nodejs.org/
```

설치가 끝나면 PowerShell을 닫았다가 다시 엽니다.

## 2. 프로젝트 폴더로 이동

프로젝트 폴더 경로에 맞게 아래 명령을 실행합니다.

```powershell
cd "프로젝트폴더경로"
```

예시:

```powershell
cd "C:\Users\jae55\.copilot\repos\copilot-worktrees\paddock-f1-hub\paddockapp-hub-supreme-system"
```

`server.js`가 있는 폴더인지 확인합니다.

```powershell
Get-ChildItem server.js
```

## 3. 보안값 설정

현재 관리자 비밀번호를 그대로 사용하려면 아래에서 `ckdgh0828!`을 유지하면 됩니다.

```powershell
$env:ADMIN_PASS = 'ckdgh0828!'
$env:APP_SALT = 'paddock-salt-change-this-to-a-long-random-value-839201'
```

`APP_SALT`는 관리자 토큰을 만드는 비밀 문자열입니다. 다른 사람에게 보여주지 마세요.

이 환경변수는 **현재 PowerShell 창에서만** 유지됩니다. PowerShell을 새로 열면 다시 입력해야 합니다.

## 4. 백엔드 실행

같은 PowerShell 창에서 실행합니다.

```powershell
node server.js
```

다음과 비슷한 메시지가 나오면 정상입니다.

```text
Server Ready at http://localhost:8888
```

이 PowerShell 창은 닫지 마세요. 닫으면 서버가 꺼집니다.

인터넷 브라우저에서 확인합니다.

```text
http://localhost:8888
```

관리자 화면:

```text
http://localhost:8888/admin.html
```

## 5. 무료 인터넷 주소 만들기

Cloudflare Tunnel은 내 컴퓨터의 `localhost:8888`을 임시 인터넷 주소로 연결해주는 무료 도구입니다.

Cloudflare Tunnel 다운로드 페이지:

```text
https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
```

Windows용 `cloudflared`를 다운로드합니다. 다운로드한 파일 이름을 `cloudflared.exe`로 바꾸고, 찾기 쉬운 폴더에 둡니다.

예를 들어 다음 위치에 둡니다.

```text
C:\cloudflared\cloudflared.exe
```

새 PowerShell 창을 열고 다음을 실행합니다.

```powershell
cd C:\cloudflared
.\cloudflared.exe tunnel --url http://localhost:8888
```

잠시 기다리면 다음처럼 생긴 주소가 표시됩니다.

```text
https://something-random.trycloudflare.com
```

이 주소가 다른 사람에게 보내는 앱 주소입니다.

Cloudflare Tunnel을 실행한 PowerShell 창도 닫지 마세요.

## 6. 친구에게 주소 보내기

친구에게 다음 주소를 보냅니다.

```text
https://something-random.trycloudflare.com
```

관리자 페이지는 주소 뒤에 `/admin.html`을 붙입니다.

```text
https://something-random.trycloudflare.com/admin.html
```

관리자 비밀번호는 친구에게 공개하지 마세요.

## 7. 매번 실행할 때 순서

컴퓨터를 다시 켠 뒤에는 다음 순서로 실행합니다.

### 첫 번째 PowerShell

```powershell
cd "프로젝트폴더경로"
$env:ADMIN_PASS = 'ckdgh0828!'
$env:APP_SALT = 'paddock-salt-change-this-to-a-long-random-value-839201'
node server.js
```

### 두 번째 PowerShell

```powershell
cd C:\cloudflared
.\cloudflared.exe tunnel --url http://localhost:8888
```

두 번째 창에 새 주소가 나오면 그 주소를 사용합니다.

## 8. 서버를 끄는 방법

`node server.js`가 실행 중인 창에서 다음 키를 누릅니다.

```text
Ctrl + C
```

Cloudflare Tunnel 창에서도 `Ctrl + C`를 누릅니다.

## 9. 게시글 백업

게시글은 다음 파일에 저장됩니다.

```text
posts_db.json
posts_db.json.bak
```

통계는 다음 파일에 저장됩니다.

```text
analytics_db.json
analytics_db.json.bak
```

앱을 업데이트하기 전에 이 파일들을 다른 폴더에 복사해 두세요. 특히 `posts_db.json`은 게시글이 들어 있는 중요한 파일입니다.

## 10. 자주 생기는 문제

### `ADMIN_PASS and APP_SALT environment variables are required`

환경변수를 먼저 입력하지 않았거나, 다른 PowerShell 창에서 서버를 실행한 경우입니다.

```powershell
$env:ADMIN_PASS = 'ckdgh0828!'
$env:APP_SALT = 'paddock-salt-change-this-to-a-long-random-value-839201'
node server.js
```

### `localhost:8888`이 열리지 않음

- `node server.js`가 실행 중인지 확인합니다.
- `Server Ready at http://localhost:8888` 메시지를 확인합니다.
- 이미 다른 프로그램이 8888 포트를 사용 중인지 확인합니다.

### Cloudflare 주소가 열리지 않음

- `node server.js` 창이 켜져 있는지 확인합니다.
- Cloudflare Tunnel 창이 켜져 있는지 확인합니다.
- Tunnel 명령이 `http://localhost:8888`을 사용하고 있는지 확인합니다.

### 주소가 바뀜

무료 임시 Tunnel 주소는 Tunnel을 다시 실행할 때 바뀔 수 있습니다. 새로 표시된 주소를 사용하면 됩니다.

## 최종 정리

현재 단계에서 필요한 것은 다음 네 가지입니다.

1. Node.js 설치
2. `ADMIN_PASS`와 `APP_SALT` 설정
3. `node server.js` 실행
4. Cloudflare Tunnel 실행

이 방식은 도메인 비용과 Firebase 비용이 **0원**입니다. 대신 서버 역할을 하는 컴퓨터를 켜두어야 합니다.
