import React, { useState } from 'react';
import { 
  Receipt, 
  ArrowLeft, 
  CheckCircle2, 
  Download, 
  Printer, 
  Building2, 
  Coffee, 
  Gift, 
  Award, 
  Moon, 
  UtensilsCrossed, 
  Package, 
  HelpCircle,
  FileText,
  Calendar,
  X
} from 'lucide-react';

interface SettlementItem {
  id: string;
  category: 'income' | 'expense_session1' | 'expense_session2' | 'expense_common';
  title: string;
  detail: string;
  vendor: string;
  date: string;
  amount: number;
  paymentMethod: string;
  receiptNumber: string;
  receiptType: '신용카드 매출전표' | '현금영수증' | '전자세금계산서' | '계좌이체 영수증';
  itemsBreakdown: { name: string; qty: number; unitPrice: number }[];
}

const SETTLEMENT_DATA: SettlementItem[] = [
  // 수입
  {
    id: 'INC-01',
    category: 'income',
    title: '1차 메인모임 「새학기」 회비 입금',
    detail: '1차 참가비 40,000원 × 32명 완납',
    vendor: '카카오뱅크 모임통장',
    date: '2026-12-18',
    amount: 1280000,
    paymentMethod: '계좌입금',
    receiptNumber: 'BANK-20261218-001',
    receiptType: '계좌이체 영수증',
    itemsBreakdown: [
      { name: '1차 참가비 (32명)', qty: 32, unitPrice: 40000 }
    ]
  },
  {
    id: 'INC-02',
    category: 'income',
    title: '2차 애프터모임 「수학여행」 예약금 입금',
    detail: '2차 예약금 20,000원 × 25명 완납',
    vendor: '카카오뱅크 모임통장',
    date: '2026-12-18',
    amount: 500000,
    paymentMethod: '계좌입금',
    receiptNumber: 'BANK-20261218-002',
    receiptType: '계좌이체 영수증',
    itemsBreakdown: [
      { name: '2차 예약금 (25명)', qty: 25, unitPrice: 20000 }
    ]
  },
  {
    id: 'INC-03',
    category: 'income',
    title: '플래닛 운영위원회 발전기금 지원금',
    detail: '잔액 0원 정산 및 참가자 전원 웰컴키트 보조를 위한 운영위 자체 지원',
    vendor: '플래닛 운영위원회',
    date: '2026-12-18',
    amount: 595000,
    paymentMethod: '운영비 충당',
    receiptNumber: 'COMM-20261218-001',
    receiptType: '계좌이체 영수증',
    itemsBreakdown: [
      { name: '운영위 특별 지원금', qty: 1, unitPrice: 595000 }
    ]
  },

  // 1부 지출
  {
    id: 'EXP-01',
    category: 'expense_session1',
    title: '공간나인 강남점 대관료 (1부)',
    detail: '1부 행사장 10:00 ~ 17:00 (7시간) 단독 대관 및 빔프로젝터 사용료',
    vendor: '공간나인 강남점 (주식회사 나인스페이스)',
    date: '2026-12-05',
    amount: 770000,
    paymentMethod: '신용카드 (일시불)',
    receiptNumber: 'CRD-20261205-8821',
    receiptType: '신용카드 매출전표',
    itemsBreakdown: [
      { name: '메인 홀 대관 (7시간)', qty: 7, unitPrice: 100000 },
      { name: '음향/빔프로젝터 패키지', qty: 1, unitPrice: 70000 }
    ]
  },
  {
    id: 'EXP-02',
    category: 'expense_session1',
    title: '1부 환영 다과 및 스페셜티 원두 커피 케이터링',
    detail: '학우 35인 기준 핸드드립 커피 2종, 레트로 델리 쿠키 및 전통 다과 세트',
    vendor: '학사당 베이커리 & 로스터리',
    date: '2026-12-19',
    amount: 385000,
    paymentMethod: '신용카드 (일시불)',
    receiptNumber: 'CRD-20261219-1049',
    receiptType: '신용카드 매출전표',
    itemsBreakdown: [
      { name: '케이터링 커피 바스켓 (35인)', qty: 35, unitPrice: 6000 },
      { name: '구움과자 & 클래식 다과 박스', qty: 35, unitPrice: 5000 }
    ]
  },
  {
    id: 'EXP-03',
    category: 'expense_session1',
    title: '2026 명예의 전당 어워즈 상패 & 기념 도서',
    detail: '다독상, 토론상, 다정한 플래닛상 원목 감사패 및 플래닛 추천도서 3권',
    vendor: '광화문 아날로그 공방 / 교보문고',
    date: '2026-12-14',
    amount: 210000,
    paymentMethod: '신용카드 (일시불)',
    receiptNumber: 'CRD-20261214-9912',
    receiptType: '전자세금계산서',
    itemsBreakdown: [
      { name: '원목 레이저 각인 상패 (3개)', qty: 3, unitPrice: 50000 },
      { name: '어워즈 특별 도서 (3권)', qty: 3, unitPrice: 20000 }
    ]
  },

  // 2부 지출
  {
    id: 'EXP-04',
    category: 'expense_session2',
    title: '2부 모임 장소 대관료 (수학여행)',
    detail: '2부 수학여행 야간 장소 18:00 ~ 익일 06:00 올나잇 대관 (장소 미정/추후 확정)',
    vendor: '살롱 드 강남 (Salon de Gangnam)',
    date: '2026-12-08',
    amount: 480000,
    paymentMethod: '계좌이체',
    receiptNumber: 'TAX-20261208-4109',
    receiptType: '현금영수증',
    itemsBreakdown: [
      { name: '파티룸 올나잇 패키지', qty: 1, unitPrice: 480000 }
    ]
  },
  {
    id: 'EXP-05',
    category: 'expense_session2',
    title: '2부 야간 살롱 토크 다이닝 & 핑거푸드',
    detail: '야간 토크용 수제 샤퀴테리, 와인/무알콜 음료, 수학여행 테마 추억의 야식',
    vendor: '델리 마켓 & 피자리아',
    date: '2026-12-19',
    amount: 325000,
    paymentMethod: '신용카드 (일시불)',
    receiptNumber: 'CRD-20261219-5501',
    receiptType: '신용카드 매출전표',
    itemsBreakdown: [
      { name: '핑거푸드 & 치즈 플레이터 (25인)', qty: 25, unitPrice: 9000 },
      { name: '야식 피자 및 음료 세트', qty: 1, unitPrice: 100000 }
    ]
  },

  // 공통 지출
  {
    id: 'EXP-06',
    category: 'expense_common',
    title: '플래닛 모바일 학생증 & 웰컴 패키지 인쇄비',
    detail: '참석자 전원 실물 명찰 케이스, 2026 금박 북마크, 학교 가정통신문 안내지 인쇄',
    vendor: '을지로 프린트 팩토리',
    date: '2026-12-12',
    amount: 175000,
    paymentMethod: '신용카드 (일시불)',
    receiptNumber: 'CRD-20261212-3021',
    receiptType: '신용카드 매출전표',
    itemsBreakdown: [
      { name: '아크릴 명찰 & 넥스트랩 (40세트)', qty: 40, unitPrice: 2500 },
      { name: '2026 한정판 금박 웰컴 책갈피', qty: 50, unitPrice: 1000 },
      { name: '가정통신문 컬러 출력 (고급 모조지)', qty: 50, unitPrice: 500 }
    ]
  },
  {
    id: 'EXP-07',
    category: 'expense_common',
    title: '진행 소품 및 블라인드 북 선물 포장재',
    detail: '책 선물 교환용 크라프트 포장지, 빨간 실링 왁스, 분필 및 지우개 소모품',
    vendor: '알파문구 본점',
    date: '2026-12-15',
    amount: 30000,
    paymentMethod: '신용카드 (일시불)',
    receiptNumber: 'CRD-20261215-0912',
    receiptType: '현금영수증',
    itemsBreakdown: [
      { name: '크라프트 포장지 & 실링 왁스 세트', qty: 1, unitPrice: 20000 },
      { name: '칠판 분필 & 진행용 문구류', qty: 1, unitPrice: 10000 }
    ]
  }
];

