/**
 * ==============================================================================
 * 2026 플래닛 독서학교 연말모임 - 구글 시트 실시간 연동 Apps Script
 * ==============================================================================
 * 
 * [구글 시트 탭 구성]:
 * 1. [시트1] (신청자 명단 - 자동 등록):
 *    A열: 이름 | B열: 연락처 | C열: 참석세션 | D열: 도서제목 | E열: 회비 | F열: 회비납부여부 | G열: 조배치 | H열: 기존회원 | I열: 반뱃지 | J열: 학번 | K열: 아바타코드 | L열: 아바타코디요약 | M열: 새학기한마디 | N열: 메모사항 | O열: 접수일시
 * 
 * 2. [시트2] (정산 내역 - 운영진 직접 입력):
 *    A열: 구분 | B열: 항목 및 세부내용 | C열: 거래처 | D열: 일자 | E열: 금액 | F열: 증빙(영수증 URL 또는 번호)
 * 
 * [설치 및 배포 방법]:
 * 1. 구글 스프레드시트 상단 메뉴 [확장 프로그램] > [Apps Script] 클릭
 * 2. 기존 코드를 모두 지우고 본 파일의 코드를 복사하여 붙여넣기 (Ctrl + A -> Ctrl + V)
 * 3. 상단 [저장] 아이콘(디스켓) 클릭
 * 4. 우측 상단 파란색 [배포] 버튼 > [새 배포] 클릭
 * 5. 톱니바퀴 아이콘 클릭 > [웹 앱] 선택
 * 6. 설정:
 *    - 설명: 2026 플래닛 연말모임 신청 및 정산 연동 (아바타 데이터 포함 v3)
 *    - 다음 사용자로 실행: 나 (your-email@gmail.com)
 *    - 액세스 권한이 있는 사용자: 모든 사용자 (Anyone)  <-- ★ 반드시 '모든 사용자'로 선택
 * 7. [배포] 클릭 후 승인 절차(고급 > ...으로 이동) 완료
 * 8. 생성된 "웹 앱 URL" 복사 후 환경변수에 적용
 * ==============================================================================
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    // 1번째 시트(신청자 명단) 명시적 타겟팅 (시트2가 활성화되어 있어도 안전하게 시트1에 기록)
    var sheet = ss.getSheetByName('시트1') || ss.getSheetByName('신청자명단') || ss.getSheetByName('Sheet1') || ss.getSheets()[0];
    var data = {};
    
    // 시트가 완전히 비어있는 경우 1행 헤더 자동 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        '이름', '연락처', '참석세션', '도서제목', '회비', '회비납부여부', 
        '조배치', '기존회원', '반뱃지', '학번', '아바타코드', '아바타코디요약', '새학기한마디', '메모사항', '접수일시'
      ]);
    }
    
    // 1. 요청 데이터 파싱 (JSON 또는 파라미터)
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    // 봇 스팸 차단 (허니팟 필드 체크)
    if (data.hp_check && data.hp_check.trim() !== '') {
      return ContentService.createTextOutput(JSON.stringify({ status: 'ignored' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. 컬럼 매핑 데이터 추출
    var name = data.name || data.cleanName || '';
    var phone = data.phone || '';
    var session = data.session || data.sessionLabel || '';
    var bookTitle = data.bookTitle || data.bookHint || '(선물 책 준비 중)';
    var fee = data.fee || data.totalFee || 0;
    var paymentStatus = data.paymentStatus || '입금 대기';
    var seatGroup = data.seatGroup || data.group || '';
    var existingMember = data.existingMember || data.fellowType || ''; // H열: 운영진 조배치용 기존회원 여부
    var badge = data.badge || data.memberType || '';                  // I열: 학우 선택 반 뱃지
    var studentNumber = data.studentNumber || '';
    var avatarCode = data.avatarCode || data.croquisCode || '';
    var avatarRecipe = data.avatarRecipe || data.recipe || '';
    var motto = data.motto || data.새학기한마디 || '';
    var memo = data.memo || data.메모사항 || '';
    var submittedAt = data.submittedAt || new Date().toLocaleString('ko-KR');

    // 필수 항목 누락 시 처리
    if (!name || !phone) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Missing required fields' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 중복 학번(동일 요청 2회 도달) 방지 체크
    if (studentNumber && sheet.getLastRow() > 1) {
      var existingValues = sheet.getDataRange().getValues();
      for (var rIdx = 1; rIdx < existingValues.length; rIdx++) {
        if (String(existingValues[rIdx][9] || '') === String(studentNumber)) {
          return ContentService.createTextOutput(JSON.stringify({ status: 'duplicate_ignored', name: name }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // 3. 구글 시트 행 추가:
    // [이름, 연락처, 참석세션, 도서제목, 회비, 회비납부여부, 조배치, 기존회원, 반뱃지, 학번, 아바타코드, 아바타코디요약, 새학기한마디, 메모사항, 접수일시]
    sheet.appendRow([
      name,
      phone,
      session,
      bookTitle,
      fee,
      paymentStatus,
      seatGroup,
      existingMember,
      badge,
      studentNumber,
      avatarCode,
      avatarRecipe,
      motto,
      memo,
      submittedAt
    ]);

    // 성공 응답 반환
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'success', 
      name: name,
      message: '등록이 정상 완료되었습니다.' 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// GET 요청: 구글 시트 데이터 조회 API (신청자 명단 및 정산 내역)
function doGet(e) {
  try {
    var params = e ? (e.parameter || {}) : {};
    var action = String(params.action || '').trim();
    var token = String(params.token || '').trim();
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // -------------------------------------------------------------
    // [0] 시트 상태 진단 API (운영 점검용: 시트 탭 목록, 행 수, 최근 등록 현황)
    // URL 예: ?action=inspect&token=2099
    // -------------------------------------------------------------
    if (action === 'inspect') {
      var sheets = ss.getSheets();
      var sheetInfos = sheets.map(function(s) {
        return {
          name: s.getName(),
          lastRow: s.getLastRow(),
          lastColumn: s.getLastColumn()
        };
      });

      var targetSheet = ss.getSheetByName('시트1') || ss.getSheetByName('신청자명단') || ss.getSheetByName('Sheet1') || sheets[0];
      var rawRows = targetSheet.getDataRange().getValues();
      var recentRows = rawRows.slice(Math.max(1, rawRows.length - 5));

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        spreadsheetName: ss.getName(),
        spreadsheetUrl: ss.getUrl(),
        targetSheetName: targetSheet.getName(),
        totalRows: targetSheet.getLastRow(),
        sheets: sheetInfos,
        headers: rawRows.length > 0 ? rawRows[0] : [],
        recentSample: recentRows
      }, null, 2)).setMimeType(ContentService.MimeType.JSON);
    }

    // -------------------------------------------------------------
    // [0-1] GET 방식 참가 신청 등록 지원 (어떠한 브라우저 CORS 문제도 100% 회피)
    // URL 예: ?action=register&name=...&phone=...
    // -------------------------------------------------------------
    if (action === 'register') {
      var applicantSheet = ss.getSheetByName('시트1') || 
                           ss.getSheetByName('신청자명단') || 
                           ss.getSheetByName('Sheet1') || 
                           ss.getSheets()[0];

      if (applicantSheet.getLastRow() === 0) {
        applicantSheet.appendRow([
          '이름', '연락처', '참석세션', '도서제목', '회비', '회비납부여부', 
          '조배치', '기존회원', '반뱃지', '학번', '아바타코드', '아바타코디요약', '새학기한마디', '메모사항', '접수일시'
        ]);
      }

      var regName = params.name || params.cleanName || '';
      var regPhone = params.phone || '';
      if (!regName || !regPhone) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: '이름과 연락처가 필요합니다.' }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      applicantSheet.appendRow([
        regName,
        regPhone,
        params.session || params.sessionLabel || '',
        params.bookTitle || params.bookHint || '(선물 책 준비 중)',
        params.fee || params.totalFee || 0,
        params.paymentStatus || '입금 대기',
        params.seatGroup || '',
        params.existingMember || '',
        params.badge || params.memberType || '',
        params.studentNumber || '',
        params.avatarCode || params.croquisCode || '',
        params.avatarRecipe || params.recipe || '',
        params.motto || params.새학기한마디 || '',
        params.memo || params.메모사항 || '',
        new Date().toLocaleString('ko-KR')
      ]);

      return ContentService.createTextOutput(JSON.stringify({ 
        status: 'success', 
        name: regName,
        message: 'GET 방식으로 등록 완료되었습니다.' 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // -------------------------------------------------------------
    // [1] 정산 내역 조회 (시트2)
    // URL 파라미터 예: ?action=get_settlement
    // -------------------------------------------------------------
    if (action === 'get_settlement') {
      var settlementSheet = ss.getSheetByName('시트2') || 
                            ss.getSheetByName('정산내역') || 
                            ss.getSheetByName('결산') || 
                            ss.getSheetByName('Sheet2') || 
                            (ss.getSheets().length > 1 ? ss.getSheets()[1] : null);

      if (!settlementSheet) {
        return ContentService.createTextOutput(JSON.stringify({ 
          success: false, 
          error: '시트2를 찾을 수 없습니다.', 
          data: [] 
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var rows = settlementSheet.getDataRange().getValues();
      if (rows.length <= 1) {
        return ContentService.createTextOutput(JSON.stringify({ 
          success: true, 
          count: 0, 
          data: [] 
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var headers = rows[0].map(function(h) { return String(h).trim(); });
      var data = [];

      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        // 빈 행 체크 (구분이나 항목 내용이 있는 행만 처리)
        var rowStr = row.join('').trim();
        if (rowStr === '') continue;

        var item = { id: 'SETTLE_' + i };
        headers.forEach(function(h, cIdx) {
          item[h] = row[cIdx];
        });
        data.push(item);
      }

      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        count: data.length, 
        data: data 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // -------------------------------------------------------------
    // [2] 신청자 명단 조회 (시트1 - 관리자 인증 토큰 필수)
    // URL 파라미터 예: ?action=admin_get_all&token=2099
    // -------------------------------------------------------------
    if (token !== '2099' && token !== '1aaf97e300d50bacc554c8c27a1b9687dde34e6754b8de3759dd0ab844477e37' && token !== 'c0dbfc724e52834b6e511470ce22619bfdc84e7240c5e7b57bf10bbcd1cf4ee8') {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Unauthorized: 유효한 관리자 인증 토큰이 필요합니다.',
        data: [] 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var applicantSheet = ss.getSheetByName('시트1') || 
                         ss.getSheetByName('신청자명단') || 
                         ss.getSheetByName('Sheet1') || 
                         ss.getSheets()[0];

    var rows = applicantSheet.getDataRange().getValues();
    if (rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        count: 0, 
        data: [] 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var headers = rows[0].map(function(h) { return String(h).trim(); });
    var data = rows.slice(1).filter(function(r) {
      return String(r[0] || '').trim() !== ''; // 이름 빈칸 제외
    }).map(function(row, idx) {
      var item = { id: idx + 1 };
      headers.forEach(function(h, cIdx) {
        item[h] = row[cIdx];
      });
      return item;
    });

    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      count: data.length, 
      data: data 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: err.toString(), 
      data: [] 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

