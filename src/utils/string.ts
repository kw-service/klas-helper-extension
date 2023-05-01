/**
 * 36진수 트릭을 이용해 랜덤한 문자열을 생성합니다.
 */
export function generateRandomString(): string {
  return Math.random().toString(36).slice(2);
}
