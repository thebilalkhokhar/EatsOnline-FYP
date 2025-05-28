import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import {
  createCheckoutSession,
  getOrders,
  stripeWebhook,
} from "../controller/order.controller";
import { getSalesSummary } from "../controller/order.controller"; // Import the new controller
const router = express.Router();
router.get("/test", (req, res) => {
  res.json({ message: "Order route works!" });
});

router.route("/report/summary").get(isAuthenticated, getSalesSummary); // New route
router.route("/").get(isAuthenticated, getOrders);
router
  .route("/checkout/create-checkout-session")
  .post(isAuthenticated, createCheckoutSession);
router
  .route("/webhook")
  .post(express.raw({ type: "application/json" }), stripeWebhook);

export default router;
