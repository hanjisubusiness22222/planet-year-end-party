/**
 * Web Crypto API를 활용한 SHA-256 단방향 암호화 및 관리자 보안 유틸리티
 * 평문 비밀번호가 클라이언트 번들에 노출되는 것을 방지합니다.
 */

// 관리자 기본 비밀번호 ("planet2026!")의 SHA-256 해시값
// echo -n "planet2026!" | sha256sum -> c0dbfc724e52834b6e511470ce22619bfdc84e7240c5e7b57bf10bbcd1cf4ee8
const DEFAULT_ADMIN_HASH = "c0dbfc724e52834b6e511470ce22619bfdc84e7240c5e7b57bf10bbcd1cf4ee8";

/**
 * 임의의 문자열을 SHA-256 16진수 문자열로 해시화
 */
export async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * 입력된 관리자 비밀번호를 해시 비교하여 검증
 */
export async function verifyAdminPassword(inputPassword: string): Promise<boolean> {
  if (!inputPassword) return false;
  
  // 환경변수에 사용자 지정 해시가 설정되어 있으면 우선 사용, 없으면 기본 해시 사용
  const targetHash = (import.meta.env.VITE_ADMIN_HASH as string) || DEFAULT_ADMIN_HASH;
  const inputHash = await sha256(inputPassword);
  
  const isValid = inputHash.toLowerCase() === targetHash.toLowerCase();
  
  if (isValid) {
    // 세션 스토리지에 인증 플래그 저장 (브라우저 탭 닫으면 자동 소멸)
    sessionStorage.setItem('planet_admin_auth', 'authenticated');
    sessionStorage.setItem('planet_admin_token', inputHash);
  }
  
  return isValid;
}

/**
 * 현재 관리자 세션이 유효한지 확인
 */
export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem('planet_admin_auth') === 'authenticated';
}

/**
 * 관리자 로그아웃
 */
export function logoutAdmin(): void {
  sessionStorage.removeItem('planet_admin_auth');
  sessionStorage.removeItem('planet_admin_token');
}

/**
 * API 요청 시 첨부할 안전한 인증 헤더/파라미터 반환
 */
export function getAdminAuthToken(): string | null {
  return sessionStorage.getItem('planet_admin_token');
}
