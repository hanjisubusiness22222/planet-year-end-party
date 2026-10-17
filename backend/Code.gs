/**
 * 🏛️ 2026 플래닛 연말 갈라 보안 Google Apps Script 백엔드
 * 
 * [보안 기능 탑재]
 * 1. 관리자 토큰 검증: 관리자 키(ADMIN_SECRET_KEY) 없이 GET 요청 시 민감 개인정보(PII) 조회 불가
 * 2. 봇 차단 허니팟(Honeypot): 봇이 보이지 않는 가짜 필드(hp_check)를 채우면 즉시 드롭
 * 3. 전화번호 중복 등록 차단 & 입력값 살균(Sanitization)
 * 4. 시트별 권한 분리: [신청자명단], [사전알림], [회계정산]
 */

// ★ 관리자 접속 시 검증할 비밀 토큰 (GitHub Secrets의 VITE_ADMIN_PASSWORD 해시와 연동)
const ADMIN_SECRET_KEY = "c0dbfc724e52834b6e511470ce22619bfdc84e7240c5e7b57bf10bbcd1cf4ee8";

/**
 * GET 요청 처리 (데이터 조회)
 * - 관리자 인증 키가 있으면: 전체 원본 데이터(전화번호 포함) 반환
 * - 일반 요청일 경우: 전화번호 완전 마스킹된 안전 데이터만 반환 (또는 403 차단)
 */
function doGet(e) {
  try {
    const params = e.parameter || {};
    const action = params.action || "get_public";
    const token = params.token || "";
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. 관리자 데이터 조회 요청
    if (action === "admin_get_all") {
      if (token !== ADMIN_SECRET_KEY) {
        return createJsonResponse({ 
          success: false, 
          error: "Unauthorized: 관리자 인증 토큰이 올바르지 않습니다." 
        }, 403);
      }
      
      const sheet = ss.getSheetByName("신청자명단");
      if (!sheet) return createJsonResponse({ success: true, data: [] });
      
      const rows = sheet.getDataRange().getValues();
      if (rows.length <= 1) return createJsonResponse({ success: true, data: [] });
      
      const headers = rows[0];
      const data = rows.slice(1).map((row, index) => {
        const item = { id: index + 1 };
        headers.forEach((header, colIndex) => {
          item[header] = row[colIndex];
        });
        return item;
      });
      
      return createJsonResponse({ success: true, data: data });
    }
    
    // 2. 일반 공개용 조배치/정산 데이터 (민감 정보 완전 배제)
    if (action === "get_public") {
      const sheet = ss.getSheetByName("신청자명단");
      if (!sheet) return createJsonResponse({ success: true, data: [] });
      
      const rows = sheet.getDataRange().getValues();
      if (rows.length <= 1) return createJsonResponse({ success: true, data: [] });
      
      // 일반인에게는 이름(마스킹), 성별, 구분, 참석 세션, 조 번호만 반환 (전화번호, 입금내역 배제)
      const publicData = rows.slice(1).map(row => ({
        name: maskName(String(row[1])),
        gender: row[2],
        fellowType: row[3],
        session1: row[5],
        session2: row[6],
        houseGroup: row[9] || 0
      }));
      
      return createJsonResponse({ success: true, data: publicData });
    }
    
    // 3. 정산 내역 공개 데이터
    if (action === "get_settlement") {
      const sheet = ss.getSheetByName("회계정산");
      if (!sheet) return createJsonResponse({ success: true, data: [] });
      
      const rows = sheet.getDataRange().getValues();
      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        const item = {};
        headers.forEach((h, i) => { item[h] = row[i]; });
        return item;
      });
      return createJsonResponse({ success: true, data: data });
    }
    
    return createJsonResponse({ success: false, error: "Invalid action" }, 400);

  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() }, 500);
  }
}

