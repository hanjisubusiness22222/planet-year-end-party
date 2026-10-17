import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Download, RefreshCw, Shuffle, Check, 
  Sparkles, BookOpen, User, Copy, CheckCircle2, QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';
import planetLogo from '../assets/planet-logo.png';

import { FEMALE_PARTS, MALE_PARTS, STEP_KEYS, StepKey } from './avatarParts';

interface StudentCardStudioProps {
  onBack: () => void;
}

export const StudentCardStudio: React.FC<StudentCardStudioProps> = ({ onBack }) => {
  // 성별 상태: 'female' (여학생) | 'male' (남학생)
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const activeParts = gender === 'female' ? FEMALE_PARTS : MALE_PARTS;

  // 공책 게임 상태
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // 0..4
  const [activeSlot, setActiveSlot] = useState(0);             // 0..4
  const [selectedResults, setSelectedResults] = useState<(number | null)[]>([0, 0, 0, 0, 0]); // 기본 1번 세트 세팅
  const [isPlaying, setIsPlaying] = useState(true);

  // 학생증 인적사항 4대 항목
  const [name, setName] = useState('김플래닛');
  const [seasonGroup, setSeasonGroup] = useState<'스프링토' | '미들썸머' | '어텀' | '윈터블'>('윈터블');
  const [grade, setGrade] = useState<'1학년' | '2학년' | '3학년' | '4학년'>('2학년');
  const [studentNumber, setStudentNumber] = useState('2026-PLANET-2084');

  // 학년 표시 포맷터 (1학년: 신규 / 2학년: 기존 / 3학년: 진행 / 4학년: 준비)
  const getGradeDisplay = (g: string) => {
    switch (g) {
      case '1학년': return '1학년 (신규)';
      case '2학년': return '2학년 (기존)';
      case '3학년': return '3학년 (진행)';
      case '4학년': return '4학년 (준비)';
      default: return g;
    }
  };

  // 학번 랜덤 생성
  const handleRandomStudentNumber = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setStudentNumber(`2026-PLANET-${randomDigits}`);
  };

  // 이미지 다운로드
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // 기존 등록 명단에서 불러오기
  const [registeredList, setRegisteredList] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('planet_rsvps');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRegisteredList(parsed);
        }
      }
    } catch {}
  }, []);

  // 볼펜 왕복 타이머 (85ms)
  useEffect(() => {
    if (!isPlaying || currentStepIndex >= STEP_KEYS.length) return;

    let direction = 1;
    const interval = setInterval(() => {
      setActiveSlot(prev => {
        let next = prev + direction;
        if (next >= 4) {
          next = 4;
          direction = -1;
        } else if (next <= 0) {
          next = 0;
          direction = 1;
        }
        return next;
      });
    }, 85);

    return () => clearInterval(interval);
  }, [isPlaying, currentStepIndex]);

  // 스페이스바 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
          return;
        }
        e.preventDefault();
        handleStop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // 멈춰! 핸들러
  const handleStop = () => {
    if (currentStepIndex >= STEP_KEYS.length) return;

    const chosen = activeSlot;
    const updated = [...selectedResults];
    updated[currentStepIndex] = chosen;
    setSelectedResults(updated);

    confetti({
      particleCount: 15,
      spread: 40,
      origin: { y: 0.65 }
    });

    const nextStep = currentStepIndex + 1;
    setCurrentStepIndex(nextStep);

    if (nextStep >= STEP_KEYS.length) {
      setIsPlaying(false);
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  // 선도부한테 빌어서 재촬영 (초기화)
  const handleReset = () => {
    setSelectedResults([0, null, null, null, null]);
    setCurrentStepIndex(0);
    setActiveSlot(0);
    setIsPlaying(true);
  };

  // 1초 올랜덤 뽑기
  const handleQuickRandom = () => {
    const randoms = [
      Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 5)
    ];
    setSelectedResults(randoms);
    setCurrentStepIndex(5);
    setIsPlaying(false);
    confetti({ particleCount: 50, spread: 70 });
  };

  // 특정 부위 직접 수동 선택 (파츠 클릭)
  const handleDirectSelect = (stepIdx: number, optIdx: number) => {
    const updated = [...selectedResults];
    updated[stepIdx] = optIdx;
    setSelectedResults(updated);
  };

  // 아바타 코드 생성: {G}-{F}{i}-{H}{i}-{E}{i}-{M}{i}-{B}{i}
  const prefix = ['F', 'H', 'E', 'M', 'B'];
  const avatarCode = `${gender === 'female' ? 'F' : 'M'}-${selectedResults
    .map((r, i) => `${prefix[i]}${r !== null ? r + 1 : '1'}`)
    .join('-')}`;

  // 이미지 다운로드
  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `2026_플래닛_학생증_${name || '학우'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download card:', err);
      alert('학생증 저장 중 오류가 발생했습니다. 화면을 캡처해 주세요!');
    } finally {
      setIsDownloading(false);
    }
  };

  // 기존 명단 선택 시 자동 채우기
  const handleSelectRecord = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const found = registeredList.find(r => r.name === val || r.studentNumber === val);
    if (found) {
      setName(found.name || '');
      if (found.phone) {
        const cleaned = found.phone.replace(/[^0-9]/g, '');
        const last4 = cleaned.slice(-4) || '2084';
        setStudentNumber(`2026-PLANET-${last4}`);
      } else {
        const rand = Math.floor(1000 + Math.random() * 9000);
        setStudentNumber(`2026-PLANET-${rand}`);
      }
    }
  };

  const currentStepData = currentStepIndex < STEP_KEYS.length 
    ? activeParts[STEP_KEYS[currentStepIndex]] 
    : null;

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#1f1b18] font-sans py-4 sm:py-8 px-2.5 sm:px-6 pb-24">
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">

        {/* 상단 관리자 네비게이션 헤더 */}
        <header className="bg-white/95 border-2 border-[#1f1b18] rounded-xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#d8d3c7] bg-[#f8f6f0] hover:bg-[#ede8dc] text-xs font-serif text-[#1f1b18] transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-[#b82828]" />
              <span>관리자 대시보드로 돌아가기</span>
            </button>

            <div className="flex items-center space-x-2">
              <img src={planetLogo} alt="플래닛" className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded bg-white border border-[#e5e0d8] p-0.5 shadow-sm" />
              <div>
                <h1 className="font-serif text-sm sm:text-base font-bold text-[#1f1b18] flex items-center space-x-1.5">
                  <span>추억의 공책 게임 아바타 학생증 공작소</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#b82828] text-white">현장 발급</span>
                </h1>
                <p className="text-[10px] text-[#666] font-serif">5단계 '볼펜 멈춰!' 손그림 아바타 생성 및 고화질 네임택 즉시 인쇄</p>
              </div>
            </div>
          </div>

          {/* 명단에서 원클릭 불러오기 (관리자 편의 기능) */}
          {registeredList.length > 0 && (
            <div className="flex items-center space-x-1.5 text-xs font-serif">
              <span className="text-[#666] whitespace-nowrap">📋 참가자 불러오기:</span>
              <select 
                onChange={handleSelectRecord}
                className="text-xs font-serif border border-[#ccc] rounded px-2 py-1 bg-white focus:outline-none focus:border-[#b82828]"
              >
                <option value="">명단에서 선택...</option>
                {registeredList.map((r, i) => (
                  <option key={i} value={r.name}>{r.name} ({r.session})</option>
                ))}
              </select>
            </div>
          )}
        </header>

        {/* 메인 2단 작업 그리드: [좌: 공책 볼펜 멈춰 게임판] / [우: 실시간 발급 카드 & 편집] */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">

          {/* ======================================================== */}
          {/* [좌측 7컬럼] 추억의 스프링 공책 "볼펜 멈춰!" 게임판           */}
          {/* ======================================================== */}
          <section className="lg:col-span-7 bg-[#FAF8F2] border-2 border-[#1f1b18] rounded-xl shadow-xl overflow-hidden relative">
            
            {/* 스프링 바인더 철 장식 */}
            <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-8 bg-[#e8e4dc] border-r-2 border-[#1f1b18] flex flex-col justify-around py-4 items-center z-10 select-none">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-3 h-5 sm:w-4 sm:h-6 bg-[#222] rounded-full border border-gray-400"></div>
              ))}
            </div>

            <div className="pl-8 sm:pl-11 p-4 sm:p-6 min-h-[560px] flex flex-col justify-between"
                 style={{
                   backgroundColor: '#FAF8F2',
                   backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(37, 99, 235, 0.12) 28px)',
                   backgroundSize: '100% 28px'
                 }}>
              
              <div>
                {/* 과목 및 진행도 */}
                <div className="flex items-center justify-between border-b-2 border-[#b82828] pb-2 mb-2.5">
                  <div className="font-serif text-base sm:text-lg font-bold text-[#b82828] flex items-center space-x-2">
                    <span>과목: 독서학교 학생증 사진촬영</span>
                    <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-[#b82828] text-white">제 1 교시</span>
                  </div>
                  <div className="font-serif text-xs sm:text-sm text-[#444]">
                    진행도: <strong className="text-[#2563EB] text-base">{Math.min(currentStepIndex + 1, 5)}/5단계</strong>
                  </div>
                </div>

                {/* 남학생 / 여학생 선택 탭 */}
                <div className="flex items-center justify-between bg-white/90 border border-[#1f1b18] rounded-xl p-1.5 mb-3 shadow-xs">
                  <div className="flex items-center space-x-1 text-xs font-serif font-bold text-[#1f1b18] pl-1.5">
                    <span>학생 성별 선택:</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all flex items-center space-x-1 ${
                        gender === 'female'
                          ? 'bg-[#b82828] text-white shadow-xs'
                          : 'bg-[#f4f1ea] text-[#666] hover:text-[#111]'
                      }`}
                    >
                      <span>👧 여학생</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all flex items-center space-x-1 ${
                        gender === 'male'
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'bg-[#f4f1ea] text-[#666] hover:text-[#111]'
                      }`}
                    >
                      <span>👦 남학생</span>
                    </button>
                  </div>
                </div>

                {/* 현재 카테고리 알림 */}
                <div className="bg-white/95 border border-[#1f1b18]/30 rounded-lg p-2.5 mb-3 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#777] font-sans">현재 뽑는 부위:</span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1f1b18]">
                      {currentStepIndex < 5 
                        ? `${currentStepIndex + 1}단계 <${currentStepData?.category}>`
                        : '🎉 5단계 완성! 아바타가 모두 조립되었습니다!'}
                    </h3>
                    <p className="text-[11px] text-[#666] font-serif">
                      {currentStepData?.subTitle || '마음에 안 들면 다시 뽑거나 직접 클릭해 수정하세요.'}
                    </p>
                  </div>
                  {isPlaying && currentStepIndex < 5 && (
                    <div className="text-[11px] font-sans text-right text-[#555]">
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping mr-1"></span>
                      <span>볼펜 질주 중 (85ms)</span>
                    </div>
                  )}
                </div>

                {/* 5개 파츠 카드 슬롯 그리드 (고화질 일러스트 썸네일) */}
                {currentStepData && (
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-3">
                    {currentStepData.options.map((opt, idx) => {
                      const isActive = activeSlot === idx && isPlaying;
                      return (
                        <div 
                          key={idx}
                          onClick={() => handleDirectSelect(currentStepIndex, idx)}
                          className={`cursor-pointer bg-white/95 border-2 rounded-lg p-1.5 text-center transition-all duration-75 relative hover:border-[#1f1b18] ${
                            isActive 
                              ? 'border-[#DC2626] bg-yellow-100/90 shadow-md scale-105' 
                              : 'border-dashed border-[#888]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-serif font-bold text-[#555] mb-0.5 px-0.5">
                            <span>{['①', '②', '③', '④', '⑤'][idx]}</span>
                            <span className="text-[8px] font-mono px-1 rounded bg-[#eee] text-[#555]">{opt.badge}</span>
                          </div>
                          
                          {/* 고화질 SVG 썸네일 */}
                          <div className="w-full aspect-square flex items-center justify-center bg-[#FAF8F5] rounded border border-gray-200 overflow-hidden">
                            <svg 
                              viewBox="0 0 200 200" 
                              className="w-full h-full"
                              dangerouslySetInnerHTML={{ __html: opt.svg }}
                            />
                          </div>

                          <div className="text-[10px] font-serif font-bold text-[#1f1b18] truncate mt-1">
                            {opt.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="text-center py-1">
                  <div className="inline-flex items-center space-x-1.5 bg-yellow-100/90 px-3 py-1 rounded-full border border-yellow-300 text-[11px] font-serif text-yellow-900">
                    <span>🖋️ 모나미 볼펜이 눈 깜짝할 새 왔다 갔다 하는 중! 타이밍을 맞춰보세요. (클릭 선택도 가능)</span>
                  </div>
                </div>
              </div>

              {/* 공책 하단 조작 버튼 */}
              <div className="pt-4 border-t-2 border-[#1f1b18]/20 space-y-2.5">
                <button
                  type="button"
                  onClick={handleStop}
                  disabled={currentStepIndex >= 5}
                  className={`w-full py-3.5 sm:py-4 rounded-xl text-white font-serif font-black text-lg sm:text-2xl shadow-lg border-2 active:scale-98 transition-all flex items-center justify-center space-x-2 ${
                    currentStepIndex < 5
                      ? 'bg-[#DC2626] hover:bg-[#B91C1C] border-[#7F1D1D]'
                      : 'bg-[#16A34A] border-[#15803D]'
                  }`}
                >
                  {currentStepIndex < 5 ? (
                    <span>✋ 멈춰! (클릭 또는 스페이스바)</span>
                  ) : (
                    <span>✨ 아바타 조립 완료! (다시 뽑기 가능)</span>
                  )}
                </button>

                <div className="flex items-center justify-between gap-2 text-xs font-serif">
                  <button 
                    type="button"
                    onClick={handleQuickRandom}
                    className="px-3 py-1.5 rounded-lg border border-[#888] bg-white hover:bg-[#ede8dc] text-[#333] flex items-center space-x-1 transition-colors"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-[#2e5238]" />
                    <span>🎲 운명에 맡기기 (1초 랜덤)</span>
                  </button>

                  <button 
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-lg border border-[#dc2626]/40 bg-red-50 hover:bg-red-100 text-[#b91c1c] font-bold flex items-center space-x-1 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>선도부한테 빌어서 재촬영하기 (초기화)</span>
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* ======================================================== */}
          {/* [우측 5컬럼] 실시간 공식 학생증(STUDENT PASS) & 정보 편집 */}
          {/* ======================================================== */}
          <section className="lg:col-span-5 space-y-4">
            
            {/* 캡처 대상: 2026 플래닛 학생증 실물 카드 */}
            <div 
              ref={cardRef}
              className="bg-[#FFFDF9] border-2 border-[#1f1b18] rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 relative overflow-hidden"
              style={{
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)'
              }}
            >
              {/* 상단 헤더: PLANET READING SCHOOL ★ 2026 STUDENT PASS */}
              <div className="bg-[#1f1b18] text-[#F4F1EA] py-2 px-3 rounded-lg flex items-center justify-between tracking-wide shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b82828] inline-block animate-pulse"></span>
                  <span className="font-serif font-black text-xs sm:text-sm tracking-wider">
                    PLANET READING SCHOOL
                  </span>
                </div>
                <div className="font-mono font-bold text-xs text-[#EAB308] flex items-center space-x-1">
                  <span>★</span>
                  <span className="text-[#F4F1EA]">2026 STUDENT PASS</span>
                </div>
              </div>

              {/* 본문: [공책 볼펜 스톱 게임 아바타] + [인적사항: 성명/소속/학년/학번] */}
              <div className="grid grid-cols-12 gap-3.5 items-center">
                
                {/* 좌측 증명사진 프레임 (5겹 SVG 레이어 스택: 몸통 -> 얼굴형 -> 눈 -> 입 -> 헤어스타일 순서로 완벽 결합) */}
                <div className="col-span-5">
                  <div 
                    className="aspect-[3/4] w-full border-2 border-[#1f1b18] rounded-xl relative overflow-hidden flex items-center justify-center shadow-md"
                    style={{
                      backgroundColor: '#FAF8F5',
                      backgroundImage: 'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)',
                      backgroundSize: '12px 12px'
                    }}
                  >
                    {/* 레이어 0: 몸통 & 의상 (가장 아래) */}
                    {selectedResults[4] !== null && (
                      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full"
                           dangerouslySetInnerHTML={{ __html: activeParts.body.options[selectedResults[4]!].svg }} />
                    )}

                    {/* 레이어 1: 얼굴형 & 피부톤 & 볼터치 */}
                    {selectedResults[0] !== null && (
                      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full"
                           dangerouslySetInnerHTML={{ __html: activeParts.face.options[selectedResults[0]!].svg }} />
                    )}

                    {/* 레이어 2: 눈 & 눈썹 */}
                    {selectedResults[2] !== null && (
                      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full"
                           dangerouslySetInnerHTML={{ __html: activeParts.eyes.options[selectedResults[2]!].svg }} />
                    )}

                    {/* 레이어 3: 코 & 입 */}
                    {selectedResults[3] !== null && (
                      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full"
                           dangerouslySetInnerHTML={{ __html: activeParts.mouth.options[selectedResults[3]!].svg }} />
                    )}

                    {/* 레이어 4: 헤어스타일 & 모자/핀 (가장 위에서 얼굴을 덮음) */}
                    {selectedResults[1] !== null && (
                      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full"
                           dangerouslySetInnerHTML={{ __html: activeParts.hair.options[selectedResults[1]!].svg }} />
                    )}
                  </div>
                </div>

                {/* 우측 인적사항 4대 항목 */}
                <div className="col-span-7 space-y-2 font-serif text-[#1f1b18]">
                  <div className="space-y-1.5 border-l-2 border-[#1f1b18]/20 pl-3">
                    <div className="flex items-baseline text-xs sm:text-sm">
                      <span className="font-bold text-[#666] w-14 shrink-0 tracking-wider">성 명 :</span>
                      <span className="font-extrabold text-base sm:text-lg text-[#111]">{name || '김플래닛'}</span>
                    </div>
                    <div className="flex items-baseline text-xs sm:text-sm">
                      <span className="font-bold text-[#666] w-14 shrink-0 tracking-wider">소 속 :</span>
                      <span className="font-bold text-sm sm:text-base text-[#2e5238]">{seasonGroup}반</span>
                    </div>
                    <div className="flex items-baseline text-xs sm:text-sm">
                      <span className="font-bold text-[#666] w-14 shrink-0 tracking-wider">학 년 :</span>
                      <span className="font-bold text-xs sm:text-sm text-[#b82828]">{getGradeDisplay(grade)}</span>
                    </div>
                    <div className="flex items-baseline text-xs sm:text-sm">
                      <span className="font-bold text-[#666] w-14 shrink-0 tracking-wider">학 번 :</span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-[#111]">{studentNumber || '2026-PLANET-2084'}</span>
                    </div>
                  </div>

                  {/* 아바타 조합 코드 (보조 표시) */}
                  <div className="pl-3 pt-1 text-[10px] font-mono text-[#888]">
                    CODE: <span className="text-[#2563EB] font-bold">{avatarCode}</span>
                  </div>
                </div>

              </div>

              {/* 카드 하단: [도장: 플래닛 독서학교장 직인 🔴] + 바코드 그래픽 */}
              <div className="pt-3 border-t-2 border-[#1f1b18]/20 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                {/* 붉은색 레트로 직인 도장 */}
                <div className="border-2 border-[#b82828] bg-red-50/70 text-[#b82828] text-xs px-2.5 py-1 rounded font-serif font-black tracking-wider flex items-center space-x-1.5 rotate-[-2deg] shadow-xs">
                  <span>도장: 플래닛 독서학교장 직인</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b82828] inline-block"></span>
                </div>

                {/* 바코드 그래픽 */}
                <div className="flex flex-col items-center sm:items-end">
                  <svg className="h-6 w-44" viewBox="0 0 160 24" fill="#1f1b18">
                    <rect x="0" y="0" width="3" height="24" />
                    <rect x="5" y="0" width="1" height="24" />
                    <rect x="8" y="0" width="2" height="24" />
                    <rect x="13" y="0" width="4" height="24" />
                    <rect x="19" y="0" width="1" height="24" />
                    <rect x="22" y="0" width="3" height="24" />
                    <rect x="27" y="0" width="2" height="24" />
                    <rect x="32" y="0" width="1" height="24" />
                    <rect x="35" y="0" width="4" height="24" />
                    <rect x="42" y="0" width="2" height="24" />
                    <rect x="46" y="0" width="1" height="24" />
                    <rect x="50" y="0" width="3" height="24" />
                    <rect x="55" y="0" width="2" height="24" />
                    <rect x="60" y="0" width="4" height="24" />
                    <rect x="66" y="0" width="1" height="24" />
                    <rect x="70" y="0" width="2" height="24" />
                    <rect x="74" y="0" width="3" height="24" />
                    <rect x="80" y="0" width="1" height="24" />
                    <rect x="83" y="0" width="4" height="24" />
                    <rect x="90" y="0" width="2" height="24" />
                    <rect x="94" y="0" width="3" height="24" />
                    <rect x="99" y="0" width="1" height="24" />
                    <rect x="103" y="0" width="4" height="24" />
                    <rect x="110" y="0" width="2" height="24" />
                    <rect x="114" y="0" width="1" height="24" />
                    <rect x="118" y="0" width="3" height="24" />
                    <rect x="124" y="0" width="2" height="24" />
                    <rect x="128" y="0" width="4" height="24" />
                    <rect x="135" y="0" width="1" height="24" />
                    <rect x="138" y="0" width="3" height="24" />
                    <rect x="144" y="0" width="2" height="24" />
                    <rect x="148" y="0" width="1" height="24" />
                    <rect x="152" y="0" width="3" height="24" />
                    <rect x="157" y="0" width="3" height="24" />
                  </svg>
                  <span className="font-mono text-[9px] tracking-widest text-[#555] mt-0.5">
                    *{studentNumber || '2026-PLANET-2084'}*
                  </span>
                </div>
              </div>

            </div>

            {/* 다운로드 버튼 */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full py-2.5 rounded-lg bg-[#2e5238] hover:bg-[#23402c] text-white font-serif font-bold text-xs sm:text-sm shadow flex items-center justify-center space-x-1.5 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? '이미지 저장 중...' : '📸 내 학생증 이미지 저장하기 (PNG)'}</span>
            </button>

            {/* 인적사항 실시간 편집 폼 (관리자 수정용) */}
            <div className="bg-white border-2 border-[#1f1b18] rounded-xl p-4 shadow-sm space-y-3 font-serif">
              <div className="border-b border-[#1f1b18]/20 pb-1.5">
                <h4 className="font-bold text-xs sm:text-sm text-[#1f1b18]">
                  ✍️ 학생증 인적사항 실시간 편집
                </h4>
                <p className="text-[10px] text-[#777]">수정 시 위의 학생증 카드에 즉시 반영됩니다.</p>
              </div>

              {/* 1. 성명 */}
              <div>
                <label className="block text-[11px] font-bold text-[#1f1b18] mb-0.5">1. 성명 (이름)</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder="실명 또는 닉네임"
                  className="w-full text-xs p-2 border border-[#ccc] rounded focus:border-[#b82828] focus:outline-none"
                />
              </div>

              {/* 학생 성별 선택 */}
              <div>
                <label className="block text-[11px] font-bold text-[#1f1b18] mb-1">학생 성별 (아바타 스타일)</label>
                <div className="grid grid-cols-2 gap-2 text-center text-xs font-serif">
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`p-1.5 rounded border transition-all flex items-center justify-center space-x-1.5 ${
                      gender === 'female'
                        ? 'border-[#b82828] bg-[#b82828] text-white font-bold shadow-xs'
                        : 'border-[#ccc] bg-white text-[#555] hover:bg-gray-50'
                    }`}
                  >
                    <span>👧 여학생 스타일</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`p-1.5 rounded border transition-all flex items-center justify-center space-x-1.5 ${
                      gender === 'male'
                        ? 'border-[#2563EB] bg-[#2563EB] text-white font-bold shadow-xs'
                        : 'border-[#ccc] bg-white text-[#555] hover:bg-gray-50'
                    }`}
                  >
                    <span>👦 남학생 스타일</span>
                  </button>
                </div>
              </div>

              {/* 2. 소속반 (스프링토/미들썸머/어텀/윈터블) */}
              <div>
                <label className="block text-[11px] font-bold text-[#1f1b18] mb-1">2. 소속반 (계절 모임반)</label>
                <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-serif">
                  {(['스프링토', '미들썸머', '어텀', '윈터블'] as const).map(grp => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setSeasonGroup(grp)}
                      className={`p-1.5 rounded border transition-all ${
                        seasonGroup === grp 
                          ? 'border-[#2e5238] bg-[#2e5238] text-white font-bold shadow-xs' 
                          : 'border-[#ccc] bg-white text-[#555] hover:bg-gray-50'
                      }`}
                    >
                      {grp}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. 학년 (1학년:신규 / 2학년:기존 / 3학년:진행 / 4학년:준비) */}
              <div>
                <label className="block text-[11px] font-bold text-[#1f1b18] mb-1">3. 학년 (플래닛 롤)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center text-[11px] font-serif">
                  {(['1학년', '2학년', '3학년', '4학년'] as const).map(grd => (
                    <button
                      key={grd}
                      type="button"
                      onClick={() => setGrade(grd)}
                      className={`p-1.5 rounded border transition-all ${
                        grade === grd 
                          ? 'border-[#b82828] bg-[#b82828] text-white font-bold shadow-xs' 
                          : 'border-[#ccc] bg-white text-[#555] hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-bold">{grd}</div>
                      <div className="text-[9px] opacity-80">
                        {grd === '1학년' ? '신규' : grd === '2학년' ? '기존' : grd === '3학년' ? '진행' : '준비'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. 학번 */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[11px] font-bold text-[#1f1b18]">4. 학번 (학생증 고유번호)</label>
                  <button
                    type="button"
                    onClick={handleRandomStudentNumber}
                    className="text-[10px] text-[#2563EB] hover:underline flex items-center space-x-1"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>랜덤 생성</span>
                  </button>
                </div>
                <input 
                  type="text" 
                  value={studentNumber} 
                  onChange={e => setStudentNumber(e.target.value)}
                  placeholder="2026-PLANET-2084"
                  className="w-full text-xs p-2 border border-[#ccc] rounded font-mono focus:border-[#b82828] focus:outline-none"
                />
              </div>

            </div>

          </section>

        </div>

      </div>
    </div>
  );
};
