import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoute from "./routes/user.route";
import restaurantRoute from "./routes/restaurant.route";
import menuRoute from "./routes/menu.route";
import orderRoute from "./routes/order.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Stripe webhook needs raw body
app.use("/api/v1/order/webhook", bodyParser.raw({ type: "application/json" }));

// Other middlewares
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: process.env.FRONTEND_URL || "https://eatsonline-fyp.onrender.com",
  credentials: true,
};

app.use(cors(corsOptions));

// routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/restaurant", restaurantRoute);
app.use("/api/v1/menu", menuRoute);
app.use("/api/v1/order", orderRoute);

// Connect DB first, then listen
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed", err);
  });
