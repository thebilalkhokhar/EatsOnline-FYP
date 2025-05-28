import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant.model";
import { Order } from "../models/order.model";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

interface CartItem {
  menuId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface CheckoutSessionRequest {
  cartItems: CartItem[];
  deliveryDetails: {
    name: string;
    email: string;
    address: string;
    city: string;
  };
  restaurantId: string;
}

interface AuthenticatedRequest extends Request {
  id: string;
}

export const getOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const orders = await Order.find({ user: userId })
      .populate({ path: "user", select: "name email" })
      .populate({ path: "restaurant", select: "title image" });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const createCheckoutSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;

    const restaurant = await Restaurant.findById(
      checkoutSessionRequest.restaurantId
    ).populate("menus");
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found." });
    }

    const userId = req.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const order = new Order({
      restaurant: restaurant._id,
      user: userId,
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      status: "pending",
      totalAmount: 0,
    });

    const menuItems = restaurant.menus as any[];

    const lineItems = createLineItems(checkoutSessionRequest, menuItems);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      shipping_address_collection: {
        allowed_countries: ["PK", "US", "CA", "GB"],
      },
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/order/status`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata: {
        orderId: (order._id as string).toString(),
        images: JSON.stringify(menuItems.map((item) => item.image)),
      },
    });

    await order.save();

    return res.status(200).json({ session });
  } catch (error) {
    console.error("Checkout session error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  if (!sig) return res.status(400).send("Missing Stripe signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.WEBHOOK_ENDPOINT_SECRET || ""
    );
  } catch (err: any) {
    console.error("Webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const orderId = session.metadata?.orderId;
      if (!orderId) return res.status(400).send("Order ID missing");

      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });

      if (session.amount_total !== null) {
        order.totalAmount = session.amount_total / 100;
      }

      order.status = "confirmed";
      await order.save();
    } catch (error) {
      console.error("Stripe webhook processing error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  res.status(200).send();
};

export const createLineItems = (
  checkoutSessionRequest: CheckoutSessionRequest,
  menuItems: any[]
) => {
  return checkoutSessionRequest.cartItems.map((cartItem) => {
    const menuItem = menuItems.find(
      (item) => item._id.toString() === cartItem.menuId
    );
    if (!menuItem)
      throw new Error(`Menu item with id ${cartItem.menuId} not found`);

    return {
      price_data: {
        currency: "pkr",
        product_data: {
          name: menuItem.name,
          images: [menuItem.image],
        },
        unit_amount: menuItem.price * 100,
      },
      quantity: cartItem.quantity,
    };
  });
};

export const getSalesSummary = async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find({ status: "confirmed" });

    // Calculate total sales by summing cart items, not order.totalAmount
    const totalSales = orders.reduce((sum, order) => {
      const orderSales = order.cartItems.reduce(
        (itemSum, item) => itemSum + item.price * item.quantity,
        0
      );
      return sum + orderSales;
    }, 0);

    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    const salesByPeriod: Record<string, { sales: number; orders: number }> = {};
    const productSales: Record<
      string,
      { totalSales: number; unitsSold: number }
    > = {};

    for (const order of orders) {
      const date = order.createdAt.toISOString().slice(0, 10);

      if (!salesByPeriod[date]) salesByPeriod[date] = { sales: 0, orders: 0 };
      // Use cartItems total for sales by period as well
      const orderSales = order.cartItems.reduce(
        (itemSum, item) => itemSum + item.price * item.quantity,
        0
      );

      salesByPeriod[date].sales += orderSales;
      salesByPeriod[date].orders += 1;

      for (const item of order.cartItems) {
        if (!productSales[item.name]) {
          productSales[item.name] = { totalSales: 0, unitsSold: 0 };
        }
        productSales[item.name].totalSales += item.price * item.quantity;
        productSales[item.name].unitsSold += item.quantity;
      }
    }

    const formattedSalesByPeriod = Object.entries(salesByPeriod).map(
      ([period, data]) => ({
        period,
        ...data,
      })
    );

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5);

    return res.json({
      totalSales,
      totalOrders,
      avgOrderValue,
      salesByPeriod: formattedSalesByPeriod,
      topProducts,
    });
  } catch (error) {
    console.error("Error generating sales summary:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
