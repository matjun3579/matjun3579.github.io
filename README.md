# PARK Junho Personal Website

GitHub Pages용 개인 포트폴리오 및 BFS 최단 경로 체험 사이트입니다.

## 로컬 미리보기

1. 저장소를 내려받은 뒤 해당 폴더를 VS Code로 엽니다.
2. 터미널을 열고 `cd` 명령으로 저장소 폴더로 이동합니다.
3. 다음 명령을 실행합니다.
   ```powershell
   python -m http.server 8000
   ```
4. 브라우저 주소창에 `http://localhost:8000`을 입력합니다.

Python이 없다면 VS Code의 Live Server 확장을 설치한 뒤 `index.html`에서 "Open with Live Server"를 선택할 수 있습니다.

## GitHub Pages 배포

1. GitHub 저장소에서 `Settings`를 엽니다.
2. 왼쪽 메뉴의 `Pages`를 선택합니다.
3. `Build and deployment` 아래 `Source`를 `Deploy from a branch`로 설정합니다.
4. 브랜치는 `main`, 폴더는 `/ (root)`로 선택하고 저장합니다.
5. 1~2분 뒤 공개 주소 `https://matjun3579.github.io`로 접속해 새 페이지를 확인합니다.
