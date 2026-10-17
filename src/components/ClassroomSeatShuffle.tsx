import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Shuffle, Users, Maximize2, Minimize2, 
  Download, Plus, Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';
import planetLogo from '../assets/planet-logo.png';

interface Participant {
  id: string;
  name: string;
  gender: 'M' | 'F';
  type: 'senior' | 'new';
  seatIndex?: number;
}

// 기본 샘플 참가자 명단 (24인 - 기존여6, 기존남6, 신규여6, 신규남6 황금비율 구성)
const DEFAULT_PARTICIPANTS: Participant[] = [
  // 1분단 배정 후보군
  { id: 'p1', name: '김하늘', gender: 'F', type: 'senior' },
  { id: 'p2', name: '박서연', gender: 'F', type: 'senior' },
  { id: 'p3', name: '정민우', gender: 'M', type: 'senior' },
  { id: 'p4', name: '강도현', gender: 'M', type: 'senior' },
  { id: 'p5', name: '최지우', gender: 'F', type: 'new' },
  { id: 'p6', name: '한소희', gender: 'F', type: 'new' },
  { id: 'p7', name: '이준호', gender: 'M', type: 'new' },
  { id: 'p8', name: '임태양', gender: 'M', type: 'new' },

  // 2분단 배정 후보군
  { id: 'p9', name: '윤채원', gender: 'F', type: 'senior' },
  { id: 'p10', name: '송예진', gender: 'F', type: 'senior' },
  { id: 'p11', name: '오승재', gender: 'M', type: 'senior' },
  { id: 'p12', name: '배진우', gender: 'M', type: 'senior' },
  { id: 'p13', name: '신유나', gender: 'F', type: 'new' },
  { id: 'p14', name: '노다혜', gender: 'F', type: 'new' },
  { id: 'p15', name: '권혁주', gender: 'M', type: 'new' },
  { id: 'p16', name: '유시온', gender: 'M', type: 'new' },

  // 3분단 배정 후보군
  { id: 'p17', name: '백서린', gender: 'F', type: 'senior' },
  { id: 'p18', name: '황가람', gender: 'F', type: 'senior' },
  { id: 'p19', name: '문재원', gender: 'M', type: 'senior' },
  { id: 'p20', name: '조현우', gender: 'M', type: 'senior' },
  { id: 'p21', name: '전민서', gender: 'F', type: 'new' },
  { id: 'p22', name: '양다은', gender: 'F', type: 'new' },
  { id: 'p23', name: '서강진', gender: 'M', type: 'senior' },
  { id: 'p24', name: '구동혁', gender: 'M', type: 'new' }
];

interface ClassroomSeatShuffleProps {
  onBack: () => void;
}

