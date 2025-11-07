async function findPointsByUserId({ tx = prisma, userId }) {
  return tx.user.findUnique({
    where: { id: userId },
    select: { points: { select: { acc_point: true } } },
  });
}

async function findPriceByPostId({ tx = prisma, tradePostId }) {
  return tx.tradePosts.findUnique({
    where: { id: tradePostId },
    select: { price: true },
  });
}

export default { findPointsByUserId, findPriceByPostId };
