export default function errorHandler(error, req, res, next) {
  // 권한 에러
  if (error.name === "UnauthorizedError") {
    const message = error.message ?? "유효하지 않은 권한입니다.";
    res.status(401).send({ message });
  }

  const status = error.code ?? 500;
  console.error(error);
  return res.status(status).json({
    path: req.path,
    method: req.method,
    code: error.code,
    errorCode: error.data.errorCode,
    message: error.message ?? "Internal Server Error",
    // data: error.data ?? undefined,
    date: new Date(),
  });
}
