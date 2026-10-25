export interface SessionConfig {
  name: string;
  subName?: string;
  time: string;
  location: string;
  description: string;
  capacity: number;
  fee: number;
}

export interface EventConfig {
  isTeaserMode: boolean;
  eventTitle: string;
  subTitle: string;
  noticeNumber: string;
  organization: string;
  establishedYear: number;
  eventDate: string;
  targetDateTime: string;
  recipientTitle: string;
  session1: SessionConfig;
  session2: SessionConfig;
  dressCode: {
    title: string;
    dayStyle: string;
    nightStyle: string;
    items: string[];
  };
  requirements: string[];
  account: {
    bank: string;
    number: string;
    holder: string;
  };
  contact: {
    accountInfo: string;
    inquiryEmail: string;
  };
  googleScriptUrl: string;
}

export const EVENT_CONFIG: EventConfig = {
  isTeaserMode: false, // true: 칠판 티저 모드, false: 가정통신문 정식 오픈
  eventTitle: "2026 플래닛 독서학교 연말모임",
  subTitle: "플래닛의 새학기 & 수학여행",
  noticeNumber: "제2026-1호",
  organization: "플래닛 독서학교 (PLANET since 2017)",
  establishedYear: 2017,
  eventDate: "2026년 12월 19일 (토요일)",
  targetDateTime: "2026-12-19T10:00:00+09:00",
  recipientTitle: "플래닛 여러분 귀하",
  
  session1: {
    name: "플래닛 연말모임 「플래닛의 새학기」",
    subName: "1부 메인 모임",
    time: "10:00 ~ 17:00",
    location: "공간나인 강남점 (서울 강남구)",
    description: "올해의 플래닛 아카이브 회고, 블라인드 책 선물 교환회 및 2026 명예의 전당 어워즈",
    capacity: 35,
    fee: 40000,
  },
  
  session2: {
    name: "연말모임 뒷풀이 「플래닛의 수학여행」",
    subName: "2부 애프터 모임",
    time: "18:00 ~ LATE",
    location: "미정",
    description: "추억의 수학여행 밤, 파자마/프라이빗 야간 토크, 심야 책이야기 및 자유 네트워킹 (예약금 2만원)",
    capacity: 25,
    fee: 20000,
  },
  
  dressCode: {
    title: "학생다운 스쿨룩 & 클래식 프레피 (Geek Chic 한 방울)",
    dayStyle: "교복을 연상시키는 단정한 블레이저, 케이블 니트/베스트, 옥스포드 셔츠, 플리츠 스커트 / 치노 팬츠",
    nightStyle: "수학여행 분위기의 편안한 파자마 또는 이지웨어 지참 가능",
    items: ["클래식 뿔테 / 오벌 안경", "단정한 타이 / 리본", "로퍼 / 스니커즈", "만년필 & 필기구"],
  },
  
  requirements: [
    "동료 학우에게 선물할 엄선된 도서 1권 이상 (정성 담긴 추천 손편지 동봉)",
    "만년필 또는 아날로그 필기구",
    "꺾이지 않는 텐션과 열린 마음",
  ],
  
  account: {
    bank: "하나은행",
    number: "439-911050-56507",
    holder: "한지수",
  },
  
  contact: {
    accountInfo: "하나은행 439-911050-56507 (예금주: 한지수)",
    inquiryEmail: "contact@planet-school.org",
  },
  
  // 배포된 Google Apps Script Web App URL (.env.local 우선 참조)
  googleScriptUrl: (import.meta.env.VITE_GOOGLE_SCRIPT_URL as string) || "https://script.google.com/macros/s/AKfycbwundzXPh6V07GOlwPVlGApvr7FU64BWfZ2Y8eMgxPWYUjDpwDe0ZVeQAtEEJJc3X7o/exec"
};
