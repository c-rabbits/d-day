/**
 * Supabase/인증 등에서 반환되는 영어 오류 메시지를 한글로 변환합니다.
 * 매칭되지 않으면 원문을 그대로 반환합니다.
 */
const AUTH_ERROR_MAP: [string | RegExp, string][] = [
  ["Invalid login credentials", "이메일 또는 비밀번호가 올바르지 않습니다."],
  ["invalid_credentials", "이메일 또는 비밀번호가 올바르지 않습니다."],
  ["Invalid Login Credentials", "이메일 또는 비밀번호가 올바르지 않습니다."],
  ["Email not confirmed", "이메일 인증이 완료되지 않았습니다. 메일함을 확인해 주세요."],
  ["User already registered", "이미 가입된 이메일입니다."],
  ["Password should be at least 6 characters", "비밀번호는 6자 이상이어야 합니다."],
  ["Signup requires a valid password", "비밀번호를 입력해 주세요."],
  ["Unable to validate email address: invalid format", "올바른 이메일 형식이 아닙니다."],
  ["email must be a valid email", "올바른 이메일 형식이 아닙니다."],
  ["Forbidden", "접근이 거부되었습니다."],
  ["Auth session missing!", "로그인 세션이 없습니다. 다시 로그인해 주세요."],
  ["new password should be different from the old password", "새 비밀번호는 기존 비밀번호와 달라야 합니다."],
  ["Token has expired or is invalid", "링크가 만료되었거나 올바르지 않습니다. 다시 시도해 주세요."],
  ["OAuth redirect URL mismatch", "소셜 로그인 설정 오류입니다. 잠시 후 다시 시도해 주세요."],
  ["No auth code", "인증 코드가 없습니다. 다시 시도해 주세요."],
  ["No token hash or type", "인증 정보가 없습니다. 다시 시도해 주세요."],
  [/rate limit/i, "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요."],
  [/network|fetch/i, "네트워크 오류가 발생했습니다. 연결을 확인해 주세요."],
];

/** 메시지가 한글이 포함되어 있는지 여부 */
function hasKorean(text: string): boolean {
  return /[\uAC00-\uD7A3]/.test(text);
}

export function toUserFriendlyMessage(message: string): string {
  if (!message || typeof message !== "string") return "오류가 발생했습니다.";
  const trimmed = message.trim();
  for (const [pattern, ko] of AUTH_ERROR_MAP) {
    if (typeof pattern === "string") {
      if (trimmed.includes(pattern) || trimmed === pattern) return ko;
    } else {
      if (pattern.test(trimmed)) return ko;
    }
  }
  // 매칭되지 않은 영어 등은 기본 한글 메시지로
  if (!hasKorean(trimmed)) return "오류가 발생했습니다.";
  return trimmed;
}