interface SettlementReportProps {
  onBack?: () => void;
  onGoToSeat?: () => void;
  onGoToTeaser?: () => void;
}

export const SettlementReport: React.FC<SettlementReportProps> = ({
  onBack,
  onGoToSeat,
  onGoToTeaser
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'income' | 'expense_session1' | 'expense_session2' | 'expense_common'>('all');
  const [activeReceipt, setActiveReceipt] = useState<SettlementItem | null>(null);

  // 재정 합계 계산
  const totalIncome = SETTLEMENT_DATA
    .filter(i => i.category === 'income')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalExpense = SETTLEMENT_DATA
    .filter(i => i.category !== 'income')
    .reduce((sum, i) => sum + i.amount, 0);

  const balance = totalIncome - totalExpense;

  const filteredItems = selectedCategory === 'all'
    ? SETTLEMENT_DATA
    : SETTLEMENT_DATA.filter(i => i.category === selectedCategory);

  const formatWon = (num: number) => {
    return '₩' + num.toLocaleString('ko-KR');
  };

  // CSV 다운로드 기능
  const handleExportCSV = () => {
    const headers = ['구분', '항목명', '세부내용', '거래처', '결제일자', '금액(원)', '결제수단', '영수증번호'];
    const rows = SETTLEMENT_DATA.map(item => [
      item.category === 'income' ? '수입' : '지출',
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.detail.replace(/"/g, '""')}"`,
      `"${item.vendor.replace(/"/g, '""')}"`,
      item.date,
      item.amount,
      item.paymentMethod,
      item.receiptNumber
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `2026_플래닛_독서학교_학생회비_결산보고서_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 인쇄 기능
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-[#1f1b18] py-4 sm:py-8 px-2.5 sm:px-6 pb-24 sm:pb-12 font-sans">
      
      {/* 상단 네비게이션 바 */}
      <div className="max-w-4xl mx-auto mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-[#d8d3c7] bg-white hover:bg-[#ede8dc] text-xs font-serif text-[#333] transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-[#b82828]" />
          <span>관리자 대시보드로 돌아가기</span>
        </button>

        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {onGoToSeat && (
            <button
              onClick={onGoToSeat}
              className="px-2.5 py-1.5 rounded-lg border border-[#c8c0b0] bg-white hover:bg-[#ede8dc] text-xs font-serif text-[#333] transition-all shadow-sm"
            >
              자리 배치
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-[#c8c0b0] bg-white hover:bg-[#f0ece1] text-xs font-serif text-[#1b3323] transition-all shadow-sm"
            title="CSV 파일로 저장"
          >
            <Download className="w-3.5 h-3.5 text-[#2e5238]" />
            <span className="hidden sm:inline">CSV 다운로드</span>
            <span className="sm:hidden">CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#1b3323] hover:bg-[#112217] text-white text-xs font-serif font-bold transition-all shadow-sm"
            title="보고서 인쇄"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>인쇄</span>
          </button>
        </div>
      </div>

      {/* 정산 보고서 본문 컨테이너 (레트로 공문서 느낌) */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl border-2 border-[#1f1b18] shadow-2xl p-3.5 sm:p-8 md:p-10 relative overflow-hidden">
        
        {/* 상단 공문 헤더 & 3단 결재란 */}
        <div className="border-b-2 border-[#1f1b18] pb-4 sm:pb-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            
            {/* 좌측: 공문 제목 및 발송정보 */}
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#1b3323] text-white text-[10px] sm:text-[11px] font-mono mb-1.5">
                <Receipt className="w-3 h-3 text-[#dfc27d]" />
                <span>제 2026-결산1호</span>
              </div>
              <h1 className="text-base sm:text-2xl md:text-3xl font-serif font-black tracking-tight text-[#111]">
                2026 플래닛 독서학교 연말모임 학생회비 투명 정산 보고서
              </h1>
              <p className="text-xs sm:text-sm font-serif text-[#555] mt-1">
                주최: 플래닛 독서학교 학생회 및 2026 연말모임준비위원회
              </p>
            </div>

            {/* 우측: 3단 결재 도장 (담당/감사/대표) */}
            <div className="self-end sm:self-auto border border-[#1f1b18] bg-[#fbf9f4] text-center text-xs font-serif">
              <div className="bg-[#ede8dc] border-b border-[#1f1b18] px-3 py-1 font-bold text-[11px] text-[#333]">
                결 재 및 감 사
              </div>
              <div className="grid grid-cols-3 divide-x divide-[#1f1b18]">
                <div className="p-2 w-16">
                  <div className="text-[10px] text-[#666] mb-1">총 무</div>
                  <div className="w-9 h-9 mx-auto rounded-full border-2 border-[#a62b2b] flex items-center justify-center text-[#a62b2b] text-[10px] font-bold transform -rotate-12 bg-red-50/50">
                    확인
                  </div>
                </div>
                <div className="p-2 w-16">
                  <div className="text-[10px] text-[#666] mb-1">감 사</div>
                  <div className="w-9 h-9 mx-auto rounded-full border-2 border-[#a62b2b] flex items-center justify-center text-[#a62b2b] text-[10px] font-bold transform rotate-6 bg-red-50/50">
                    적정
                  </div>
                </div>
                <div className="p-2 w-16">
                  <div className="text-[10px] text-[#666] mb-1">회 장</div>
                  <div className="w-9 h-9 mx-auto rounded-full border-2 border-[#a62b2b] flex items-center justify-center text-[#a62b2b] text-[10px] font-bold transform -rotate-6 bg-red-50/50">
                    승인
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 투명 정산 원칙 선언 배너 */}
        <div className="mb-8 p-4 rounded-lg bg-[#f8f6f0] border-l-4 border-[#2e5238] text-xs font-serif leading-relaxed text-[#333] space-y-1">
          <div className="font-bold text-[#1b3323] flex items-center space-x-1.5 text-sm">
            <CheckCircle2 className="w-4 h-4 text-[#2e5238]" />
            <span>플래닛 독서학교 0원 정산 원칙 (Zero-Balance Transparency)</span>
          </div>
          <p>
            플래닛 독서학교는 영리를 일절 추구하지 않는 비영리 자율 독서 공동체입니다. 참가 학우분들이 납부해주신 모든 회비는
            대관, 케이터링, 웰컴 패키지 제작 등 행사 운영 실비에 100% 사용되었으며, 1원 단위까지 영수증 증빙과 함께 완전 공개합니다.
          </p>
        </div>

        {/* 3대 핵심 재정 지표 요약 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          
          {/* 총 수입 */}
          <div className="p-4 rounded-xl border border-[#d8d3c7] bg-[#faf8f5] shadow-sm">
            <div className="flex items-center justify-between text-xs font-serif text-[#666] mb-1">
              <span>총 수입 (Income)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#eef5f0] text-[#2e5238] font-bold">100% 입금</span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-[#2e5238]">
              {formatWon(totalIncome)}
            </div>
            <p className="text-[11px] font-serif text-[#777] mt-1">
              1부 32명 + 2부 25명 회비 및 운영 지원
            </p>
          </div>

          {/* 총 지출 */}
          <div className="p-4 rounded-xl border border-[#d8d3c7] bg-[#faf8f5] shadow-sm">
            <div className="flex items-center justify-between text-xs font-serif text-[#666] mb-1">
              <span>총 지출 (Expenditure)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-[#b82828] font-bold">실비 집행</span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-[#b82828]">
              {formatWon(totalExpense)}
            </div>
            <p className="text-[11px] font-serif text-[#777] mt-1">
              대관료 2건, 다과 2건, 굿즈/상패 등 7건
            </p>
          </div>

          {/* 최종 잔액 */}
          <div className="p-4 rounded-xl border-2 border-[#1b3323] bg-[#f2f6f3] shadow-sm">
            <div className="flex items-center justify-between text-xs font-serif text-[#1b3323] mb-1">
              <span className="font-bold">최종 잔액 (Balance)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#2e5238] text-white font-bold">0원 정산 완료</span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-[#1b3323]">
              {formatWon(balance)}
            </div>
            <p className="text-[11px] font-serif text-[#2e5238] mt-1 font-semibold">
              ✓ 차액 0원 완전 일치 (수익금 0원)
            </p>
          </div>

        </div>

        {/* 카테고리 필터 탭 */}
        <div className="flex items-center space-x-1.5 border-b border-[#ddd] pb-3 mb-6 overflow-x-auto text-xs font-serif print:hidden">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#1b3323] text-white font-bold shadow-sm'
                : 'bg-white hover:bg-[#ede8dc] text-[#555] border border-[#e0dad0]'
            }`}
          >
            전체 내역 ({SETTLEMENT_DATA.length})
          </button>
          <button
            onClick={() => setSelectedCategory('income')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === 'income'
                ? 'bg-[#2e5238] text-white font-bold shadow-sm'
                : 'bg-white hover:bg-[#ede8dc] text-[#555] border border-[#e0dad0]'
            }`}
          >
            수입 내역 ({SETTLEMENT_DATA.filter(i => i.category === 'income').length})
          </button>
          <button
            onClick={() => setSelectedCategory('expense_session1')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === 'expense_session1'
                ? 'bg-[#b82828] text-white font-bold shadow-sm'
                : 'bg-white hover:bg-[#ede8dc] text-[#555] border border-[#e0dad0]'
            }`}
          >
            1부 새학기 지출 ({SETTLEMENT_DATA.filter(i => i.category === 'expense_session1').length})
          </button>
          <button
            onClick={() => setSelectedCategory('expense_session2')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === 'expense_session2'
                ? 'bg-[#405d45] text-white font-bold shadow-sm'
                : 'bg-white hover:bg-[#ede8dc] text-[#555] border border-[#e0dad0]'
            }`}
          >
            2부 수학여행 지출 ({SETTLEMENT_DATA.filter(i => i.category === 'expense_session2').length})
          </button>
          <button
            onClick={() => setSelectedCategory('expense_common')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === 'expense_common'
                ? 'bg-[#4a3b32] text-white font-bold shadow-sm'
                : 'bg-white hover:bg-[#ede8dc] text-[#555] border border-[#e0dad0]'
            }`}
          >
            공통 물품 지출 ({SETTLEMENT_DATA.filter(i => i.category === 'expense_common').length})
          </button>
        </div>

        {/* 상세 입출금 내역 테이블 */}
        <div className="overflow-x-auto -mx-1 sm:mx-0 mb-8 border border-[#1f1b18] rounded-lg">
          <table className="min-w-[500px] sm:min-w-full text-left text-xs font-serif border-collapse">
            <thead>
              <tr className="bg-[#ede8dc] text-[#1f1b18] font-bold border-b border-[#1f1b18]">
                <th className="p-3 w-20 text-center">구분</th>
                <th className="p-3">항목 및 세부내용</th>
                <th className="p-3 hidden md:table-cell">거래처</th>
                <th className="p-3 text-center hidden sm:table-cell">일자</th>
                <th className="p-3 text-right">금액</th>
                <th className="p-3 text-center print:hidden">증빙</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e4dc]">
              {filteredItems.map((item) => {
                const isIncome = item.category === 'income';
                return (
                  <tr key={item.id} className="hover:bg-[#faf8f5] transition-colors">
                    
                    {/* 구분 뱃지 */}
                    <td className="p-3 text-center">
                      {isIncome ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#eef5f0] text-[#2e5238] border border-[#c4e0cb]">
                          수입
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fdf0f0] text-[#b82828] border border-[#f5c6c6]">
                          지출
                        </span>
                      )}
                    </td>

                    {/* 항목 및 내용 */}
                    <td className="p-3">
                      <div className="font-bold text-[#1f1b18] text-xs sm:text-sm">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#666] mt-0.5">
                        {item.detail}
                      </div>
                    </td>

                    {/* 거래처 */}
                    <td className="p-3 text-[#555] hidden md:table-cell text-[11px]">
                      {item.vendor}
                    </td>

                    {/* 일자 */}
                    <td className="p-3 text-center text-[#777] font-mono text-[11px] hidden sm:table-cell">
                      {item.date}
                    </td>

                    {/* 금액 */}
                    <td className="p-3 text-right font-mono font-bold text-xs sm:text-sm">
                      <span className={isIncome ? 'text-[#2e5238]' : 'text-[#b82828]'}>
                        {isIncome ? '+' : '-'}{formatWon(item.amount)}
                      </span>
                    </td>

                    {/* 증빙 영수증 버튼 */}
                    <td className="p-3 text-center print:hidden">
                      <button
                        onClick={() => setActiveReceipt(item)}
                        className="px-2 py-1 rounded border border-[#d8d3c7] bg-white hover:bg-[#ede8dc] text-[11px] font-serif text-[#1b3323] inline-flex items-center space-x-1 transition-all shadow-xs"
                      >
                        <Receipt className="w-3 h-3 text-[#b82828]" />
                        <span>영수증</span>
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#f0ece1] border-t-2 border-[#1f1b18] font-bold">
                <td colSpan={2} className="p-3 text-xs font-serif">
                  선택 합계 ({filteredItems.length}건)
                </td>
                <td className="hidden md:table-cell"></td>
                <td className="hidden sm:table-cell"></td>
                <td className="p-3 text-right font-mono text-sm text-[#111]">
                  {formatWon(filteredItems.reduce((acc, curr) => acc + curr.amount, 0))}
                </td>
                <td className="print:hidden"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 회계감사 의견서 및 서명란 */}
        <div className="border border-[#1f1b18] p-5 rounded-lg bg-[#faf8f5] space-y-4">
          <div className="border-b border-[#e0dad0] pb-2 flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-[#1b3323]">
              ■ 2026 플래닛 독서학교 회계감사위원 총평 ■
            </span>
            <span className="text-[11px] font-mono text-[#888]">
              감사일자: 2026. 12. 20.
            </span>
          </div>

          <p className="text-xs font-serif leading-relaxed text-[#444]">
            본 회계감사위원단은 2026년 12월 19일 진행된 플래닛 독서학교 연말모임(1부 새학기 & 2부 수학여행)의 
            모든 입출금 내역 및 금융거래 증빙을 면밀히 대조·검토하였습니다.
            검토 결과, 모든 수입과 지출은 정관 및 행사 운영 계획에 따라 적법하게 집행되었으며,
            잔여 회비 없이 <strong>총 수입 2,375,000원 대 총 지출 2,375,000원으로 잔액 0원 정산</strong>이
            투명하고 정확하게 완료되었음을 엄숙히 확인합니다.
          </p>

          <div className="pt-3 border-t border-[#eee] flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-serif text-[#666] gap-2">
            <div>
              <strong>회계총무:</strong> 김플래닛 (인) &nbsp;|&nbsp; <strong>감사위원:</strong> 이책방, 박학우 (인)
            </div>
            <div className="font-bold text-[#111]">
              플래닛 독서학교 연말모임준비위원회 일동
            </div>
          </div>
        </div>

      </div>

      {/* 실물 영수증 증빙 팝업 모달 */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border-2 border-[#222] max-w-sm w-full p-6 shadow-2xl relative font-mono text-xs">
            
            {/* 닫기 버튼 */}
            <button
              onClick={() => setActiveReceipt(null)}
              className="absolute top-3 right-3 p-1 rounded-full text-[#666] hover:text-[#111] hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 영수증 상단 헤더 */}
            <div className="text-center border-b-2 border-dashed border-[#444] pb-3 mb-3">
              <div className="text-sm font-bold tracking-widest text-[#111]">
                [ {activeReceipt.receiptType} ]
              </div>
              <div className="text-xs text-[#555] mt-1">
                {activeReceipt.vendor}
              </div>
              <div className="text-[10px] text-[#777] mt-0.5">
                증빙번호: {activeReceipt.receiptNumber}
              </div>
            </div>

            {/* 거래 정보 */}
            <div className="space-y-1 text-[11px] text-[#444] border-b border-dashed border-[#ccc] pb-3 mb-3">
              <div className="flex justify-between">
                <span>거래일시:</span>
                <span>{activeReceipt.date} 14:30:22</span>
              </div>
              <div className="flex justify-between">
                <span>결제수단:</span>
                <span>{activeReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>승인상태:</span>
                <span className="font-bold text-[#2e5238]">정상승인</span>
              </div>
            </div>

            {/* 품목 내역 */}
            <div className="border-b-2 border-dashed border-[#444] pb-3 mb-3">
              <div className="text-[11px] font-bold text-[#222] mb-1.5 flex justify-between">
                <span>품목 / 적요</span>
                <span>금액</span>
              </div>
              <div className="space-y-1.5">
                {activeReceipt.itemsBreakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] text-[#333]">
                    <div>
                      <div>{item.name}</div>
                      <div className="text-[10px] text-[#888]">
                        {formatWon(item.unitPrice)} × {item.qty}
                      </div>
                    </div>
                    <div className="font-bold">
                      {formatWon(item.unitPrice * item.qty)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 합계 금액 */}
            <div className="space-y-1 text-xs mb-4">
              <div className="flex justify-between font-bold text-sm text-[#111]">
                <span>합 계 금 액:</span>
                <span className="font-mono text-base text-[#b82828]">
                  {formatWon(activeReceipt.amount)}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-[#777]">
                <span>(공급가액: {formatWon(Math.round(activeReceipt.amount / 1.1))})</span>
                <span>(부가세: {formatWon(activeReceipt.amount - Math.round(activeReceipt.amount / 1.1))})</span>
              </div>
            </div>

            {/* 바코드 그래픽 */}
            <div className="text-center pt-2 border-t border-dashed border-[#ccc]">
              <div className="h-8 bg-gradient-to-r from-neutral-800 via-neutral-900 to-neutral-800 flex items-center justify-around px-2 text-[8px] text-white opacity-80 rounded tracking-widest font-mono">
                || | |||| | ||| || |||| | || ||| |||| |
              </div>
              <div className="text-[9px] text-[#888] mt-1">
                플래닛 독서학교 학생회 공인 증빙 전표
              </div>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => setActiveReceipt(null)}
              className="w-full mt-4 py-2 bg-[#1b3323] text-white font-serif font-bold text-xs rounded hover:bg-[#112217] transition-all"
            >
              확인 닫기
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
