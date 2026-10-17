/**
 * ==============================================================================
 * 2026 플래닛 독서학교 연말모임 - 구글 시트 실시간 연동 Apps Script
 * ==============================================================================
 * 
 * [구글 시트 컬럼 구성 (1행 헤더)]:
 * A열: 이름
 * B열: 연락처
 * C열: 참석세션
 * D열: 도서제목
 * E열: 회비
 * F열: 회비납부여부
 * 
 * [설치 및 배포 방법]:
 * 1. 구글 스프레드시트 상단 메뉴 [확장 프로그램] > [Apps Script] 클릭
 * 2. 기존 코드를 모두 지우고 본 파일의 코드를 복사하여 붙여넣기 (Ctrl + A -> Ctrl + V)
 * 3. 상단 [저장] 아이콘(디스켓) 클릭
 * 4. 우측 상단 파란색 [배포] 버튼 > [새 배포] 클릭
 * 5. 톱니바퀴 아이콘 클릭 > [웹 앱] 선택
 * 6. 설정:
 *    - 설명: 2026 플래닛 연말모임 신청 접수
 *    - 다음 사용자로 실행: 나 (your-email@gmail.com)
 *    - 액세스 권한이 있는 사용자: 모든 사용자 (Anyone)  <-- ★ 반드시 '모든 사용자'로 선택
 * 7. [배포] 클릭 후 승인 절차(고급 > ...으로 이동) 완료
 * 8. 생성된 "웹 앱 URL" (https://script.google.com/macros/s/.../exec) 복사
 * ==============================================================================
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};
    
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
    var bookTitle = data.bookTitle || data.bookHint || '(미정)';
    var fee = data.fee || data.totalFee || 0;
    var paymentStatus = data.paymentStatus || '입금 대기';

    // 필수 항목 누락 시 처리
    if (!name || !phone) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Missing required fields' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. 구글 시트 행 추가: [이름, 연락처, 참석세션, 도서제목, 회비, 회비납부여부]
    sheet.appendRow([
      name,
      phone,
      session,
      bookTitle,
      fee,
      paymentStatus
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

// GET 요청 테스트용
function doGet(e) {
  return ContentService.createTextOutput("2026 플래닛 독서학교 RSVP API 정상 작동 중");
}
