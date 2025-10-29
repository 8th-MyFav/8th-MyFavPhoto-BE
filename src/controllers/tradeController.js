// NOTE: 교환 제안
export async function proposeTrade(req, res, next) {
  try {
    const { userId } = req.auth;
    const { cardId: targetCardId } = req.params;
    const { offeredCardId } = req.body;

    

    return res.status(200).json(offeredCardId);
  } catch (error) {
    next(error);
  }
}
