// 🧩 src/utils/errors.js
// API 전체 에러 상황을 일관된 형태로 관리하는 Error Factory 모음
// NOTE: 종종 명세서랑 다른 부분이 있을 것 같은데, 작업하면서 고치는게 효율적일 것 같습니다!

/**
 * 공통 Error 생성기
 * @param {number} code - HTTP 상태 코드
 * @param {string} errorCode - 커스텀 에러 코드 (ex. "UNAUTHORIZED")
 * @param {string} message - 사용자에게 보여줄 메시지
 */
function createError(code, errorCode, message) {
  const error = new Error(message);
  error.code = code;
  error.data = { errorCode, message };
  return error;
}

/* ===========================
   ✅ 400 Bad Request 계열
=========================== */

// 필수값 누락 또는 형식 오류
export function invalidData(
  message = "필수 필드 누락 또는 유효하지 않은 값입니다."
) {
  return createError(400, "INVALID_DATA", message);
}

// 잘못된 쿼리 파라미터
export function invalidQuery(message = "잘못된 쿼리 파라미터입니다.") {
  return createError(400, "INVALID_QUERY", message);
}

// 요청 자체가 유효하지 않음 (폼 등)
export function badRequest(message = "요청이 올바르지 않습니다.") {
  return createError(400, "BAD_REQUEST", message);
}

// 입력 형식 유효성 검증 실패
export function validationError(message = "입력 값이 올바르지 않습니다.") {
  return createError(400, "VALIDATION_ERROR", message);
}

/* ===========================
   🚫 401 Unauthorized 계열
=========================== */

// 인증이 필요한 요청
export function unauthorized(message = "로그인이 필요합니다.") {
  return createError(401, "UNAUTHORIZED", message); 
}

/* ===========================
   ⛔ 403 Forbidden 계열
=========================== */

// 접근 권한 없음
export function forbidden(message = "접근 권한이 없습니다.") {
  return createError(403, "FORBIDDEN", message);
}

// 포인트 부족
export function insufficientPoints(message = "포인트가 부족합니다.") {
  return createError(403, "INSUFFICIENT_POINTS", message);
}

/* ===========================
   🔍 404 Not Found 계열
=========================== */

// 일반 리소스 없음
export function notFound(resource = "리소스") {
  return createError(404, "NOT_FOUND", `${resource}를 찾을 수 없습니다.`);
}

// 카드 없음
export function cardNotFound(message = "존재하지 않는 카드입니다.") {
  return createError(404, "CARD_NOT_FOUND", message);
}

// 거래 제안 없음
export function tradeNotFound(message = "존재하지 않는 거래 제안입니다.") {
  return createError(404, "TRADE_NOT_FOUND", message);
}

// 판매 정보 없음
export function saleNotFound(message = "판매 등록된 카드가 없습니다.") {
  return createError(404, "SALE_NOT_FOUND", message);
}

// 알림 없음
export function notificationNotFound(message = "존재하지 않는 알림입니다.") {
  return createError(404, "NOTIFICATION_NOT_FOUND", message);
}

/* ===========================
   ⚠️ 409 Conflict 계열
=========================== */

// 중복 이메일
export function emailAlreadyExists(message = "이미 존재하는 이메일입니다.") {
  return createError(409, "EMAIL_EXISTS", message);
}

// 이미 판매 완료된 카드
export function cardAlreadySold(message = "이미 판매 완료된 카드입니다.") {
  return createError(409, "ALREADY_SOLD", message);
}

// 이미 교환 중이거나 완료된 카드
export function cardAlreadyInTrade(
  message = "이미 교환 중이거나 완료된 카드입니다."
) {
  return createError(409, "ALREADY_IN_TRADE", message);
}

// 잘못된 거래 상태 (이미 승인/거절된 거래)
export function invalidTradeStatus(message = "이미 처리된 거래입니다.") {
  return createError(409, "INVALID_TRADE_STATUS", message);
}

/* ===========================
   🚦 413 / 429 / 5xx 계열
=========================== */

// 파일 용량 초과
export function fileTooLarge(message = "업로드 파일이 너무 큽니다.") {
  return createError(413, "FILE_TOO_LARGE", message);
}

// 요청 과도 (랜덤 포인트 제한 등)
export function tooManyRequests(
  message = "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
) {
  return createError(429, "TOO_MANY_REQUESTS", message);
}

/* ===========================
   💥 서버 계열 (5xx)
=========================== */

export function internalServerError(message = "서버 에러가 발생했습니다.") {
  return createError(500, "INTERNAL_SERVER_ERROR", message);
}

export function badGateway(message = "외부 서비스에서 에러가 발생했습니다.") {
  return createError(502, "BAD_GATEWAY", message);
}

export function serviceUnavailable(
  message = "서비스를 일시적으로 이용할 수 없습니다."
) {
  return createError(503, "SERVICE_UNAVAILABLE", message);
}

export function gatewayTimeout(message = "서버 응답 시간이 초과되었습니다.") {
  return createError(504, "GATEWAY_TIMEOUT", message);
}
