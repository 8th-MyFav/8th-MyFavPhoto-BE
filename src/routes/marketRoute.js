import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  approveTrade,
  getOfferedTradesHistory,
  proposeTrade,
  rejectTrade,
} from "../controllers/tradeController.js";
import {
  createListing,
  getListingDetail,
  getMarketListings,
  getMyListings,
  removeListing,
  updateListing,
} from "../controllers/listingController.js";
import { purchaseCard } from "../controllers/purchaseController.js";

const marketRouter = express.Router();

marketRouter.use("/trades", authMiddleware.verifyAccessToken);

// NOTE: 교환 제안 생성 api
marketRouter.post(
  "/trades",
  authMiddleware.verifyOfferedCardAuth,
  authMiddleware.verifyTradePostCardAuth,
  proposeTrade
);

// NOTE: 교환 제시 목록 조회 api
marketRouter.get(
  "/trades/:cardId",
  authMiddleware.verifyParamsCardAuth,
  getOfferedTradesHistory
);
// NOTE: 교환 제시 승인
marketRouter.patch(
  "/trades/:tradeId/approve",
  authMiddleware.verifyTradeAuth,
  approveTrade
);
// NOTE: 교환 제시 거절
marketRouter.patch(
  "/trades/:tradeId/reject",
  authMiddleware.verifyTradeAuth,
  rejectTrade
);

// NOTE: 카드 구매
marketRouter.post(
  "/purchase",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyTradePostCardAuth,
  purchaseCard
);

const listingRouter = express.Router();

marketRouter.use("/listings", listingRouter);

// NOTE: /market/listings
listingRouter
  .route("/")
  .get(getMarketListings)
  .post(
    authMiddleware.verifyAccessToken,
    authMiddleware.verifyBodyCardAuth,
    createListing
  );

// NOTE: /market/listings/:cardId
listingRouter
  .route("/:cardId")
  .get(getListingDetail)
  .patch(
    authMiddleware.verifyAccessToken,
    authMiddleware.verifyParamsCardAuth,
    updateListing
  )
  .delete(
    authMiddleware.verifyAccessToken,
    authMiddleware.verifyParamsCardAuth,
    removeListing
  );

// NOTE: /market/listings/me
listingRouter.route("/me").get(getMyListings);

export default marketRouter;
