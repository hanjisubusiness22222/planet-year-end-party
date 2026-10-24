import React, { useState, useEffect } from 'react';
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
  X,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { EVENT_CONFIG } from '../constants/eventConfig';

export interface SettlementItem {
  id: string;
  category: 'income' | 'expense' | 'expense_session1' | 'expense_session2' | 'expense_common';
  title: string;
  detail?: string;
  vendor: string;
  date: string;
  amount: number;
  paymentMethod?: string;
  receiptNumber?: string;
  receiptUrl?: string; // 증빙 영수증 URL (구글 드라이브/웹 링크)
  receiptType?: string;
  itemsBreakdown?: { name: string; qty: number; unitPrice: number }[];
}

// 구글 드라이브 이미지 공유 링크를 직접 렌더링 가능한 썸네일 URL로 변환
export const getDirectImageUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  const match1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1 && match1[1]) {
    return `https://drive.google.com/thumbnail?id=${match1[1]}&sz=w1200`;
  }
  const match2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2 && match2[1]) {
    return `https://drive.google.com/thumbnail?id=${match2[1]}&sz=w1200`;
  }
  return trimmed;
};

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
  // 로컬 캐시에서 불러오기 (구글 시트 연동 데이터만 인정, 캐시 없으면 빈 배열)
  const [items, setItems] = useState<SettlementItem[]>(() => {
    const saved = localStorage.getItem('planet_settlement_records');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((p: any) => p.id?.startsWith('sheet_settle_'))) {
          return parsed;
        }
      } catch {}
    }
    return [];
  });

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'income' | 'expense'>('all');
  const [activeReceipt, setActiveReceipt] = useState<SettlementItem | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFromSheet, setIsFromSheet] = useState(() => items.length > 0);

  // 구글 시트2(정산내역) 실시간 데이터 조회 함수
  const fetchSettlementFromSheet = async (showToast = false) => {
    const scriptUrl = EVENT_CONFIG.googleScriptUrl;
    if (!scriptUrl || scriptUrl.includes('YOUR_SCRIPT_ID')) {
      if (showToast) alert('구글 시트 연동 URL이 설정되지 않아 로컬 데이터를 유지합니다.');
      return;
    }

    setIsSyncing(true);
    try {
      const url = scriptUrl.includes('?') 
        ? `${scriptUrl}&action=get_settlement` 
        : `${scriptUrl}?action=get_settlement`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rawData = Array.isArray(json) ? json : (json.data || []);

      if (Array.isArray(rawData) && rawData.length > 0) {
        const mapped: SettlementItem[] = rawData.map((row: any, idx: number) => {
          const rawCat = String(row['구분'] || row.category || '지출').trim();
          const isIncome = rawCat.includes('수입');
          const title = String(row['항목 및 세부내용'] || row.title || row['항목'] || '').trim();
          const vendor = String(row['거래처'] || row.vendor || '-').trim();
          
          let dateStr = String(row['일자'] || row.date || '').trim();
          if (dateStr.includes('T')) {
            try {
              dateStr = new Date(dateStr).toLocaleDateString('ko-KR');
            } catch {}
          }

          const amountVal = typeof row['금액'] === 'number'
            ? row['금액']
            : parseInt(String(row['금액'] || '0').replace(/[^0-9-]/g, ''), 10) || 0;

          const proof = String(row['증빙'] || row.receiptUrl || row.receipt || '').trim();
          const isUrl = proof.startsWith('http://') || proof.startsWith('https://');

          return {
            id: `sheet_settle_${idx + 1}`,
            category: (isIncome ? 'income' : 'expense') as 'income' | 'expense',
            title: title || '(항목명 없음)',
            detail: '',
            vendor: vendor,
            date: dateStr || '-',
            amount: Math.abs(amountVal),
            paymentMethod: isIncome ? '계좌입금' : '카드/계좌',
            receiptNumber: isUrl ? '' : proof,
            receiptUrl: isUrl ? proof : '',
            receiptType: isIncome ? '입금 확인증' : '결제 영수증'
          };
        }).filter(item => item.title.trim() !== '');

        if (mapped.length > 0) {
          setItems(mapped);
          setIsFromSheet(true);
          localStorage.setItem('planet_settlement_records', JSON.stringify(mapped));
          if (showToast) {
            alert(`구글 시트2 연동 완료: 총 ${mapped.length}건의 정산 내역을 성공적으로 불러왔습니다.`);
          }
        }
      } else {
        if (showToast) alert('구글 시트2에 등록된 데이터가 없습니다.');
      }
    } catch (err) {
      console.warn('정산 내역 동기화 실패:', err);
      if (showToast) alert('구글 시트 연동 중 오류가 발생했습니다. 기존 데이터를 유지합니다.');
    } finally {
      setIsSyncing(false);
    }
  };

  // 컴포넌트 마운트 시 자동 1회 구글 시트2 연동 시도
  useEffect(() => {
    if (EVENT_CONFIG.googleScriptUrl && !EVENT_CONFIG.googleScriptUrl.includes('YOUR_SCRIPT_ID')) {
      fetchSettlementFromSheet(false);
    }
  }, []);

  // 재정 합계 계산
  const totalIncome = items
    .filter(i => i.category === 'income')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalExpense = items
    .filter(i => i.category !== 'income')
    .reduce((sum, i) => sum + i.amount, 0);

  const balance = totalIncome - totalExpense;

  // 카테고리 필터링 적용
  const filteredItems = items.filter(i => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'income') return i.category === 'income';
    return i.category !== 'income';
  });

  const formatWon = (num: number) => {
    return '₩' + num.toLocaleString('ko-KR');
  };

  // CSV 다운로드 기능
  const handleExportCSV = () => {
    const headers = ['구분', '항목 및 세부내용', '거래처', '일자', '금액(원)', '증빙'];
    const rows = items.map(item => [
      item.category === 'income' ? '수입' : '지출',
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.vendor.replace(/"/g, '""')}"`,
      item.date,
      item.amount,
      item.receiptUrl || item.receiptNumber || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `2026_플래닛_독서학교_정산보고서_${new Date().toISOString().slice(0, 10)}.csv`);
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
          {/* 구글 시트2 실시간 동기화 버튼 */}
          <button
            onClick={() => fetchSettlementFromSheet(true)}
            disabled={isSyncing}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-[#c8c0b0] bg-white hover:bg-[#f0ece1] text-xs font-serif text-[#1b3323] transition-all shadow-sm disabled:opacity-50"
            title="구글 시트2에서 최신 정산내역 불러오기"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#3b5998] ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? '동기화 중...' : '시트2 동기화'}</span>
            <span className="sm:hidden">동기화</span>
          </button>

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
                {isFromSheet && (
                  <span className="px-1.5 py-0.2 rounded bg-[#2e5238] text-[9px] text-[#dfc27d] font-bold">시트2 연동완료</span>
                )}
              </div>
              <h1 className="text-base sm:text-2xl md:text-3xl font-serif font-black tracking-tight text-[#111]">
                2026 플래닛 독서학교 연말모임 정산 보고서
              </h1>
              <p className="text-xs sm:text-sm font-serif text-[#555] mt-1">
                주최: 2026 플래닛 독서학교 연말모임준비위원회
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

        {/* 3대 핵심 재정 지표 요약 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          
          {/* 총 수입 */}
          <div className="p-4 rounded-xl border border-[#d8d3c7] bg-[#faf8f5] shadow-sm">
            <div className="flex items-center justify-between text-xs font-serif text-[#666] mb-1">
              <span>총 수입 (Income)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#eef5f0] text-[#2e5238] font-bold">
                {items.filter(i => i.category === 'income').length}건 입금
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-[#2e5238]">
              {formatWon(totalIncome)}
            </div>
            <p className="text-[11px] font-serif text-[#777] mt-1">
              {items.filter(i => i.category === 'income').length > 0
                ? `총 ${items.filter(i => i.category === 'income').length}건 입금 내역 집계`
                : '등록된 수입 내역이 없습니다.'}
            </p>
          </div>

          {/* 총 지출 */}
          <div className="p-4 rounded-xl border border-[#d8d3c7] bg-[#faf8f5] shadow-sm">
            <div className="flex items-center justify-between text-xs font-serif text-[#666] mb-1">
              <span>총 지출 (Expenditure)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-[#b82828] font-bold">
                {items.filter(i => i.category !== 'income').length}건 집행
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-[#b82828]">
              {formatWon(totalExpense)}
            </div>
            <p className="text-[11px] font-serif text-[#777] mt-1">
              {items.filter(i => i.category !== 'income').length > 0
                ? `총 ${items.filter(i => i.category !== 'income').length}건 실비 집행 내역 집계`
                : '등록된 지출 내역이 없습니다.'}
            </p>
          </div>

          {/* 최종 잔액 */}
          <div className="p-4 rounded-xl border-2 border-[#1b3323] bg-[#f2f6f3] shadow-sm">
            <div className="flex items-center justify-between text-xs font-serif text-[#1b3323] mb-1">
              <span className="font-bold">최종 잔액 (Balance)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#2e5238] text-white font-bold">
                {balance === 0 ? '0원 정산 완료' : balance > 0 ? '잔여 회비' : '초과 지출'}
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-[#1b3323]">
              {formatWon(balance)}
            </div>
            <p className="text-[11px] font-serif text-[#2e5238] mt-1 font-semibold">
              {balance === 0 
                ? '✓ 수입과 지출 잔액 0원 일치' 
                : balance > 0 
                  ? `현재 ${formatWon(balance)} 잔여` 
                  : `현재 ${formatWon(Math.abs(balance))} 초과 지출`}
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
            전체 내역 ({items.length})
          </button>
          <button
            onClick={() => setSelectedCategory('income')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === 'income'
                ? 'bg-[#2e5238] text-white font-bold shadow-sm'
                : 'bg-white hover:bg-[#ede8dc] text-[#555] border border-[#e0dad0]'
            }`}
          >
            수입 내역 ({items.filter(i => i.category === 'income').length})
          </button>
          <button
            onClick={() => setSelectedCategory('expense')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === 'expense'
                ? 'bg-[#b82828] text-white font-bold shadow-sm'
                : 'bg-white hover:bg-[#ede8dc] text-[#555] border border-[#e0dad0]'
            }`}
          >
            지출 내역 ({items.filter(i => i.category !== 'income').length})
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
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-stone-500 font-serif">
                    {isSyncing ? (
                      <div className="flex flex-col items-center justify-center space-y-2 py-4">
                        <RefreshCw className="w-5 h-5 animate-spin text-[#1b3323]" />
                        <span className="text-sm font-bold text-[#1b3323]">구글 시트(시트2)에서 정산 내역을 불러오는 중입니다...</span>
                      </div>
                    ) : (
                      <div className="py-4">
                        <p className="font-bold text-sm text-[#333] mb-1">등록된 정산 내역이 없습니다.</p>
                        <p className="text-xs text-stone-500">
                          구글 스프레드시트의 <span className="font-bold text-[#1b3323]">[시트2]</span>에 입력된 항목이 실시간으로 반영됩니다.
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
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
                })
              )}
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

      </div>

      {/* 실물 영수증 증빙 팝업 모달 */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl border-2 border-[#222] max-w-md w-full p-5 sm:p-6 shadow-2xl relative font-sans text-xs max-h-[90vh] flex flex-col">
            
            {/* 닫기 버튼 */}
            <button
              onClick={() => setActiveReceipt(null)}
              className="absolute top-3.5 right-3.5 p-1 rounded-full text-[#666] hover:text-[#111] hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 영수증 상단 헤더 */}
            <div className="text-center border-b pb-3 mb-3">
              <div className="text-sm font-bold font-serif text-[#111]">
                [ {activeReceipt.receiptType || '증빙 영수증'} ]
              </div>
              <div className="text-sm font-bold text-[#b82828] mt-1 font-mono">
                {formatWon(activeReceipt.amount)}
              </div>
              <div className="text-xs text-[#555] mt-0.5">
                {activeReceipt.title}
              </div>
              <div className="text-[11px] text-[#777] mt-0.5">
                거래처: {activeReceipt.vendor} • {activeReceipt.date}
              </div>
            </div>

            {/* URL 영수증 이미지가 있는 경우 */}
            {activeReceipt.receiptUrl ? (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-center">
                <div className="bg-[#f8f6f0] border border-[#e2ddd3] rounded-lg p-2 min-h-[180px] flex items-center justify-center overflow-hidden">
                  <img 
                    src={getDirectImageUrl(activeReceipt.receiptUrl)} 
                    alt="증빙 영수증" 
                    className="max-h-[50vh] w-auto max-w-full object-contain rounded shadow-xs mx-auto"
                    onError={(e) => {
                      // 이미지 직링크가 안 열릴 때 대체 안내
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const notice = document.createElement('div');
                        notice.className = 'text-center py-6 text-xs text-[#666] font-serif';
                        notice.innerHTML = '<p class="font-bold mb-1">📷 영수증 링크가 등록되어 있습니다.</p><p class="text-[11px] text-[#888]">아래 [새 창에서 원본 열기] 버튼을 눌러 확인해 주세요.</p>';
                        parent.appendChild(notice);
                      }
                    }}
                  />
                </div>

                <div className="pt-1">
                  <a 
                    href={activeReceipt.receiptUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-[#3b5998] hover:bg-[#2e477a] text-white font-serif font-bold text-xs inline-flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                  >
                    <span>새 창에서 원본 증빙 열기</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              /* URL이 없고 세부 품목이 있는 텍스트 전표 */
              <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-1">
                {activeReceipt.receiptNumber && (
                  <div className="text-center text-[10px] text-[#888]">
                    증빙번호: {activeReceipt.receiptNumber}
                  </div>
                )}

                {/* 거래 정보 */}
                <div className="space-y-1 text-[11px] text-[#444] border-b border-dashed border-[#ccc] pb-3">
                  <div className="flex justify-between">
                    <span>거래일시:</span>
                    <span>{activeReceipt.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>결제수단:</span>
                    <span>{activeReceipt.paymentMethod || '카드/계좌'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>승인상태:</span>
                    <span className="font-bold text-[#2e5238]">정상승인</span>
                  </div>
                </div>

                {/* 품목 내역 (존재할 경우) */}
                {activeReceipt.itemsBreakdown && activeReceipt.itemsBreakdown.length > 0 && (
                  <div className="border-b-2 border-dashed border-[#444] pb-3">
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
                )}

                {/* 합계 금액 */}
                <div className="space-y-1 text-xs pt-1">
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
                  <div className="text-[9px] text-[#888] mt-1 font-serif">
                    플래닛 독서학교 공식 증빙
                  </div>
                </div>
              </div>
            )}

            {/* 하단 확인 닫기 버튼 */}
            <div className="pt-3 border-t mt-3">
              <button
                onClick={() => setActiveReceipt(null)}
                className="w-full py-2 bg-[#1b3323] hover:bg-[#112217] text-white font-serif font-bold text-xs rounded-lg transition-all shadow-sm"
              >
                닫기
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
