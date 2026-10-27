import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';
import { 
  Download, Shuffle, Eraser, 
  Scissors, AlertCircle, Copy, CheckCircle2,
  ChevronDown, ChevronUp, User, BookOpen, Clock, ShieldCheck
} from 'lucide-react';
import { 
  getStagesV3, HAIR_COLORS, PHOTO_BG_COLORS, BADGE_OPTIONS, getBadgeSeasonStyle, Stage 
} from './pencilDataV3';
import { EVENT_CONFIG } from '../constants/eventConfig';
import { sanitizeText, validatePhone, formatPhone } from '../utils/validation';

interface PencilSketchRsvpProps {
  onSuccess?: () => void;
}

export const PencilSketchRsvp: React.FC<PencilSketchRsvpProps> = ({ onSuccess }) => {
  // 1. 헤어 컬러 및 배경톤, 반 뱃지 상태
  const [hairColorIdx, setHairColorIdx] = useState(0);
  const [photoBg, setPhotoBg] = useState('#fffdf9');
  const [badge, setBadge] = useState('🌸 스프링토');
  const [cardMode, setCardMode] = useState<'id' | 'library'>('id');

  const currentHairMain = HAIR_COLORS[hairColorIdx].main;
  const currentHairSub = HAIR_COLORS[hairColorIdx].sub;

  // 8단계 스테이지 데이터 (머리색 반영)
  const STAGES: Stage[] = useMemo(() => {
    return getStagesV3(currentHairMain, currentHairSub);
  }, [currentHairMain, currentHairSub]);

  // 2. 8단계 인덱스: [얼굴, 헤어, 눈, 코/볼, 입, 안경, 의상, 소품]
  const [currentStage, setCurrentStage] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hairGenderFilter, setHairGenderFilter] = useState<'ALL' | 'M' | 'F'>('ALL');
  const [selectedIndices, setSelectedIndices] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);

  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // 3. 참가 신청 폼 상태
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sessionType, setSessionType] = useState<'both' | 'session1' | 'session2'>('both');
  const [bookHint, setBookHint] = useState('');
  const [motto, setMotto] = useState('');
  const [memo, setMemo] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(true);
  const [hpCheck, setHpCheck] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [showAdminPrint, setShowAdminPrint] = useState(false);

  // 운영진 수합 조판 그리드 (초기 샘플 3명 포함)
  const [submittedRoster, setSubmittedRoster] = useState<any[]>([
    { name: '김동효', session: '1부 새학기 + 2부 수학여행', book: '우리가 사랑한 소설 1권', motto: '새학기처럼 신선하게!', badge: '🌸 스프링토', indices: [0, 2, 0, 0, 0, 0, 0, 0], hair: ['#3b332b', '#5e5044'] },
    { name: '한지수', session: '1부 새학기 + 2부 수학여행', book: '원고는 불타지 않는다', motto: '자율주행 정상화 완료!', badge: '☀️ 썸머데이', indices: [4, 6, 1, 1, 2, 1, 5, 1], hair: ['#3b332b', '#5e5044'] },
    { name: '이플래닛', session: '1부 플래닛의 새학기 (낮)', book: '겨울밤에 읽기 좋은 시집', motto: '꺾이지 않는 텐션!', badge: '🍂 어텀', indices: [1, 3, 3, 4, 1, 2, 1, 2], hair: ['#6f4e37', '#8a6449'] }
  ]);

  // 허용된 파츠 인덱스 목록 (헤어 성별 필터 고려)
  const allowedIndices = useMemo(() => {
    if (currentStage >= 8 || !STAGES[currentStage]) return [0];
    const items = STAGES[currentStage].items;
    if (STAGES[currentStage].id === 'hair' && hairGenderFilter !== 'ALL') {
      const filtered: number[] = [];
      items.forEach((it, idx) => {
        if (it.gender === hairGenderFilter) filtered.push(idx);
      });
      return filtered.length > 0 ? filtered : items.map((_, i) => i);
    }
    return items.map((_, i) => i);
  }, [currentStage, hairGenderFilter, STAGES]);

  // 공책 위 색연필 좌우 왕복 애니메이션 (95ms)
  useEffect(() => {
    if (!isPlaying || currentStage >= 8) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const currentPos = allowedIndices.indexOf(prev);
        let nextPos = (currentPos === -1 ? 0 : currentPos) + direction;

        if (nextPos >= allowedIndices.length - 1) {
          nextPos = allowedIndices.length - 1;
          setDirection(-1);
        } else if (nextPos <= 0) {
          nextPos = 0;
          setDirection(1);
        }

        return allowedIndices[nextPos] ?? 0;
      });
    }, 95);

    return () => clearInterval(interval);
  }, [isPlaying, direction, allowedIndices, currentStage]);

  // 스페이스바를 누르면 '멈춰!' 인터랙션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleStopClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStage, activeIndex, isPlaying]);

  // [멈춰!] 버튼 클릭 핸들러
  const handleStopClick = () => {
    if (currentStage >= 8) {
      setCurrentStage(0);
      setIsPlaying(true);
      return;
    }

    const newIndices = [...selectedIndices];
    newIndices[currentStage] = activeIndex;
    setSelectedIndices(newIndices);

    if (currentStage < 7) {
      setCurrentStage(prev => prev + 1);
      const nextAllowed = STAGES[currentStage + 1]?.items.map((_, i) => i) || [0];
      setActiveIndex(nextAllowed[0]);
    } else {
      setCurrentStage(8);
      setIsPlaying(false);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#3b332b', '#d97757', '#dfc27d']
      });
    }
  };

  // 특정 파츠 직접 클릭 시 선택 & 다음 단계 이동
  const handleSelectPart = (idx: number) => {
    const newIndices = [...selectedIndices];
    newIndices[currentStage] = idx;
    setSelectedIndices(newIndices);
    setActiveIndex(idx);

    if (currentStage < 7) {
      setCurrentStage(prev => prev + 1);
      const nextAllowed = STAGES[currentStage + 1]?.items.map((_, i) => i) || [0];
      setActiveIndex(nextAllowed[0]);
    } else {
      setCurrentStage(8);
      setIsPlaying(false);
    }
  };

  // 특정 단계 탭으로 점프
  const jumpToStage = (stageIdx: number) => {
    setCurrentStage(stageIdx);
    setActiveIndex(selectedIndices[stageIdx] ?? 0);
    setIsPlaying(true);
  };

  // 원클릭 랜덤 코디 생성 (남/여/전체)
  const handleRandomize = (genderMode: 'ALL' | 'M' | 'F' = 'ALL') => {
    const rand = STAGES.map((st) => {
      if (st.id === 'hair' && genderMode !== 'ALL') {
        const candidates = st.items
          .map((it, idx) => (it.gender === genderMode ? idx : -1))
          .filter(idx => idx !== -1);
        return candidates[Math.floor(Math.random() * candidates.length)] ?? 0;
      }
      return Math.floor(Math.random() * st.items.length);
    });
    setSelectedIndices(rand);
    setCurrentStage(8);
    setIsPlaying(false);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#3b332b', '#c83e37', '#dfc27d']
    });
  };

  // 지우개 리셋
  const handleReset = () => {
    setSelectedIndices([0, 0, 0, 0, 0, 0, 0, 0]);
    setCurrentStage(0);
    setActiveIndex(0);
    setIsPlaying(true);
  };

  // 학생증 / 도서대출카드 PNG 다운로드
  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        backgroundColor: '#fffdf9'
      });
      const link = document.createElement('a');
      const safeName = (name.trim() || '김플래닛').replace(/[^a-zA-Z0-9가-힣]/g, '');
      link.download = `2026_플래닛독서학교_학생증_${safeName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('이미지 저장 오류:', err);
      alert('이미지 저장 중 일시적 오류가 발생했습니다. 화면을 캡처해 주세요.');
    } finally {
      setIsDownloading(false);
    }
  };

  // 계좌번호 원클릭 복사
  const handleCopyAccount = () => {
    const text = '하나은행 439-911050-56507 한지수';
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }).catch(() => {
      alert(text);
    });
  };

  // 전화번호 포맷팅
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
    if (errorMessage) setErrorMessage('');
  };

  // 세션 라벨 및 회비 계산
  const { sessionLabel, feeAmount, feeText } = useMemo(() => {
    if (sessionType === 'both') {
      return {
        sessionLabel: '1부 새학기 + 2부 수학여행',
        feeAmount: 60000,
        feeText: '60,000원'
      };
    } else if (sessionType === 'session1') {
      return {
        sessionLabel: '1부 플래닛의 새학기 (낮)',
        feeAmount: 40000,
        feeText: '40,000원'
      };
    } else {
      return {
        sessionLabel: '2부 플래닛의 수학여행 (밤/예약금)',
        feeAmount: 20000,
        feeText: '20,000원'
      };
    }
  }, [sessionType]);

  // 코디 요약 텍스트
  const avatarRecipeText = useMemo(() => {
    return selectedIndices.map((val, sIdx) => STAGES[sIdx]?.items[val]?.name || '미정').join(' · ');
  }, [selectedIndices, STAGES]);

  const libraryCallNumber = useMemo(() => {
    const code = selectedIndices.map(v => v + 1).join('');
    return `813.5-플2026-${code}`;
  }, [selectedIndices]);

  // 참가 신청서 제출 (구글 시트 연동)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (hpCheck.trim() !== '') return;

    const cleanName = sanitizeText(name, 20);
    if (!cleanName || cleanName.length < 2) {
      setErrorMessage('성함을 2자 이상 바르게 입력해 주세요.');
      return;
    }
    if (!validatePhone(phone)) {
      setErrorMessage('휴대폰 번호(010-0000-0000) 형식을 확인해 주세요.');
      return;
    }
    if (!privacyAgreed) {
      setErrorMessage('개인정보 수집 및 행사 안내 목적 이용에 동의해 주세요.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    const studentNumber = `2026-PLANET-${Math.floor(1000 + Math.random() * 9000)}`;
    const avatarCode = selectedIndices.map(v => v + 1).join('-');
    const safeBook = sanitizeText(bookHint, 100) || '(선물 책 준비 중)';
    const safeMotto = sanitizeText(motto, 100) || '꺾이지 않는 텐션으로 완독!';
    const safeMemo = sanitizeText(memo, 200) || '(없음)';

    // 운영진 조판 명단에 실시간 추가
    setSubmittedRoster(prev => [
      {
        name: cleanName,
        session: sessionLabel,
        book: safeBook,
        motto: safeMotto,
        badge: badge,
        indices: [...selectedIndices],
        hair: [currentHairMain, currentHairSub]
      },
      ...prev
    ]);

    const payload = {
      action: 'register',
      name: cleanName,
      phone: phone,
      session: sessionLabel,
      bookTitle: safeBook,
      fee: feeAmount,
      paymentStatus: '입금 대기',
      seatGroup: '',
      existingMember: '',
      badge: badge,
      memberType: badge,
      studentNumber: studentNumber,
      avatarCode: avatarCode,
      avatarRecipe: avatarRecipeText,
      motto: safeMotto,
      memo: safeMemo,
      submittedAt: new Date().toLocaleString('ko-KR')
    };

    try {
      const scriptUrl = EVENT_CONFIG.googleScriptUrl || "https://script.google.com/macros/s/AKfycbwXzDlUsRy3fFI6gGW0fCoAYaEuQEoJwHu1a2-I4ULhpl3wUj_5vq_yi22xG85WGBXV/exec";
      if (scriptUrl && !scriptUrl.includes('YOUR_SCRIPT_ID')) {
        // 단일 POST 전송 (중복 행 입력 방지를 위해 백업 다중 요청 제거)
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
      }

      // 로컬스토리지 캐싱 (관리자 대시보드 연동)
      try {
        const existing = JSON.parse(localStorage.getItem('planet_rsvps') || '[]');
        existing.push(payload);
        localStorage.setItem('planet_rsvps', JSON.stringify(existing));
      } catch {}

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#b82828', '#2e5238', '#dfc27d', '#292524', '#f59e0b']
      });

      setSubmittedData({
        ...payload,
        feeText: feeText
      });

      if (onSuccess) onSuccess();

    } catch (err) {
      console.error('신청서 전송 오류:', err);
      alert('신청서 전송 중 일시적인 오류가 발생했습니다. 브라우저에 우선 안전하게 보관되었습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex justify-center py-2 px-1 sm:px-4">
      {/* 전역 SVG 부드러운 색연필 텍스처 필터 */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="pencil-sketch" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.75" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* 메인 컨테이너 (HWP 가정통신문 갱지 스타일) */}
      <div className="w-full max-w-4xl gengji-paper rounded-xl shadow-2xl border-4 border-stone-800 p-3 sm:p-7 relative text-[#2e2823]">

        {/* 1. 상단 HWP 가정통신문 헤더 */}
        <div className="border-2 border-black bg-white/70 mb-5 rounded-sm overflow-hidden">
          <div className="grid grid-cols-12 divide-x-2 divide-black items-center text-center">
            <div className="col-span-3 py-2 px-1">
              <div className="font-black text-base sm:text-xl tracking-tighter text-stone-800">PLANET</div>
              <div className="text-[10px] text-stone-600">since 2017</div>
            </div>
            <div className="col-span-6 py-2 sm:py-3">
              <h1 className="font-hwp-title font-black text-lg sm:text-2xl text-black">가 정 통 신 문</h1>
            </div>
            <div className="col-span-3 py-1.5 px-1 text-[10px] sm:text-xs leading-tight font-hwp-body text-left pl-2">
              <div>플래닛독서학교</div>
              <div>제2026-1호</div>
              <div>2026.12.19.</div>
            </div>
          </div>
        </div>

        {/* 안내 타이틀 */}
        <div className="text-center mb-5">
          <h2 className="font-bold text-base sm:text-lg text-black tracking-tight">
            - 2026 플래닛 연말 파티 「플래닛의 새학기」 동글동글 학생증 공방 & 참가 신청서 -
          </h2>
          <p className="text-xs sm:text-sm text-stone-700 mt-1 font-hwp-body">
            ※ 짝꿍이 다이어리 귀퉁이에 색연필로 동글동글하게 그려준 <b>'8단계 공책 게임'</b>으로 나만의 학생증을 꾸며보세요!
          </p>
        </div>

        {/* ========================================================= */}
        {/* 2. 동글동글 색연필 공책 게임 ("연필 멈춰!") 섹션            */}
        {/* ========================================================= */}
        <div className="relative lined-notebook border-2 border-stone-800 rounded-2xl shadow-lg p-3 sm:p-6 pl-7 sm:pl-11 mb-8">
          
          {/* 스프링 링 장식 */}
          <div className="absolute left-1.5 top-5 bottom-5 flex flex-col justify-between py-1 pointer-events-none">
            <div className="spiral-ring"></div><div className="spiral-ring"></div><div className="spiral-ring"></div>
            <div className="spiral-ring"></div><div className="spiral-ring"></div><div className="spiral-ring"></div>
            <div className="spiral-ring"></div><div className="spiral-ring"></div><div className="spiral-ring"></div>
          </div>

          {/* 공책 상단 헤더 */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-stone-300 pb-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-600 text-white px-3 py-0.5 rounded-full font-hand font-bold text-base sm:text-lg shadow-sm">
                🎨 동글동글 색연필 공책 게임
              </span>
              <span className="font-hand text-base sm:text-xl font-bold text-stone-800">
                색연필이 왔다 갔다 할 때 <span className="text-amber-700 underline decoration-wavy">"멈춰!"</span>를 눌러 내 캐릭터 만들기
              </span>
            </div>
            <span className="text-xs font-bold bg-amber-100 border border-amber-700 text-amber-950 px-3 py-1 rounded-full">
              {currentStage >= 8 ? '✨ 8/8 단계 완성!' : `${currentStage + 1}/8 단계: ${STAGES[currentStage]?.title} 고르는 중`}
            </span>
          </div>

          {/* 8단계 탭 버튼 */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 mb-3 text-center font-hand text-xs sm:text-sm font-bold">
            {STAGES.map((st, idx) => {
              const isCurrent = idx === currentStage;
              const isSelected = selectedIndices[idx] !== null;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => jumpToStage(idx)}
                  className={`py-1.5 px-1 rounded-xl transition ${
                    isCurrent
                      ? 'border-2 border-amber-800 bg-amber-600 text-white shadow scale-105'
                      : isSelected
                        ? 'border border-stone-500 bg-stone-200 text-stone-900 hover:bg-stone-300'
                        : 'border border-stone-300 bg-white/80 text-stone-400'
                  }`}
                >
                  {idx + 1}. {st.title.replace(/[<>]/g, '')}
                </button>
              );
            })}
          </div>

          {/* 헤어스타일 남/여 필터 바 */}
          {currentStage === 1 && (
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 bg-amber-50/90 border border-amber-300 rounded-xl px-3 py-1.5 text-xs">
              <span className="font-bold text-amber-950">💇‍♂️💇‍♀️ 헤어스타일 12종 (남학생 6종 · 여학생 6종):</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setHairGenderFilter('ALL')}
                  className={`px-2.5 py-0.5 rounded-full font-bold transition ${
                    hairGenderFilter === 'ALL' ? 'bg-amber-700 text-white shadow-sm' : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  전체 12종
                </button>
                <button
                  type="button"
                  onClick={() => setHairGenderFilter('M')}
                  className={`px-2.5 py-0.5 rounded-full font-bold transition ${
                    hairGenderFilter === 'M' ? 'bg-amber-700 text-white shadow-sm' : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  👦 남학생 머리
                </button>
                <button
                  type="button"
                  onClick={() => setHairGenderFilter('F')}
                  className={`px-2.5 py-0.5 rounded-full font-bold transition ${
                    hairGenderFilter === 'F' ? 'bg-amber-700 text-white shadow-sm' : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  👧 여학생 머리
                </button>
              </div>
            </div>
          )}

          {/* 현재 단계 파츠 나열 판 */}
          {currentStage < 8 && STAGES[currentStage] && (
            <div className={`grid gap-2 my-3 ${currentStage === 1 ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-4 sm:grid-cols-8'}`}>
              {STAGES[currentStage].items.map((item, idx) => {
                const isItemActive = idx === activeIndex;
                const isHair = STAGES[currentStage].id === 'hair';
                const guideOutline = currentStage !== 0 
                  ? `<circle cx="100" cy="102" r="48" fill="#fffaf3" stroke="#e7e0d6" stroke-width="1.5" stroke-dasharray="3,3"/>` 
                  : '';
                const previewInner = isHair
                  ? `${item.backSvg || ''}${guideOutline}${item.frontSvg || ''}`
                  : `${guideOutline}${item.svg || ''}`;

                const dimmed = isHair && hairGenderFilter !== 'ALL' && item.gender !== hairGenderFilter;

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectPart(idx)}
                    className={`cursor-pointer border-2 bg-[#fffdf9] rounded-xl p-1.5 flex flex-col items-center justify-between transition duration-75 hover:border-amber-600 ${
                      isItemActive ? 'pen-active' : 'border-stone-300'
                    } ${dimmed ? 'opacity-40' : ''}`}
                  >
                    <div className="w-full aspect-square flex items-center justify-center overflow-hidden">
                      <svg viewBox="0 0 200 220" className="w-full h-full" filter="url(#pencil-sketch)"
                        dangerouslySetInnerHTML={{ __html: previewInner }}
                      />
                    </div>
                    <span className="font-hand text-xs sm:text-sm font-bold text-stone-800 text-center leading-tight mt-1">
                      {item.gender === 'M' && <span className="text-[9px] bg-sky-100 text-sky-800 border border-sky-300 px-1 rounded mr-0.5">남</span>}
                      {item.gender === 'F' && <span className="text-[9px] bg-rose-100 text-rose-800 border border-rose-300 px-1 rounded mr-0.5">여</span>}
                      {idx + 1}. {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 콤포넌트 바: 머리색 / 배경톤 / 반 뱃지 */}
          <div className="mt-4 bg-stone-100/90 border border-stone-300 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* 머리색 */}
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="font-bold text-stone-700 shrink-0">🎨 머리색:</span>
              <div className="flex items-center gap-1.5">
                {HAIR_COLORS.map((hc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setHairColorIdx(idx)}
                    style={{ backgroundColor: hc.main }}
                    className={`w-6 h-6 rounded-full border-2 border-white shadow ring-1 ring-stone-400 hover:scale-110 transition ${
                      hairColorIdx === idx ? 'ring-2 ring-amber-600 scale-110' : ''
                    }`}
                    title={hc.name}
                  />
                ))}
              </div>
            </div>

            {/* 배경톤 */}
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="font-bold text-stone-700 shrink-0">🖼️ 배경톤:</span>
              <div className="flex items-center gap-1.5">
                {PHOTO_BG_COLORS.map((bg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhotoBg(bg.color)}
                    style={{ backgroundColor: bg.color }}
                    className={`w-6 h-6 rounded-full border border-stone-400 hover:scale-110 transition ${
                      photoBg === bg.color ? 'ring-2 ring-amber-600 scale-110' : ''
                    }`}
                    title={bg.name}
                  />
                ))}
              </div>
            </div>

            {/* 반 뱃지 */}
            <div className="flex items-center justify-between gap-1.5">
              <span className="font-bold text-stone-700 shrink-0">🏷️ 반 뱃지:</span>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full border border-stone-400 rounded-lg px-2 py-1 bg-white text-xs font-round focus:outline-none"
              >
                {BADGE_OPTIONS.map((opt, idx) => (
                  <option key={idx} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 연필 상태 메시지 & 컨트롤 버튼 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-dashed border-stone-300">
            <div className="font-hand text-base sm:text-lg font-bold text-stone-700 flex items-center gap-1.5">
              <span className="inline-block animate-bounce">✏️</span>
              {currentStage >= 8 ? (
                <span className="text-amber-900 font-bold">✨ 나만의 학생증 캐릭터가 완성되었어요! (상단 탭을 눌러 언제든 수정 가능)</span>
              ) : (
                <span>색연필이 오가고 있어요! [멈춰!]를 누르거나 마음에 드는 그림을 직접 콕 찍어보세요.</span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <button
                type="button"
                onClick={handleStopClick}
                className="flex-1 sm:flex-initial bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black px-5 py-2.5 rounded-xl shadow-md border-2 border-stone-900 transition flex items-center justify-center gap-1.5 text-sm sm:text-base cursor-pointer"
              >
                <span>{currentStage >= 8 ? '✏️ 다시 뽑기' : '✋ 멈춰!'}</span>
                <span className="text-[11px] font-normal opacity-90">(Space)</span>
              </button>

              <button
                type="button"
                onClick={() => handleRandomize('ALL')}
                className="bg-amber-100 hover:bg-amber-200 text-stone-900 font-bold px-3 py-2.5 rounded-xl border-2 border-stone-900 text-xs sm:text-sm transition cursor-pointer"
                title="남/여 전체 랜덤 코디"
              >
                🎲 랜덤 코디
              </button>
              <button
                type="button"
                onClick={() => handleRandomize('M')}
                className="bg-sky-100 hover:bg-sky-200 text-sky-950 font-bold px-2.5 py-2.5 rounded-xl border-2 border-stone-900 text-xs transition cursor-pointer"
                title="남학생 머리로 랜덤 코디"
              >
                👦 남학생
              </button>
              <button
                type="button"
                onClick={() => handleRandomize('F')}
                className="bg-rose-100 hover:bg-rose-200 text-rose-950 font-bold px-2.5 py-2.5 rounded-xl border-2 border-stone-900 text-xs transition cursor-pointer"
                title="여학생 머리로 랜덤 코디"
              >
                👧 여학생
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold px-3 py-2.5 rounded-xl border-2 border-stone-900 text-xs sm:text-sm transition cursor-pointer"
                title="지우개로 지우고 처음부터"
              >
                🧹 지우개
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================= */}
        {/* 3. 실시간 학생증 / 도서대출증 프리뷰 & 참가 신청서 폼   */}
        {/* ======================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

          {/* 좌측: 실시간 학생증 & 대출증 프리뷰 (5칸) */}
          <div className="md:col-span-5 flex flex-col items-center w-full">
            
            {/* 카드 모드 전환 탭 */}
            <div className="grid grid-cols-2 w-full mb-2 border-2 border-stone-900 rounded-xl overflow-hidden text-xs font-bold">
              <button
                type="button"
                onClick={() => setCardMode('id')}
                className={`py-2 transition cursor-pointer ${
                  cardMode === 'id' ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                🪪 공식 학생증 뷰
              </button>
              <button
                type="button"
                onClick={() => setCardMode('library')}
                className={`py-2 transition cursor-pointer ${
                  cardMode === 'library' ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                📚 도서대출카드 뷰
              </button>
            </div>

            {/* 캡처 대상 카드 영역 */}
            <div
              ref={cardRef}
              className="w-full bg-[#fffdf9] border-2 border-stone-900 rounded-xl p-4 shadow-md relative"
            >
              {/* [모드 1] 플래닛독서학교 학생증 */}
              {cardMode === 'id' && (
                <div>
                  <div className="border-b-2 border-stone-800 pb-1.5 mb-3 flex justify-between items-end">
                    <div>
                      <div className="text-[10px] font-bold text-stone-500 tracking-widest">PLANET BOOK SCHOOL</div>
                      <div className="font-hwp-title font-black text-lg text-stone-900 leading-none mt-0.5">학 생 증</div>
                    </div>
                    <span className={`text-[10px] font-round font-bold border px-2 py-0.5 rounded-full shadow-2xs ${getBadgeSeasonStyle(badge)}`}>
                      {badge}
                    </span>
                  </div>

                  {/* 증명사진 + 학적 정보 */}
                  <div className="grid grid-cols-12 gap-3 items-center">
                    {/* 아바타 캔버스 */}
                    <div
                      style={{ backgroundColor: photoBg }}
                      className="col-span-5 sketch-paper border-2 border-stone-800 rounded-xl aspect-[4/5] relative flex items-center justify-center overflow-hidden shadow-inner"
                    >
                      <svg viewBox="0 0 200 220" className="w-full h-full" filter="url(#pencil-sketch)">
                        {/* 1. 뒷머리 */}
                        {selectedIndices[1] !== null && STAGES[1] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[1].items[selectedIndices[1]]?.backSvg || '' }} />
                        )}
                        {/* 2. 의상 */}
                        {selectedIndices[6] !== null && STAGES[6] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[6].items[selectedIndices[6]]?.svg || '' }} />
                        )}
                        {/* 3. 얼굴형 */}
                        {selectedIndices[0] !== null && STAGES[0] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[0].items[selectedIndices[0]]?.svg || '' }} />
                        )}
                        {/* 4. 볼터치 */}
                        {selectedIndices[3] !== null && STAGES[3] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[3].items[selectedIndices[3]]?.svg || '' }} />
                        )}
                        {/* 5. 눈 */}
                        {selectedIndices[2] !== null && STAGES[2] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[2].items[selectedIndices[2]]?.svg || '' }} />
                        )}
                        {/* 6. 입 */}
                        {selectedIndices[4] !== null && STAGES[4] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[4].items[selectedIndices[4]]?.svg || '' }} />
                        )}
                        {/* 7. 앞머리 */}
                        {selectedIndices[1] !== null && STAGES[1] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[1].items[selectedIndices[1]]?.frontSvg || '' }} />
                        )}
                        {/* 8. 안경/헤어악세사리 */}
                        {selectedIndices[5] !== null && STAGES[5] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[5].items[selectedIndices[5]]?.svg || '' }} />
                        )}
                        {/* 9. 소품 (맨 앞으로 표시) */}
                        {selectedIndices[7] !== null && STAGES[7] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[7].items[selectedIndices[7]]?.svg || '' }} />
                        )}
                      </svg>
                    </div>

                    {/* 우측 학생 정보 */}
                    <div className="col-span-7 text-xs font-hwp-body space-y-1.5">
                      <div className="border-b border-stone-300 pb-1">
                        <span className="text-stone-500 font-bold block text-[10px]">성 명 (학우명)</span>
                        <span className="font-bold text-sm text-stone-900">{name.trim() || '김플래닛'}</span>
                      </div>
                      <div className="border-b border-stone-300 pb-1">
                        <span className="text-stone-500 font-bold block text-[10px]">수강 과정</span>
                        <span className="font-bold text-amber-900 text-[11px]">{sessionLabel}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 font-bold block text-[10px]">새학기 한마디</span>
                        <span className="font-hand text-xs text-stone-700 line-clamp-1">"{motto.trim() || '꺾이지 않는 텐션으로 완독!'}"</span>
                      </div>
                    </div>
                  </div>

                  {/* 아바타 코디 요약 태그 */}
                  <div className="mt-2.5 bg-stone-100 border border-stone-300 rounded-lg px-2.5 py-1 text-[10px] font-hand text-stone-700 truncate">
                    ✏️ 코디 조합: {avatarRecipeText}
                  </div>

                  {/* 하단 직인 */}
                  <div className="mt-3 pt-2 border-t border-stone-800 flex justify-between items-center">
                    <div className="text-[10px] font-hwp-body text-stone-600">
                      개학일: <b>2026. 12. 19. (토)</b><br />
                      위 사람은 본교 어른이임을 증명함.
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-hwp-body font-bold text-xs text-stone-900">플래닛독서학교장</span>
                      <div className="stamp-seal w-9 h-9 text-[9px] flex items-center justify-center leading-tight text-center p-0.5">
                        플래닛<br />학교장인
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* [모드 2] 도서대출카드 */}
              {cardMode === 'library' && (
                <div>
                  <div className="text-center border-b-2 border-stone-800 pb-2 mb-2">
                    <div className="text-[10px] tracking-widest text-stone-500">PLANET LIBRARY BORROWER'S CARD</div>
                    <div className="font-hwp-title font-black text-base text-stone-900">도 서 대 출 카 드</div>
                  </div>

                  <div className="border-2 border-stone-800 rounded-lg overflow-hidden text-[11px] font-hwp-body mb-2">
                    <div className="grid grid-cols-12 border-b border-stone-800">
                      <div className="col-span-4 bg-stone-200 font-bold p-1.5 border-r border-stone-800">청구기호</div>
                      <div className="col-span-8 p-1.5 font-mono text-[10px]">{libraryCallNumber}</div>
                    </div>
                    <div className="grid grid-cols-12">
                      <div className="col-span-4 bg-stone-200 font-bold p-1.5 border-r border-stone-800">기증 학우</div>
                      <div className="col-span-8 p-1.5 font-bold">{name.trim() || '김플래닛'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 border-2 border-stone-800 rounded-lg overflow-hidden bg-white">
                    <div className="col-span-7 border-r border-stone-800 p-2 text-[10px] font-hwp-body space-y-1">
                      <div className="font-bold border-b border-stone-300 pb-0.5 text-center">대출일 / 반납예정일</div>
                      <div className="text-red-700 font-mono font-bold tracking-tighter">💮 2026. 12. 19. 개학일</div>
                      <div className="text-stone-500">💮 2026. 12. 19. 수학여행 밤</div>
                      <div className="text-amber-800 font-hand text-xs">"{motto.trim() || '꺾이지 않는 텐션으로 완독!'}"</div>
                    </div>
                    <div
                      style={{ backgroundColor: photoBg }}
                      className="col-span-5 flex flex-col items-center justify-center p-1 sketch-paper"
                    >
                      <svg viewBox="0 0 200 220" className="w-16 h-20" filter="url(#pencil-sketch)">
                        {/* 1. 뒷머리 */}
                        {selectedIndices[1] !== null && STAGES[1] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[1].items[selectedIndices[1]]?.backSvg || '' }} />
                        )}
                        {/* 2. 의상 */}
                        {selectedIndices[6] !== null && STAGES[6] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[6].items[selectedIndices[6]]?.svg || '' }} />
                        )}
                        {/* 3. 얼굴형 */}
                        {selectedIndices[0] !== null && STAGES[0] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[0].items[selectedIndices[0]]?.svg || '' }} />
                        )}
                        {/* 4. 볼터치 */}
                        {selectedIndices[3] !== null && STAGES[3] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[3].items[selectedIndices[3]]?.svg || '' }} />
                        )}
                        {/* 5. 눈 */}
                        {selectedIndices[2] !== null && STAGES[2] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[2].items[selectedIndices[2]]?.svg || '' }} />
                        )}
                        {/* 6. 입 */}
                        {selectedIndices[4] !== null && STAGES[4] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[4].items[selectedIndices[4]]?.svg || '' }} />
                        )}
                        {/* 7. 앞머리 */}
                        {selectedIndices[1] !== null && STAGES[1] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[1].items[selectedIndices[1]]?.frontSvg || '' }} />
                        )}
                        {/* 8. 안경/헤어악세사리 */}
                        {selectedIndices[5] !== null && STAGES[5] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[5].items[selectedIndices[5]]?.svg || '' }} />
                        )}
                        {/* 9. 소품 (맨 앞으로 표시) */}
                        {selectedIndices[7] !== null && STAGES[7] && (
                          <g dangerouslySetInnerHTML={{ __html: STAGES[7].items[selectedIndices[7]]?.svg || '' }} />
                        )}
                      </svg>
                      <span className="text-[9px] font-hand text-stone-500">기증자 크로키</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 이미지 저장 버튼 */}
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadCard}
              className="w-full mt-3 bg-stone-800 hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl border-2 border-black shadow flex items-center justify-center gap-2 text-xs sm:text-sm transition cursor-pointer"
            >
              <span>{isDownloading ? '저장 중...' : '📸 완성된 학생증/대출증 PNG 저장하기'}</span>
            </button>
          </div>

          {/* 우측: 절취선 참가 신청서 입력 폼 (7칸) */}
          <div className="md:col-span-7 w-full bg-white/80 border-2 border-stone-800 rounded-xl p-4 sm:p-5">
            <div className="text-center border-b-2 border-dashed border-stone-400 pb-2 mb-4">
              <span className="text-xs font-mono text-stone-500">------------ ✂️ (절 취 선) ✂️ ------------</span>
              <h3 className="font-bold text-sm sm:text-base text-black mt-1">
                2026년도 플래닛 연말파티 「플래닛의 새학기」 참가 신청서
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm font-hwp-body">
              
              {/* 스팸 차단 허니팟 필드 (보이지 않음) */}
              <input
                type="text"
                name="hp_check"
                value={hpCheck}
                onChange={(e) => setHpCheck(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 성함 */}
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    성함 (이름) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="예: 김플래닛"
                    className="w-full border-2 border-stone-800 rounded-lg bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600 font-sans text-sm"
                  />
                </div>

                {/* 휴대폰 번호 */}
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    휴대폰 번호 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="010-0000-0000"
                    className="w-full border-2 border-stone-800 rounded-lg bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600 font-sans text-sm"
                  />
                </div>
              </div>

              {/* 참석 세션 선택 */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  참석 세션 선택 <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 font-sans">
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="session"
                      value="both"
                      checked={sessionType === 'both'}
                      onChange={() => setSessionType('both')}
                      className="peer sr-only"
                    />
                    <div className="border-2 border-stone-300 peer-checked:border-amber-800 peer-checked:bg-amber-50 p-2 text-center rounded-xl transition">
                      <div className="font-bold text-xs text-stone-900">1부 + 2부 전체</div>
                      <div className="text-[10px] text-stone-600">새학기 & 수학여행</div>
                      <div className="font-black text-xs text-red-800 mt-1">60,000원</div>
                    </div>
                  </label>

                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="session"
                      value="session1"
                      checked={sessionType === 'session1'}
                      onChange={() => setSessionType('session1')}
                      className="peer sr-only"
                    />
                    <div className="border-2 border-stone-300 peer-checked:border-amber-800 peer-checked:bg-amber-50 p-2 text-center rounded-xl transition">
                      <div className="font-bold text-xs text-stone-900">1부만 참석</div>
                      <div className="text-[10px] text-stone-600">새학기 본파티(낮)</div>
                      <div className="font-black text-xs text-red-800 mt-1">40,000원</div>
                    </div>
                  </label>

                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="session"
                      value="session2"
                      checked={sessionType === 'session2'}
                      onChange={() => setSessionType('session2')}
                      className="peer sr-only"
                    />
                    <div className="border-2 border-stone-300 peer-checked:border-amber-800 peer-checked:bg-amber-50 p-2 text-center rounded-xl transition">
                      <div className="font-bold text-xs text-stone-900">2부만 참석</div>
                      <div className="text-[10px] text-stone-600">수학여행 (예약금)</div>
                      <div className="font-black text-xs text-red-800 mt-1">20,000원</div>
                    </div>
                  </label>
                </div>
              </div>


              {/* 새학기 한마디 */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  학생증에 적힐 새학기 한마디 <span className="text-stone-500 font-normal">(선택)</span>
                </label>
                <input
                  type="text"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  placeholder="예: 꺾이지 않는 텐션으로 완독!"
                  className="w-full border-2 border-stone-800 rounded-lg bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600 font-sans text-sm"
                />
              </div>

              {/* 운영진 메모 */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  운영진에게 남기는 메모 / 건의사항 <span className="text-stone-500 font-normal">(선택)</span>
                </label>
                <textarea
                  rows={2}
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="못 드시는 음식(알레르기)이나 준비위원회에 전하고 싶은 다정한 말을 적어주세요."
                  className="w-full border-2 border-stone-800 rounded-lg bg-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-600 font-sans text-xs"
                />
              </div>

              {/* 개인정보 동의 */}
              <div className="pt-1">
                <label className="flex items-center space-x-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    className="rounded border-stone-400 text-stone-800 focus:ring-stone-600"
                  />
                  <span>[필수] 연말모임 안내 및 학생증 제작을 위한 개인정보 수집에 동의합니다.</span>
                </label>
              </div>

              {/* 에러 메시지 */}
              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-300 text-red-800 text-xs flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-stone-900 hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl border-2 border-black shadow-md transition text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>참가 신청서를 등록하는 중입니다...</span>
                  </>
                ) : (
                  <span>✂️ 절취선 뜯어서 가정통신문 참가 신청서 제출하기</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ======================================================= */}
        {/* 4. 제출 완료 결과 카드 (참가 접수 완료 + 계좌 안내) */}
        {/* ======================================================= */}
        {submittedData && (
          <div className="mt-6 bg-[#fffdf9] text-stone-900 border-3 border-stone-800 p-5 sm:p-6 rounded-2xl shadow-2xl relative animate-fadeIn">
            <div className="border-b-2 border-dashed border-stone-300 pb-3 mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <div>
                  <h4 className="font-black text-base sm:text-lg text-emerald-800">2026 플래닛 새학기 참가 접수가 완료되었습니다!</h4>
                  <p className="text-xs text-stone-600 font-hwp-body">운영진 참가자 명부 및 학생증 조판 대기열에 실시간으로 정상 등록되었습니다.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-hwp-body">
              {/* 내 접수 정보 */}
              <div className="bg-stone-50 border border-stone-300 rounded-xl p-3.5 space-y-1.5">
                <div className="font-bold text-stone-700 border-b border-stone-200 pb-1 mb-1">📋 내 접수 정보</div>
                <div><b className="text-stone-500">학우 성함:</b> <span className="font-bold text-stone-900">{submittedData.name}</span></div>
                <div><b className="text-stone-500">신청 세션:</b> <span className="font-bold text-amber-900">{submittedData.session}</span></div>
                <div><b className="text-stone-500">발급 학번:</b> <span className="font-mono text-red-700 font-bold">{submittedData.studentNumber}</span></div>
              </div>

              {/* 회비 입금 안내 */}
              <div className="bg-amber-50/80 border-2 border-amber-800/40 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center border-b border-amber-200 pb-1">
                  <span className="font-bold text-amber-950">🏦 참가 회비 입금 안내</span>
                  <span className="font-black text-sm text-red-700">{submittedData.feeText}</span>
                </div>
                <p className="text-[11px] text-stone-700 leading-relaxed">
                  원활한 행사 대관 및 기념품(학생증/웰컴키트) 준비를 위해 아래 계좌로 입금해 주시면 입금 확인이 완료됩니다.
                </p>
                <div className="bg-white border border-amber-300 rounded-lg p-2.5 flex items-center justify-between gap-2">
                  <div className="font-mono text-xs text-stone-900">
                    <b>하나은행</b> 439-911050-56507 <span className="text-stone-500">(한지수)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className={`px-2.5 py-1 text-white rounded-md text-[11px] font-bold shrink-0 transition cursor-pointer ${
                      copiedAccount ? 'bg-emerald-700' : 'bg-amber-700 hover:bg-amber-800'
                    }`}
                  >
                    {copiedAccount ? '✓ 복사완료' : '계좌 복사'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] text-stone-500">
                💡 왼쪽 화면에서 <b>[완성된 학생증/대출증 PNG 저장하기]</b>를 눌러 소장하실 수 있습니다.
              </div>
              <button
                type="button"
                onClick={handleDownloadCard}
                className="bg-stone-800 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>📸 내 학생증 이미지 즉시 다운로드</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PencilSketchRsvp;
