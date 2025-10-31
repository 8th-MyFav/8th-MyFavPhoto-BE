import prisma from "../config/prisma.js";
import * as errors from "../utils/errors.js";

// 해당 테이블에 존재하는지 확인
async function isEntityExist(id, modelName) {
  const modelClient = prisma[modelName];

  if (!modelClient)
    throw new Error(`유효하지 않은 model 명입니다. !!${modelName}!!`);

  const record = await modelClient.findUnique({ where: { id: id } });

  if (!record) throw errors.notFound(modelName);
}

export default {
  isEntityExist,
};
