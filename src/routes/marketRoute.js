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

const marketRouter = express.Router();

marketRouter.use("/trades", authMiddleware.verifyAccessToken);
// NOTE: 교환 제안 생성 api
marketRouter.post(
  "/trades/:cardId",
  authMiddleware.verifyOfferedCardAuth,
  getOfferedTradesHistory
);

// NOTE: 교환 api
marketRouter.post("/trades/:cardId", proposeTrade);

// NOTE: 교환 제시 목록 조회 api
marketRouter.get(
  "/trades/:cardId",
  authMiddleware.verifyBodyCardAuth,
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

// marketRouter.post("/purchase");

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
listingRouter.route("/me").get(authMiddleware.verifyAccessToken, getMyListings);

export default marketRouter;
