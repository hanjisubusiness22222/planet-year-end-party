/**
 * 입력값 검증(Validation) 및 XSS 방어 살균(Sanitization) 유틸리티
 */

/**
 * 사용자 입력 문자열에서 HTML 태그 및 악성 스크립트를 제거하고 길이를 제한
 */
export function sanitizeText(input: string, maxLength: number = 200): string {
  if (!input) return '';
  
  // HTML 태그 제거
  let clean = input.replace(/<[^>]*>/g, '');
  
  // 위험한 스크립트 키워드 치환
  clean = clean
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/eval\(/gi, '')
    .trim();
    
  // 최대 길이 제한
  if (clean.length > maxLength) {
    clean = clean.slice(0, maxLength);
  }
  
  return clean;
}

/**
 * 휴대폰 번호 유효성 검사 (010, 011, 016, 017, 018, 019 지원)
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/[^0-9]/g, '');
  return /^01[016789]\d{7,8}$/.test(digits);
}

/**
 * 휴대폰 번호 자동 하이픈 포맷터 (예: 01012345678 -> 010-1234-5678)
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/[^0-9]/g, '').slice(0, 11);
  
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  } else {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
}

/**
 * 이메일 주소 유효성 검사
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