export const ClassroomSeatShuffle: React.FC<ClassroomSeatShuffleProps> = ({ onBack }) => {
  const [participants, setParticipants] = useState<Participant[]>(() => {
    const savedRsvps = localStorage.getItem('planet_rsvps');
    if (savedRsvps) {
      try {
        const parsed = JSON.parse(savedRsvps);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: { name: string }, idx: number) => ({
            id: `rsvp_${idx}`,
            name: item.name,
            gender: (idx % 2 === 0 ? 'F' : 'M') as 'M' | 'F',
            type: (Math.floor(idx / 2) % 2 === 0 ? 'senior' : 'new') as 'senior' | 'new'
          }));
        }
      } catch {}
    }
    return DEFAULT_PARTICIPANTS;
  });

  const [seats, setSeats] = useState<(Participant | null)[]>(new Array(24).fill(null));
  const [isShuffling, setIsShuffling] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  const classroomRef = useRef<HTMLDivElement>(null);

  // 드럼롤 사운드 (Web Audio API 가속 비트)
  const playDrumrollSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const count = 28;
      
      for (let i = 0; i < count; i++) {
        const time = ctx.currentTime + (i * 0.1) * (1 - i / (count * 1.5));
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140 + (i * 4), time);
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.08);
      }

      // 최종 팡파레 심벌즈 효과
      setTimeout(() => {
        const chimeNotes = [523.25, 659.25, 783.99, 1046.50]; // 도-미-솔-도
        chimeNotes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
          gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.12);
          osc.stop(ctx.currentTime + idx * 0.12 + 1.2);
        });
      }, 2500);

    } catch {}
  };

  // 각 분단별 성비 균형(1:1) & 신·구 조화(1:1) 자동 배정 (짝꿍은 분단 내에서 자연스럽게 랜덤 믹스)
  const calculateBalancedSeats = (list: Participant[]) => {
    const finalSeats: (Participant | null)[] = new Array(24).fill(null);

    // 각 4개 그룹별 무작위 셔플
    const seniorF = list.filter(p => p.gender === 'F' && p.type === 'senior').sort(() => Math.random() - 0.5);
    const seniorM = list.filter(p => p.gender === 'M' && p.type === 'senior').sort(() => Math.random() - 0.5);
    const newF = list.filter(p => p.gender === 'F' && p.type === 'new').sort(() => Math.random() - 0.5);
    const newM = list.filter(p => p.gender === 'M' && p.type === 'new').sort(() => Math.random() - 0.5);

    // 잔여 인원 보충용 풀
    const fallbackPool = [...list].sort(() => Math.random() - 0.5);

    // 3개 분단(1분단, 2분단, 3분단) 각각에 성비 1:1, 신구 1:1 보장
    for (let bunday = 0; bunday < 3; bunday++) {
      const base = bunday * 8;

      // 해당 분단에 배정될 8명 선출 (기존여2, 기존남2, 신규여2, 신규남2 = 성비 1:1, 신구 1:1)
      const divisionMembers: (Participant | null)[] = [
        seniorF.pop() || fallbackPool.pop() || null,
        seniorF.pop() || fallbackPool.pop() || null,
        seniorM.pop() || fallbackPool.pop() || null,
        seniorM.pop() || fallbackPool.pop() || null,
        newF.pop() || fallbackPool.pop() || null,
        newF.pop() || fallbackPool.pop() || null,
        newM.pop() || fallbackPool.pop() || null,
        newM.pop() || fallbackPool.pop() || null,
      ];

      // 분단 내에서는 8명을 완전히 무작위로 섞어서 4개 책상(8개 좌석)에 자유롭게 배치
      // (짝꿍끼리는 인위적인 제약 없이 자연스럽게 매칭)
      const shuffledDivision = divisionMembers.sort(() => Math.random() - 0.5);

      shuffledDivision.forEach((member, i) => {
        finalSeats[base + i] = member;
      });
    }

    return finalSeats;
  };

  // 자리바꾸기 실행 (드럼롤 셔플 후 자동 밸런스 안착)
  const runSmartShuffle = () => {
    if (participants.length === 0 || isShuffling) return;

    setIsShuffling(true);
    playDrumrollSound();

    let step = 0;
    const maxSteps = 22;
    const intervalTime = 110;

    const interval = setInterval(() => {
      // 셔플 애니메이션 동안 무작위 스핀 연출
      const randomTemp = [...participants].sort(() => Math.random() - 0.5);
      const tempSeats: (Participant | null)[] = new Array(24).fill(null);
      randomTemp.slice(0, 24).forEach((p, i) => {
        tempSeats[i] = p;
      });
      setSeats(tempSeats);
      step++;

      if (step >= maxSteps) {
        clearInterval(interval);

        // 최종: 분단별 성비 균형 & 신구 조화가 자동 계산된 좌석에 안착
        const balanced = calculateBalancedSeats(participants);
        setSeats(balanced);
        setIsShuffling(false);

        // 축하 컨페티 효과
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#b82828', '#2e5238', '#dfc27d', '#ffffff']
        });
      }
    }, intervalTime);
  };

  // 초기 1회 기본 밸런스 배치
  useEffect(() => {
    const initialBalanced = calculateBalancedSeats(participants);
    setSeats(initialBalanced);
  }, [participants]);

  // 전체화면 토글
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // 배치도 이미지(PNG) 다운로드
  const handleDownloadSeats = async () => {
    if (!classroomRef.current) return;
    try {
      setIsCapturing(true);
      const dataUrl = await toPng(classroomRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#fcfbf9'
      });
      const link = document.createElement('a');
      link.download = `2026_플래닛_교실_자리배치표.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert('배치표 저장 중 오류가 발생했습니다.');
    } finally {
      setIsCapturing(false);
    }
  };

  // 참가자 추가 (자동 성비 및 신구 속성 부여)
  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const count = participants.length;
    const autoGender: 'M' | 'F' = count % 2 === 0 ? 'F' : 'M';
    const autoType: 'senior' | 'new' = Math.floor(count / 2) % 2 === 0 ? 'senior' : 'new';

    const newP: Participant = {
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      gender: autoGender,
      type: autoType
    };
    setParticipants([...participants, newP]);
    setNewName('');
  };

  // 참가자 삭제
  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-[#1f1b18] font-sans selection:bg-[#b82828]/20 selection:text-[#b82828] pb-16">
      
      {/* 상단 헤더 & 컨트롤 바 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e8e4dc] px-3 sm:px-6 py-2.5 sm:py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          
          {/* 좌측: 홈으로 & 타이틀 */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <button
              onClick={onBack}
              className="p-1 sm:p-1.5 rounded-lg border border-[#d8d3c7] bg-[#f8f6f0] hover:bg-[#ede8dc] text-[#1f1b18] transition-colors flex items-center space-x-1 text-xs font-serif shadow-sm flex-shrink-0"
              title="뒤로 가기"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>돌아가기</span>
            </button>

            <div className="flex items-center space-x-2 min-w-0">
              <img src={planetLogo} alt="플래닛" className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded bg-white border border-[#e5e0d8] p-0.5 shadow-sm flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-serif font-bold text-[#1f1b18] flex items-center space-x-1.5">
                  <span className="truncate">자리 배치</span>
                  <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#b82828] text-white whitespace-nowrap">현장용</span>
                </h1>
                <p className="text-[9px] sm:text-[10px] text-[#666] font-serif truncate">2026 플래닛 독서학교 1·2·3분단 짝꿍 좌석 배정</p>
              </div>
            </div>
          </div>

          {/* 우측: 셔플 및 컨트롤 버튼 */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 justify-end">
            
            <button
              onClick={() => setShowManageModal(true)}
              className="px-2 py-1 sm:px-3 sm:py-1.5 rounded text-[11px] sm:text-xs font-serif border border-[#d8d3c7] bg-white hover:bg-[#f8f6f0] text-[#1f1b18] flex items-center space-x-1 transition-all shadow-sm"
            >
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#2e5238]" />
              <span>명단 ({participants.length}명)</span>
            </button>

            <button
              onClick={handleDownloadSeats}
              disabled={isCapturing}
              className="px-2 py-1 sm:px-3 sm:py-1.5 rounded text-[11px] sm:text-xs font-serif border border-[#d8d3c7] bg-white hover:bg-[#f8f6f0] text-[#1f1b18] flex items-center space-x-1 transition-all shadow-sm"
              title="배치표 이미지 저장"
            >
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#555]" />
              <span className="hidden xs:inline">배치표 저장</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1 sm:p-1.5 rounded text-xs font-serif border border-[#d8d3c7] bg-white hover:bg-[#f8f6f0] text-[#1f1b18] transition-all shadow-sm"
              title={isFullscreen ? "전체화면 종료" : "빔프로젝터 전체화면"}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* 메인 셔플 액션 버튼 */}
            <button
              onClick={runSmartShuffle}
              disabled={isShuffling}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[#b82828] hover:bg-[#961e1e] text-white font-serif font-bold text-xs sm:text-sm flex items-center space-x-1 sm:space-x-1.5 shadow-md transition-all disabled:opacity-50 active:scale-95 whitespace-nowrap"
            >
              <Shuffle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>{isShuffling ? '자리 섞는 중...' : '자리 배치 시작!'}</span>
            </button>

          </div>

        </div>
      </header>

      {/* 상단 좌석 현황 바 */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-end text-[10px] sm:text-[11px] text-[#777] font-mono border-b border-[#e8e4dc]">
        <div>총 24석 (1·2·3분단 각 8석)</div>
      </div>

      {/* 메인 교실 배치도 영역 (캡처 대상) */}
      <main className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-24 sm:pb-12">
        
        <div 
          ref={classroomRef}
          className="bg-white border-2 border-[#1f1b18] rounded-xl sm:rounded-2xl p-3 sm:p-6 md:p-10 shadow-xl space-y-5 sm:space-y-8 relative overflow-hidden"
        >
          
          {/* 상단: 칠판 및 교탁 (선생님 / 운영진) */}
          <div className="text-center space-y-2.5 sm:space-y-3">
            
            {/* 레트로 우드 현판 헤더 (교탁과 일치하는 따뜻한 갈색) */}
            <div className="bg-[#5c4033] text-[#f7f5ed] max-w-xl mx-auto py-2 sm:py-3 px-3 sm:px-6 rounded-lg border-2 sm:border-4 border-[#3e2723] shadow-lg relative">
              <div className="text-[9px] sm:text-[10px] font-mono text-[#dfc27d] tracking-widest uppercase">
                CLASSROOM SIGNBOARD
              </div>
              <h2 className="text-sm sm:text-lg md:text-xl font-serif font-black tracking-normal sm:tracking-widest text-[#f7f5ed]">
                2026 플래닛 독서학교 「새학기 교실」
              </h2>
              <div className="text-[10px] sm:text-[11px] text-[#dfc27d]/90 font-serif mt-0.5">
                * 책을 사랑하는 플래닛 여러분의 다정한 첫 만남
              </div>
            </div>

            {/* 교탁 그래픽 */}
            <div className="inline-block px-5 sm:px-8 py-1.5 sm:py-2 rounded-t-lg bg-[#5c4033] text-[#f7f5ed] font-serif font-bold text-[11px] sm:text-xs border-2 border-b-4 border-[#3e2723] shadow-md">
              [ 교 탁 (선생님 / 운영진 교무석) ]
            </div>

          </div>

          {/* 중앙: 3개 분단 책상 레이아웃 (1분단 / 2분단 / 3분단) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-4">
            
            {/* 분단 정의: 0~7 (1분단), 8~15 (2분단), 16~23 (3분단) */}
            {[
              { id: 1, name: '1 분단', sub: '창가 라인' },
              { id: 2, name: '2 분단', sub: '중앙 집중 라인' },
              { id: 3, name: '3 분단', sub: '복도 라인' }
            ].map((blandan, bIdx) => (
              <div 
                key={blandan.id} 
                className="bg-[#fcfbf9] border border-[#dcd6c8] rounded-xl p-4 space-y-4 shadow-sm"
              >
                
                {/* 분단 헤더 */}
                <div className="flex items-center justify-between pb-2 border-b border-[#e2ddd3]">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#b82828] inline-block"></span>
                    <h3 className="font-serif font-bold text-sm text-[#1f1b18]">{blandan.name}</h3>
                  </div>
                  <span className="text-[10px] font-serif text-[#777]">{blandan.sub}</span>
                </div>

                {/* 분단 내 4개 책상 (각 책상 2인 1조 짝꿍) */}
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((rowIdx) => {
                    const seatLeftIndex = bIdx * 8 + rowIdx * 2;
                    const seatRightIndex = seatLeftIndex + 1;
                    const pLeft = seats[seatLeftIndex];
                    const pRight = seats[seatRightIndex];

                    return (
                      <div 
                        key={rowIdx} 
                        className="bg-white border-2 border-[#1f1b18]/30 rounded-lg p-2 shadow-sm hover:border-[#1f1b18] transition-colors"
                      >
                        <div className="text-[9px] font-mono text-[#888] mb-1 text-center">
                          {rowIdx + 1}분임 책상 (짝꿍)
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          
                          {/* 왼쪽 좌석 */}
                          <div 
                            className={`p-3 rounded border text-center transition-all min-h-[52px] flex items-center justify-center ${
                              pLeft 
                                ? 'bg-[#fdfcf9] border-[#1f1b18]/40 shadow-sm' 
                                : 'bg-[#f7f5ed] border-dashed border-[#ccc]'
                            }`}
                          >
                            {pLeft ? (
                              <div className="font-serif font-bold text-sm sm:text-base text-[#111] tracking-wide">
                                {pLeft.name}
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#aaa] font-serif">빈 자리</span>
                            )}
                          </div>

                          {/* 오른쪽 좌석 */}
                          <div 
                            className={`p-3 rounded border text-center transition-all min-h-[52px] flex items-center justify-center ${
                              pRight 
                                ? 'bg-[#fdfcf9] border-[#1f1b18]/40 shadow-sm' 
                                : 'bg-[#f7f5ed] border-dashed border-[#ccc]'
                            }`}
                          >
                            {pRight ? (
                              <div className="font-serif font-bold text-sm sm:text-base text-[#111] tracking-wide">
                                {pRight.name}
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#aaa] font-serif">빈 자리</span>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}

          </div>

          {/* 하단 배치도 설명 및 플래닛 독서학교 인증마크 */}
          <div className="pt-4 border-t border-[#e2ddd3] flex flex-wrap items-center justify-between text-xs font-serif text-[#666]">
            <div>
              * 자리 배치가 완료된 후 서로의 학생증과 선물할 책을 나누며 인사를 시작해 주세요.
            </div>
            <div className="font-bold text-[#1f1b18]">
              플래닛 독서학교 운영위원회 자리배치도 제2026호
            </div>
          </div>

        </div>

      </main>

      {/* 명단 관리 모달 (이름만 간편하게 등록) */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#fcfbf9] border-2 border-[#1f1b18] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-2 border-b border-[#e2ddd3]">
              <h3 className="font-serif font-bold text-base text-[#1f1b18]">
                참가자 명단 관리 ({participants.length}명)
              </h3>
              <button 
                onClick={() => setShowManageModal(false)}
                className="text-[#888] hover:text-[#111] text-sm"
              >
                ✕ 닫기
              </button>
            </div>

            {/* 신규 참가자 추가 폼 (이름만 입력) */}
            <form onSubmit={handleAddParticipant} className="flex gap-2 p-3 bg-white border border-[#e2ddd3] rounded-lg">
              <input 
                type="text" 
                placeholder="추가할 참가자 성함 (예: 홍길동)" 
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
                className="flex-1 border border-[#ccc] rounded px-3 py-1.5 text-xs font-serif focus:outline-none focus:border-[#b82828]"
              />
              <button 
                type="submit" 
                className="px-4 py-1.5 rounded bg-[#2e5238] hover:bg-[#23402c] text-white text-xs font-serif font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>추가</span>
              </button>
            </form>

            {/* 명단 리스트 스크롤 영역 */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {participants.map((p, idx) => (
                <div 
                  key={p.id} 
                  className="flex items-center justify-between p-2.5 rounded bg-white border border-[#e8e4dc] text-xs font-serif hover:bg-[#faf8f4] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-[11px] text-[#888] w-6 text-right">{idx + 1}.</span>
                    <span className="font-bold text-[#111] text-sm">{p.name}</span>
                  </div>

                  <button 
                    onClick={() => handleRemoveParticipant(p.id)}
                    className="p-1 text-[#aaa] hover:text-[#b82828] transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#e2ddd3] flex justify-between items-center text-xs font-serif">
              <button 
                onClick={() => setParticipants(DEFAULT_PARTICIPANTS)}
                className="text-[#777] hover:text-[#111] underline"
              >
                기본 24인 명단 복원
              </button>
              <button 
                onClick={() => setShowManageModal(false)}
                className="px-4 py-2 rounded bg-[#1f1b18] text-white font-bold"
              >
                적용 완료
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
