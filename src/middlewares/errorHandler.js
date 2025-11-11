export default function errorHandler(error, req, res, next) {
  // 권한 에러
  if (error.name === "UnauthorizedError") {
    const message = error.message ?? "유효하지 않은 권한입니다.";
    res.status(401).send({ message });
  }

  // error.code가 숫자일 경우에만 status로 사용하고, 아니면 500을 사용합니다.
  // 이렇게 하면 Prisma 에러 코드("P2010")가 status로 들어가는 것을 방지할 수 있습니다.
  const status = Number.isInteger(error.code) ? error.code : 500;

  console.error(error);
  return res.status(status).json({
    path: req.path,
    method: req.method,
    code: error.code ?? status,
    errorCode: error.errorCode ?? "INTERNAL_SERVER_ERROR",
    message: error.message ?? "Internal Server Error",
    date: new Date(),
  });
}
