import React, { useState, useEffect } from 'react';
import { 
  Bell, BellOff, Calendar, Clock, MapPin, 
  Sparkles, CheckCircle2, X, Send, Key, 
  HelpCircle, ChevronRight, BookOpen, UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EVENT_CONFIG } from '../constants/eventConfig';
import { sanitizeText, validatePhone, validateEmail } from '../utils/validation';
import planetLogo from '../assets/planet-logo.png';

interface TeaserPageProps {
  onExploreFullPage?: () => void;
  onGoToAdmin?: () => void;
}

export const TeaserPage: React.FC<TeaserPageProps> = ({ onExploreFullPage, onGoToAdmin }) => {
  const [isOpened, setIsOpened] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [contactInput, setContactInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [hpCheck, setHpCheck] = useState(''); // 허니팟 봇 차단

  // 음향 효과 (학교 종소리 차임벨)
  const [isMuted, setIsMuted] = useState(false);

  // D-Day 카운트다운 계산
  useEffect(() => {
    const targetDate = new Date(EVENT_CONFIG.targetDateTime).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // 학교 종소리 사운드 (Web Audio API 차임벨)
  const playChimeSequence = (notes: number[]) => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.38);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.38);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.38 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.38);
        osc.stop(ctx.currentTime + idx * 0.38 + 1.2);
      });
    } catch {
      // AudioContext unallowed before gesture
    }
  };

  // 칠판 펼칠 때 (시작 차임벨: 미 - 도 - 레 - 솔)
  const playOpenSound = () => {
    playChimeSequence([659.25, 523.25, 587.33, 392.00]); // E5, C5, D5, G4
  };

  // 칠판 접을 때 (마침 차임벨: 솔 - 레 - 미 - 도)
  const playCloseSound = () => {
    playChimeSequence([392.00, 587.33, 659.25, 523.25]); // G4, D5, E5, C5
  };

  // 헤더 종소리 버튼 클릭용
  const playSchoolBellSound = () => {
    playOpenSound();
  };

  // 칠판 지우개 또는 칠판 클릭 시 분필 가루 효과 & 오픈/접기 토글
  const handleChalkboardClick = () => {
    if (!isOpened) {
      // 칠판 펼칠 때: 미 - 도 - 레 - 솔
      playOpenSound();
      setIsOpened(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ffffff', '#f7f5ed', '#cfc5b2']
      });
    } else {
      // 칠판 접을 때: 솔 - 레 - 미 - 도
      playCloseSound();
      setIsOpened(false);
    }
  };

  // 사전 알림 등록
  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hpCheck.trim() !== '') return;

    const trimmed = contactInput.trim();
    if (!trimmed) {
      setValidationError('연락처 또는 이메일을 입력해 주세요.');
      return;
    }

    const isPhoneValid = validatePhone(trimmed);
    const isEmailValid = validateEmail(trimmed);

    if (!isPhoneValid && !isEmailValid) {
      setValidationError('올바른 휴대폰 번호(010-0000-0000) 또는 이메일 형식을 입력해 주세요.');
      return;
    }

    setValidationError('');
    setIsSubmitted(true);
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#b82828', '#2e5238', '#dfc27d']
    });

    setTimeout(() => {
      setIsNotifyModalOpen(false);
      setIsSubmitted(false);
      setContactInput('');
    }, 2200);
  };

  return (
    <div className="relative min-h-screen bg-[#fcfbf9] text-[#1f1b18] flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 overflow-x-hidden selection:bg-[#b82828]/20 selection:text-[#b82828]">
      
      {/* 상단 헤더: 학교 로고 & 종소리 버튼 */}
      <header className="w-full max-w-4xl flex items-center justify-between py-2.5 sm:py-3 border-b border-[#e8e4dc] z-20">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <img 
            src={planetLogo} 
            alt="플래닛 로고" 
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain rounded-xl bg-white border border-[#e5e0d8] p-0.5 shadow-sm flex-shrink-0" 
          />
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-serif text-xs sm:text-sm tracking-wide text-[#1f1b18] font-bold truncate">
                플래닛 독서학교
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono text-[#555] border border-[#d8d3c7] bg-[#f0ece1] whitespace-nowrap">
                since 2017
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#666] font-serif tracking-wide mt-0.5 truncate max-w-[190px] xs:max-w-xs sm:max-w-none">
              플래닛 여러분을 위한 설레는 새학기와 추억의 수학여행
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (isMuted) playSchoolBellSound();
            }}
            className="p-1.5 sm:p-2 rounded-lg border border-[#d8d3c7] hover:border-[#999] bg-white text-[#1f1b18] transition-all text-xs flex items-center space-x-1 sm:space-x-1.5 shadow-sm"
            title={isMuted ? "학교 종소리 켜기" : "음소거"}
          >
            {isMuted ? (
              <BellOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#888]" />
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#b82828]" />
                <span className="hidden sm:inline text-[11px] font-serif">종소리</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 중앙 메인: 컨셉제안1 실물 나무 액자 초록 칠판 (Chalkboard) */}
      <main className="w-full max-w-3xl my-auto py-4 sm:py-8 pb-20 sm:pb-8 flex flex-col items-center justify-center z-10 px-1 sm:px-0">
        
        {/* 상단 안내 태그 */}
        <div className="text-center mb-4 sm:mb-5 space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-[#d8d3c7] bg-[#f0ece1] text-[#333] text-[10px] sm:text-[11px] font-serif shadow-sm">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#b82828]" />
            <span>2026 연말모임 특별 개교 안내</span>
          </div>
          <div className="text-[11px] sm:text-xs font-serif text-[#666]">
            2026년 12월 19일 (토요일) 오전 10:00 개학식
          </div>
        </div>

        {/* 대형 나무 액자 칠판 컨테이너 (흰 배경 위에서 선명하게 돋보임) */}
        <div className="relative w-full max-w-2xl">
          
          <div 
            onClick={handleChalkboardClick}
            className="cursor-pointer relative chalkboard-frame rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl"
          >
            {/* 칠판 본체 (Chalkboard Surface) */}
            <div className="chalkboard-surface p-4 sm:p-10 text-center relative select-none">
              
              {/* 분필가루 얼룩 효과 */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.06),_transparent_70%)] pointer-events-none"></div>

              {/* 칠판 분필 메인 타이틀 (컨셉제안1 재현) */}
              <div className="space-y-3 sm:space-y-4 py-3 sm:py-6">
                <div className="inline-block border-b-2 border-dashed border-[#ffffff]/30 pb-2">
                  <h1 className="chalk-text font-serif text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#f7f5ed]">
                    〈 플래닛의 새학기 〉
                  </h1>
                </div>

                <div className="text-xs sm:text-sm font-serif text-[#dfc27d] tracking-widest font-bold">
                  2026 플래닛 연말모임 컨셉 제안
                </div>

                {/* 칠판 분필 감성 글귀 (컨셉제안3 재현) */}
                <div className="pt-2 text-xs sm:text-sm font-serif text-[#ede8dc] leading-relaxed max-w-lg mx-auto opacity-90">
                  <p>우리가 사랑한 플래닛,</p>
                  <p>무사히 거쳐온 하나의 큰 변화를 축하하고</p>
                  <p className="font-bold text-[#f7f5ed]">앞으로도 새학기처럼 신선하길 기원하며.</p>
                </div>
              </div>

              {/* 칠판 하단: 분필 받침대 & 지우개 인터랙션 힌트 */}
              <div className="mt-6 pt-4 border-t border-[#ffffff]/15 flex items-center justify-between text-xs font-serif text-[#a8b8ae]">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-2 bg-[#f7f5ed] rounded-sm inline-block shadow-sm"></span>
                  <span className="w-4 h-2 bg-[#dfc27d] rounded-sm inline-block shadow-sm rotate-12"></span>
                  <span className="text-[11px] text-[#cfc5b2]">하얀 분필</span>
                </div>

                <div className="text-[11px] text-[#f7f5ed] bg-[#16231b] px-3 py-1 rounded border border-[#ffffff]/30 animate-pulse">
                  {isOpened ? "▲ 칠판을 눌러 안내장 접기" : "▼ 칠판을 눌러 가정통신문 펼치기"}
                </div>
              </div>

            </div>
          </div>

          {/* 펼쳐졌을 때: 갱지 가정통신문 프리뷰 (초대장.png 서식 반영) */}
          <div 
            className={`transition-all duration-700 overflow-hidden ${
              isOpened 
                ? 'max-h-[1200px] opacity-100 mt-5' 
                : 'max-h-0 opacity-0'
            }`}
          >
            <div className="retro-gazette-paper rounded-lg p-3 sm:p-8 text-[#1f1b18] shadow-2xl border-2 border-[#1f1b18]/40 space-y-3.5 sm:space-y-5">
              
              {/* 가정통신문 헤더 박스 (초대장.png와 100% 동일한 격자 서식) */}
              <div className="border-2 border-[#1f1b18] grid grid-cols-4 sm:grid-cols-5 text-center text-xs font-serif">
                <div className="col-span-1 border-r-2 border-[#1f1b18] p-1.5 sm:p-3 flex items-center justify-center bg-white">
                  <img src={planetLogo} alt="PLANET" className="w-12 sm:w-20 h-auto object-contain" />
                </div>
                <div className="col-span-2 sm:col-span-3 border-r-2 border-[#1f1b18] p-1.5 sm:p-3 flex items-center justify-center">
                  <h2 className="font-serif text-sm sm:text-2xl font-black tracking-[0.15em] sm:tracking-[0.25em] text-[#111]">
                    가 정 통 신 문
                  </h2>
                </div>
                <div className="col-span-1 p-1 sm:p-2 flex flex-col justify-center text-[9px] sm:text-xs font-serif text-left leading-tight bg-white/50">
                  <div className="font-bold truncate">플래닛독서학교</div>
                  <div className="truncate">제2026-1호</div>
                  <div className="font-mono text-[8px] sm:text-xs">2026.12.19.</div>
                </div>
              </div>

              {/* 제목 서브 헤더 */}
              <div className="text-center py-1">
                <h3 className="font-serif text-sm sm:text-lg font-bold text-[#1f1b18]">
                  - 2026 플래닛 연말 파티 「플래닛의 새학기」 안내 -
                </h3>
              </div>

              {/* 본문 안내문 (초대장.png 원문 인용) */}
              <div className="font-serif text-xs sm:text-sm leading-relaxed text-[#2c2621] space-y-2 bg-white/60 p-3 sm:p-4 rounded border border-[#1f1b18]/20">
                <p>
                  <strong>플래닛 여러분, 안녕하십니까?</strong> 날씨가 부쩍 추워지고, 2026년의 마무리가 다가오고 있습니다.
                  책을 사랑하는 마음으로 플래닛 활동에 관심을 갖고 모임 발전에 협조해주시는 회원 여러분께 진심으로 감사드리며, 
                  2026년 플래닛 연말 모임을 아래와 같이 개최하고자 합니다.
                </p>
                <p>
                  잘 지나온 플래닛의 올해를 축하하며, 앞으로도 신선한 마음으로 만나길 바라는 자리니 
                  가능한 많은 분들이 꼭 참석해주시길 바랍니다.
                </p>
              </div>

              {/* 일시 / 프로그램 / 장소 / 대상 표 */}
              <div className="overflow-x-auto -mx-1 sm:mx-0">
                <table className="min-w-[420px] sm:min-w-full border-collapse border-2 border-[#1f1b18] text-xs font-serif text-center">
                  <thead>
                    <tr className="bg-[#e8e4d8] font-bold">
                      <th className="border border-[#1f1b18] p-2">일시</th>
                      <th className="border border-[#1f1b18] p-2">프로그램</th>
                      <th className="border border-[#1f1b18] p-2">장소</th>
                      <th className="border border-[#1f1b18] p-2">대상</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white/80">
                      <td className="border border-[#1f1b18] p-2 font-mono text-[11px]">
                        2026. 12. 19. (토)<br />10:00 ~ 17:00
                      </td>
                      <td className="border border-[#1f1b18] p-2 font-bold text-[#b82828]">
                        플래닛 연말모임<br />「플래닛의 새학기」
                      </td>
                      <td className="border border-[#1f1b18] p-2">공간나인 강남점</td>
                      <td className="border border-[#1f1b18] p-2">플래닛 멤버<br />누구나</td>
                    </tr>
                    <tr className="bg-white/80">
                      <td className="border border-[#1f1b18] p-2 font-mono text-[11px]">
                        2026. 12. 19. (토)<br />18:00 ~ LATE
                      </td>
                      <td className="border border-[#1f1b18] p-2 font-bold text-[#2e5238]">
                        연말모임 뒷풀이<br />「플래닛의 수학여행」
                      </td>
                      <td className="border border-[#1f1b18] p-2">미정</td>
                      <td className="border border-[#1f1b18] p-2">연말모임 참여자<br />中 희망자</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 주의사항 박스 */}
              <div className="border-2 border-[#1f1b18] p-3.5 bg-white/90 text-xs font-serif space-y-1.5">
                <div className="font-bold text-[#1f1b18] flex items-center space-x-1">
                  <span>■ 주의사항 ■</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[#333] text-[11px] leading-relaxed">
                  <li><strong>신청 오픈:</strong> 2026. 10. 26. (월)</li>
                  <li><strong>참여 비용:</strong> 1차 40,000원 / 2차 예약금 20,000원 (※ 추가비 발생 가능, 2부는 추가 금액 정산 예정)</li>
                  <li><strong>드레스 코드:</strong> 학생다운 프레피룩 복장 (※ 드레스 코드는 선택 참여)</li>
                  <li><strong>준비물:</strong> 학우에게 선물할 도서 1권 이상, 필기구, 꺾이지 않는 텐션과 열린 마음</li>
                </ol>
              </div>

              {/* 하단 서명 */}
              <div className="text-center pt-2 font-serif">
                <div className="text-xs font-mono text-[#666]">2026. 10. 26.</div>
                <div className="text-base font-bold text-[#111] mt-0.5">
                  연말모임준비위원회 일동
                </div>
              </div>

              {/* 바로가기 버튼 */}
              {onExploreFullPage && (
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                      onExploreFullPage();
                    }}
                    className="flex-1 py-3 px-4 rounded bg-[#b82828] hover:bg-[#961e1e] text-white font-bold text-xs sm:text-sm font-serif transition-all shadow flex items-center justify-center space-x-2"
                  >
                    <BookOpen className="w-4 h-4 text-white" />
                    <span>가정통신문 정식 열람하기</span>
                  </button>
                  <button
                    onClick={() => setIsNotifyModalOpen(true)}
                    className="py-3 px-4 rounded border-2 border-[#1f1b18] bg-white hover:bg-[#ede8dc] text-[#1f1b18] font-bold text-xs font-serif transition-all"
                  >
                    사전 알림 예약
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* 칠판 D-Day 분필 카운트다운 타이머 (깔끔한 화이트 카드) */}
        <div className="w-full max-w-xl mt-6 p-4 rounded-xl border border-[#e0dad0] bg-white text-center shadow-md">
          <div className="flex items-center justify-center space-x-1.5 text-[#1f1b18] text-xs font-serif mb-2.5">
            <Clock className="w-3.5 h-3.5 text-[#b82828]" />
            <span className="font-bold">개학식 D-Day 카운트다운 • 2026. 12. 19. (토) 오전 10:00</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[#1f1b18]">
            <div className="bg-[#f8f6f0] p-2.5 rounded-lg border border-[#e8e4dc]">
              <span className="font-mono text-xl sm:text-2xl font-black text-[#b82828] block">{timeLeft.days}</span>
              <span className="text-[10px] text-[#777] font-serif">일 (Days)</span>
            </div>
            <div className="bg-[#f8f6f0] p-2.5 rounded-lg border border-[#e8e4dc]">
              <span className="font-mono text-xl sm:text-2xl font-black text-[#b82828] block">{timeLeft.hours}</span>
              <span className="text-[10px] text-[#777] font-serif">시간 (Hours)</span>
            </div>
            <div className="bg-[#f8f6f0] p-2.5 rounded-lg border border-[#e8e4dc]">
              <span className="font-mono text-xl sm:text-2xl font-black text-[#b82828] block">{timeLeft.minutes}</span>
              <span className="text-[10px] text-[#777] font-serif">분 (Minutes)</span>
            </div>
            <div className="bg-[#f8f6f0] p-2.5 rounded-lg border border-[#e8e4dc]">
              <span className="font-mono text-xl sm:text-2xl font-black text-[#b82828] block">{timeLeft.seconds}</span>
              <span className="text-[10px] text-[#777] font-serif">초 (Seconds)</span>
            </div>
          </div>
        </div>

      </main>

      {/* 하단 푸터 */}
      <footer className="w-full max-w-4xl py-4 border-t border-[#e8e4dc] text-center text-[11px] text-[#777] font-serif space-y-1.5 z-20">
        <p>© 2026 플래닛 독서학교 (PLANET since 2017). All Rights Reserved.</p>
        <p className="text-[10px] text-[#999]">책과 대화로 따뜻해지는 2026 플래닛 연말모임</p>
        {onGoToAdmin && (
          <div className="pt-1">
            <button
              onClick={onGoToAdmin}
              className="text-[10px] text-[#888] hover:text-[#b82828] underline font-mono transition-colors"
            >
              [운영진 관리자 대시보드]
            </button>
          </div>
        )}
      </footer>

      {/* 사전 알림 등록 모달 */}
      {isNotifyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white border border-[#d8d3c7] rounded-xl p-6 text-[#1f1b18] shadow-2xl">
            <button
              onClick={() => setIsNotifyModalOpen(false)}
              className="absolute top-3.5 right-3.5 text-[#888] hover:text-[#111] p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5 mb-5">
              <div className="w-10 h-10 rounded-full border border-[#d8d3c7] bg-[#f8f6f0] mx-auto flex items-center justify-center text-[#b82828]">
                <Bell className="w-5 h-5 text-[#b82828]" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#1f1b18]">
                개학식 사전 알림 예약
              </h3>
              <p className="text-xs text-[#666] font-serif">
                정식 가정통신문 접수가 시작되는 즉시 문자로 링크를 전송해 드립니다.
              </p>
            </div>

            {isSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#2e5238] mx-auto" />
                <p className="font-bold text-sm text-[#1f1b18] font-serif">사전 알림 예약이 완료되었습니다!</p>
                <p className="text-xs text-[#666]">접수 오픈 당일 연락처로 가장 먼저 안내드립니다.</p>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="space-y-4">
                <input
                  type="text"
                  name="hp_check"
                  value={hpCheck}
                  onChange={(e) => setHpCheck(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ display: 'none', position: 'absolute', left: '-9999px' }}
                />

                <div>
                  <label className="block text-xs font-serif text-[#1f1b18] mb-1 font-bold">
                    연락처 또는 이메일 주소
                  </label>
                  <input
                    type="text"
                    required
                    value={contactInput}
                    onChange={(e) => {
                      setContactInput(e.target.value);
                      if (validationError) setValidationError('');
                    }}
                    placeholder="010-0000-0000 또는 fellow@planet.org"
                    className="w-full bg-[#fcfbf9] border border-[#d5cfc4] rounded p-2.5 text-sm text-[#111] placeholder:text-[#888] focus:outline-none focus:border-[#b82828] font-serif"
                  />
                  {validationError && (
                    <p className="text-[11px] text-[#e06c75] mt-1 font-serif">
                      ⚠️ {validationError}
                    </p>
                  )}
                </div>

                <div className="text-[10px] text-[#777] font-serif leading-tight">
                  * [개인정보 보호] 입력하신 연락처는 2026 플래닛 연말모임 알림 발송용으로만 사용되며, 행사 종료 후 7일 이내 안전하게 파기됩니다.
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded bg-[#b82828] hover:bg-[#961e1e] text-white font-bold text-sm transition-all shadow flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>사전 알림 신청하기</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 하단 푸터 */}

    </div>
  );
};
