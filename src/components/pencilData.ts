// 4B Pencil Sketch Data extracted from planet.html

export const P_DARK = "#2b2927";
export const P_MID = "#57534e";
export const P_SHADE = "#d6d3cd";
export const P_PAPER = "#fbf9f3";

// 공통 귀 & 목선 (얼굴형과 몸통이 자연스러운 일러스트로 이어지게 하는 핵심 파츠)
export const NECK_AND_EARS = `
      <!-- 목 피부 베이스 (뒷머리가 목 영역으로 투과되어 어두워지는 현상 완벽 차단) -->
      <polygon points="79,140 121,140 121,172 79,172" fill="${P_PAPER}"/>
      <!-- 목선과 턱 밑 연필 해칭(빗금) 그림자 -->
      <path d="M 82 142 L 80 172 M 118 142 L 120 172" stroke="${P_DARK}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 84 150 L 92 158 M 90 151 L 98 159 M 96 152 L 104 160 M 102 151 L 110 159 M 108 150 L 115 157" stroke="${P_MID}" stroke-width="1.3" opacity="0.65"/>
      <!-- 양쪽 귀 스케치 -->
      <path d="M 52 95 C 43 92, 43 114, 54 116" fill="${P_PAPER}" stroke="${P_DARK}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M 48 100 C 46 105, 48 110, 51 111" fill="none" stroke="${P_MID}" stroke-width="1.5"/>
      <path d="M 148 95 C 157 92, 157 114, 146 116" fill="${P_PAPER}" stroke="${P_DARK}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M 152 100 C 154 105, 152 110, 149 111" fill="none" stroke="${P_MID}" stroke-width="1.5"/>
    `;

export interface StageItem {
  name: string;
  svg?: string;
  backSvg?: string;
  frontSvg?: string;
}

export interface Stage {
  id: string;
  title: string;
  items: StageItem[];
}

