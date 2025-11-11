import multer from "multer";

const storage = multer.memoryStorage(); // 파일을 디스크에 저장하지 않고 메모리에만 저장
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
});
