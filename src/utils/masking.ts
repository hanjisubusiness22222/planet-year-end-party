/**
 * 개인정보(PII) 마스킹 유틸리티
 * 일반 사용자 뷰(조배치 결과표, 현장 스크린 등)에서 참가자의 민감 정보를 보호합니다.
 */

/**
 * 이름 마스킹 (예: '홍길동' -> '홍*동', '김철' -> '김*', 'Planet Kim' -> 'P***** K**')
 */
export function maskName(name: string): string {
  if (!name) return '';
  const trimmed = name.trim();
  
  // 한글 이름 처리
  if (/^[가-힣]+$/.test(trimmed)) {
    if (trimmed.length <= 1) return trimmed;
    if (trimmed.length === 2) return `${trimmed[0]}*`;
    if (trimmed.length === 3) return `${trimmed[0]}*${trimmed[2]}`;
    // 4자 이상 (예: 남궁민수 -> 남**수)
    const middleMask = '*'.repeat(trimmed.length - 2);
    return `${trimmed[0]}${middleMask}${trimmed[trimmed.length - 1]}`;
  }

  // 영문 또는 공백 포함 이름 처리 (예: John Doe -> J**n D*e)
  return trimmed.split(' ').map(word => {
    if (word.length <= 2) return word;
    const maskedPart = '*'.repeat(word.length - 2);
    return `${word[0]}${maskedPart}${word[word.length - 1]}`;
  }).join(' ');
}

/**
 * 전화번호 마스킹 (예: '010-1234-5678' -> '010-****-5678')
 */
export function maskPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-****-${digits.slice(7)}`;
  } else if (digits.length === 10) {
    return `${digits.slice(0, 3)}-***-${digits.slice(6)}`;
  }
  
  return phone.replace(/(\d{3})\d{3,4}(\d{4})/, '$1-****-$2');
}

/**
 * 이메일 마스킹 (예: 'fellow@planet.org' -> 'fe***@planet.org')
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  
  const visible = local.slice(0, 2);
  const masked = '*'.repeat(Math.max(1, local.length - 2));
  return `${visible}${masked}@${domain}`;
}
