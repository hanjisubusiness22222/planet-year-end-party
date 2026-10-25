import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Calendar, Clock, MapPin, Sparkles, Glasses, 
  CheckCircle2, ArrowLeft, Send, ShieldCheck, Award, 
  Wine, HelpCircle, Heart, Tag, Bookmark, Check,
  ChevronRight, AlertCircle, Info, User, Download, Copy
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { EVENT_CONFIG } from '../constants/eventConfig';
import { sanitizeText, validatePhone, formatPhone } from '../utils/validation';
import { maskPhone } from '../utils/masking';
import confetti from 'canvas-confetti';
import planetLogo from '../assets/planet-logo.png';
import { PencilSketchRsvp } from './PencilSketchRsvp';

interface OfficialInvitationProps {
  onBackToTeaser: () => void;
  onGoToSettlement?: () => void;
}

type TabType = 'letter' | 'timeline' | 'lookbook' | 'rsvp';

// 신청 페이지(회신서), 일과표 안내, 드레스 코드 룩북 공개 여부
const SHOW_EXTRA_TABS = true;

export const OfficialInvitation: React.FC<OfficialInvitationProps> = ({ 
  onBackToTeaser,
  onGoToSettlement
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#rsvp') return 'rsvp';
    if (hash === '#timeline') return 'timeline';
    if (hash === '#lookbook') return 'lookbook';
    return 'letter';
  });

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#rsvp') setActiveTab('rsvp');
      else if (hash === '#timeline') setActiveTab('timeline');
      else if (hash === '#lookbook') setActiveTab('lookbook');
      else if (hash === '#letter' || hash === '#main') setActiveTab('letter');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isDownloadingId, setIsDownloadingId] = useState(false);
  const studentIdCardRef = useRef<HTMLDivElement>(null);

  // RSVP Form States (성별, 신구구분, 프롬신청곡 제외)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedSession, setSelectedSession] = useState<'both' | 'session1' | 'session2'>('both');
  const [bookHint, setBookHint] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(true);
  const [hpCheck, setHpCheck] = useState(''); // 허니팟 봇 차단

  // Status & Validation States
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedStudentId, setConfirmedStudentId] = useState<{
    studentNumber: string;
    name: string;
    phone: string;
    sessionName: string;
    fee: number;
    submittedAt: string;
  } | null>(null);

  // Phone input formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatPhone(raw);
    setPhone(formatted);
    if (errorMessage) setErrorMessage('');
  };

  // Form Submit Handler
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hpCheck.trim() !== '') return;

    const cleanName = sanitizeText(name, 20);
    if (!cleanName || cleanName.length < 2) {
      setErrorMessage('성함을 올바르게 입력해 주세요. (2자 이상)');
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMessage('올바른 휴대폰 번호를 입력해 주세요. (예: 010-1234-5678)');
      return;
    }

    if (!privacyAgreed) {
      setErrorMessage('개인정보 수집 및 행사 안내 목적 이용에 동의해 주세요.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    const s1 = selectedSession === 'both' || selectedSession === 'session1';
    const s2 = selectedSession === 'both' || selectedSession === 'session2';
    const totalFee = (s1 ? EVENT_CONFIG.session1.fee : 0) + (s2 ? EVENT_CONFIG.session2.fee : 0);
    const sessionLabel = 
      selectedSession === 'both' 
        ? '1차(새학기) + 2차(수학여행) 전체 참석' 
        : selectedSession === 'session1' 
          ? '1차(새학기)만 참석' 
          : '2차(수학여행)만 참석 (예약금)';

    const studentNumber = `2026-PLANET-${Math.floor(1000 + Math.random() * 9000)}`;
    const payload = {
      action: 'register',
      hp_check: hpCheck,
      name: cleanName,
      phone: phone,
      session: sessionLabel,
      bookTitle: sanitizeText(bookHint, 100) || '(선물 책 준비 중)',
      fee: totalFee,
      paymentStatus: '입금 대기',
      studentNumber: studentNumber
    };

    try {
      if (EVENT_CONFIG.googleScriptUrl && EVENT_CONFIG.googleScriptUrl !== 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec') {
        await fetch(EVENT_CONFIG.googleScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const existingRsvps = JSON.parse(localStorage.getItem('planet_rsvps') || '[]');
      existingRsvps.push({
        ...payload,
        submittedAt: new Date().toISOString()
      });
      localStorage.setItem('planet_rsvps', JSON.stringify(existingRsvps));

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#b82828', '#2e5238', '#dfc27d', '#ffffff']
      });

      setConfirmedStudentId({
        studentNumber,
        name: cleanName,
        phone: maskPhone(phone),
        sessionName: sessionLabel,
        fee: totalFee,
        submittedAt: new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      });

    } catch (err) {
      console.error(err);
      setErrorMessage('접수 처리 중 일시적인 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 학생증 이미지(PNG) 다운로드 함수
  const handleDownloadStudentId = async () => {
    if (!studentIdCardRef.current) return;
    try {
      setIsDownloadingId(true);
      const dataUrl = await toPng(studentIdCardRef.current, { 
        cacheBust: true, 
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `플래닛_학생증_${confirmedStudentId?.name || '학우'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download student id', err);
      alert('학생증 이미지 저장 중 오류가 발생했습니다. 화면을 캡처해 주세요.');
    } finally {
      setIsDownloadingId(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-[#1f1b18] font-sans selection:bg-[#b82828]/20 selection:text-[#b82828]">
      
      {/* 상단 엠블럼 및 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e8e4dc] px-3 sm:px-6 py-2.5 sm:py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          
          {/* 상단 1단: 티저로 돌아가기 & 학교 로고 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={onBackToTeaser}
                className="p-1 sm:p-1.5 rounded-lg border border-[#d8d3c7] bg-[#f8f6f0] hover:bg-[#ede8dc] text-[#1f1b18] transition-colors flex items-center space-x-1 text-xs font-serif"
                title="교실 칠판으로 돌아가기"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">교실 칠판</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <img 
                  src={planetLogo} 
                  alt="플래닛 로고" 
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded bg-white border border-[#e5e0d8] p-0.5 shadow-sm" 
                />
                <div>
                  <div className="text-xs sm:text-sm font-serif font-bold text-[#1f1b18] tracking-wide">
                    플래닛 독서학교
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-[#666] font-serif">
                    제2026-1호 가정통신문
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          {SHOW_EXTRA_TABS && (
            <div className="flex items-center justify-between md:justify-end space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none pb-0.5 -mx-1 px-1">
              <nav className="flex items-center space-x-1 sm:space-x-2">
                {[
                  { id: 'letter', label: '가정통신문' },
                  { id: 'timeline', label: '일과표 안내' },
                  { id: 'lookbook', label: '드레스 코드 룩북' },
                  { id: 'rsvp', label: '참가 신청(회신서)' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id as TabType)}
                    className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded text-[11px] sm:text-xs font-serif whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#b82828] text-white font-bold shadow-sm'
                        : 'text-[#555] hover:text-[#111] hover:bg-[#f0ece1]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* 중앙 메인 컨텐츠 영역 */}
      <main className="max-w-4xl mx-auto px-2.5 sm:px-6 py-5 sm:py-10 pb-24 sm:pb-12">
        
        {/* ========================================================= */}
        {/* TAB 1: PLANET 가정통신문 (초대장.png 양식 100% 재현)      */}
        {/* ========================================================= */}
        {activeTab === 'letter' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* 갱지 가정통신문 카드 */}
            <div className="relative retro-gazette-paper p-3.5 sm:p-8 md:p-12 rounded-xl text-[#1f1b18] shadow-xl border-2 border-[#1f1b18]/40 overflow-hidden space-y-4 sm:space-y-6">
              
              {/* 상단 공문 헤더 박스 (초대장.png) */}
              <div className="border-2 border-[#1f1b18] grid grid-cols-4 sm:grid-cols-5 text-center text-xs font-serif">
                <div className="col-span-1 border-r-2 border-[#1f1b18] p-1.5 sm:p-4 flex items-center justify-center bg-white">
                  <img src={planetLogo} alt="PLANET" className="w-12 sm:w-20 md:w-24 h-auto object-contain" />
                </div>
                <div className="col-span-2 sm:col-span-3 border-r-2 border-[#1f1b18] p-1.5 sm:p-4 flex items-center justify-center">
                  <h1 className="font-serif text-sm sm:text-2xl md:text-3xl font-black tracking-[0.15em] sm:tracking-[0.3em] text-[#111]">
                    가 정 통 신 문
                  </h1>
                </div>
                <div className="col-span-1 p-1 sm:p-3 flex flex-col justify-center text-[9px] sm:text-xs font-serif text-left leading-tight bg-white/40">
                  <div className="font-bold truncate">플래닛독서학교</div>
                  <div className="truncate">제2026-1호</div>
                  <div className="font-mono text-[#333] text-[8px] sm:text-xs">2026.12.19.</div>
                </div>
              </div>

              {/* 결재란 (담당 - 부장 - 교장) 직인 */}
              <div className="flex justify-end">
                <div className="border border-[#1f1b18] inline-grid grid-cols-3 text-center text-[9px] sm:text-[10px] font-serif bg-white/60">
                  <div className="border-r border-[#1f1b18] p-1 px-1.5 sm:px-3">
                    <div className="text-[#666] border-b border-[#1f1b18] pb-0.5">담 당</div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mt-0.5 sm:mt-1 rounded-full border border-[#b82828] text-[#b82828] flex items-center justify-center font-bold text-[8px] sm:text-[9px] rotate-[-5deg]">
                      확인
                    </div>
                  </div>
                  <div className="border-r border-[#1f1b18] p-1 px-1.5 sm:px-3">
                    <div className="text-[#666] border-b border-[#1f1b18] pb-0.5">부 장</div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mt-0.5 sm:mt-1 rounded-full border border-[#b82828] text-[#b82828] flex items-center justify-center font-bold text-[8px] sm:text-[9px] rotate-[8deg]">
                      결재
                    </div>
                  </div>
                  <div className="p-1 px-1.5 sm:px-3">
                    <div className="text-[#666] border-b border-[#1f1b18] pb-0.5">교 장</div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mt-0.5 sm:mt-1 rounded-full border-2 border-[#b82828] text-[#b82828] flex items-center justify-center font-bold text-[8px] sm:text-[9px] rotate-[-12deg]">
                      플래닛
                    </div>
                  </div>
                </div>
              </div>

              {/* 제목 서브 헤더 */}
              <div className="text-center py-1 sm:py-2">
                <h2 className="font-serif text-sm sm:text-xl font-bold text-[#1f1b18]">
                  - 2026 플래닛 연말 파티 「플래닛의 새학기」 안내 -
                </h2>
              </div>

              {/* 본문 안내문 (초대장.png 원문 인용) */}
              <div className="font-serif text-xs sm:text-sm leading-relaxed text-[#2c2621] space-y-2.5 sm:space-y-3 bg-white/70 p-3.5 sm:p-5 rounded border border-[#1f1b18]/20">
                <p>
                  <strong>플래닛 여러분, 안녕하십니까?</strong> 날씨가 부쩍 추워지고, 2026년의 마무리가 다가오고 있습니다.
                  책을 사랑하는 마음으로 플래닛 활동에 관심을 갖고 모임 발전에 협조해주시는 회원 여러분께 진심으로 감사드리며, 
                  2026년 플래닛 연말 파티를 아래와 같이 개최하고자 합니다.
                </p>
                <p>
                  잘 지나온 플래닛의 올해를 축하하며, 앞으로도 신선한 마음으로 만나길 바라는 자리니 
                  가능한 많은 분들이 꼭 참석해주시길 바랍니다.
                </p>
              </div>

              {/* 표: 일시 / 프로그램 / 장소 / 대상 */}
              <div className="overflow-x-auto -mx-1 sm:mx-0">
                <table className="min-w-[420px] sm:min-w-full border-collapse border-2 border-[#1f1b18] text-xs sm:text-sm font-serif text-center">
                  <thead>
                    <tr className="bg-[#ede8dc] font-bold">
                      <th className="border border-[#1f1b18] p-2 sm:p-2.5">일시</th>
                      <th className="border border-[#1f1b18] p-2 sm:p-2.5">프로그램</th>
                      <th className="border border-[#1f1b18] p-2 sm:p-2.5">장소</th>
                      <th className="border border-[#1f1b18] p-2 sm:p-2.5">대상</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white/80">
                      <td className="border border-[#1f1b18] p-2.5 sm:p-3 font-mono text-[11px] sm:text-xs">
                        2026. 12. 19. (토)<br />10:00 ~ 17:00
                      </td>
                      <td className="border border-[#1f1b18] p-2.5 sm:p-3 font-bold text-[#b82828]">
                        플래닛 연말파티<br />「플래닛의 새학기」
                      </td>
                      <td className="border border-[#1f1b18] p-2.5 sm:p-3">공간나인 강남점</td>
                      <td className="border border-[#1f1b18] p-2.5 sm:p-3">플래닛 멤버<br />누구나</td>
                    </tr>
                    <tr className="bg-white/80">
                      <td className="border border-[#1f1b18] p-2.5 sm:p-3 font-mono text-[11px] sm:text-xs">
                        2026. 12. 19. (토)<br />18:00 ~ LATE
                      </td>
                      <td className="border border-[#1f1b18] p-2.5 sm:p-3 font-bold text-[#2e5238]">
                        연말파티 뒷풀이<br />「플래닛의 수학여행」
                      </td>
                      <td className="border border-[#1f1b18] p-2.5 sm:p-3">미정</td>
                      <td className="border border-[#1f1b18] p-2.5 sm:p-3">연말파티 참여자<br />中 희망자</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 주의사항 박스 (초대장.png 원문) */}
              <div className="border-2 border-[#1f1b18] p-4 bg-white/90 text-xs sm:text-sm font-serif space-y-2">
                <div className="font-bold text-[#1f1b18]">
                  ■ 주의사항 ■
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[#2c2621] leading-relaxed">
                  <li><strong>신청 오픈:</strong> 2026. 10. 26. (월)</li>
                  <li><strong>참여 비용:</strong> 1차 40,000원 / 2차 예약금 20,000원 (※ 추가비 발생 가능, 2부는 추가 금액 정산 예정)</li>
                  <li><strong>드레스 코드:</strong> 학생다운 프레피룩 복장 (※ 드레스 코드는 선택 참여)</li>
                  <li><strong>준비물:</strong> 학우에게 선물할 도서 1권 이상, 필기구, 꺾이지 않는 텐션과 열린 마음</li>
                </ol>
              </div>

              {/* 하단 날짜 및 서명 */}
              <div className="text-center pt-3 font-serif space-y-1">
                <div className="text-xs font-mono text-[#555]">2026. 10. 26.</div>
                <div className="text-lg font-black text-[#111] tracking-wider">
                  연말파티준비위원회 일동
                </div>
              </div>

              {/* 절취선 및 참가 신청서(회신서) 바로가기 */}
              {SHOW_EXTRA_TABS && (
                <div className="pt-4 sm:pt-6 border-t-2 border-dashed border-[#1f1b18]/40 text-center space-y-3 sm:space-y-4">
                  <div className="text-xs font-serif text-[#666] tracking-wider">
                    ---------------------- (절  취  선) ----------------------
                  </div>

                  {/* 참가 신청서 바로가기 안내 박스 */}
                  <div className="bg-[#f8f6f0] border-2 border-[#1f1b18] rounded-xl p-4 sm:p-6 shadow-sm space-y-3 max-w-xl mx-auto">
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded bg-[#b82828] text-white font-mono text-[10px] font-bold">
                        RSVP NOTICE
                      </span>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#1f1b18]">
                        2026 플래닛 연말모임 가정통신문 회신서
                      </h3>
                      <p className="text-xs text-[#555] font-serif">
                        참석 여부 및 선물 도서 힌트를 제출하고 모바일 학생증을 발급받으세요.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                      <button
                        onClick={() => handleTabClick('rsvp')}
                        className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#b82828] hover:bg-[#961e1e] text-white font-serif font-bold text-sm sm:text-base shadow-md flex items-center justify-center space-x-2 transition-all active:scale-98"
                      >
                        <Send className="w-4 h-4" />
                        <span>참가 신청서 (회신서) 바로 작성하기</span>
                      </button>
                      <button
                        onClick={() => handleTabClick('timeline')}
                        className="w-full sm:w-auto px-5 py-3 rounded-lg border border-[#1f1b18]/40 bg-white hover:bg-[#ede8dc] text-[#1f1b18] font-serif font-bold text-sm transition-all"
                      >
                        일과표 세부 일정 보기
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: 일과표 안내 (1부 새학기 & 2부 수학여행 상세)        */}
        {/* ========================================================= */}
        {SHOW_EXTRA_TABS && activeTab === 'timeline' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="text-center space-y-1 mb-4">
              <h2 className="font-serif text-2xl font-bold text-[#1f1b18]">
                2026 플래닛 연말모임 일과표
              </h2>
              <p className="text-xs font-serif text-[#666]">
                낮의 「플래닛의 새학기」와 밤의 「플래닛의 수학여행」 세부 시간표입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 1부 새학기 */}
              <div className="p-5 rounded-xl border border-[#e0dad0] bg-white shadow-md space-y-4">
                <div className="border-b border-[#eee] pb-3">
                  <span className="px-2 py-0.5 rounded bg-[#b82828] text-white text-[11px] font-bold font-serif">
                    1부 메인 모임
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#1f1b18] mt-2">
                    플래닛의 새학기 (The New Semester)
                  </h3>
                  <div className="text-xs text-[#666] flex items-center space-x-1 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>10:00 ~ 17:00 (공간나인 강남점)</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs font-serif">
                  <div className="p-3 bg-[#f8f6f0] rounded-lg border border-[#e8e4dc]">
                    <div className="font-bold text-[#b82828]">1교시 (10:00 ~ 10:30) • 등교 및 자리배치</div>
                    <p className="text-[#666] text-[11px] mt-0.5">
                      명찰 및 웰컴 북마크 수령, 추억의 교실 자리뽑기 프로그램으로 조별 책상 착석
                    </p>
                  </div>

                  <div className="p-3 bg-[#f8f6f0] rounded-lg border border-[#e8e4dc]">
                    <div className="font-bold text-[#1f1b18]">2교시 (10:30 ~ 12:30) • 아카이브 회고 & 북 스피치</div>
                    <p className="text-[#666] text-[11px] mt-0.5">
                      올 한 해 함께 읽은 도서 회고, 학우별 '올해의 인생 문장' 1분 릴레이 스피치
                    </p>
                  </div>

                  <div className="p-3 bg-[#f8f6f0] rounded-lg border border-[#e8e4dc]">
                    <div className="font-bold text-[#b82828]">3교시 (12:30 ~ 15:00) • 블라인드 책 선물 교환회</div>
                    <p className="text-[#666] text-[11px] mt-0.5">
                      포장된 책과 정성 담긴 추천 편지를 무작위로 교환하는 플래닛 연말 시그니처 행사
                    </p>
                  </div>

                  <div className="p-3 bg-[#f8f6f0] rounded-lg border border-[#e8e4dc]">
                    <div className="font-bold text-[#1f1b18]">4교시 (15:00 ~ 17:00) • 2026 명예의 전당 어워즈</div>
                    <p className="text-[#666] text-[11px] mt-0.5">
                      다독상, 토론상, 다정한 플래닛상 시상 및 1부 단체 기념 촬영
                    </p>
                  </div>
                </div>
              </div>

              {/* 2부 수학여행 */}
              <div className="p-5 rounded-xl border border-[#e0dad0] bg-white shadow-md space-y-4">
                <div className="border-b border-[#eee] pb-3">
                  <span className="px-2 py-0.5 rounded bg-[#2e5238] text-white text-[11px] font-bold font-serif">
                    2부 애프터 모임
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#1f1b18] mt-2">
                    플래닛의 수학여행 (School Trip)
                  </h3>
                  <div className="text-xs text-[#666] flex items-center space-x-1 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>18:00 ~ LATE (미정)</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs font-serif">
                  <div className="p-3 bg-[#f8f6f0] rounded-lg border border-[#e8e4dc]">
                    <div className="font-bold text-[#2e5238]">18:00 ~ 19:00 • 숙소 체크인 & 웰컴 드링크</div>
                    <p className="text-[#666] text-[11px] mt-0.5">
                      파티룸 이동 및 체크인, 웰컴 음료와 함께하는 수학여행 분위기 환담
                    </p>
                  </div>

                  <div className="p-3 bg-[#f8f6f0] rounded-lg border border-[#e8e4dc]">
                    <div className="font-bold text-[#1f1b18]">19:00 ~ 20:30 • 추억의 야간 살롱 토크</div>
                    <p className="text-[#666] text-[11px] mt-0.5">
                      핑거푸드와 간식을 나누며 편안한 옷(파자마/이지웨어)으로 이어지는 깊은 대화
                    </p>
                  </div>

                  <div className="p-3 bg-[#f8f6f0] rounded-lg border border-[#e8e4dc]">
                    <div className="font-bold text-[#2e5238]">20:30 ~ 21:30 • 베스트 학우 룩 선출식</div>
                    <p className="text-[#666] text-[11px] mt-0.5">
                      가장 멋진 스쿨룩/프레피 룩을 선보인 학우에게 특별 기념품 증정
                    </p>
                  </div>

                  <div className="p-3 bg-[#f8f6f0] rounded-lg border border-[#e8e4dc]">
                    <div className="font-bold text-[#1f1b18]">21:30 ~ LATE • 심야 북토크 & 보드게임</div>
                    <p className="text-[#666] text-[11px] mt-0.5">
                      밤새 도란도란 이어지는 자유로운 친교와 심야 책 이야기
                    </p>
                  </div>
                </div>
              </div>

            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setActiveTab('rsvp')}
                className="px-6 py-2.5 rounded bg-[#b82828] hover:bg-[#961e1e] text-white font-serif font-bold text-sm shadow inline-flex items-center space-x-2"
              >
                <span>가정통신문 회신서 작성하러 가기</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: 드레스 코드 룩북 (컨셉제안3 프레피 룩에 긱 시크 한 방울) */}
        {/* ========================================================= */}
        {SHOW_EXTRA_TABS && activeTab === 'lookbook' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="text-center space-y-1 mb-4">
              <h2 className="font-serif text-2xl font-bold text-[#1f1b18]">
                드레스 코드 안내: 프레피 룩에 긱 시크 한 방울
              </h2>
              <p className="text-xs font-serif text-[#666]">
                교복을 연상시키는 단정한 프레피 스타일에 긱 시크 안경을 더한 추천 코디입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="p-4 rounded-xl border border-[#e0dad0] bg-white shadow-md space-y-3">
                <div className="w-10 h-10 rounded-full border border-[#d8d3c7] bg-[#f0ece1] flex items-center justify-center text-[#b82828]">
                  <Bookmark className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-[#1f1b18]">1. 교복 감성 블레이저 & 니트</h4>
                <p className="text-xs text-[#555] font-serif leading-relaxed">
                  네이비/차콜/베이지 블레이저, 케이블 니트 베스트, 단정한 화이트 셔츠와 플리츠 스커트 또는 치노 팬츠.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#e0dad0] bg-white shadow-md space-y-3">
                <div className="w-10 h-10 rounded-full border border-[#d8d3c7] bg-[#f0ece1] flex items-center justify-center text-[#b82828]">
                  <Glasses className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-[#1f1b18]">2. 긱 시크 뿔테 & 만년필</h4>
                <p className="text-xs text-[#555] font-serif leading-relaxed">
                  볼드한 블랙/브라운 뿔테 안경 또는 클래식 오벌 메탈 안경, 상의 포켓에 꽂힌 만년필 한 자루.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#e0dad0] bg-white shadow-md space-y-3">
                <div className="w-10 h-10 rounded-full border border-[#d8d3c7] bg-[#f0ece1] flex items-center justify-center text-[#b82828]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-[#1f1b18]">3. 선물할 도서 1권 이상</h4>
                <p className="text-xs text-[#555] font-serif leading-relaxed">
                  학우에게 선물할 정성스런 도서 1권(추천사 카드 동봉)과 꺾이지 않는 텐션!
                </p>
              </div>

            </div>

            <div className="p-4 rounded-lg bg-[#f8f6f0] border border-[#e0dad0] text-xs font-serif text-[#666]">
              * 드레스 코드는 필수가 아닌 <strong>선택 참여</strong>입니다. 소장하고 계신 편안한 셔츠나 니트만 입고 오셔도 대환영입니다!
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => handleTabClick('rsvp')}
                className="px-6 py-2.5 rounded bg-[#b82828] hover:bg-[#961e1e] text-white font-serif font-bold text-sm shadow inline-flex items-center space-x-2"
              >
                <span>가정통신문 회신서 작성하기</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: 가정통신문 회신서 (4B 연필 크로키 아바타 & 참가 신청서) */}
        {/* ========================================================= */}
        {SHOW_EXTRA_TABS && activeTab === 'rsvp' && (
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <PencilSketchRsvp />
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* 신청 완료: 플래닛 독서학교 공식 모바일 학생증 모달 (컨셉제안4) */}
      {/* ========================================================= */}
      {confirmedStudentId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-sm space-y-3 animate-scaleUp my-auto max-h-[92vh] overflow-y-auto p-0.5 scrollbar-none">
            
            {/* 캡처 대상 학생증 실물 카드 */}
            <div 
              ref={studentIdCardRef}
              className="bg-white rounded-2xl overflow-hidden shadow-2xl border-4 border-[#17241b]"
            >
              {/* 학생증 상단 띠 */}
              <div className="bg-[#17241b] text-white p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img src={planetLogo} alt="플래닛 로고" className="w-7 h-7 object-contain bg-white rounded p-0.5" />
                  <span className="text-xs font-serif font-bold text-[#dfc27d]">플래닛 독서학교</span>
                </div>
                <h3 className="font-serif text-sm font-black tracking-wider text-white">
                  학 생 증 (STUDENT ID)
                </h3>
              </div>

              {/* 학생증 본문 (컨셉제안4 배부하는 명찰 양식) */}
              <div className="p-6 text-[#1f1b18] space-y-4">
                
                <div className="flex items-center space-x-4">
                  {/* 사진 프레임 */}
                  <div className="w-20 h-24 rounded-lg border-2 border-[#1f1b18]/30 bg-[#f6f3eb] flex flex-col items-center justify-center text-[#555] shadow-inner">
                    <User className="w-10 h-10 text-[#888] mb-1" />
                    <span className="text-[9px] font-serif">프로필 사진</span>
                  </div>

                  {/* 인적 사항 */}
                  <div className="space-y-1 text-xs font-serif flex-1">
                    <div>
                      <span className="text-[10px] text-[#666] block">성명</span>
                      <span className="font-bold text-base text-[#111]">{confirmedStudentId.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#666] block">학번</span>
                      <span className="font-mono font-bold text-[#b82828]">{confirmedStudentId.studentNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#666] block">참석 세션</span>
                      <span className="font-bold text-[11px] text-[#2e5238]">{confirmedStudentId.sessionName}</span>
                    </div>
                  </div>
                </div>

                {/* 회비 및 발급 안내 */}
                <div className="p-2.5 rounded bg-[#f6f3eb] border border-[#1f1b18]/20 text-[11px] font-serif space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#666]">회비 내역:</span>
                    <span className="font-mono font-bold text-[#b82828]">{confirmedStudentId.fee.toLocaleString()}원 (입금 대기)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666]">연락처:</span>
                    <span className="font-mono">{confirmedStudentId.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666]">발급일자:</span>
                    <span className="font-mono">{confirmedStudentId.submittedAt}</span>
                  </div>
                </div>

                {/* 바코드 그래픽 */}
                <div className="text-center pt-2 border-t border-[#1f1b18]/20">
                  <div className="font-mono text-xl tracking-[0.3em] font-black select-none text-[#111]">
                    ||| | |||| | ||| |||||
                  </div>
                  <div className="text-[9px] font-mono text-[#888] mt-0.5">
                    플래닛 독서학교 운영위원회 직인 생략
                  </div>
                </div>

              </div>
            </div>

            {/* 입금 계좌 안내 및 원클릭 복사 바 */}
            <div className="bg-[#fcfbf9] border border-[#d5cfc4] rounded-xl p-3 text-center space-y-1.5 shadow-md">
              <div className="text-[11px] font-serif text-[#555]">
                입금 계좌: <strong className="text-[#111]">{EVENT_CONFIG.contact.accountInfo}</strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(EVENT_CONFIG.contact.accountInfo);
                  setCopiedAccount(true);
                  setTimeout(() => setCopiedAccount(false), 2000);
                }}
                className="w-full py-1.5 text-xs font-serif rounded bg-white hover:bg-[#ede8dc] border border-[#bbb] text-[#1f1b18] flex items-center justify-center space-x-1 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-[#2e5238]" />
                <span>{copiedAccount ? '계좌번호 복사 완료!' : '계좌번호 복사하기'}</span>
              </button>
            </div>

            {/* 모바일 저장 / 닫기 액션 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={handleDownloadStudentId}
                disabled={isDownloadingId}
                className="flex-1 py-3 rounded-xl bg-[#2e5238] hover:bg-[#23402c] text-white font-serif font-bold text-xs transition-all shadow flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloadingId ? '저장 중...' : '학생증 이미지(PNG) 저장'}</span>
              </button>
              <button
                onClick={() => setConfirmedStudentId(null)}
                className="px-4 py-3 rounded-xl bg-white hover:bg-[#ede8dc] border border-[#17241b] text-[#17241b] font-serif font-bold text-xs transition-all shadow"
              >
                닫기
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 푸터 */}
      <footer className="mt-12 py-6 border-t border-[#e8e4dc] text-center text-xs text-[#777] font-serif space-y-2">
        <p>© 2026 플래닛 독서학교 (PLANET since 2017). All Rights Reserved.</p>
        <p className="text-[10px] text-[#999]">
          가정통신문 제2026-1호 • 플래닛 여러분을 위한 설레는 새학기와 추억의 수학여행
        </p>
        {onGoToSettlement && (
          <div className="pt-2">
            <button
              onClick={onGoToSettlement}
              className="inline-flex items-center space-x-1 px-3 py-1 rounded-full border border-[#d8d3c7] bg-white hover:bg-[#ede8dc] text-[11px] text-[#444] transition-all shadow-xs"
            >
              <span>🧾 정산 보고서 열람</span>
            </button>
          </div>
        )}
      </footer>

    </div>
  );
};
