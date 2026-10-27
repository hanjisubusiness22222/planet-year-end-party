# 🎒 2026 플래닛 독서학교 연말모임 「플래닛의 새학기 & 수학여행」
> **"플래닛 독서학교 가정통신문 — 플래닛 여러분을 위한 설레는 새학기와 추억의 수학여행"**

[![Deploy to GitHub Pages](https://github.com/hanjisubusiness22222/MVPproject/actions/workflows/deploy.yml/badge.svg)](https://github.com/hanjisubusiness22222/MVPproject/actions)

---

## 📌 행사 개요 (Event Overview)

- **주최**: 플래닛 독서학교 (**PLANET Reading School** / since 2017)
- **일시**: **2026년 12월 19일 (토)**
  - **1부 (Main Session)**: `12:00 ~ 17:00` | 플래닛 연말모임 **「플래닛의 새학기」** @ 공간나인 강남점
  - **2부 (After Session)**: `18:00 ~ LATE` | 연말모임 애프터 **「플래닛의 수학여행」** @ 강남 프라이빗 파티룸
- **대상**: **플래닛 멤버 누구나** (기존 학우 & 신규 학우)
- **드레스 코드**: **단정한 스쿨룩 & 클래식 프레피 (Geek Chic 한 방울)**
  - 교복 감성의 블레이저, 케이블 니트/베스트, 셔츠, 플리츠 스커트 / 치노 팬츠, 클래식 뿔테 안경
- **준비물**: 동료 학우에게 선물할 엄선된 도서 1권 이상 (추천 손편지 동봉), 필기구, 꺾이지 않는 텐션

---

## ✨ 주요 기능 (Key Features)

| 기능 | 설명 |
| :--- | :--- |
| **0. 인터랙티브 티저 (Teaser)** | 초록 칠판과 분필 손글씨 D-Day 카운트다운, 분필 지우개 비밀 힌트, 사전 알림 신청 |
| **1. PLANET 가정통신문 (제 2026-1호)** | 실제 학교 가정통신문 양식(결재 직인, 격자 레이아웃), 1부 새학기 & 2부 수학여행 일과표 |
| **2. 가정통신문 회신서 (RSVP)** | 성함, 연락처, 1부/2부 참석 선택, 선물 도서 한 줄 힌트 입력 폼 |
| **3. 플래닛 모바일 학생증 발급** | 신청 즉시 개인 성함·고유 학번·바코드가 새겨진 **모바일 학생증 이미지(PNG) 다운로드** |
| **4. 추억의 교실 자리바꾸기 (`/seat`)** | 교탁과 분단 책상 UI, **남/녀 성비 균등 + 신규/기존 균형** 2대 알고리즘 기반 자리배치 (빔프로젝터 모드) |
| **5. 학생회비 투명 정산 (`/settlement`)** | 회비 수입/실비 지출 내역 및 실물 영수증 증빙 공개 (0원 정산 원칙) |
| **6. 관리자 대시보드 (`/admin`)** | 구글 시트 실시간 연동, 입금 확인 토글, 티저/정산 공개 원클릭 스위치 |

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons, Canvas-confetti, Framer Motion
- **Backend & Database**: Google Sheets API + Google Apps Script (Serverless, 완전 무료)
- **CI/CD & Hosting**: **GitHub Actions** 자동 빌드 파이프라인 ➔ **GitHub Pages** 무중단 무료 호스팅

---

## ⏱️ 5일 개발 스프린트 로드맵 (5-Day Sprint)

- **Day 1**: 프로젝트 기반 환경 구축, 칠판/가정통신문 디자인 시스템 및 **티저 페이지 배포**
- **Day 2**: PLANET 가정통신문 서간문 & **가정통신문 회신서(RSVP) 폼 UI** 구현
- **Day 3**: Google Apps Script 연동(실시간 저장) & **모바일 학생증(PNG 다운로드) 발급** 시스템 완성
- **Day 4**: **추억의 교실 자리바꾸기 프로그램 (`/seat`)** 개발 (2대 밸런스 알고리즘) & **관리자 페이지** 구축
- **Day 5**: **학생회비 투명 결산 공개 페이지 (`/settlement`)** 구현, 전 기기 반응형 검수 및 최종 배포

---

## 📖 상세 기획 문서
프로젝트의 전체 아키텍처, 와이어프레임 및 구체적인 데이터 스펙은 [PROJECT_PLAN.md](file:///c:/Users/pile1/OneDrive/%EB%B0%94%ED%83%95%20%ED%99%94%EB%A9%B4/%EC%88%98%EC%97%85/1%ED%95%99%EB%85%84%202%ED%95%99%EA%B8%B0/%EA%B8%B0%EC%88%A0%EA%B0%9C%EB%B0%9C%EC%97%B0%EA%B5%AC%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/%EC%97%B0%EB%A7%90%EB%AA%A8%EC%9E%84%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80/PROJECT_PLAN.md)에서 확인하실 수 있습니다.
