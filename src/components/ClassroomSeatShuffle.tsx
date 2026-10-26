import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowLeft, Shuffle, Users, Maximize2, Minimize2, 
  Download, Plus, Trash2, RefreshCw, BookOpen, Coffee, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';
import planetLogo from '../assets/planet-logo.png';
import { EVENT_CONFIG } from '../constants/eventConfig';
import { getStagesV3, getBadgeSeasonStyle } from './pencilDataV3';

export interface Participant {
  id: string;
  name: string;
  session?: string;
  memberType?: string;
  bookTitle?: string;
  phone?: string;
  avatarCode?: string;
  badge?: string;
  indices?: number[];
}

// 아바타 코드를 8자리 파츠 인덱스 배열로 변환하는 헬퍼 함수
export const parseAvatarIndices = (code?: string, name?: string): number[] => {
  if (code && typeof code === 'string' && code.trim() !== '') {
    const parts = code.includes('-')
      ? code.split('-').map(v => Math.max(0, parseInt(v, 10) - 1))
      : code.split('').map(v => Math.max(0, parseInt(v, 10) - 1));
    if (parts.length >= 8 && parts.every(v => !isNaN(v))) {
      return parts.slice(0, 8);
    }
  }
  // 코드가 없는 경우 이름을 시드로 일관된 귀여운 크로키 아바타 생성
  const seed = (name || '플래닛').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return [
    seed % 8,
    (seed * 3) % 12,
    (seed * 7) % 8,
    (seed * 11) % 8,
    (seed * 13) % 8,
    (seed * 17) % 8,
    (seed * 19) % 8,
    (seed * 23) % 8
  ];
};

// 분단 메타데이터 정의 (최대 50인 이상 지원을 위해 8분단까지 확장)
export const ALL_DIVISIONS = [
  { id: 1, name: '1 분단', sub: '창가 라인', accent: '#2e5238', badgeBg: 'bg-[#2e5238]' },
  { id: 2, name: '2 분단', sub: '중앙 집중 라인', accent: '#b82828', badgeBg: 'bg-[#b82828]' },
  { id: 3, name: '3 분단', sub: '복도 라인', accent: '#3b5998', badgeBg: 'bg-[#3b5998]' },
  { id: 4, name: '4 분단', sub: '앞자리 열정 라인', accent: '#d97706', badgeBg: 'bg-[#d97706]' },
  { id: 5, name: '5 분단', sub: '자유 토론 라인', accent: '#7c3aed', badgeBg: 'bg-[#7c3aed]' },
  { id: 6, name: '6 분단', sub: '책방 아늑 라인', accent: '#be185d', badgeBg: 'bg-[#be185d]' },
  { id: 7, name: '7 분단', sub: '별빛 라인', accent: '#0f766e', badgeBg: 'bg-[#0f766e]' },
  { id: 8, name: '8 분단', sub: '달빛 라인', accent: '#374151', badgeBg: 'bg-[#374151]' }
];

// 실제 신청자 데이터 로드 (로컬스토리지 기반)
const loadParticipantsFromStorage = (): Participant[] => {
  const savedRsvps = localStorage.getItem('planet_rsvps');
  if (savedRsvps) {
    try {
      const parsed = JSON.parse(savedRsvps);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .filter((item: any) => item && (item.name || item.cleanName))
          .map((item: any, idx: number) => ({
            id: item.studentNumber || item.id || `rsvp_${idx}_${Date.now()}`,
            name: (item.name || item.cleanName || '').trim(),
            session: item.session || item.sessionLabel || '',
            memberType: item.기존회원 || item.memberType || item.fellowType || '',
            badge: item.badge || item.반뱃지 || item.memberType || '',
            avatarCode: item.avatarCode || item.아바타코드 || item.croquisCode || '',
            bookTitle: item.bookTitle || item.bookHint || item.도서제목 || '',
            phone: item.phone || item.연락처 || ''
          }));
      }
    } catch (e) {
      console.error('로컬 신청자 명단 파싱 오류:', e);
    }
  }
  return [];
};

