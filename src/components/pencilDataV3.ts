// 8단계 × 8종 = 총 64종 동글동글 색연필 일러스트 데이터 (planet-v3 기반)

export interface StageItem {
  name: string;
  gender?: 'M' | 'F';
  svg?: string;
  backSvg?: string;
  frontSvg?: string;
}

export interface Stage {
  id: string;
  title: string;
  items: StageItem[];
}

export const HAIR_COLORS = [
  { name: '흑갈색(기본)', main: '#3b332b', sub: '#54493f' },
  { name: '밤톨 브라운', main: '#6f4e37', sub: '#8a6449' },
  { name: '로제 와인', main: '#9c5a49', sub: '#b56e5c' },
  { name: '허니 블론드', main: '#c29458', sub: '#d6aa6f' },
  { name: '포그 애쉬블루', main: '#475569', sub: '#64748b' }
];

export const PHOTO_BG_COLORS = [
  { name: '크림 모눈지', color: '#fffdf9' },
  { name: '버터 옐로우', color: '#fef3c7' },
  { name: '피치 핑크', color: '#fce7f3' },
  { name: '칠판 민트', color: '#dcfce7' },
  { name: '소다 블루', color: '#e0f2fe' }
];

export const BADGE_OPTIONS = [
  '🌸 스프링토',
  '☀️ 썸머데이',
  '🍂 어텀',
  '❄️ 윈터블'
];

export function getBadgeSeasonStyle(badge?: string): string {
  const b = String(badge || '');
  if (b.includes('스프링')) return 'bg-rose-50 text-rose-800 border-rose-300';
  if (b.includes('썸머')) return 'bg-sky-50 text-sky-800 border-sky-300';
  if (b.includes('어텀')) return 'bg-[#f7f0e8] text-[#5c3016] border-[#a0522d]';
  if (b.includes('윈터')) return 'bg-indigo-50 text-indigo-900 border-indigo-300';
  return 'bg-amber-50 text-amber-900 border-amber-700';
}