export const STAGES: Stage[] = [
      // 1단계: 얼굴·윤곽 (6종)
      {
        id: 'face',
        title: '<얼굴·윤곽>',
        items: [
          {
            name: '부드러운 달걀형',
            svg: `${NECK_AND_EARS}
              <path d="M 52 85 C 50 42, 150 42, 148 85 C 148 122, 126 150, 100 152 C 74 150, 52 122, 52 85 Z" fill="${P_PAPER}" stroke="${P_DARK}" stroke-width="2.8" stroke-linecap="round"/>
              <path d="M 56 115 C 65 138, 82 148, 100 150" fill="none" stroke="${P_MID}" stroke-width="1" opacity="0.4"/>`
          },
          {
            name: '샤프한 브이라인',
            svg: `${NECK_AND_EARS}
              <path d="M 52 82 C 50 42, 150 42, 148 82 C 146 115, 124 140, 100 154 C 76 140, 54 115, 52 82 Z" fill="${P_PAPER}" stroke="${P_DARK}" stroke-width="2.8" stroke-linejoin="round"/>
              <path d="M 138 118 L 102 151" fill="none" stroke="${P_MID}" stroke-width="1.1" opacity="0.4"/>`
          },
          {
            name: '말랑 모찌 볼살형',
            svg: `${NECK_AND_EARS}
              <path d="M 53 84 C 52 44, 148 44, 147 84 C 154 116, 138 148, 100 150 C 62 148, 46 116, 53 84 Z" fill="${P_PAPER}" stroke="${P_DARK}" stroke-width="2.8" stroke-linecap="round"/>
              <path d="M 55 122 Q 62 132 70 130 M 145 122 Q 138 132 130 130" fill="none" stroke="${P_MID}" stroke-width="1.2" opacity="0.5"/>`
          },
          {
            name: '단정한 클래식 각진형',
            svg: `${NECK_AND_EARS}
              <path d="M 52 80 C 52 42, 148 42, 148 80 L 145 126 L 118 150 L 82 150 L 55 126 Z" fill="${P_PAPER}" stroke="${P_DARK}" stroke-width="2.8" stroke-linejoin="round"/>
              <path d="M 58 124 L 83 147" fill="none" stroke="${P_MID}" stroke-width="1.2" opacity="0.4"/>`
          },
          {
            name: '분위기파 갸름형',
            svg: `${NECK_AND_EARS}
              <path d="M 55 82 C 54 40, 146 40, 145 82 C 144 122, 124 148, 100 155 C 76 148, 56 122, 55 82 Z" fill="${P_PAPER}" stroke="${P_DARK}" stroke-width="2.8"/>`
          },
          {
            name: '포근한 복숭아형',
            svg: `${NECK_AND_EARS}
              <path d="M 51 86 C 49 44, 151 44, 149 86 C 151 120, 130 146, 100 153 C 70 146, 49 120, 51 86 Z" fill="${P_PAPER}" stroke="${P_DARK}" stroke-width="2.8"/>`
          }
        ]
      },

      // 2단계: 헤어스타일 (6종 - 뒷머리 backSvg + 앞머리 frontSvg 분리로 일러스트 퀄리티 극대화)
      {
        id: 'hair',
        title: '<헤어스타일>',
        items: [
          {
            name: '단정한 태슬 보브단발',
            backSvg: `<path d="M 42 70 C 32 18, 168 18, 158 70 C 168 100, 168 135, 160 148 L 40 148 C 32 135, 32 100, 42 70 Z" fill="#3a3633" stroke="${P_DARK}" stroke-width="2.6"/>`,
            frontSvg: `<path d="M 40 85 C 34 20, 72 16, 100 18 C 128 16, 166 20, 160 85 C 152 64, 136 56, 120 70 C 112 55, 92 55, 82 70 C 68 56, 52 64, 40 85 Z" fill="#3a3633" stroke="${P_DARK}" stroke-width="2.6" stroke-linejoin="round"/>
                       <path d="M 68 28 Q 78 48 82 70 M 100 22 Q 104 46 112 66 M 132 28 Q 124 48 120 70" stroke="#78716c" stroke-width="1.4" fill="none"/>
                       <path d="M 42 84 Q 38 108 42 128 M 158 84 Q 162 108 158 128" stroke="${P_DARK}" stroke-width="2" fill="none" stroke-linecap="round"/>`
          },
          {
            name: '댄디 가름마 숏컷',
            backSvg: `<path d="M 47 72 C 44 50, 156 50, 153 72 Z" fill="#33302e"/>`,
            frontSvg: `<path d="M 46 92 C 40 52, 75 34, 106 38 C 135 34, 160 52, 154 92 C 148 72, 130 58, 108 54 C 102 68, 92 76, 84 78 C 90 66, 96 58, 98 52 C 76 58, 56 72, 46 92 Z" fill="#3a3633" stroke="${P_DARK}" stroke-width="2.6" stroke-linejoin="round"/>
                       <path d="M 62 52 Q 78 60 86 74 M 128 48 Q 118 58 112 66" stroke="#78716c" stroke-width="1.3" fill="none"/>`
          },
          {
            name: '내추럴 장발 웨이브',
            backSvg: `<path d="M 40 70 C 34 22, 166 22, 160 70 C 172 105, 172 145, 172 182 C 155 188, 135 185, 125 175 C 120 155, 80 155, 75 175 C 65 185, 45 188, 28 182 C 28 145, 28 105, 40 70 Z" fill="#3f3b37" stroke="${P_DARK}" stroke-width="2.6"/>
                       <path d="M 36 115 Q 46 140 34 165 M 164 115 Q 154 140 166 165" stroke="#78716c" stroke-width="1.4" fill="none"/>`,
            frontSvg: `<path d="M 44 94 C 36 24, 76 22, 100 26 C 124 22, 164 24, 156 94 C 146 66, 126 50, 100 52 C 74 50, 54 66, 44 94 Z" fill="#3f3b37" stroke="${P_DARK}" stroke-width="2.6"/>
                       <path d="M 72 30 Q 82 52 78 76 M 100 26 Q 102 52 103 75 M 128 30 Q 118 52 122 76" stroke="${P_DARK}" stroke-width="2" fill="none" stroke-linecap="round"/>
                       <path d="M 48 40 Q 64 48 70 66 M 152 40 Q 136 48 130 66" stroke="#78716c" stroke-width="1.4" fill="none"/>`
          },
          {
            name: '동글동글 로우번(똥머리)',
            backSvg: `<circle cx="100" cy="18" r="21" fill="#3a3633" stroke="${P_DARK}" stroke-width="2.6"/>
                       <path d="M 85 20 Q 100 8 115 20 M 86 14 Q 100 26 114 14" fill="none" stroke="#78716c" stroke-width="1.6"/>
                       <ellipse cx="100" cy="32" rx="14" ry="4" fill="#2b2927" stroke="${P_DARK}" stroke-width="2"/>`,
            frontSvg: `<path d="M 46 88 C 40 26, 160 26, 154 88 C 144 62, 122 50, 100 52 C 78 50, 56 62, 46 88 Z" fill="#3a3633" stroke="${P_DARK}" stroke-width="2.6"/>
                       <path d="M 68 50 Q 84 32 94 28 M 132 50 Q 116 32 106 28 M 100 48 L 100 30" stroke="#78716c" stroke-width="1.4" fill="none"/>
                       <path d="M 48 86 Q 42 110 48 126 M 152 86 Q 158 110 152 126" fill="none" stroke="${P_DARK}" stroke-width="2.4" stroke-linecap="round"/>
                       <path d="M 86 52 Q 92 68 88 76 M 112 52 Q 108 68 114 76" fill="none" stroke="${P_DARK}" stroke-width="1.8" stroke-linecap="round"/>`
          },
          {
            name: '포근한 복슬 히피펌',
            backSvg: `<path d="M 38 80 Q 24 95 34 115 Q 22 135 34 155 Q 28 172 48 176 L 152 176 Q 172 172 166 155 Q 178 135 166 115 Q 176 95 162 80 Z" fill="#44403c" stroke="${P_DARK}" stroke-width="2.6"/>`,
            frontSvg: `<path d="M 42 86 Q 38 60 58 46 Q 80 32 100 40 Q 120 32 142 46 Q 162 60 158 86 Q 142 68 128 74 Q 114 62 100 74 Q 86 62 72 74 Q 58 68 42 86 Z" fill="#44403c" stroke="${P_DARK}" stroke-width="2.6"/>
                       <path d="M 65 52 Q 72 62 66 70 M 100 45 Q 106 56 98 66 M 135 52 Q 128 62 134 70" stroke="#a8a29e" stroke-width="1.4" fill="none"/>`
          },
          {
            name: '차분한 풀뱅 스트레이트',
            backSvg: `<path d="M 40 70 C 32 18, 168 18, 160 70 L 164 180 L 36 180 L 40 70 Z" fill="#292524" stroke="${P_DARK}" stroke-width="2.6"/>
                       <path d="M 46 110 L 44 165 M 154 110 L 156 165" stroke="#57534e" stroke-width="1.2" fill="none"/>`,
            frontSvg: `<path d="M 40 85 C 34 20, 68 18, 100 19 C 132 18, 166 20, 160 85 L 148 76 L 144 135 L 136 75 L 64 75 L 56 135 L 52 76 Z" fill="#292524" stroke="${P_DARK}" stroke-width="2.4" stroke-linejoin="round"/>
                       <line x1="78" y1="48" x2="76" y2="74" stroke="#78716c" stroke-width="1.3"/>
                       <line x1="100" y1="46" x2="100" y2="74" stroke="#78716c" stroke-width="1.3"/>
                       <line x1="122" y1="48" x2="124" y2="74" stroke="#78716c" stroke-width="1.3"/>
                       <path d="M 60 26 Q 80 34 100 32 Q 120 34 140 26" stroke="#57534e" stroke-width="1.3" fill="none"/>`
          }
        ]
      },

      // 3단계: 눈매·눈썹 (6종 - 섬세한 연필 인물화 눈동자와 속눈썹)
      {
        id: 'eyes',
        title: '<눈매·눈썹>',
        items: [
          {
            name: '맑고 깊은 사슴 눈망울',
            svg: `<g stroke="${P_DARK}" fill="none" stroke-linecap="round">
              <!-- 눈썹 -->
              <path d="M 62 78 Q 75 73 86 77" stroke-width="2.4"/>
              <path d="M 114 77 Q 125 73 138 78" stroke-width="2.4"/>
              <!-- 쌍꺼풀 라인 -->
              <path d="M 64 85 Q 75 80 85 85" stroke-width="1.2" stroke="${P_MID}"/>
              <path d="M 115 85 Q 125 80 136 85" stroke-width="1.2" stroke="${P_MID}"/>
              <!-- 눈 외곽선 -->
              <path d="M 62 91 Q 75 81 87 91 Q 75 98 62 91 Z" fill="#fff" stroke-width="2.2"/>
              <path d="M 113 91 Q 125 81 138 91 Q 125 98 113 91 Z" fill="#fff" stroke-width="2.2"/>
              <!-- 연필 해칭 눈동자 + 하이라이트 -->
              <circle cx="75" cy="90" r="5.5" fill="${P_DARK}"/>
              <circle cx="125" cy="90" r="5.5" fill="${P_DARK}"/>
              <circle cx="73" cy="88" r="1.8" fill="#fff" stroke="none"/>
              <circle cx="123" cy="88" r="1.8" fill="#fff" stroke="none"/>
            </g>`
          },
          {
            name: '다정한 반달 눈웃음',
            svg: `<g stroke="${P_DARK}" fill="none" stroke-linecap="round">
              <path d="M 63 79 Q 75 74 86 79" stroke-width="2.2"/>
              <path d="M 114 79 Q 125 74 137 79" stroke-width="2.2"/>
              <path d="M 62 91 Q 75 81 88 91" stroke-width="3"/>
              <path d="M 112 91 Q 125 81 138 91" stroke-width="3"/>
              <path d="M 66 94 Q 75 97 84 94" stroke-width="1.2" stroke="${P_MID}"/>
              <path d="M 116 94 Q 125 97 134 94" stroke-width="1.2" stroke="${P_MID}"/>
            </g>`
          },
          {
            name: '지적인 고양이 눈매',
            svg: `<g stroke="${P_DARK}" fill="none" stroke-linecap="round">
              <path d="M 62 79 L 86 75" stroke-width="2.4"/>
              <path d="M 114 75 L 138 79" stroke-width="2.4"/>
              <path d="M 60 89 Q 74 82 87 91 Q 73 96 60 89 Z" fill="#fff" stroke-width="2.4"/>
              <path d="M 140 89 Q 126 82 113 91 Q 127 96 140 89 Z" fill="#fff" stroke-width="2.4"/>
              <path d="M 57 87 L 62 89 M 143 87 L 138 89" stroke-width="2.5"/>
              <circle cx="74" cy="89" r="4.8" fill="${P_DARK}"/>
              <circle cx="126" cy="89" r="4.8" fill="${P_DARK}"/>
              <circle cx="72.5" cy="87.5" r="1.5" fill="#fff" stroke="none"/>
              <circle cx="124.5" cy="87.5" r="1.5" fill="#fff" stroke="none"/>
            </g>`
          },
          {
            name: '나른한 문학청년 눈빛',
            svg: `<g stroke="${P_DARK}" fill="none" stroke-linecap="round">
              <path d="M 62 77 Q 75 76 86 78" stroke-width="2.2"/>
              <path d="M 114 78 Q 125 76 138 77" stroke-width="2.2"/>
              <!-- 반쯤 감긴 눈꺼풀 -->
              <line x1="61" y1="88" x2="88" y2="88" stroke-width="2.6"/>
              <line x1="112" y1="88" x2="139" y2="88" stroke-width="2.6"/>
              <path d="M 63 88 C 65 96, 85 96, 87 88" fill="#fff" stroke-width="1.8"/>
              <path d="M 113 88 C 115 96, 135 96, 137 88" fill="#fff" stroke-width="1.8"/>
              <circle cx="75" cy="90" r="4.2" fill="${P_DARK}"/>
              <circle cx="125" cy="90" r="4.2" fill="${P_DARK}"/>
              <!-- 살짝 피곤한 애교살/다크서클 해칭 -->
              <path d="M 66 98 Q 75 101 84 98 M 116 98 Q 125 101 134 98" stroke="${P_MID}" stroke-width="1.1"/>
            </g>`
          },
          {
            name: '초롱초롱 탐구형 눈매',
            svg: `<g stroke="${P_DARK}" fill="none" stroke-linecap="round">
              <path d="M 61 76 Q 74 70 87 76" stroke-width="2.5"/>
              <path d="M 113 76 Q 126 70 139 76" stroke-width="2.5"/>
              <ellipse cx="75" cy="90" rx="12" ry="9" fill="#fff" stroke-width="2.4"/>
              <ellipse cx="125" cy="90" rx="12" ry="9" fill="#fff" stroke-width="2.4"/>
              <circle cx="75" cy="90" r="6.2" fill="${P_DARK}"/>
              <circle cx="125" cy="90" r="6.2" fill="${P_DARK}"/>
              <circle cx="72.5" cy="87.5" r="2.2" fill="#fff" stroke="none"/>
              <circle cx="122.5" cy="87.5" r="2.2" fill="#fff" stroke="none"/>
              <circle cx="77.5" cy="92.5" r="1" fill="#fff" stroke="none"/>
              <circle cx="127.5" cy="92.5" r="1" fill="#fff" stroke="none"/>
            </g>`
          },
          {
            name: '담백한 무쌍 크로키 눈',
            svg: `<g stroke="${P_DARK}" fill="none" stroke-linecap="round">
              <path d="M 60 77 L 87 76" stroke-width="2.6"/>
              <path d="M 113 76 L 140 77" stroke-width="2.6"/>
              <path d="M 61 90 Q 74 84 87 91 Q 74 95 61 90 Z" fill="#fff" stroke-width="2.3"/>
              <path d="M 113 91 Q 126 84 139 90 Q 126 95 113 91 Z" fill="#fff" stroke-width="2.3"/>
              <circle cx="74" cy="90" r="4.5" fill="${P_DARK}"/>
              <circle cx="126" cy="90" r="4.5" fill="${P_DARK}"/>
              <circle cx="73" cy="88.5" r="1.4" fill="#fff" stroke="none"/>
              <circle cx="125" cy="88.5" r="1.4" fill="#fff" stroke="none"/>
            </g>`
          }
        ]
      },

      // 4단계: 코·안경·무드 (6종 - 스케치 코 + 긱시크 안경/연필 볼터치/점 등)
      {
        id: 'nose',
        title: '<코·안경·무드>',
        items: [
          {
            name: '클래식 연필 음영 코',
            svg: `<g stroke="${P_DARK}" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M 99 94 L 96 112 L 103 114" stroke-width="2.2"/>
              <path d="M 96 112 L 101 116 L 105 113" fill="${P_SHADE}" stroke="none"/>
            </g>`
          },
          {
            name: '긱시크 볼드 뿔테안경',
            svg: `<g stroke="${P_DARK}" fill="none" stroke-linecap="round">
              <!-- 코 -->
              <path d="M 100 96 L 97 112 L 103 113" stroke-width="2"/>
              <!-- 뿔테안경 -->
              <rect x="55" y="79" width="36" height="23" rx="5" fill="rgba(255,255,255,0.35)" stroke-width="3.6"/>
              <rect x="109" y="79" width="36" height="23" rx="5" fill="rgba(255,255,255,0.35)" stroke-width="3.6"/>
              <path d="M 91 88 Q 100 85 109 88" stroke-width="3.2"/>
              <line x1="52" y1="86" x2="55" y2="86" stroke-width="3"/>
              <line x1="145" y1="86" x2="148" y2="86" stroke-width="3"/>
              <!-- 렌즈 빛 반사 연필선 -->
              <line x1="60" y1="97" x2="67" y2="83" stroke="#a8a29e" stroke-width="1.5"/>
              <line x1="114" y1="97" x2="121" y2="83" stroke="#a8a29e" stroke-width="1.5"/>
            </g>`
          },
          {
            name: '빈티지 동그란 금테안경',
            svg: `<g stroke="${P_DARK}" fill="none" stroke-linecap="round">
              <path d="M 99 96 Q 95 111 103 113" stroke-width="2"/>
              <circle cx="74" cy="90" r="17" fill="rgba(255,255,255,0.25)" stroke="#44403c" stroke-width="2"/>
              <circle cx="126" cy="90" r="17" fill="rgba(255,255,255,0.25)" stroke="#44403c" stroke-width="2"/>
              <path d="M 91 90 Q 100 86 109 90" stroke="#44403c" stroke-width="1.8"/>
              <line x1="52" y1="89" x2="57" y2="89" stroke="#44403c" stroke-width="1.8"/>
              <line x1="143" y1="89" x2="148" y2="89" stroke="#44403c" stroke-width="1.8"/>
            </g>`
          },
          {
            name: '발그레 사선 연필 볼터치',
            svg: `<g stroke-linecap="round">
              <path d="M 100 97 L 97 111 L 103 113" fill="none" stroke="${P_DARK}" stroke-width="2.1"/>
              <!-- 연필 빗금 볼터치 -->
              <g stroke="#d9776c" stroke-width="1.6" opacity="0.75">
                <line x1="58" y1="108" x2="63" y2="101"/><line x1="63" y1="109" x2="68" y2="102"/><line x1="68" y1="109" x2="73" y2="102"/><line x1="73" y1="108" x2="77" y2="102"/>
                <line x1="123" y1="108" x2="128" y2="101"/><line x1="128" y1="109" x2="133" y2="102"/><line x1="133" y1="109" x2="138" y2="102"/><line x1="138" y1="108" x2="142" y2="102"/>
              </g>
            </g>`
          },
          {
            name: '무테 안경 & 눈밑 매력점',
            svg: `<g stroke="${P_DARK}" fill="none" stroke-linecap="round">
              <path d="M 99 95 L 96 112 L 102 113" stroke-width="2.1"/>
              <!-- 하프림/무테 긱시크 안경 -->
              <path d="M 57 90 C 57 102, 89 102, 89 90" stroke-width="1.8"/>
              <path d="M 111 90 C 111 102, 143 102, 143 90" stroke-width="1.8"/>
              <line x1="89" y1="89" x2="111" y2="89" stroke-width="1.8"/>
              <!-- 눈밑 매력점 -->
              <circle cx="84" cy="101" r="1.6" fill="${P_DARK}" stroke="none"/>
            </g>`
          },
          {
            name: '말괄량이 주근깨 스케치',
            svg: `<g stroke="${P_DARK}" fill="none" stroke-linecap="round">
              <path d="M 99 98 Q 95 110 103 112" stroke-width="2.2"/>
              <g fill="${P_MID}" stroke="none">
                <circle cx="64" cy="105" r="1.2"/><circle cx="70" cy="108" r="1.2"/><circle cx="75" cy="104" r="1.2"/><circle cx="67" cy="102" r="1"/>
                <circle cx="125" cy="104" r="1.2"/><circle cx="130" cy="108" r="1.2"/><circle cx="136" cy="105" r="1.2"/><circle cx="133" cy="102" r="1"/>
              </g>
            </g>`
          }
        ]
      },

      // 5단계: 입모양·표정 (6종)
      {
        id: 'mouth',
        title: '<입모양·표정>',
        items: [
          {
            name: '다정한 미소',
            svg: `<g stroke="${P_DARK}" fill="none" stroke-linecap="round">
              <path d="M 86 128 Q 100 137 114 128" stroke-width="2.4"/>
              <path d="M 84 126 Q 86 128 87 130 M 116 126 Q 114 128 113 130" stroke-width="1.5"/>
              <path d="M 95 135 Q 100 137 105 135" stroke="${P_MID}" stroke-width="1.2"/>
            </g>`
          },
          {
            name: '장난기 가득 씨익',
            svg: `<g stroke="${P_DARK}" fill="none" stroke-linecap="round">
              <path d="M 85 129 Q 102 135 117 124" stroke-width="2.5"/>
              <path d="M 115 121 Q 118 124 117 128" stroke-width="1.8"/>
              <path d="M 96 135 Q 102 136 107 134" stroke="${P_MID}" stroke-width="1.2"/>
            </g>`
          },
          {
            name: '차분한 독서 몰입 입매',
            svg: `<g stroke="${P_DARK}" fill="none" stroke-linecap="round">
              <path d="M 89 129 Q 95 127 100 129 Q 105 127 111 129" stroke-width="2.2"/>
              <path d="M 95 134 Q 100 136 105 134" stroke="${P_MID}" stroke-width="1.3"/>
            </g>`
          },
          {
            name: '귀여운 뾰로통 입술',
            svg: `<g stroke="${P_DARK}" fill="none" stroke-linecap="round">
              <path d="M 91 128 Q 100 124 109 128" stroke-width="2.3"/>
              <path d="M 93 133 Q 100 136 107 133" stroke="#78716c" stroke-width="1.8"/>
            </g>`
          },
          {
            name: '해맑은 함박웃음',
            svg: `<g stroke="${P_DARK}" stroke-linecap="round" stroke-linejoin="round">
              <path d="M 84 125 Q 100 128 116 125 C 115 141, 85 141, 84 125 Z" fill="#fff" stroke-width="2.2"/>
              <path d="M 88 133 Q 100 129 112 133 C 109 139, 91 139, 88 133 Z" fill="#c27870" stroke="none"/>
            </g>`
          },
          {
            name: '커피 한 모금 / 호기심',
            svg: `<g stroke="${P_DARK}" fill="#57534e" stroke-linecap="round">
              <ellipse cx="100" cy="130" rx="5.5" ry="4.5" stroke-width="2.2"/>
              <path d="M 96 137 Q 100 139 104 137" fill="none" stroke="${P_MID}" stroke-width="1.2"/>
            </g>`
          }
        ]
      },

      // 6단계: 프레피룩·소품 (6종 - 플라스크 연구원 제거 & 독서모임/새학기/수학여행 테마 강화)
      {
        id: 'body',
        title: '<프레피·소품>',
        items: [
          {
            name: '클래식 프레피 니트 & 타이',
            svg: `<g stroke="${P_DARK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <!-- 어깨 및 니트 베스트 -->
              <path d="M 42 218 L 48 174 L 78 166 L 100 198 L 122 166 L 152 174 L 158 218 Z" fill="#3f3b37"/>
              <!-- 셔츠 칼라 -->
              <path d="M 78 166 L 100 198 L 122 166 L 112 162 L 100 176 L 88 162 Z" fill="#ffffff"/>
              <!-- 스트라이프 넥타이 -->
              <path d="M 96 175 L 104 175 L 106 205 L 100 212 L 94 205 Z" fill="#7f1d1d"/>
              <!-- 니트 V넥 라인 디테일 -->
              <path d="M 74 168 L 100 205 L 126 168" fill="none" stroke="#d6d3cd" stroke-width="1.8"/>
            </g>`
          },
          {
            name: '단정한 체크 블레이저 자켓',
            svg: `<g stroke="${P_DARK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M 38 218 L 45 172 L 78 165 L 122 165 L 155 172 L 162 218 Z" fill="#d6d0c4"/>
              <!-- 안쪽 셔츠 및 리본/보타이 -->
              <path d="M 80 165 L 100 206 L 120 165 Z" fill="#ffffff"/>
              <!-- 자켓 라펠(깃) -->
              <path d="M 78 165 L 66 190 L 82 195 L 100 212" fill="none" stroke-width="2.2"/>
              <path d="M 122 165 L 134 190 L 118 195 L 100 212" fill="none" stroke-width="2.2"/>
              <!-- 체크무늬 연필 선 -->
              <line x1="55" y1="172" x2="52" y2="218" stroke="${P_MID}" stroke-width="1" opacity="0.5"/>
              <line x1="145" y1="172" x2="148" y2="218" stroke="${P_MID}" stroke-width="1" opacity="0.5"/>
              <line x1="42" y1="195" x2="78" y2="195" stroke="${P_MID}" stroke-width="1" opacity="0.5"/>
              <line x1="122" y1="195" x2="158" y2="195" stroke="${P_MID}" stroke-width="1" opacity="0.5"/>
            </g>`
          },
          {
            name: '포근한 겨울 머플러 & 코트',
            svg: `<g stroke="${P_DARK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M 40 218 L 46 174 L 154 174 L 160 218 Z" fill="#57534e"/>
              <!-- 도톰한 목도리 -->
              <path d="M 66 160 C 66 184, 134 184, 134 160 C 138 172, 136 188, 126 190 L 74 190 C 64 188, 62 172, 66 160 Z" fill="#e7e0d3"/>
              <path d="M 106 182 L 104 216 L 126 216 L 124 182 Z" fill="#e7e0d3"/>
              <!-- 목도리 체크 해칭 -->
              <line x1="80" y1="168" x2="80" y2="190" stroke="${P_MID}" stroke-width="1.3"/>
              <line x1="100" y1="170" x2="100" y2="190" stroke="${P_MID}" stroke-width="1.3"/>
              <line x1="115" y1="198" x2="115" y2="215" stroke="${P_MID}" stroke-width="1.3"/>
            </g>`
          },
          {
            name: '두꺼운 애장서 품에 안기',
            svg: `<g stroke="${P_DARK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M 42 218 L 48 172 L 78 166 L 122 166 L 152 172 L 158 218 Z" fill="#e5e0d5"/>
              <!-- 품에 안은 양장본 책 -->
              <rect x="68" y="175" width="64" height="42" rx="3" fill="#44403c"/>
              <rect x="72" y="179" width="56" height="34" fill="#faf8f2" stroke-width="1.5"/>
              <line x1="100" y1="175" x2="100" y2="217" stroke-width="2.5"/>
              <!-- 책을 감싸 쥔 양손 -->
              <ellipse cx="70" cy="198" rx="7" ry="5" fill="${P_PAPER}"/>
              <ellipse cx="130" cy="198" rx="7" ry="5" fill="${P_PAPER}"/>
            </g>`
          },
          {
            name: '따뜻한 드립커피와 독서',
            svg: `<g stroke="${P_DARK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <!-- 터틀넥 스웨터 -->
              <path d="M 42 218 L 48 174 L 76 166 L 124 166 L 152 174 L 158 218 Z" fill="#292524"/>
              <path d="M 76 158 L 124 158 L 126 172 L 74 172 Z" fill="#3f3b37"/>
              <!-- 머그컵과 김 -->
              <rect x="112" y="180" width="24" height="28" rx="3" fill="#faf8f2"/>
              <path d="M 136 185 C 144 185, 144 200, 136 200" fill="none" stroke-width="2.4"/>
              <path d="M 120 174 Q 118 168 122 164 M 128 174 Q 126 168 130 164" fill="none" stroke="#a8a29e" stroke-width="1.5"/>
            </g>`
          },
          {
            name: '수학여행 스트라이프 파자마',
            svg: `<g stroke="${P_DARK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M 42 218 L 48 172 L 78 165 L 100 185 L 122 165 L 152 172 L 158 218 Z" fill="#f5f2eb"/>
              <!-- 파자마 세로 줄무늬 -->
              <line x1="60" y1="170" x2="56" y2="218" stroke="#78716c" stroke-width="2"/>
              <line x1="76" y1="166" x2="74" y2="218" stroke="#78716c" stroke-width="2"/>
              <line x1="124" y1="166" x2="126" y2="218" stroke="#78716c" stroke-width="2"/>
              <line x1="140" y1="170" x2="144" y2="218" stroke="#78716c" stroke-width="2"/>
              <!-- 파자마 깃 & 단추 -->
              <path d="M 78 165 L 68 182 L 94 186 L 100 185 L 106 186 L 132 182 L 122 165" fill="none"/>
              <circle cx="100" cy="196" r="2" fill="${P_DARK}"/>
              <circle cx="100" cy="208" r="2" fill="${P_DARK}"/>
            </g>`
          }
        ]
      }
    ];