// 책상 위 미니 학생증 명찰 컴포넌트 (동글동글 색연필 크로키 아바타 포함)
const MiniStudentIdBadge: React.FC<{ participant: Participant; seatNumber: number }> = ({ participant, seatNumber }) => {
  const STAGES = useMemo(() => getStagesV3('#3b332b', '#5e5044'), []);
  const indices = useMemo(() => participant.indices || parseAvatarIndices(participant.avatarCode, participant.name), [participant]);

  return (
    <div className="w-full bg-[#fffdf9] border-2 border-[#1f1b18] rounded-xl p-1.5 sm:p-2 shadow-sm hover:shadow-md hover:border-[#b82828] hover:-translate-y-0.5 transition-all text-left relative overflow-hidden flex flex-col justify-between min-h-[82px] sm:min-h-[92px] group">
      {/* 상단 미니 바: 좌석 번호 & 반 뱃지 */}
      <div className="flex items-center justify-between border-b border-[#e5dfd3] pb-1 mb-1 w-full">
        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#5c4033] text-white">
          #{seatNumber < 10 ? `0${seatNumber}` : seatNumber}
        </span>
        <span className={`text-[8px] font-serif border px-1.5 py-0.2 rounded-full truncate max-w-[85px] ${getBadgeSeasonStyle(participant.badge || participant.memberType)}`}>
          {participant.badge || participant.memberType || '🌸 스프링토'}
        </span>
      </div>

      {/* 실물 학생증 레이아웃: 좌측 크로키 얼굴 + 우측 인적사항 */}
      <div className="grid grid-cols-12 gap-1.5 items-center flex-1">
        {/* 아바타 증명사진 */}
        <div className="col-span-4 aspect-[4/5] sketch-paper border border-[#2b2520] rounded-lg overflow-hidden flex items-center justify-center shadow-inner bg-[#fffdfa]">
          <svg viewBox="0 0 200 220" className="w-full h-full" filter="url(#pencil-sketch)">
            {/* 1. 뒷머리 */}
            {indices[1] !== null && STAGES[1] && (
              <g dangerouslySetInnerHTML={{ __html: STAGES[1].items[indices[1]]?.backSvg || '' }} />
            )}
            {/* 2. 의상 */}
            {indices[6] !== null && STAGES[6] && (
              <g dangerouslySetInnerHTML={{ __html: STAGES[6].items[indices[6]]?.svg || '' }} />
            )}
            {/* 3. 얼굴형 */}
            {indices[0] !== null && STAGES[0] && (
              <g dangerouslySetInnerHTML={{ __html: STAGES[0].items[indices[0]]?.svg || '' }} />
            )}
            {/* 4. 볼터치 */}
            {indices[3] !== null && STAGES[3] && (
              <g dangerouslySetInnerHTML={{ __html: STAGES[3].items[indices[3]]?.svg || '' }} />
            )}
            {/* 5. 눈 */}
            {indices[2] !== null && STAGES[2] && (
              <g dangerouslySetInnerHTML={{ __html: STAGES[2].items[indices[2]]?.svg || '' }} />
            )}
            {/* 6. 입 */}
            {indices[4] !== null && STAGES[4] && (
              <g dangerouslySetInnerHTML={{ __html: STAGES[4].items[indices[4]]?.svg || '' }} />
            )}
            {/* 7. 앞머리 */}
            {indices[1] !== null && STAGES[1] && (
              <g dangerouslySetInnerHTML={{ __html: STAGES[1].items[indices[1]]?.frontSvg || '' }} />
            )}
            {/* 8. 안경/헤어악세사리 */}
            {indices[5] !== null && STAGES[5] && (
              <g dangerouslySetInnerHTML={{ __html: STAGES[5].items[indices[5]]?.svg || '' }} />
            )}
            {/* 9. 소품 (맨 앞으로 표시) */}
            {indices[7] !== null && STAGES[7] && (
              <g dangerouslySetInnerHTML={{ __html: STAGES[7].items[indices[7]]?.svg || '' }} />
            )}
          </svg>
        </div>

        {/* 인적사항 */}
        <div className="col-span-8 space-y-0.5 font-serif min-w-0 pl-0.5">
          <div className="font-bold text-xs sm:text-sm text-[#111] truncate tracking-tight">
            {participant.name}
          </div>
          {participant.session && (
            <div className="text-[8.5px] text-[#b82828] font-bold truncate">
              {participant.session.includes('전체') ? '1부+2부 전체' : participant.session.includes('1부') ? '1차 새학기' : '2차 수학여행'}
            </div>
          )}
          {participant.bookTitle && (
            <div className="text-[7.5px] text-[#666] truncate italic font-hwp-body">
              📖 {participant.bookTitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ClassroomSeatShuffleProps {
  onBack: () => void;
}

export const ClassroomSeatShuffle: React.FC<ClassroomSeatShuffleProps> = ({ onBack }) => {
  // 실제 신청자 명단 관리 (더미데이터 배제, 실제 등록된 신청자 기준)
  const [participants, setParticipants] = useState<Participant[]>(() => loadParticipantsFromStorage());
  const [seats, setSeats] = useState<(Participant | null)[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSession, setNewSession] = useState('1차+2차 전체 참석');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [divisionMode, setDivisionMode] = useState<number | 'auto'>('auto');
  const classroomRef = useRef<HTMLDivElement>(null);

  // 최대 50인 이상 지원: 인원 수에 따른 최적 분단 수 자동 추천
  const getRecommendedDivisions = (count: number): number => {
    if (count <= 18) return 3; // ~18명: 3분단 (테이블당 4~6명)
    if (count <= 28) return 4; // 19~28명: 4분단 (테이블당 5~7명)
    if (count <= 38) return 5; // 29~38명: 5분단 (테이블당 6~8명)
    if (count <= 48) return 6; // 39~48명: 6분단 (테이블당 6~8명)
    return 8;                  // 49~50인 이상: 8분단 (테이블당 6~8명)
  };

  const activeDivisionCount = divisionMode === 'auto' 
    ? getRecommendedDivisions(participants.length) 
    : divisionMode;

  const currentDivisions = useMemo(() => {
    return ALL_DIVISIONS.slice(0, activeDivisionCount);
  }, [activeDivisionCount]);

  // 분단당 좌석 수 및 총 좌석 수 계산 (각 분단 테이블에서 마주보도록 짝수 보장)
  const calcSeatsPerDivision = () => {
    const count = participants.length;
    const base = Math.max(Math.ceil(count / activeDivisionCount), 4);
    return base % 2 === 0 ? base : base + 1; // 짝수로 보정 (기본 4, 6, 8, 10...)
  };

  const seatsPerDivision = calcSeatsPerDivision();
  const totalSeats = seatsPerDivision * activeDivisionCount;

  // 분단 개수에 맞춘 유연한 반응형 그리드 클래스
  const gridLayoutClass = useMemo(() => {
    if (activeDivisionCount === 3) return 'grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2';
    if (activeDivisionCount === 4) return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-2';
    if (activeDivisionCount <= 6) return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pt-2';
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-2';
  }, [activeDivisionCount]);

  // 구글 시트 실시간 신청자 연동
  const syncWithGoogleSheet = async (showToast = true) => {
    const scriptUrl = EVENT_CONFIG.googleScriptUrl;
    if (!scriptUrl || scriptUrl.includes('YOUR_SCRIPT_ID')) {
      if (showToast) alert('구글 시트 연동 URL이 설정되지 않아 로컬 저장소 신청자 명단만 유지됩니다.');
      return;
    }

    setIsSyncing(true);
    try {
      const url = scriptUrl.includes('?') 
        ? `${scriptUrl}&action=admin_get_all&token=2099` 
        : `${scriptUrl}?action=admin_get_all&token=2099`;

      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const resJson = await response.json();
      const rawData = Array.isArray(resJson) ? resJson : (resJson.data || []);

      if (Array.isArray(rawData)) {
        const mapped: Participant[] = rawData
          .filter((item: any) => item && (item.이름 || item.name || item.cleanName))
          .map((item: any, idx: number) => ({
            id: item.학번 || item.studentNumber || `sheet_${idx}`,
            name: (item.이름 || item.name || item.cleanName || '').trim(),
            session: item.참석세션 || item.session || item.sessionLabel || '',
            memberType: item.기존회원 || item.memberType || item.학우구분 || '',
            badge: item.반뱃지 || item.badge || item.memberType || '',
            avatarCode: item.아바타코드 || item.avatarCode || item.croquisCode || '',
            bookTitle: item.도서제목 || item.선물도서힌트 || item.bookTitle || item.bookHint || '',
            phone: item.연락처 || item.phone || ''
          }));

        setParticipants(mapped);
        localStorage.setItem('planet_rsvps', JSON.stringify(mapped));
        if (showToast) {
          alert(`구글 시트 연동 완료: 실제 신청자 총 ${mapped.length}명의 명단을 성공적으로 불러왔습니다.`);
        }
      }
    } catch (err) {
      console.warn('구글 시트 동기화 실패 (오프라인 모드 유지):', err);
      if (showToast) {
        alert('구글 시트 연동 중 오류가 발생했습니다. 로컬 신청자 데이터를 유지합니다.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // 초기 마운트 시 구글 시트 자동 동기화 1회 시도 (URL이 설정되어 있는 경우)
  useEffect(() => {
    if (EVENT_CONFIG.googleScriptUrl && !EVENT_CONFIG.googleScriptUrl.includes('YOUR_SCRIPT_ID')) {
      syncWithGoogleSheet(false);
    }
  }, []);

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

  // 실제 신청자 명단을 N개 분단의 통합 테이블 좌석에 골고루 분배 배치
  const calculateSeatsForDivisions = (list: Participant[], perDiv: number, divCount: number) => {
    const total = perDiv * divCount;
    const finalSeats: (Participant | null)[] = new Array(total).fill(null);
    const shuffled = [...list].sort(() => Math.random() - 0.5);

    // N개 분단에 1명씩 번갈아가며 균등하게 분배
    shuffled.forEach((participant, idx) => {
      const divIdx = idx % divCount;
      const seatInDiv = Math.floor(idx / divCount);
      if (seatInDiv < perDiv) {
        finalSeats[divIdx * perDiv + seatInDiv] = participant;
      }
    });

    return finalSeats;
  };

  // 초기 1회 및 분단/신청자 변경 시 자동 재배치
  useEffect(() => {
    setSeats(calculateSeatsForDivisions(participants, seatsPerDivision, activeDivisionCount));
  }, [participants, seatsPerDivision, activeDivisionCount]);

  // 자리바꾸기 실행 (드럼롤 셔플 후 안착)
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
      const tempSeats: (Participant | null)[] = new Array(totalSeats).fill(null);
      randomTemp.forEach((p, i) => {
        if (i < totalSeats) tempSeats[i] = p;
      });
      setSeats(tempSeats);
      step++;

      if (step >= maxSteps) {
        clearInterval(interval);

        // 최종: N개 분단별 통합 테이블에 고르게 셔플 배치 확정
        const balanced = calculateSeatsForDivisions(participants, seatsPerDivision, activeDivisionCount);
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
      link.download = `2026_플래닛_교실_분단별_자리배치도.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert('배치표 저장 중 오류가 발생했습니다.');
    } finally {
      setIsCapturing(false);
    }
  };

  // 참가자 직접 추가
  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newP: Participant = {
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      session: newSession,
      memberType: '신청자'
    };
    const updated = [...participants, newP];
    setParticipants(updated);
    localStorage.setItem('planet_rsvps', JSON.stringify(updated));
    setNewName('');
  };

  // 참가자 삭제
  const handleRemoveParticipant = (id: string) => {
    const updated = participants.filter(p => p.id !== id);
    setParticipants(updated);
    localStorage.setItem('planet_rsvps', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-[#1f1b18] font-sans selection:bg-[#b82828]/20 selection:text-[#b82828] pb-16">
      
      {/* 전역 SVG 부드러운 색연필 텍스처 필터 */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="pencil-sketch" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.75" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* 상단 헤더 & 컨트롤 바 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e8e4dc] px-3 sm:px-6 py-2.5 sm:py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          
          {/* 좌측: 홈으로 & 타이틀 */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <button
              onClick={onBack}
              className="p-1 sm:p-1.5 rounded-lg border border-[#d8d3c7] bg-[#f8f6f0] hover:bg-[#ede8dc] text-[#1f1b18] transition-colors flex items-center space-x-1 text-xs font-serif shadow-sm flex-shrink-0"
              title="관리자로 돌아가기"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>돌아가기</span>
            </button>

            <div className="flex items-center space-x-2 min-w-0">
              <img src={planetLogo} alt="플래닛" className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded bg-white border border-[#e5e0d8] p-0.5 shadow-sm flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-serif font-bold text-[#1f1b18] flex items-center space-x-1.5">
                  <span className="truncate">교실 자리 배치 (1~{activeDivisionCount}분단)</span>
                  <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#2e5238] text-white whitespace-nowrap">
                    신청 {participants.length}명 • 최대 50인+
                  </span>
                </h1>
                <p className="text-[9px] sm:text-[10px] text-[#666] font-serif truncate">
                  2026 플래닛 독서학교 1~{activeDivisionCount}분단 통합 테이블 배치도 (분단당 {seatsPerDivision}석)
                </p>
              </div>
            </div>
          </div>

          {/* 우측: 셔플 및 컨트롤 버튼 */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 justify-end">
            
            {/* 분단 수 조절 드롭다운 */}
            <div className="flex items-center space-x-1 bg-[#f8f6f0] border border-[#d8d3c7] rounded px-2 py-1 text-[11px] sm:text-xs font-serif shadow-sm">
              <span className="text-[#666] font-bold">분단:</span>
              <select
                value={divisionMode}
                onChange={(e) => {
                  const val = e.target.value;
                  setDivisionMode(val === 'auto' ? 'auto' : parseInt(val, 10));
                }}
                className="bg-transparent font-bold text-[#1f1b18] outline-none cursor-pointer"
              >
                <option value="auto">자동 추천 ({activeDivisionCount}분단)</option>
                <option value="3">3 분단 (기본)</option>
                <option value="4">4 분단</option>
                <option value="5">5 분단</option>
                <option value="6">6 분단 (30~45인)</option>
                <option value="7">7 분단</option>
                <option value="8">8 분단 (50인 안팎)</option>
              </select>
            </div>
            
            {/* 구글 시트 동기화 버튼 */}
            <button
              onClick={() => syncWithGoogleSheet(true)}
              disabled={isSyncing}
              className="px-2 py-1 sm:px-3 sm:py-1.5 rounded text-[11px] sm:text-xs font-serif border border-[#d8d3c7] bg-white hover:bg-[#f8f6f0] text-[#1f1b18] flex items-center space-x-1 transition-all shadow-sm disabled:opacity-50"
              title="구글 시트에서 최신 신청자 불러오기"
            >
              <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#3b5998] ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">신청자 동기화</span>
            </button>

            {/* 명단 관리 모달 버튼 */}
            <button
              onClick={() => setShowManageModal(true)}
              className="px-2 py-1 sm:px-3 sm:py-1.5 rounded text-[11px] sm:text-xs font-serif border border-[#d8d3c7] bg-white hover:bg-[#f8f6f0] text-[#1f1b18] flex items-center space-x-1 transition-all shadow-sm"
            >
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#2e5238]" />
              <span>신청자 ({participants.length}명)</span>
            </button>

            {/* 배치표 다운로드 */}
            <button
              onClick={handleDownloadSeats}
              disabled={isCapturing}
              className="px-2 py-1 sm:px-3 sm:py-1.5 rounded text-[11px] sm:text-xs font-serif border border-[#d8d3c7] bg-white hover:bg-[#f8f6f0] text-[#1f1b18] flex items-center space-x-1 transition-all shadow-sm"
              title="배치표 이미지 저장"
            >
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#555]" />
              <span className="hidden xs:inline">이미지 저장</span>
            </button>

            {/* 전체화면 */}
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
              disabled={isShuffling || participants.length === 0}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[#b82828] hover:bg-[#961e1e] text-white font-serif font-bold text-xs sm:text-sm flex items-center space-x-1 sm:space-x-1.5 shadow-md transition-all disabled:opacity-50 active:scale-95 whitespace-nowrap"
            >
              <Shuffle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>{isShuffling ? '자리 섞는 중...' : '자리 배치 시작!'}</span>
            </button>

          </div>

        </div>
      </header>

      {/* 상단 좌석 현황 바 */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between text-[10px] sm:text-[11px] text-[#666] font-mono border-b border-[#e8e4dc]">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#2e5238]"></span>
          <span>실제 신청자: <strong>{participants.length}명</strong></span>
          <span className="text-[#bbb]">|</span>
          <span>1~{activeDivisionCount}분단 (각 분단 {seatsPerDivision}석 • 총 {totalSeats}석)</span>
        </div>
        <div>* 분단별 하나의 일체형 통합 책상 구조 (최대 50인+)</div>
      </div>

      {/* 메인 교실 배치도 영역 (캡처 대상) */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-24 sm:pb-12">
        
        <div 
          ref={classroomRef}
          className="bg-white border-2 border-[#1f1b18] rounded-xl sm:rounded-2xl p-3 sm:p-6 md:p-8 shadow-xl space-y-6 relative overflow-hidden"
        >
          
          {/* 상단: 칠판 및 교탁 (선생님 / 운영진) */}
          <div className="text-center space-y-2.5 sm:space-y-3">
            
            {/* 레트로 우드 현판 헤더 */}
            <div className="bg-[#5c4033] text-[#f7f5ed] max-w-xl mx-auto py-2 sm:py-2.5 px-3 sm:px-6 rounded-lg border-2 sm:border-4 border-[#3e2723] shadow-lg relative">
              <div className="text-[9px] sm:text-[10px] font-mono text-[#dfc27d] tracking-widest uppercase">
                CLASSROOM SIGNBOARD • 1 ~ {activeDivisionCount} DIVISION
              </div>
              <h2 className="text-sm sm:text-lg md:text-xl font-serif font-black tracking-normal sm:tracking-widest text-[#f7f5ed]">
                2026 플래닛 독서학교 「새학기 교실 자리배치도」
              </h2>
              <div className="text-[10px] sm:text-[11px] text-[#dfc27d]/90 font-serif mt-0.5">
                * 책을 사랑하는 플래닛 여러분의 다정한 첫 만남 (총 {participants.length}명)
              </div>
            </div>

            {/* 교탁 그래픽 */}
            <div className="inline-block px-5 sm:px-8 py-1.5 sm:py-2 rounded-t-lg bg-[#5c4033] text-[#f7f5ed] font-serif font-bold text-[11px] sm:text-xs border-2 border-b-4 border-[#3e2723] shadow-md">
              [ 칠 판 & 교 탁 (선생님 / 운영진 교무석) ]
            </div>

          </div>

          {/* 신청자가 전혀 없을 때의 안내 */}
          {participants.length === 0 && (
            <div className="p-6 text-center bg-[#faf8f4] border-2 border-dashed border-[#dcd6c8] rounded-xl my-4 space-y-3">
              <BookOpen className="w-8 h-8 text-[#888] mx-auto" />
              <div className="font-serif font-bold text-sm text-[#1f1b18]">
                현재 등록된 실제 신청자가 없습니다.
              </div>
              <p className="text-xs text-[#666] font-serif max-w-md mx-auto">
                가정통신문 신청서를 통해 접수된 명단이 자동으로 반영됩니다. 상단의 [신청자 동기화]를 누르거나 [신청자 명단]에서 직접 참가자를 등록하실 수 있습니다.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowManageModal(true)}
                  className="px-3.5 py-1.5 rounded bg-[#2e5238] text-white text-xs font-serif font-bold shadow hover:bg-[#23402c] transition-colors"
                >
                  참가자 등록하기
                </button>
              </div>
            </div>
          )}

          {/* 중앙: N개 분단 레이아웃 (각 분단마다 하나의 통합 책상) */}
          <div className={gridLayoutClass}>
            
            {currentDivisions.map((division, divIndex) => {
              const divBase = divIndex * seatsPerDivision;
              const divSeats = seats.slice(divBase, divBase + seatsPerDivision);

              return (
                <div 
                  key={division.id}
                  className="bg-[#fcfbf9] border-2 border-[#dcd6c8] rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-md flex flex-col justify-between"
                >
                  {/* 분단 헤더 */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#e2ddd3]">
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${division.badgeBg} inline-block shadow-sm`}></span>
                      <h3 className="font-serif font-bold text-base text-[#1f1b18]">{division.name}</h3>
                    </div>
                    <span className="text-[11px] font-serif px-2 py-0.5 rounded-full bg-[#f0ede4] text-[#666] border border-[#e2ddd3]">
                      {division.sub}
                    </span>
                  </div>

                  {/* 분단 내 하나의 통합 책상 (One Unified Desk) */}
                  <div className="flex-1 bg-gradient-to-b from-[#f9f7f2] to-[#f2eee4] border-2 border-[#5c4033]/80 rounded-xl p-3 shadow-inner space-y-2.5 flex flex-col justify-between">
                    
                    {/* 통합 책상 상단 라벨 */}
                    <div className="py-1 px-2.5 rounded bg-[#5c4033] text-[#f7f5ed] text-[10px] font-serif font-bold text-center flex items-center justify-center space-x-1 shadow-sm">
                      <Coffee className="w-3 h-3 text-[#dfc27d]" />
                      <span>{division.name} 일체형 통합 테이블 ({seatsPerDivision}석)</span>
                      <BookOpen className="w-3 h-3 text-[#dfc27d]" />
                    </div>

                    {/* 책상 위 마주보는 2열 좌석 그리드 */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-2.5 flex-1">
                      {divSeats.map((participant, sIdx) => {
                        const seatNumber = divBase + sIdx + 1;
                        if (!participant) {
                          return (
                            <div
                              key={`seat-${divIndex}-${sIdx}`}
                              className="p-2 sm:p-2.5 rounded-xl border-2 border-dashed border-[#ccc] bg-[#eae6db]/30 flex flex-col items-center justify-center text-center min-h-[82px] sm:min-h-[92px]"
                            >
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-stone-300 text-stone-600 mb-1">
                                #{seatNumber < 10 ? `0${seatNumber}` : seatNumber}
                              </span>
                              <div className="text-[11px] text-[#aaa] font-serif">빈 자리</div>
                              <div className="w-3 h-0.5 rounded-full bg-[#8b6f4e]/20 mt-1"></div>
                            </div>
                          );
                        }

                        return (
                          <MiniStudentIdBadge
                            key={`seat-${divIndex}-${sIdx}-${participant.id}`}
                            participant={participant}
                            seatNumber={seatNumber}
                          />
                        );
                      })}
                    </div>

                    {/* 책상 하단 데코 문구 */}
                    <div className="text-[9px] text-center text-[#777] font-serif border-t border-[#dfd9cb] pt-1">
                      * {division.name} 학우들이 한 책상에서 담소를 나눕니다.
                    </div>

                  </div>

                  {/* 분단 푸터 요약 */}
                  <div className="text-[10px] font-mono text-[#888] text-right pt-0.5">
                    배정 인원: {divSeats.filter(Boolean).length} / {seatsPerDivision}명
                  </div>

                </div>
              );
            })}

          </div>

          {/* 하단 배치도 설명 및 플래닛 독서학교 인증마크 */}
          <div className="pt-4 border-t border-[#e2ddd3] flex flex-wrap items-center justify-between gap-2 text-xs font-serif text-[#666]">
            <div>
              * 자리 배치가 완료된 후 같은 분단 학우들과 눈인사를 나누며 서로의 책 선물을 교환해 주세요.
            </div>
            <div className="font-bold text-[#1f1b18]">
              플래닛 독서학교 운영위원회 자리배치도 제2026호
            </div>
          </div>

        </div>

      </main>

      {/* 실제 신청자 명단 관리 모달 */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#fcfbf9] border-2 border-[#1f1b18] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-2 border-b border-[#e2ddd3]">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1f1b18]">
                  실제 참가자 명단 관리
                </h3>
                <p className="text-[11px] text-[#666] font-serif">
                  현재 등록된 실제 신청자 {participants.length}명
                </p>
              </div>
              <button 
                onClick={() => setShowManageModal(false)}
                className="text-[#888] hover:text-[#111] text-sm"
              >
                ✕ 닫기
              </button>
            </div>

            {/* 신규 참가자 직접 추가 폼 */}
            <form onSubmit={handleAddParticipant} className="space-y-2 p-3 bg-white border border-[#e2ddd3] rounded-lg">
              <div className="text-xs font-serif font-bold text-[#1f1b18]">참가자 수동 추가</div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="참가자 성함 (예: 홍길동)" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  className="flex-1 border border-[#ccc] rounded px-3 py-1.5 text-xs font-serif focus:outline-none focus:border-[#b82828]"
                />
                <select
                  value={newSession}
                  onChange={e => setNewSession(e.target.value)}
                  className="border border-[#ccc] rounded px-2 py-1.5 text-xs font-serif focus:outline-none focus:border-[#b82828] bg-white"
                >
                  <option value="1차+2차 전체 참석">1차+2차</option>
                  <option value="1차만 참석">1차만</option>
                  <option value="2차만 참석">2차만</option>
                </select>
                <button 
                  type="submit" 
                  className="px-3.5 py-1.5 rounded bg-[#2e5238] hover:bg-[#23402c] text-white text-xs font-serif font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>추가</span>
                </button>
              </div>
            </form>

            {/* 명단 리스트 스크롤 영역 */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[160px]">
              {participants.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#999] font-serif">
                  등록된 신청자가 없습니다.
                </div>
              ) : (
                participants.map((p, idx) => (
                  <div 
                    key={p.id} 
                    className="flex items-center justify-between p-2.5 rounded bg-white border border-[#e8e4dc] text-xs font-serif hover:bg-[#faf8f4] transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-[11px] text-[#888] w-6 text-right">{idx + 1}.</span>
                      <span className="font-bold text-[#111] text-sm">{p.name}</span>
                      {p.session && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f0eee6] text-[#666]">
                          {p.session}
                        </span>
                      )}
                    </div>

                    <button 
                      onClick={() => handleRemoveParticipant(p.id)}
                      className="p-1 text-[#aaa] hover:text-[#b82828] transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-[#e2ddd3] flex justify-between items-center text-xs font-serif">
              <button 
                onClick={() => syncWithGoogleSheet(true)}
                disabled={isSyncing}
                className="text-[#3b5998] hover:underline flex items-center space-x-1"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>구글 시트에서 다시 불러오기</span>
              </button>
              <button 
                onClick={() => setShowManageModal(false)}
                className="px-4 py-2 rounded bg-[#1f1b18] text-white font-bold"
              >
                완료
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