/**
 * POST 요청 처리 (신청서 등록 및 관리자 상태 업데이트)
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action || "register";
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. [보안 봇 필터링] 허니팟 검증: 숨겨진 필드에 값이 있으면 즉시 거부
    if (postData.hp_check && postData.hp_check.trim() !== "") {
      return createJsonResponse({ success: false, error: "Bot detected" }, 400);
    }

    // 2. 사전 오픈 알림 등록
    if (action === "early_notify") {
      let sheet = ss.getSheetByName("사전알림");
      if (!sheet) {
        sheet = ss.insertSheet("사전알림");
        sheet.appendRow(["접수일시", "연락처/이메일"]);
      }
      sheet.appendRow([new Date().toLocaleString("ko-KR"), sanitize(postData.contact)]);
      return createJsonResponse({ success: true, message: "사전 알림이 등록되었습니다." });
    }

    // 3. 정식 참가 신청 (RSVP)
    if (action === "register") {
      let sheet = ss.getSheetByName("신청자명단");
      if (!sheet) {
        sheet = ss.insertSheet("신청자명단");
        sheet.appendRow([
          "신청일시", "이름", "성별", "학우구분", "연락처", 
          "1부참석", "2부참석", "선물도서힌트", "프롬신청곡", 
          "하우스조", "입금상태", "메모"
        ]);
      }

      // [보안] 전화번호 중복 등록 방지
      const cleanPhone = String(postData.phone || "").replace(/[^0-9]/g, "");
      const existingRows = sheet.getDataRange().getValues();
      for (let i = 1; i < existingRows.length; i++) {
        const existingPhone = String(existingRows[i][4]).replace(/[^0-9]/g, "");
        if (existingPhone === cleanPhone && cleanPhone.length > 8) {
          return createJsonResponse({ 
            success: false, 
            error: "이미 해당 전화번호로 접수된 신청 내역이 존재합니다. 수정이 필요하신 경우 운영진에 문의해 주세요." 
          }, 409);
        }
      }

      // 행 추가
      // 행 추가 (성별/구분/신청곡 생략 시 기본값 대입)
      sheet.appendRow([
        new Date().toLocaleString("ko-KR"),
        sanitize(postData.name),
        postData.gender ? (postData.gender === "female" ? "여성" : "남성") : "-",
        postData.fellowType ? (postData.fellowType === "senior" ? "기존" : "신규") : "-",
        cleanPhone,
        postData.session1 ? "O" : "X",
        postData.session2 ? "O" : "X",
        sanitize(postData.bookHint || "-"),
        sanitize(postData.promSong || "-"),
        0, // 초기 조 미배정
        "입금대기",
        sanitize(postData.note || "")
      ]);

      return createJsonResponse({ 
        success: true, 
        message: "2026 플래닛 연말 모임 참가 신청이 완료되었습니다." 
      });
    }

    // 4. [관리자 전용] 입금 상태 변경 또는 조배치 저장
    if (action === "admin_update_status") {
      if (postData.token !== ADMIN_SECRET_KEY) {
        return createJsonResponse({ success: false, error: "Unauthorized" }, 403);
      }
      const sheet = ss.getSheetByName("신청자명단");
      const rowIndex = parseInt(postData.rowIndex, 10);
      const newStatus = sanitize(postData.status);
      sheet.getRange(rowIndex, 11).setValue(newStatus);
      return createJsonResponse({ success: true });
    }

    return createJsonResponse({ success: false, error: "Unknown action" }, 400);

  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() }, 500);
  }
}

// JSON 응답 유틸리티
function createJsonResponse(data, statusCode = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// XSS 및 인젝션 방어 정제 함수
function sanitize(val) {
  if (!val) return "";
  return String(val)
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .trim()
    .slice(0, 300);
}

// 이름 마스킹 (홍길동 -> 홍*동)
function maskName(str) {
  if (!str) return "";
  if (str.length <= 1) return str;
  if (str.length === 2) return str[0] + "*";
  return str[0] + "*".repeat(str.length - 2) + str[str.length - 1];
}