export function getStagesV3(customHairMain = '#3b332b', customHairSub = '#54493f'): Stage[] {
  const LINE = "#3b332b";
  const SUB_LINE = "#786b5e";
  const SKIN = "#fffaf3";
  const BLUSH = "#f9a89d";
  const HAIR_MAIN = customHairMain;
  const HAIR_SUB = customHairSub;

  const CUTE_NECK_AND_EARS = `
    <path d="M 85 144 L 84 168 M 115 144 L 116 168" stroke="${LINE}" stroke-width="2.6" stroke-linecap="round"/>
    <ellipse cx="100" cy="153" rx="14" ry="5" fill="#eadfd3" opacity="0.7"/>
    <circle cx="48" cy="108" r="11" fill="${SKIN}" stroke="${LINE}" stroke-width="2.6"/>
    <path d="M 46 105 Q 43 108 47 111" fill="none" stroke="${SUB_LINE}" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="152" cy="108" r="11" fill="${SKIN}" stroke="${LINE}" stroke-width="2.6"/>
    <path d="M 154 105 Q 157 108 153 111" fill="none" stroke="${SUB_LINE}" stroke-width="1.8" stroke-linecap="round"/>
  `;


      return [
        // 1단계: 얼굴·볼살 (8종 - 모두 모서리 없이 말랑하고 동글동글한 윤곽)
        {
          id: 'face',
          title: '<얼굴·볼살>',
          items: [
            {
              name: '말랑 찹쌀모찌형',
              svg: `${CUTE_NECK_AND_EARS}
                <path d="M 48 96 C 46 48, 154 48, 152 96 C 155 132, 134 152, 100 152 C 66 152, 45 132, 48 96 Z" fill="${SKIN}" stroke="${LINE}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`
            },
            {
              name: '포근 복숭아볼형',
              svg: `${CUTE_NECK_AND_EARS}
                <path d="M 50 94 C 48 48, 152 48, 150 94 C 156 122, 140 148, 100 153 C 60 148, 44 122, 50 94 Z" fill="${SKIN}" stroke="${LINE}" stroke-width="2.8" stroke-linecap="round"/>`
            },
            {
              name: '동글 아기고양이형',
              svg: `${CUTE_NECK_AND_EARS}
                <path d="M 49 92 C 47 46, 153 46, 151 92 C 152 126, 128 150, 100 151 C 72 150, 48 126, 49 92 Z" fill="${SKIN}" stroke="${LINE}" stroke-width="2.8" stroke-linecap="round"/>`
            },
            {
              name: '통통 다람쥐볼형',
              svg: `${CUTE_NECK_AND_EARS}
                <path d="M 51 92 C 50 48, 150 48, 149 92 C 160 120, 142 152, 100 152 C 58 152, 40 120, 51 92 Z" fill="${SKIN}" stroke="${LINE}" stroke-width="2.8" stroke-linecap="round"/>
                <path d="M 53 126 Q 60 134 67 131 M 147 126 Q 140 134 133 131" fill="none" stroke="${SUB_LINE}" stroke-width="1.4" stroke-linecap="round" opacity="0.6"/>`
            },
            {
              name: '순둥 강아지형',
              svg: `${CUTE_NECK_AND_EARS}
                <rect x="48" y="54" width="104" height="97" rx="48" fill="${SKIN}" stroke="${LINE}" stroke-width="2.8"/>`
            },
            {
              name: '사랑스런 달걀형',
              svg: `${CUTE_NECK_AND_EARS}
                <ellipse cx="100" cy="102" rx="50" ry="49" fill="${SKIN}" stroke="${LINE}" stroke-width="2.8"/>`
            },
            {
              name: '몽글 솜사탕형',
              svg: `${CUTE_NECK_AND_EARS}
                <path d="M 47 98 C 45 50, 155 50, 153 98 C 154 134, 132 153, 100 153 C 68 153, 46 134, 47 98 Z" fill="${SKIN}" stroke="${LINE}" stroke-width="2.8"/>`
            },
            {
              name: '단정한 도토리형',
              svg: `${CUTE_NECK_AND_EARS}
                <path d="M 49 90 C 49 48, 151 48, 151 90 C 151 128, 130 150, 100 153 C 70 150, 49 128, 49 90 Z" fill="${SKIN}" stroke="${LINE}" stroke-width="2.8"/>`
            }
          ]
        },

                // 2단계: 헤어스타일 (12종 - 남학생 6종 & 여학생 6종 황금 밸런스!)
        {
          id: 'hair',
          title: '<헤어스타일>',
          items: [
            {
              name: '포근 멍뭉 덮머',
              gender: 'M',
              backSvg: `<path d="M 38 88 C 30 26, 170 26, 162 88 Z" fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6"/>`,
              frontSvg: `<g fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
                <path d="M 39 96 C 34 24, 166 24, 161 96 L 153 104 L 148 80 C 136 72, 126 76, 118 73 C 112 65, 104 75, 96 73 C 86 65, 78 75, 68 72 C 58 72, 54 76, 52 80 L 47 104 Z"/>
                <path d="M 64 42 Q 100 30 136 42" fill="none" stroke="${HAIR_SUB}" stroke-width="2.2"/>
                <path d="M 72 58 Q 100 48 128 58" fill="none" stroke="${HAIR_SUB}" stroke-width="1.8"/>
              </g>`
            },
            {
              name: '몽글 단발 보브',
              gender: 'F',
              backSvg: `<g fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round">
                <path d="M 36 84 C 18 108, 20 152, 40 166 L 160 166 C 180 152, 182 108, 164 84 C 172 22, 28 22, 36 84 Z"/>
              </g>`,
              frontSvg: `<g fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
                <path d="M 36 94 C 30 24, 170 24, 164 94 C 154 72, 138 72, 126 83 C 116 68, 84 68, 74 83 C 62 72, 46 72, 36 94 Z"/>
                <path d="M 58 44 Q 100 32 142 44" fill="none" stroke="${HAIR_SUB}" stroke-width="2.2"/>
                <path d="M 28 116 Q 24 142 38 156 M 172 116 Q 176 142 162 156" fill="none" stroke="${HAIR_SUB}" stroke-width="2"/>
              </g>`
            },
            {
              name: '훈훈 가름마 애즈펌',
              gender: 'M',
              backSvg: `<path d="M 40 88 C 32 30, 168 30, 160 88 Z" fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6"/>`,
              frontSvg: `<g fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
                <path d="M 41 96 C 36 28, 96 26, 102 36 C 108 26, 164 28, 159 96 L 151 103 L 147 80 C 134 78, 116 72, 103 58 C 98 70, 80 78, 66 76 C 58 76, 53 78, 52 80 L 49 103 Z"/>
                <path d="M 58 48 Q 80 40 96 50 M 142 48 Q 120 40 106 50" fill="none" stroke="${HAIR_SUB}" stroke-width="2"/>
              </g>`
            },
            {
              name: '구름 웨이브 여신롱',
              gender: 'F',
              backSvg: `<g fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round">
                <path d="M 36 80 C 16 24, 184 24, 164 80 C 184 108, 188 150, 172 194 C 150 198, 50 198, 28 194 C 12 150, 16 108, 36 80 Z"/>
                <path d="M 24 136 Q 16 160 30 182 M 176 136 Q 184 160 170 182" fill="none" stroke="${HAIR_SUB}" stroke-width="2.2" stroke-linecap="round"/>
              </g>`,
              frontSvg: `<g fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
                <path d="M 36 94 C 28 24, 172 24, 164 94 C 150 64, 126 56, 100 64 C 74 56, 50 64, 36 94 Z"/>
                <path d="M 56 42 Q 100 30 144 42" fill="none" stroke="${HAIR_SUB}" stroke-width="2.2"/>
                <path d="M 36 92 Q 26 122 36 148 M 164 92 Q 174 122 164 148" fill="none" stroke="${HAIR_MAIN}" stroke-width="4.5"/>
              </g>`
            },
            {
              name: '복슬 멍뭉 베이비펌',
              gender: 'M',
              backSvg: `<g fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.5">
                <circle cx="48" cy="62" r="18"/><circle cx="74" cy="42" r="20"/><circle cx="100" cy="36" r="22"/><circle cx="126" cy="42" r="20"/><circle cx="152" cy="62" r="18"/>
              </g>`,
              frontSvg: `<g fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 40 92 Q 32 66 50 56 Q 62 36 84 46 Q 100 32 116 46 Q 138 36 150 56 Q 168 66 160 92 Q 148 82 138 76 Q 124 82 112 72 Q 100 82 88 72 Q 76 82 62 76 Q 52 82 40 92 Z"/>
                <path d="M 64 54 Q 74 48 80 56 M 96 50 Q 104 44 110 52 M 122 54 Q 130 48 134 56" fill="none" stroke="${HAIR_SUB}" stroke-width="2"/>
              </g>`
            },
            {
              name: '동글 똥머리(번)',
              gender: 'F',
              backSvg: `<g fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round">
                <path d="M 38 84 C 28 22, 172 22, 162 84 Z"/>
                <circle cx="100" cy="20" r="27"/>
                <path d="M 78 24 Q 100 8 122 24" fill="none" stroke="#e11d48" stroke-width="3.5" stroke-linecap="round"/>
                <circle cx="76" cy="25" r="4.5" fill="#fb7185" stroke="${LINE}" stroke-width="1.8"/>
                <circle cx="124" cy="25" r="4.5" fill="#fb7185" stroke="${LINE}" stroke-width="1.8"/>
              </g>`,
              frontSvg: `<g fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
                <path d="M 38 92 C 30 22, 170 22, 162 92 C 148 64, 126 58, 100 62 C 74 58, 52 64, 38 92 Z"/>
                <path d="M 58 42 Q 100 30 142 42" fill="none" stroke="${HAIR_SUB}" stroke-width="2"/>
                <path d="M 44 90 Q 36 116 45 136 M 156 90 Q 164 116 155 136" fill="none" stroke="${HAIR_MAIN}" stroke-width="5"/>
              </g>`
            },
            {
              name: '깔끔 리젠트 숏컷',
              gender: 'M',
              backSvg: `<path d="M 42 86 C 36 34, 164 34, 158 86 Z" fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6"/>`,
              frontSvg: `<g fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
                <path d="M 43 96 C 39 48, 52 34, 76 30 C 88 18, 118 18, 132 30 C 150 34, 161 48, 157 96 L 150 103 L 146 76 C 140 64, 122 58, 96 60 C 74 58, 58 64, 55 76 L 50 103 Z"/>
                <path d="M 76 38 Q 102 28 126 38" fill="none" stroke="${HAIR_SUB}" stroke-width="2.2"/>
              </g>`
            },
            {
              name: '복슬 푸들 히피펌',
              gender: 'F',
              backSvg: `<g fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.5">
                <circle cx="38" cy="94" r="19"/><circle cx="34" cy="122" r="20"/><circle cx="42" cy="148" r="19"/>
                <circle cx="162" cy="94" r="19"/><circle cx="166" cy="122" r="20"/><circle cx="158" cy="148" r="19"/>
                <circle cx="62" cy="46" r="22"/><circle cx="100" cy="38" r="24"/><circle cx="138" cy="46" r="22"/>
              </g>`,
              frontSvg: `<path d="M 40 90 Q 50 64 70 76 Q 85 60 100 76 Q 115 60 130 76 Q 150 64 160 90 C 160 32, 40 32, 40 90 Z" fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.5" stroke-linejoin="round"/>`
            },
            {
              name: '밤톨 귀염 크롭컷',
              gender: 'M',
              backSvg: `<path d="M 40 88 C 34 26, 166 26, 160 88 Z" fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6"/>`,
              frontSvg: `<g fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
                <path d="M 40 95 C 34 25, 166 25, 160 95 L 154 102 L 150 72 L 134 65 L 118 68 L 100 65 L 82 68 L 66 65 L 50 72 L 46 102 Z"/>
                <path d="M 62 42 Q 100 32 138 42" fill="none" stroke="${HAIR_SUB}" stroke-width="2.2"/>
                <path d="M 72 54 Q 100 46 128 54" fill="none" stroke="${HAIR_SUB}" stroke-width="1.8"/>
              </g>`
            },
            {
              name: '양갈래 땋은머리',
              gender: 'F',
              backSvg: `<g fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round">
                <path d="M 38 84 C 28 22, 172 22, 162 84 Z"/>
                <circle cx="36" cy="98" r="16"/><circle cx="32" cy="124" r="15"/><circle cx="28" cy="148" r="13"/><circle cx="26" cy="168" r="10"/>
                <circle cx="26" cy="160" r="5" fill="#f43f5e" stroke="${LINE}" stroke-width="2"/>
                <circle cx="164" cy="98" r="16"/><circle cx="168" cy="124" r="15"/><circle cx="172" cy="148" r="13"/><circle cx="174" cy="168" r="10"/>
                <circle cx="174" cy="160" r="5" fill="#f43f5e" stroke="${LINE}" stroke-width="2"/>
              </g>`,
              frontSvg: `<g fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
                <path d="M 38 92 C 30 22, 170 22, 162 92 C 146 66, 120 62, 100 70 C 80 62, 54 66, 38 92 Z"/>
                <path d="M 58 42 Q 100 30 142 42" fill="none" stroke="${HAIR_SUB}" stroke-width="2.2"/>
              </g>`
            },
            {
              name: '문예부 감성 리프컷',
              gender: 'M',
              backSvg: `<g fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
                <path d="M 38 84 C 26 22, 174 22, 162 84 C 172 108, 170 134, 178 146 C 164 148, 154 140, 150 132 L 50 132 C 46 140, 36 148, 22 146 C 30 134, 28 108, 38 84 Z"/>
              </g>`,
              frontSvg: `<g fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
                <path d="M 38 96 C 28 22, 172 22, 162 96 C 154 80, 146 70, 136 74 C 122 62, 108 56, 100 50 C 92 56, 78 62, 64 74 C 54 70, 46 80, 38 96 Z"/>
                <path d="M 42 90 Q 36 114 44 128 M 158 90 Q 164 114 156 128" fill="none" stroke="${HAIR_MAIN}" stroke-width="4.5"/>
                <path d="M 58 42 Q 82 32 98 42 M 142 42 Q 118 32 102 42" fill="none" stroke="${HAIR_SUB}" stroke-width="2"/>
              </g>`
            },
            {
              name: '사랑스런 반묶음',
              gender: 'F',
              backSvg: `<g fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round">
                <path d="M 38 84 C 26 22, 174 22, 162 84 C 176 120, 178 156, 164 182 L 36 182 C 22 156, 24 120, 38 84 Z"/>
                <path d="M 100 34 C 80 16, 54 28, 46 50 C 56 44, 74 44, 88 54 Z" fill="${HAIR_MAIN}"/>
                <path d="M 100 34 C 120 16, 146 28, 154 50 C 144 44, 126 44, 112 54 Z" fill="${HAIR_MAIN}"/>
                <circle cx="100" cy="36" r="7.5" fill="#fb7185" stroke="${LINE}" stroke-width="2"/>
                <path d="M 94 40 L 84 58 M 106 40 L 116 58" stroke="#fb7185" stroke-width="3" stroke-linecap="round"/>
              </g>`,
              frontSvg: `<g fill="${HAIR_MAIN}" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
                <path d="M 38 92 C 30 22, 170 22, 162 92 C 148 66, 122 62, 100 70 C 78 62, 52 66, 38 92 Z"/>
                <path d="M 56 42 Q 100 30 144 42" fill="none" stroke="${HAIR_SUB}" stroke-width="2.2"/>
                <path d="M 42 90 Q 32 118 42 142 M 158 90 Q 168 118 158 142" fill="none" stroke="${HAIR_MAIN}" stroke-width="4.5"/>
              </g>`
            }
          ]
        },

        // 3단계: 눈매·속눈썹 (8종 - 크고 동글동글하고 반짝이는 눈망울)
        {
          id: 'eyes',
          title: '<눈매·속눈썹>',
          items: [
            {
              name: '초롱초롱 밤하늘눈',
              svg: `<g stroke="${LINE}" fill="none" stroke-linecap="round">
                <path d="M 63 82 Q 74 77 84 81" stroke-width="2.4"/>
                <path d="M 116 81 Q 126 77 137 82" stroke-width="2.4"/>
                <circle cx="74" cy="98" r="10.5" fill="#fff" stroke-width="2.4"/>
                <circle cx="126" cy="98" r="10.5" fill="#fff" stroke-width="2.4"/>
                <circle cx="74" cy="98" r="7.5" fill="${LINE}"/>
                <circle cx="126" cy="98" r="7.5" fill="${LINE}"/>
                <circle cx="71" cy="95" r="2.8" fill="#fff" stroke="none"/>
                <circle cx="123" cy="95" r="2.8" fill="#fff" stroke="none"/>
                <circle cx="77" cy="101" r="1.3" fill="#fff" stroke="none"/>
                <circle cx="129" cy="101" r="1.3" fill="#fff" stroke="none"/>
              </g>`
            },
            {
              name: '다정한 반달 눈웃음',
              svg: `<g stroke="${LINE}" fill="none" stroke-linecap="round">
                <path d="M 63 83 Q 74 78 84 83" stroke-width="2.2"/>
                <path d="M 116 83 Q 126 78 137 83" stroke-width="2.2"/>
                <path d="M 62 99 Q 74 87 86 99" stroke-width="3.4"/>
                <path d="M 114 99 Q 126 87 138 99" stroke-width="3.4"/>
                <path d="M 60 95 L 64 97 M 140 95 L 136 97" stroke-width="2.2"/>
              </g>`
            },
            {
              name: '순둥 강아지 눈망울',
              svg: `<g stroke="${LINE}" fill="none" stroke-linecap="round">
                <path d="M 63 84 Q 74 80 84 82" stroke-width="2.3"/>
                <path d="M 116 82 Q 126 80 137 84" stroke-width="2.3"/>
                <ellipse cx="74" cy="98" rx="10" ry="11" fill="#fff" stroke-width="2.4"/>
                <ellipse cx="126" cy="98" rx="10" ry="11" fill="#fff" stroke-width="2.4"/>
                <circle cx="74" cy="99" r="7" fill="#4a3f35"/>
                <circle cx="126" cy="99" r="7" fill="#4a3f35"/>
                <circle cx="71.5" cy="96" r="2.6" fill="#fff" stroke="none"/>
                <circle cx="123.5" cy="96" r="2.6" fill="#fff" stroke="none"/>
              </g>`
            },
            {
              name: '새침 아기고양이눈',
              svg: `<g stroke="${LINE}" fill="none" stroke-linecap="round">
                <path d="M 63 82 Q 74 78 85 82" stroke-width="2.3"/>
                <path d="M 115 82 Q 126 78 137 82" stroke-width="2.3"/>
                <path d="M 61 98 Q 74 87 86 99 Q 74 107 61 98 Z" fill="#fff" stroke-width="2.5"/>
                <path d="M 139 98 Q 126 87 114 99 Q 126 107 139 98 Z" fill="#fff" stroke-width="2.5"/>
                <path d="M 58 94 L 63 97 M 142 94 L 137 97" stroke-width="2.6"/>
                <circle cx="74" cy="98" r="6" fill="${LINE}"/>
                <circle cx="126" cy="98" r="6" fill="${LINE}"/>
                <circle cx="72" cy="95.5" r="2.2" fill="#fff" stroke="none"/>
                <circle cx="124" cy="95.5" r="2.2" fill="#fff" stroke="none"/>
              </g>`
            },
            {
              name: '윙크 장난꾸러기',
              svg: `<g stroke="${LINE}" fill="none" stroke-linecap="round">
                <path d="M 63 81 Q 74 76 84 81" stroke-width="2.3"/>
                <path d="M 116 81 Q 126 76 137 81" stroke-width="2.3"/>
                <!-- 왼쪽 윙크 -->
                <path d="M 63 96 L 84 99 L 65 104" stroke-width="3.2" stroke-linejoin="round"/>
                <!-- 오른쪽 동글 눈 -->
                <circle cx="126" cy="98" r="10" fill="#fff" stroke-width="2.4"/>
                <circle cx="126" cy="98" r="7" fill="${LINE}"/>
                <circle cx="123.5" cy="95" r="2.6" fill="#fff" stroke="none"/>
              </g>`
            },
            {
              name: '콩알 똘망이 눈',
              svg: `<g stroke="${LINE}" fill="none" stroke-linecap="round">
                <path d="M 65 83 Q 74 79 83 83" stroke-width="2.4"/>
                <path d="M 117 83 Q 126 79 135 83" stroke-width="2.4"/>
                <ellipse cx="74" cy="98" rx="6.5" ry="8" fill="${LINE}"/>
                <ellipse cx="126" cy="98" rx="6.5" ry="8" fill="${LINE}"/>
                <circle cx="72" cy="95" r="2.2" fill="#fff" stroke="none"/>
                <circle cx="124" cy="95" r="2.2" fill="#fff" stroke="none"/>
              </g>`
            },
            {
              name: '몽글 꿈꾸는 속눈썹',
              svg: `<g stroke="${LINE}" fill="none" stroke-linecap="round">
                <path d="M 63 82 Q 74 77 84 82" stroke-width="2.2"/>
                <path d="M 116 82 Q 126 77 137 82" stroke-width="2.2"/>
                <circle cx="74" cy="98" r="10" fill="#fff" stroke-width="2.4"/>
                <circle cx="126" cy="98" r="10" fill="#fff" stroke-width="2.4"/>
                <circle cx="74" cy="98" r="6.8" fill="#54463b"/>
                <circle cx="126" cy="98" r="6.8" fill="#54463b"/>
                <circle cx="71.5" cy="95" r="2.5" fill="#fff" stroke="none"/>
                <circle cx="123.5" cy="95" r="2.5" fill="#fff" stroke="none"/>
                <!-- 속눈썹 톡톡 -->
                <path d="M 63 91 L 60 88 M 68 88 L 66 85 M 137 91 L 140 88 M 132 88 L 134 85" stroke-width="2.2"/>
              </g>`
            },
            {
              name: '해피 스마일 아치눈',
              svg: `<g stroke="${LINE}" fill="none" stroke-linecap="round">
                <path d="M 64 81 Q 74 76 84 81" stroke-width="2.2"/>
                <path d="M 116 81 Q 126 76 136 81" stroke-width="2.2"/>
                <path d="M 64 101 C 66 89, 82 89, 84 101" stroke-width="3.4"/>
                <path d="M 116 101 C 118 89, 134 89, 136 101" stroke-width="3.4"/>
                <path d="M 68 103 Q 74 106 80 103 M 120 103 Q 126 106 132 103" stroke="${SUB_LINE}" stroke-width="1.4"/>
              </g>`
            }
          ]
        },

        // 4단계: 코·발그레 볼터치 (8종 - 작고 귀여운 코와 수채화/색연필 볼터치)
        {
          id: 'blush',
          title: '<코·발그레볼>',
          items: [
            {
              name: '복숭아 동글 볼터치',
              svg: `<g stroke-linecap="round">
                <ellipse cx="60" cy="113" rx="11" ry="7" fill="${BLUSH}" opacity="0.55"/>
                <ellipse cx="140" cy="113" rx="11" ry="7" fill="${BLUSH}" opacity="0.55"/>
                <path d="M 99 108 Q 96 114 101 115" fill="none" stroke="${LINE}" stroke-width="2.3"/>
              </g>`
            },
            {
              name: '색연필 사선 홍조',
              svg: `<g stroke-linecap="round">
                <path d="M 99 108 Q 103 113 99 115" fill="none" stroke="${LINE}" stroke-width="2.3"/>
                <g stroke="#e07a6b" stroke-width="2" opacity="0.75">
                  <line x1="53" y1="115" x2="58" y2="109"/><line x1="59" y1="116" x2="64" y2="110"/><line x1="65" y1="115" x2="70" y2="109"/>
                  <line x1="130" y1="115" x2="135" y2="109"/><line x1="136" y1="116" x2="141" y2="110"/><line x1="142" y1="115" x2="147" y2="109"/>
                </g>
              </g>`
            },
            {
              name: '방울코 & 눈밑 매력점',
              svg: `<g stroke-linecap="round">
                <ellipse cx="60" cy="113" rx="9" ry="5.5" fill="${BLUSH}" opacity="0.45"/>
                <ellipse cx="140" cy="113" rx="9" ry="5.5" fill="${BLUSH}" opacity="0.45"/>
                <circle cx="100" cy="113" r="3" fill="#f3d5c8" stroke="${LINE}" stroke-width="2"/>
                <circle cx="83" cy="108" r="1.7" fill="${LINE}"/>
              </g>`
            },
            {
              name: '말괄량이 주근깨 볼',
              svg: `<g stroke-linecap="round">
                <ellipse cx="61" cy="113" rx="10" ry="6" fill="${BLUSH}" opacity="0.4"/>
                <ellipse cx="139" cy="113" rx="10" ry="6" fill="${BLUSH}" opacity="0.4"/>
                <path d="M 98 111 Q 100 115 102 111" fill="none" stroke="${LINE}" stroke-width="2.2"/>
                <g fill="#8c6d58">
                  <circle cx="57" cy="112" r="1.3"/><circle cx="63" cy="115" r="1.3"/><circle cx="67" cy="111" r="1.3"/>
                  <circle cx="133" cy="111" r="1.3"/><circle cx="137" cy="115" r="1.3"/><circle cx="143" cy="112" r="1.3"/>
                </g>
              </g>`
            },
            {
              name: '하트 뿅뿅 발그레',
              svg: `<g stroke-linecap="round">
                <path d="M 99 109 Q 97 114 101 115" fill="none" stroke="${LINE}" stroke-width="2.2"/>
                <path d="M 60 116 C 55 111, 53 106, 57 105 C 59 105, 60 107, 60 107 C 60 107, 61 105, 63 105 C 67 106, 65 111, 60 116 Z" fill="#f472b6" opacity="0.75"/>
                <path d="M 140 116 C 135 111, 133 106, 137 105 C 139 105, 140 107, 140 107 C 140 107, 141 105, 143 105 C 147 106, 145 111, 140 116 Z" fill="#f472b6" opacity="0.75"/>
              </g>`
            },
            {
              name: '귀여운 코 반창고',
              svg: `<g stroke-linecap="round">
                <ellipse cx="60" cy="114" rx="10" ry="6" fill="${BLUSH}" opacity="0.5"/>
                <ellipse cx="140" cy="114" rx="10" ry="6" fill="${BLUSH}" opacity="0.5"/>
                <rect x="91" y="106" width="18" height="8" rx="3" fill="#fef3c7" stroke="${LINE}" stroke-width="1.8" transform="rotate(-8 100 110)"/>
                <line x1="97" y1="107" x2="97" y2="113" stroke="${SUB_LINE}" stroke-width="1.2"/>
                <line x1="103" y1="107" x2="103" y2="113" stroke="${SUB_LINE}" stroke-width="1.2"/>
              </g>`
            },
            {
              name: '솜사탕 핑크 무드',
              svg: `<g stroke-linecap="round">
                <ellipse cx="62" cy="112" rx="13" ry="8" fill="#fbcfe8" opacity="0.65"/>
                <ellipse cx="138" cy="112" rx="13" ry="8" fill="#fbcfe8" opacity="0.65"/>
                <circle cx="60" cy="111" r="2" fill="#fff" opacity="0.8"/>
                <circle cx="136" cy="111" r="2" fill="#fff" opacity="0.8"/>
                <path d="M 99 109 L 98 114 L 102 114" fill="none" stroke="${LINE}" stroke-width="2.2" stroke-linejoin="round"/>
              </g>`
            },
            {
              name: '살구빛 수채 볼터치',
              svg: `<g stroke-linecap="round">
                <ellipse cx="61" cy="113" rx="12" ry="6.5" fill="#fdba74" opacity="0.5"/>
                <ellipse cx="139" cy="113" rx="12" ry="6.5" fill="#fdba74" opacity="0.5"/>
                <path d="M 100 107 Q 96 113 102 115" fill="none" stroke="${LINE}" stroke-width="2.2"/>
              </g>`
            }
          ]
        },

        // 5단계: 입모양·표정 (8종 - 동글동글하고 사랑스러운 표정)
        {
          id: 'mouth',
          title: '<입모양·표정>',
          items: [
            {
              name: '방긋 다정한 미소',
              svg: `<g stroke="${LINE}" fill="none" stroke-linecap="round">
                <path d="M 88 127 Q 100 137 112 127" stroke-width="2.6"/>
                <path d="M 85 125 Q 88 127 89 130 M 115 125 Q 112 127 111 130" stroke-width="1.8"/>
              </g>`
            },
            {
              name: '귀염 뽀짝 고양이입(:3)',
              svg: `<g stroke="${LINE}" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 89 128 Q 95 135 100 128 Q 105 135 111 128" stroke-width="2.6"/>
              </g>`
            },
            {
              name: '해맑은 반달 함박웃음',
              svg: `<g stroke="${LINE}" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 86 125 Q 100 128 114 125 C 113 141, 87 141, 86 125 Z" fill="#fff" stroke-width="2.4"/>
                <path d="M 90 133 Q 100 129 110 133 C 107 139, 93 139, 90 133 Z" fill="#e57373" stroke="none"/>
              </g>`
            },
            {
              name: '장난꾸러기 메롱(:P)',
              svg: `<g stroke="${LINE}" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 88 127 Q 100 133 112 126" fill="none" stroke-width="2.5"/>
                <path d="M 96 130 C 96 141, 108 141, 107 129 Z" fill="#f48fb1" stroke-width="2.2"/>
              </g>`
            },
            {
              name: '오물오물 도토리입',
              svg: `<g stroke="${LINE}" stroke-linecap="round">
                <circle cx="100" cy="130" r="4.5" fill="#e57373" stroke-width="2.3"/>
              </g>`
            },
            {
              name: '새침 삐죽 귀염입',
              svg: `<g stroke="${LINE}" fill="none" stroke-linecap="round">
                <path d="M 90 131 Q 100 125 110 131" stroke-width="2.5"/>
                <path d="M 96 135 Q 100 137 104 135" stroke="${SUB_LINE}" stroke-width="1.5"/>
              </g>`
            },
            {
              name: '설레는 피치 스마일',
              svg: `<g stroke="${LINE}" stroke-linecap="round">
                <path d="M 87 127 Q 100 136 113 125" fill="none" stroke-width="2.6"/>
                <circle cx="83" cy="126" r="1.5" fill="${SUB_LINE}" stroke="none"/>
                <circle cx="117" cy="124" r="1.5" fill="${SUB_LINE}" stroke="none"/>
              </g>`
            },
            {
              name: '와구와구 행복웃음',
              svg: `<g stroke="${LINE}" stroke-linecap="round" stroke-linejoin="round">
                <ellipse cx="100" cy="131" rx="11" ry="7.5" fill="#d96b6b" stroke-width="2.4"/>
                <path d="M 92 126 Q 100 128 108 126" fill="#fff" stroke="none"/>
              </g>`
            }
          ]
        },

        // 6단계: 안경·머리꾸미기 (8종 - 동글동글한 안경, 베레모, 헤드폰, 머리핀 등)
        {
          id: 'acc',
          title: '<안경·머리템>',
          items: [
            {
              name: '동글 해리포터 안경',
              svg: `<g stroke="${LINE}" fill="none" stroke-linecap="round">
                <circle cx="74" cy="98" r="16" fill="rgba(255,255,255,0.25)" stroke-width="2.6"/>
                <circle cx="126" cy="98" r="16" fill="rgba(255,255,255,0.25)" stroke-width="2.6"/>
                <path d="M 90 98 Q 100 94 110 98" stroke-width="2.4"/>
                <line x1="50" y1="96" x2="58" y2="97" stroke-width="2.2"/>
                <line x1="142" y1="97" x2="150" y2="96" stroke-width="2.2"/>
              </g>`
            },
            {
              name: '긱시크 라운드 뿔테',
              svg: `<g stroke="#29221e" fill="none" stroke-linecap="round">
                <rect x="55" y="84" width="38" height="27" rx="11" fill="rgba(255,255,255,0.3)" stroke-width="4"/>
                <rect x="107" y="84" width="38" height="27" rx="11" fill="rgba(255,255,255,0.3)" stroke-width="4"/>
                <path d="M 93 95 Q 100 92 107 95" stroke-width="3.6"/>
              </g>`
            },
            {
              name: '화가풍 체크 베레모',
              svg: `<g stroke="${LINE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 42 66 C 34 34, 152 22, 162 56 C 142 50, 62 54, 42 66 Z" fill="#c85a48"/>
                <path d="M 98 28 L 103 20" stroke-width="3.2"/>
              </g>`
            },
            {
              name: '귀염 하트&클로버 핀',
              svg: `<g stroke="${LINE}" stroke-width="2" stroke-linecap="round">
                <rect x="52" y="66" width="18" height="6" rx="3" fill="#f43f5e" transform="rotate(-18 61 69)"/>
                <circle cx="140" cy="68" r="6" fill="#fbbf24"/>
                <circle cx="140" cy="68" r="2" fill="#fff" stroke="none"/>
              </g>`
            },
            {
              name: '레트로 헤드폰',
              svg: `<g stroke="${LINE}" stroke-width="2.6" stroke-linecap="round">
                <path d="M 40 105 C 36 32, 164 32, 160 105" fill="none" stroke-width="4"/>
                <rect x="30" y="90" width="16" height="30" rx="8" fill="#e2e8f0"/>
                <rect x="154" y="90" width="16" height="30" rx="8" fill="#e2e8f0"/>
              </g>`
            },
            {
              name: '포근 겨울 털귀마개',
              svg: `<g stroke="${LINE}" stroke-width="2.4" stroke-linecap="round">
                <path d="M 42 102 C 40 34, 160 34, 158 102" fill="none" stroke="#9c5a49" stroke-width="3.5"/>
                <circle cx="40" cy="108" r="15" fill="#fff7ed"/>
                <circle cx="160" cy="108" r="15" fill="#fff7ed"/>
              </g>`
            },
            {
              name: '단정한 리본 머리띠',
              svg: `<g stroke="${LINE}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 46 80 C 52 38, 148 38, 154 80" fill="none" stroke="#be123c" stroke-width="5"/>
                <path d="M 128 48 L 144 40 L 140 56 Z" fill="#e11d48"/>
                <path d="M 128 48 L 114 42 L 118 56 Z" fill="#e11d48"/>
                <circle cx="128" cy="48" r="4" fill="#fb7185"/>
              </g>`
            },
            {
              name: '꾸밈 없음 (깔끔)',
              svg: ``
            }
          ]
        },

        // 7단계: 프레피룩·의상 (8종 - 동글동글하고 따뜻한 스쿨룩 & 파자마)
        {
          id: 'body',
          title: '<프레피의상>',
          items: [
            {
              name: '프레피 니트 & 리본타이',
              svg: `<g stroke="${LINE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 42 220 C 44 176, 65 164, 82 162 L 118 162 C 135 164, 156 176, 158 220 Z" fill="#3f3b37"/>
                <path d="M 78 162 L 100 194 L 122 162 Z" fill="#ffffff"/>
                <!-- 둥근 카라 -->
                <path d="M 82 162 Q 74 174 90 176 L 100 168 L 110 176 Q 126 174 118 162 Z" fill="#ffffff"/>
                <!-- 귀여운 리본 타이 -->
                <path d="M 100 174 L 89 168 L 91 181 Z M 100 174 L 111 168 L 109 181 Z" fill="#b91c1c"/>
                <circle cx="100" cy="174" r="3.5" fill="#dc2626"/>
              </g>`
            },
            {
              name: '포근 떡볶이 더플코트',
              svg: `<g stroke="${LINE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 38 220 C 42 174, 64 164, 80 162 L 120 162 C 136 164, 158 174, 162 220 Z" fill="#d6b892"/>
                <path d="M 76 162 Q 66 178 88 182 L 100 172 L 112 182 Q 134 178 124 162 Z" fill="#e7d2b5"/>
                <line x1="100" y1="172" x2="100" y2="220"/>
                <!-- 떡볶이 단추 -->
                <rect x="88" y="188" width="24" height="6" rx="3" fill="#5c4033"/>
                <rect x="88" y="204" width="24" height="6" rx="3" fill="#5c4033"/>
              </g>`
            },
            {
              name: '아가일 체크 가디건',
              svg: `<g stroke="${LINE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 42 220 C 44 176, 65 164, 82 162 L 118 162 C 135 164, 156 176, 158 220 Z" fill="#e6dec8"/>
                <path d="M 80 162 L 100 196 L 120 162 Z" fill="#ffffff"/>
                <path d="M 65 182 L 73 192 L 65 202 L 57 192 Z" fill="#9c5a49" stroke="none"/>
                <path d="M 135 182 L 143 192 L 135 202 L 127 192 Z" fill="#9c5a49" stroke="none"/>
                <circle cx="100" cy="202" r="2.5" fill="${LINE}"/>
                <circle cx="100" cy="213" r="2.5" fill="${LINE}"/>
              </g>`
            },
            {
              name: '단정한 세일러 가디건',
              svg: `<g stroke="${LINE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 42 220 C 44 176, 65 164, 82 162 L 118 162 C 135 164, 156 176, 158 220 Z" fill="#f8fafc"/>
                <path d="M 64 165 L 100 198 L 136 165 L 120 162 L 80 162 Z" fill="#334155"/>
                <path d="M 68 168 L 100 194 L 132 168" fill="none" stroke="#ffffff" stroke-width="1.8"/>
                <path d="M 100 194 L 92 212 L 100 208 L 108 212 Z" fill="#b91c1c"/>
              </g>`
            },
            {
              name: '폭신한 겨울 체크머플러',
              svg: `<g stroke="${LINE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 40 220 C 44 176, 65 166, 82 164 L 118 164 C 135 166, 156 176, 160 220 Z" fill="#57534e"/>
                <rect x="60" y="156" width="80" height="28" rx="14" fill="#d97757"/>
                <path d="M 104 176 L 102 214 C 108 216, 120 216, 126 214 L 124 176 Z" fill="#d97757"/>
                <line x1="78" y1="157" x2="78" y2="183" stroke="#fef3c7" stroke-width="2"/>
                <line x1="100" y1="157" x2="100" y2="183" stroke="#fef3c7" stroke-width="2"/>
                <line x1="114" y1="184" x2="114" y2="214" stroke="#fef3c7" stroke-width="2"/>
              </g>`
            },
            {
              name: '체크 블레이저 & 타이',
              svg: `<g stroke="${LINE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 40 220 C 43 176, 65 164, 82 162 L 118 162 C 135 164, 157 176, 160 220 Z" fill="#c7baa7"/>
                <path d="M 80 162 L 100 202 L 120 162 Z" fill="#ffffff"/>
                <path d="M 96 172 L 104 172 L 106 202 L 100 210 L 94 202 Z" fill="#1e3a8a"/>
                <path d="M 78 163 L 68 188 L 84 192 L 100 210 M 122 163 L 132 188 L 116 192 L 100 210" fill="none"/>
              </g>`
            },
            {
              name: '동글 피터팬카라 니트',
              svg: `<g stroke="${LINE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 42 220 C 44 176, 65 164, 82 162 L 118 162 C 135 164, 156 176, 158 220 Z" fill="#5b7053"/>
                <path d="M 80 162 C 72 178, 96 182, 100 168 C 104 182, 128 178, 120 162 Z" fill="#ffffff"/>
              </g>`
            },
            {
              name: '수학여행 도트 파자마',
              svg: `<g stroke="${LINE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 42 220 C 44 176, 65 164, 82 162 L 118 162 C 135 164, 156 176, 158 220 Z" fill="#dbeafe"/>
                <path d="M 78 162 L 68 182 L 100 186 L 132 182 L 122 162 Z" fill="#ffffff"/>
                <circle cx="64" cy="196" r="3" fill="#60a5fa" stroke="none"/>
                <circle cx="82" cy="208" r="3" fill="#60a5fa" stroke="none"/>
                <circle cx="136" cy="196" r="3" fill="#60a5fa" stroke="none"/>
                <circle cx="118" cy="208" r="3" fill="#60a5fa" stroke="none"/>
                <circle cx="100" cy="198" r="2.5" fill="${LINE}"/>
              </g>`
            }
          ]
        },

        // 8단계: 손소품·무드배경 (8종 - 책, 커피, 고양이, 붕어빵, 별빛 장식 등)
        {
          id: 'prop',
          title: '<소품·무드>',
          items: [
            {
              name: '꼭 안은 인생 애장서',
              svg: `<g stroke="${LINE}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <rect x="68" y="176" width="64" height="40" rx="5" fill="#9c5a49"/>
                <rect x="72" y="180" width="56" height="32" rx="3" fill="#fffdf9" stroke-width="1.6"/>
                <line x1="100" y1="176" x2="100" y2="216" stroke-width="2.6"/>
                <!-- 동글동글 양손 -->
                <circle cx="69" cy="196" r="7.5" fill="${SKIN}"/>
                <circle cx="131" cy="196" r="7.5" fill="${SKIN}"/>
              </g>`
            },
            {
              name: '따뜻한 라떼 머그컵',
              svg: `<g stroke="${LINE}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <rect x="108" y="180" width="26" height="28" rx="6" fill="#fff7ed"/>
                <path d="M 134 186 C 143 186, 143 200, 134 200" fill="none" stroke-width="2.6"/>
                <path d="M 118 194 C 115 190, 121 188, 121 192 C 121 188, 127 190, 124 194 L 121 198 Z" fill="#e11d48" stroke="none"/>
                <circle cx="108" cy="196" r="7" fill="${SKIN}"/>
                <path d="M 116 173 Q 114 167 119 163 M 125 173 Q 123 167 128 163" fill="none" stroke="${SUB_LINE}" stroke-width="1.8"/>
              </g>`
            },
            {
              name: '아기 치즈고양이와 독서',
              svg: `<g stroke="${LINE}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 74 218 C 72 192, 128 192, 126 218 Z" fill="#fed7aa"/>
                <path d="M 78 198 L 74 182 L 88 190 Q 100 187 112 190 L 126 182 L 122 198" fill="#fed7aa"/>
                <circle cx="91" cy="201" r="2" fill="${LINE}"/>
                <circle cx="109" cy="201" r="2" fill="${LINE}"/>
                <path d="M 97 205 Q 100 208 103 205" fill="none"/>
              </g>`
            },
            {
              name: '김 모락모락 겨울 붕어빵',
              svg: `<g stroke="${LINE}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 105 190 L 138 190 L 134 218 L 109 218 Z" fill="#fef3c7"/>
                <ellipse cx="122" cy="184" rx="13" ry="8" fill="#f59e0b" transform="rotate(-12 122 184)"/>
                <circle cx="117" cy="182" r="1.5" fill="${LINE}"/>
                <circle cx="107" cy="202" r="7" fill="${SKIN}"/>
              </g>`
            },
            {
              name: '다꾸 볼펜 & 스프링수첩',
              svg: `<g stroke="${LINE}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <rect x="64" y="180" width="32" height="36" rx="4" fill="#fef08a" transform="rotate(-6 80 198)"/>
                <path d="M 122 208 L 140 172 L 145 175 L 127 211 Z" fill="#60a5fa"/>
                <circle cx="126" cy="202" r="7" fill="${SKIN}"/>
              </g>`
            },
            {
              name: '반짝 별빛 & 클로버 무드',
              svg: `<g stroke="${LINE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <!-- 배경 반짝이 별과 네잎클로버 -->
                <path d="M 26 52 Q 26 62 16 62 Q 26 62 26 72 Q 26 62 36 62 Q 26 62 26 52 Z" fill="#fde047"/>
                <path d="M 174 46 Q 174 54 166 54 Q 174 54 174 62 Q 174 54 182 54 Q 174 54 174 46 Z" fill="#fde047"/>
                <circle cx="28" cy="142" r="6" fill="#86efac"/>
                <circle cx="36" cy="142" r="6" fill="#86efac"/>
                <circle cx="32" cy="136" r="6" fill="#86efac"/>
                <path d="M 32 146 L 30 156" fill="none" stroke-width="2.2"/>
              </g>`
            },
            {
              name: '새학기 브이(V) 포즈',
              svg: `<g stroke="${LINE}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="136" cy="192" r="10" fill="${SKIN}"/>
                <path d="M 132 184 L 127 168 M 139 184 L 144 168" stroke="${SKIN}" stroke-width="6"/>
                <path d="M 132 184 L 127 168 M 139 184 L 144 168" fill="none" stroke="${LINE}" stroke-width="2.4"/>
              </g>`
            },
            {
              name: '러블리 하트 & 음표 두들',
              svg: `<g stroke="${LINE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 28 72 C 20 64, 16 54, 23 51 C 26 50, 28 54, 28 54 C 28 54, 30 50, 33 51 C 40 54, 36 64, 28 72 Z" fill="#fda4af"/>
                <path d="M 172 138 C 166 132, 163 124, 168 122 C 170 121, 172 124, 172 124 C 172 124, 174 121, 176 122 C 181 124, 178 132, 172 138 Z" fill="#fda4af"/>
                <circle cx="168" cy="64" r="4" fill="${LINE}"/>
                <path d="M 172 64 L 172 48 L 182 51" fill="none" stroke-width="2.4"/>
              </g>`
            }
          ]
        }
      ];
}

