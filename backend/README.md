# 🛡️ Google Apps Script (GAS) 보안 백엔드 배포 가이드

본 프로젝트는 별도의 유료 서버 없이 Google Apps Script와 Google Sheets를 결합하여 안전하고 확장 가능한 무과금 서버리스 데이터베이스를 사용합니다.

---

## 📌 3분 배포 절차

1. **새 Google 스프레드시트 생성**:
   - [Google Sheets](https://sheets.new)에 접속하여 새 스프레드시트를 생성합니다.
   - 제목 예시: `2026 플래닛 연말 모임 데이터베이스`
2. **Apps Script 열기**:
   - 상단 메뉴에서 **확장 프로그램 (Extensions) ➔ Apps Script** 클릭
3. **코드 붙여넣기**:
   - 편집기 화면의 기존 코드를 지우고, [`backend/Code.gs`](./Code.gs)의 내용을 전체 복사하여 붙여넣습니다.
   - 상단 디스크 아이콘(Ctrl+S)을 눌러 저장합니다.
4. **웹 앱(Web App)으로 배포**:
   - 우측 상단 파란색 **[배포(Deploy)] ➔ [새 배포(New deployment)]** 클릭
   - 유형 선택: **웹 앱 (Web app)**
   - 설정:
     - **설명**: `v1.0 Production`
     - **다음 사용자 권한으로 실행 (Execute as)**: `나 (Me - 내 구글 계정)`
     - **액세스 권한이 있는 사용자 (Who has access)**: `모든 사용자 (Anyone)`
   - **[배포]** 버튼 클릭 후 구글 계정 승인 완료
5. **웹 앱 URL 복사**:
   - 발급된 웹 앱 URL (`https://script.google.com/macros/s/.../exec`)을 복사합니다.
6. **GitHub Secrets 또는 `.env.local`에 등록**:
   - 로컬 테스트: `.env.local` 파일 생성 후 `VITE_GOOGLE_SCRIPT_URL=발급받은_URL` 추가
   - 프로덕션 배포: GitHub 저장소 **Settings > Secrets and variables > Actions**에 `VITE_GOOGLE_SCRIPT_URL` 시크릿 추가

---

## 🔒 적용된 보안 메커니즘
- **Honeypot 봇 차단**: 악성 크롤러가 숨겨진 폼 필드를 채우면 자동으로 요청 거부
- **관리자 PII 보호**: 올바른 관리자 토큰(`ADMIN_SECRET_KEY`)이 없는 GET 요청은 민감 개인정보(전화번호 등) 조회 원천 차단
- **전화번호 중복 신청 방지**: 동일한 번호로 이미 등록된 경우 중복 생성 방지
- **입력값 XSS 살균**: 스크립트 태그 및 위험 키워드 자동 치환
