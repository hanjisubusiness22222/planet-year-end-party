import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, Printer, RefreshCw, Users, Scissors, 
  Sparkles, Filter, CheckCircle2, SlidersHorizontal, BookOpen, UserPlus
} from 'lucide-react';
import { EVENT_CONFIG } from '../constants/eventConfig';
import planetLogo from '../assets/planet-logo.png';
import { getStagesV3, getBadgeSeasonStyle } from './pencilDataV3';
import { parseAvatarIndices } from './ClassroomSeatShuffle';

export interface StudentCardRecord {
  id?: string;
  studentNumber?: string;
  name: string;
  phone?: string;
  session: string;
  bookTitle?: string;
  badge?: string;
  memberType?: string;
  avatarCode?: string;
  avatarRecipe?: string;
  motto?: string;
  memo?: string;
  submittedAt?: string;
}

interface StudentCardBatchPrintProps {
  onBack: () => void;
  onGoToSeat?: () => void;
}

export const StudentCardBatchPrint: React.FC<StudentCardBatchPrintProps> = ({ onBack, onGoToSeat }) => {
  const [students, setStudents] = useState<StudentCardRecord[]>(() => {
    try {
      const saved = localStorage.getItem('planet_rsvps');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any, idx: number) => ({
            id: item.studentNumber || item.id || `card_${idx + 1}`,
            studentNumber: item.studentNumber || item.학번 || `2026-PLANET-${1001 + idx}`,
            name: (item.name || item.cleanName || item.이름 || '').trim(),
            phone: item.phone || item.연락처 || '',
            session: item.session || item.sessionLabel || item.참석세션 || '전체 참석',
            bookTitle: item.bookTitle || item.bookHint || item.도서제목 || '(선물 책 준비 중)',
            badge: item.badge || item.반뱃지 || item.memberType || item.기존회원 || '🌸 스프링토',
            avatarCode: item.avatarCode || item.아바타코드 || item.croquisCode || '',
            avatarRecipe: item.avatarRecipe || item.아바타코디요약 || '',
            motto: item.motto || item.새학기한마디 || '꺾이지 않는 텐션으로 완독!',
            memo: item.memo || item.메모사항 || '',
            submittedAt: item.submittedAt || item.접수일시 || ''
          })).filter(s => s.name);
        }
      }
    } catch (e) {
      console.warn('로컬 신청자 명단 파싱 오류:', e);
    }

    // 초기 기본 샘플 명단 (데이터가 전혀 없을 때 운영진 테스트용)
    return [
      {
        id: 'sample_1',
        studentNumber: '2026-PLANET-1001',
        name: '한지수',
        session: '1부 새학기 + 2부 수학여행',
        bookTitle: '원고는 불타지 않는다',
        badge: '☀️ 썸머데이',
        avatarCode: '5-7-2-2-3-2-6-2',
        motto: '자율주행 정상화 완료! 올해도 완독!',
        memo: '운영 총괄'
      },
      {
        id: 'sample_2',
        studentNumber: '2026-PLANET-1002',
        name: '김동효',
        session: '1부 새학기 + 2부 수학여행',
        bookTitle: '꺾이지 않는 강한 마음',
        badge: '🌸 스프링토',
        avatarCode: '1-3-1-1-1-1-1-1',
        motto: '새학기처럼 신선하게 시작합시다!',
        memo: ''
      },
      {
        id: 'sample_3',
        studentNumber: '2026-PLANET-1003',
        name: '이플래닛',
        session: '1부 플래닛의 새학기 (낮)',
        bookTitle: '겨울밤에 읽기 좋은 시집',
        badge: '🍁 어텀',
        avatarCode: '2-4-4-5-2-3-2-3',
        motto: '모두와 함께 나누는 따뜻한 책 한 권',
        memo: ''
      }
    ];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [sessionFilter, setSessionFilter] = useState<'all' | 'both' | 's1' | 's2'>('all');
  const [gridColumns, setGridColumns] = useState<2 | 3>(2);
  const [showCutGuides, setShowCutGuides] = useState(true);
  const [addBlankCount, setAddBlankCount] = useState(0);

  // SVG 파츠 데이터
  const STAGES = useMemo(() => getStagesV3('#3b332b', '#5e5044'), []);

  // 구글 시트 실시간 동기화
  const fetchGoogleSheetData = async (showToast = true) => {
    const scriptUrl = EVENT_CONFIG.googleScriptUrl;
    if (!scriptUrl || scriptUrl.includes('YOUR_SCRIPT_ID')) {
      if (showToast) {
        setSyncStatusMsg('구글 시트 URL이 설정되지 않아 로컬 캐시 데이터를 유지합니다.');
        setTimeout(() => setSyncStatusMsg(null), 3000);
      }
      return;
    }

    try {
      setIsLoading(true);
      if (showToast) setSyncStatusMsg('구글 스프레드시트에서 최신 학생 명단을 수합하는 중...');

      const url = scriptUrl.includes('?') 
        ? `${scriptUrl}&action=admin_get_all&token=2099` 
        : `${scriptUrl}?action=admin_get_all&token=2099`;

      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const resJson = await response.json();
      const rawData = Array.isArray(resJson) ? resJson : (resJson.data || []);

      if (Array.isArray(rawData) && rawData.length > 0) {
        const mapped: StudentCardRecord[] = rawData.map((item: any, idx: number) => {
          const name = String(item?.이름 || item?.name || item?.cleanName || '').trim();
          const studentNumber = String(item?.학번 || item?.studentNumber || `2026-PLANET-${1001 + idx}`);
          const session = String(item?.참석세션 || item?.session || item?.sessionLabel || '1부 새학기 + 2부 수학여행');
          const bookTitle = String(item?.도서제목 || item?.선물도서힌트 || item?.bookTitle || item?.bookHint || '(선물 책 준비 중)');
          const badge = String(item?.반뱃지 || item?.기존회원 || item?.badge || item?.memberType || '🌸 스프링토');
          const avatarCode = String(item?.아바타코드 || item?.avatarCode || item?.croquisCode || '');
          const avatarRecipe = String(item?.아바타코디요약 || item?.avatarRecipe || '');
          const motto = String(item?.새학기한마디 || item?.motto || '꺾이지 않는 텐션으로 완독!');
          const memo = String(item?.메모사항 || item?.memo || '');
          const submittedAt = item?.접수일시 || item?.submittedAt || '';

          return {
            id: studentNumber,
            studentNumber,
            name,
            phone: String(item?.연락처 || item?.phone || ''),
            session,
            bookTitle,
            badge,
            avatarCode,
            avatarRecipe,
            motto,
            memo,
            submittedAt
          };
        }).filter(r => r.name !== '');

        if (mapped.length > 0) {
          setStudents(mapped);
          localStorage.setItem('planet_rsvps', JSON.stringify(mapped));
          if (showToast) {
            setSyncStatusMsg(`동기화 완료: 총 ${mapped.length}명의 학생증이 수합되었습니다.`);
            setTimeout(() => setSyncStatusMsg(null), 3000);
          }
        }
      }
    } catch (err) {
      console.warn('동기화 실패:', err);
      if (showToast) {
        setSyncStatusMsg('구글 시트 연동 실패: 로컬 캐시 데이터를 유지합니다.');
        setTimeout(() => setSyncStatusMsg(null), 3500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 마운트 시 자동 동기화 1회 시도
  useEffect(() => {
    fetchGoogleSheetData(false);
  }, []);

  // 세션 필터링
  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      if (sessionFilter === 'both') return st.session.includes('2부') || st.session.includes('전체') || st.session.includes('1차+2차');
      if (sessionFilter === 's1') return st.session.includes('1부') || st.session.includes('새학기');
      if (sessionFilter === 's2') return st.session.includes('2부') || st.session.includes('수학여행');
      return true;
    });
  }, [students, sessionFilter]);

  // 현장 접수용 빈 카드 추가 반영 목록
  const displayList = useMemo(() => {
    const list = [...filteredStudents];
    for (let i = 0; i < addBlankCount; i++) {
      list.push({
        id: `blank_${i + 1}`,
        studentNumber: `2026-PLANET-현장${String(i + 1).padStart(2, '0')}`,
        name: '____________ (현장접수)',
        session: '현장 배정 세션',
        bookTitle: '(현장 지참 도서 기재)',
        badge: '✏️ 현장 등록 특별 학우',
        avatarCode: '0-0-0-0-0-0-0-0',
        motto: '현장에서 직접 채워가는 한마디!',
        memo: '현장 배포용 여분 명찰'
      });
    }
    return list;
  }, [filteredStudents, addBlankCount]);

  // 브라우저 A4 출력 트리거
  const handlePrint = () => {
    window.print();
  };

  // 샘플 추가 기능
  const handleAddSample = () => {
    const sampleNames = ['강도서', '정문학', '윤완독', '최새벽', '박종각', '조프레피'];
    const sampleBooks = ['밤에 읽는 에세이', '우주를 건너는 SF', '밑줄 가득한 고전', '시와 함께 걷는 겨울'];
    const sampleMottos = ['완독의 기쁨을 함께!', '다정함이 이기는 밤', '책과 함께하는 새학기'];
    const sampleBadges = ['🌸 스프링토', '☀️ 썸머데이', '🍁 어텀', '❄️ 윈터블'];
    const randCode = Array.from({ length: 8 }, () => Math.floor(1 + Math.random() * 8)).join('-');

    const newStudent: StudentCardRecord = {
      id: `sample_${Date.now()}`,
      studentNumber: `2026-PLANET-${Math.floor(1000 + Math.random() * 9000)}`,
      name: sampleNames[Math.floor(Math.random() * sampleNames.length)],
      session: '1부 새학기 + 2부 수학여행',
      bookTitle: sampleBooks[Math.floor(Math.random() * sampleBooks.length)],
      badge: sampleBadges[Math.floor(Math.random() * sampleBadges.length)],
      avatarCode: randCode,
      motto: sampleMottos[Math.floor(Math.random() * sampleMottos.length)],
      memo: '테스트용 샘플'
    };

    setStudents(prev => [newStudent, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#f7f5ed] text-[#1f1b18] font-sans pb-24 selection:bg-[#dfc27d]/30">
      
      {/* 인쇄 전용 CSS 스타일 */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 8mm 8mm 8mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .student-card-item {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            box-shadow: none !important;
            background: #fffdf9 !important;
            border: 1.5px dashed #444 !important;
          }
          .print-grid-2 {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 6mm !important;
          }
          .print-grid-3 {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 4mm !important;
          }
        }
      `}</style>

      {/* 전역 SVG 색연필 질감 필터 */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <filter id="pencil-sketch" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.75" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* ========================================================= */}
      {/* 1. 운영진 상단 네비게이션 헤더 (인쇄 시 자동 숨김)         */}
      {/* ========================================================= */}
      <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e5dfd3] px-3 sm:px-6 py-2.5 sm:py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <button
              onClick={onBack}
              className="p-1 sm:p-1.5 rounded-lg border border-[#d8d3c7] bg-[#f8f6f0] hover:bg-[#ede8dc] text-[#1f1b18] text-xs font-serif flex items-center space-x-1 shadow-sm flex-shrink-0 cursor-pointer transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>대시보드로</span>
            </button>

            <div className="flex items-center space-x-2 min-w-0">
              <img src={planetLogo} alt="플래닛" className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded bg-white border border-[#e5e0d8] p-0.5 shadow-sm flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-serif font-bold text-[#1f1b18] flex items-center space-x-1.5">
                  <span className="truncate">교무실 A4 학생증 일괄 인쇄 조판기</span>
                  <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#b82828] text-white whitespace-nowrap">인쇄실</span>
                </h1>
                <p className="text-[9px] sm:text-[10px] text-[#666] font-serif truncate">신청자 전원의 색연필 크로키 아바타 명찰 A4 일괄 조판 및 인쇄</p>
              </div>
            </div>
          </div>

          {/* 우측 액션 버튼들 */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 justify-end">
            {onGoToSeat && (
              <button
                onClick={onGoToSeat}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded text-[11px] sm:text-xs font-serif border border-[#1f1b18] bg-[#1f1b18] text-white hover:bg-[#333] flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
              >
                <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>자리 배치</span>
              </button>
            )}

            <button
              onClick={() => fetchGoogleSheetData(true)}
              disabled={isLoading}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded text-[11px] sm:text-xs font-serif border border-[#d5cfc4] bg-white hover:bg-[#f5f1e8] text-[#1f1b18] flex items-center space-x-1 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
              title="구글 시트 실시간 최신 명단 새로고침"
            >
              <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isLoading ? 'animate-spin text-[#b82828]' : ''}`} />
              <span>{isLoading ? '동기화 중...' : '구글 시트 동기화'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold font-serif border-2 border-[#16231b] bg-[#16231b] text-amber-200 hover:bg-black hover:text-white flex items-center space-x-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>A4 일괄 인쇄 (Ctrl+P)</span>
            </button>
          </div>

        </div>

        {/* 토스트 메시지 바 */}
        {syncStatusMsg && (
          <div className="bg-[#1f1b18] text-[#f7f5ed] text-xs font-serif px-4 py-2 text-center animate-fadeIn flex items-center justify-center space-x-2 border-t border-stone-700 mt-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            <span>{syncStatusMsg}</span>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* 2. 조판 설정 & 인쇄 팁 배너 (인쇄 시 자동 숨김)             */}
      {/* ========================================================= */}
      <section className="no-print max-w-6xl mx-auto px-3 sm:px-6 pt-4 pb-2 space-y-3">
        
        {/* 인쇄 최적화 팁 가이드 카드 */}
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-3 sm:p-4 text-xs font-serif text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start space-x-2.5">
            <span className="text-xl">🖨️</span>
            <div>
              <p className="font-bold text-sm text-[#5c4033] mb-0.5">
                교무실 A4 학생증 인쇄 팁 (재단선 포함)
              </p>
              <p className="text-[11px] sm:text-xs text-stone-700 leading-relaxed">
                • 브라우저 인쇄 창에서 <b>[설정 더보기] → [배경 그래픽]</b>에 반드시 체크해 주세요. 아바타 색감과 빈티지 종이 질감이 선명하게 인쇄됩니다.<br className="hidden sm:inline" />
                • 여백은 <b>[기본]</b> 또는 <b>[최소]</b>를 권장하며, 가위선(점선)을 따라 자르면 명찰 케이스(가로 95mm × 세로 70mm 등)에 알맞게 들어갑니다.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
            <span className="bg-[#2e5238] text-white text-xs px-2.5 py-1 rounded-full font-mono font-bold shadow-sm">
              인쇄 대상: 총 {displayList.length}매
            </span>
          </div>
        </div>

        {/* 조판 도구 바 (필터, 열 수, 현장 여분 추가) */}
        <div className="bg-white border border-[#e5dfd3] rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs font-serif">
          
          {/* 세션 필터 */}
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="font-bold text-stone-600 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              세션 필터:
            </span>
            <button
              onClick={() => setSessionFilter('all')}
              className={`px-2.5 py-1 rounded-md transition ${sessionFilter === 'all' ? 'bg-[#1f1b18] text-white font-bold' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
            >
              전체 ({students.length})
            </button>
            <button
              onClick={() => setSessionFilter('both')}
              className={`px-2.5 py-1 rounded-md transition ${sessionFilter === 'both' ? 'bg-[#1f1b18] text-white font-bold' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
            >
              1+2부 전체
            </button>
            <button
              onClick={() => setSessionFilter('s1')}
              className={`px-2.5 py-1 rounded-md transition ${sessionFilter === 's1' ? 'bg-[#1f1b18] text-white font-bold' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
            >
              1부만
            </button>
            <button
              onClick={() => setSessionFilter('s2')}
              className={`px-2.5 py-1 rounded-md transition ${sessionFilter === 's2' ? 'bg-[#1f1b18] text-white font-bold' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
            >
              2부만
            </button>
          </div>

          {/* 레이아웃 & 보조 도구 */}
          <div className="flex items-center space-x-2 flex-wrap">
            {/* 열 수 선택 */}
            <div className="flex items-center space-x-1 border border-stone-200 rounded-lg p-0.5 bg-stone-50">
              <span className="text-[10px] text-stone-500 px-1.5">A4 열 구성:</span>
              <button
                onClick={() => setGridColumns(2)}
                className={`px-2 py-0.5 rounded text-xs transition ${gridColumns === 2 ? 'bg-white shadow text-[#b82828] font-bold' : 'text-stone-600'}`}
                title="A4 1장에 8명 배치 (2열 x 4행)"
              >
                2열 (권장·큼직함)
              </button>
              <button
                onClick={() => setGridColumns(3)}
                className={`px-2 py-0.5 rounded text-xs transition ${gridColumns === 3 ? 'bg-white shadow text-[#b82828] font-bold' : 'text-stone-600'}`}
                title="A4 1장에 9~12명 배치 (3열)"
              >
                3열 (콤팩트)
              </button>
            </div>

            {/* 재단선 토글 */}
            <button
              onClick={() => setShowCutGuides(!showCutGuides)}
              className={`px-2.5 py-1 rounded-md border text-xs flex items-center gap-1 transition ${showCutGuides ? 'border-amber-700 bg-amber-50 text-amber-900 font-bold' : 'border-stone-300 bg-white text-stone-600'}`}
            >
              <Scissors className="w-3 h-3" />
              <span>가위선 {showCutGuides ? '켜짐' : '숨김'}</span>
            </button>

            {/* 현장 참가자용 여분 빈 카드 추가 */}
            <button
              onClick={() => setAddBlankCount(prev => prev + 2)}
              className="px-2.5 py-1 rounded-md border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 flex items-center gap-1 transition cursor-pointer"
              title="현장 추가 참가자를 위한 빈 명찰 2매 추가"
            >
              <UserPlus className="w-3 h-3 text-stone-500" />
              <span>현장 여분카드 +2 ({addBlankCount > 0 ? `+${addBlankCount}매` : '추가'})</span>
            </button>

            {/* 샘플 추가 */}
            <button
              onClick={handleAddSample}
              className="px-2 py-1 rounded-md border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs transition cursor-pointer"
              title="테스트용 샘플 학우 1명 추가"
            >
              + 샘플
            </button>
          </div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* 3. A4 일괄 인쇄 조판 그리드 (실제 출력되는 영역)          */}
      {/* ========================================================= */}
      <main className="print-container max-w-6xl mx-auto px-3 sm:px-6 py-4">
        
        {displayList.length === 0 ? (
          <div className="text-center py-20 bg-white border-2 border-dashed border-stone-300 rounded-2xl">
            <Users className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h3 className="text-base font-bold font-serif text-stone-700">해당 세션의 신청자가 없습니다.</h3>
            <p className="text-xs text-stone-500 mt-1">상단의 [구글 시트 동기화]를 눌러 최신 명단을 불러오거나 필터를 변경해 주세요.</p>
          </div>
        ) : (
          <div className={`${gridColumns === 2 ? 'grid grid-cols-1 md:grid-cols-2 print-grid-2 gap-4 sm:gap-5' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 print-grid-3 gap-3 sm:gap-4'}`}>
            {displayList.map((st, idx) => {
              const indices = parseAvatarIndices(st.avatarCode, st.name);

              return (
                <div 
                  key={st.id || idx}
                  className={`student-card-item relative bg-[#fffdf9] rounded-xl p-3 sm:p-4 transition-all duration-150 ${
                    showCutGuides 
                      ? 'border-2 border-dashed border-stone-400 hover:border-stone-800' 
                      : 'border-2 border-stone-800'
                  } shadow-sm hover:shadow-md`}
                >
                  {/* 가위 재단 표시 아이콘 (인쇄 시 가장자리 힌트) */}
                  {showCutGuides && (
                    <div className="absolute -top-2.5 left-4 bg-[#f7f5ed] px-1.5 flex items-center space-x-1 text-[9px] text-stone-400 font-mono">
                      <Scissors className="w-2.5 h-2.5 rotate-90" />
                      <span>재단선</span>
                    </div>
                  )}

                  {/* 카드 상단 헤더: 기관명 & 학생증 일련번호 & 반 뱃지 */}
                  <div className="flex items-center justify-between border-b-2 border-stone-800 pb-1.5 mb-2.5">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <span className="font-serif font-black text-xs sm:text-sm text-stone-900 tracking-tight">
                        🪪 2026 플래닛 학생증
                      </span>
                      <span className="text-[10px] font-mono font-bold text-stone-500">
                        #{String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    
                    <span className={`text-[9px] sm:text-[10px] font-serif font-bold border px-2 py-0.5 rounded-full truncate max-w-[130px] shadow-2xs ${getBadgeSeasonStyle(st.badge)}`}>
                      {st.badge || '🌸 스프링토'}
                    </span>
                  </div>

                  {/* 카드 바디: 좌측 증명사진(SVG 아바타) + 우측 인적사항 */}
                  <div className="grid grid-cols-12 gap-2.5 sm:gap-3 items-center">
                    
                    {/* 좌측: 동글동글 색연필 크로키 아바타 증명사진 (4:5 비율) */}
                    <div className="col-span-4 sm:col-span-4 aspect-[4/5] bg-[#fffaf3] border-2 border-stone-800 rounded-lg overflow-hidden relative shadow-inner flex items-center justify-center">
                      <svg viewBox="0 0 200 220" className="w-full h-full" filter="url(#pencil-sketch)">
                        {/* 1. 배경 소품 (Stage 7) */}
                        {indices[7] !== null && STAGES[7] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[7].items[indices[7]]?.svg || '' }} />
                        )}
                        {/* 2. 뒷머리 (Stage 1) */}
                        {indices[1] !== null && STAGES[1] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[1].items[indices[1]]?.backSvg || '' }} />
                        )}
                        {/* 3. 의상 (Stage 6) */}
                        {indices[6] !== null && STAGES[6] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[6].items[indices[6]]?.svg || '' }} />
                        )}
                        {/* 4. 얼굴 (Stage 0) */}
                        {indices[0] !== null && STAGES[0] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[0].items[indices[0]]?.svg || '' }} />
                        )}
                        {/* 5. 볼터치 (Stage 3) */}
                        {indices[3] !== null && STAGES[3] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[3].items[indices[3]]?.svg || '' }} />
                        )}
                        {/* 6. 눈 (Stage 2) */}
                        {indices[2] !== null && STAGES[2] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[2].items[indices[2]]?.svg || '' }} />
                        )}
                        {/* 7. 입 (Stage 4) */}
                        {indices[4] !== null && STAGES[4] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[4].items[indices[4]]?.svg || '' }} />
                        )}
                        {/* 8. 앞머리 (Stage 1) */}
                        {indices[1] !== null && STAGES[1] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[1].items[indices[1]]?.frontSvg || '' }} />
                        )}
                        {/* 9. 안경 (Stage 5) */}
                        {indices[5] !== null && STAGES[5] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[5].items[indices[5]]?.svg || '' }} />
                        )}
                      </svg>

                      {/* 학생증 워터마크 모서리 직인 */}
                      <div className="absolute bottom-1 right-1 text-[7px] font-serif font-bold text-[#b82828] border border-[#b82828] rounded px-1 bg-white/80 scale-90 origin-bottom-right">
                        교무처인
                      </div>
                    </div>

                    {/* 우측: 인적사항 및 다짐 */}
                    <div className="col-span-8 sm:col-span-8 text-[11px] sm:text-xs font-serif space-y-1 sm:space-y-1.5 leading-snug">
                      
                      {/* 성명 & 학번 */}
                      <div className="flex items-baseline justify-between border-b border-stone-200 pb-1">
                        <div>
                          <span className="text-[10px] text-stone-500 font-sans mr-1">성명:</span>
                          <span className="font-bold text-sm sm:text-base text-stone-900 font-serif">
                            {st.name}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-stone-500">
                          {st.studentNumber || '2026-PLANET'}
                        </span>
                      </div>

                      {/* 세션 */}
                      <div className="truncate">
                        <span className="text-[10px] text-stone-500 font-sans mr-1">참석세션:</span>
                        <span className="font-bold text-amber-900">
                          {st.session}
                        </span>
                      </div>

                      {/* 도서제목 */}
                      <div className="truncate text-stone-800">
                        <span className="text-[10px] text-stone-500 font-sans mr-1">도서:</span>
                        <span className="italic">{st.bookTitle || '(선물 책 준비 중)'}</span>
                      </div>

                      {/* 새학기 한마디 */}
                      <div className="bg-stone-50/90 border border-stone-200 rounded px-2 py-1 text-[10px] text-stone-700 italic font-serif line-clamp-1">
                        "{st.motto || '올해도 플래닛과 함께 완독!'}"
                      </div>

                    </div>

                  </div>

                  {/* 카드 하단 푸터: 도서관 바코드 그래픽 & 행사 타이틀 */}
                  <div className="mt-2.5 pt-1.5 border-t border-stone-300 flex items-center justify-between text-[8px] sm:text-[9px] text-stone-500 font-mono">
                    <span className="tracking-widest uppercase">PLANET READING SCHOOL GALA 2026</span>
                    <span className="font-serif text-[#786b5e]">확인: 플래닛 교무국 검인済</span>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

    </div>
  );
};

export default StudentCardBatchPrint;
