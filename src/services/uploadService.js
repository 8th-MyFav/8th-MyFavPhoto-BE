// src/services/uploadService.js
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/aws.js";
import { v4 as uuidv4 } from "uuid";
import * as errors from "../utils/errors.js";

export async function uploadImageToS3(file) {
  if (!file) {
    throw errors.invalidFile(); // 파일을 받은 시점에서 에러를 던져야 합니다.
  }

  try {
    // 파일명 충돌 방지 및 보안상 원본 그대로 노출 방지
    const ext = file.originalname.split(".").pop();
    const key = `uploads/${uuidv4()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: "public-read", // ACL 제거 확인 완료.
    });

    await s3.send(command);

    // 퍼블릭 접근이 허용된 버킷이라면 아래 URL로 접근 가능
    const region = process.env.AWS_REGION;
    const bucket = process.env.AWS_BUCKET_NAME;
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    return { key, url };
  } catch (error) {
    throw error; 
  }
}
