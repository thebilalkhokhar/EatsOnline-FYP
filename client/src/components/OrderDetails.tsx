import { useParams } from "react-router-dom";
import { useOrderStore } from "@/store/useOrderStore";
import { useEffect, useState } from "react";
import { CartItem } from "@/types/cartType";
import { Separator } from "./ui/separator";

const OrderDetails = () => {
  const { orderId } = useParams();
  const { orders } = useOrderStore();
  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => {
    if (orders.length > 0) {
      const foundOrder = orders.find((o: any) => o._id === orderId);
      setOrder(foundOrder || null);
    }
  }, [orders, orderId]);
  console.log(order);

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h2 className="text-gray-700 dark:text-gray-300 text-xl font-semibold">
          Order not found.
        </h2>
      </div>
    );
  }

  const total = order.totalAmount
    ? order.totalAmount / 100
    : order.cartItems.reduce(
        (sum: number, item: CartItem) =>
          sum + item.price * (item.quantity || 1),
        0
      );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Order Details
      </h1>

      {/* Order Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <p className="text-gray-700 dark:text-gray-300">
          <strong>Order ID:</strong> {order._id}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <strong>Status:</strong>{" "}
          <span className="text-[#FF5A5A] font-medium">
            {order.status?.toUpperCase()}
          </span>
        </p>
      </div>

      {/* Customer Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Customer Info
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          <strong>Name:</strong> {order.deliveryDetails?.name}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <strong>Email:</strong> {order.user?.email}
        </p>
      </div>

      {/* Delivery Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Delivery Address
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          <strong>Address:</strong> {order.deliveryDetails?.address}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <strong>City:</strong> {order.deliveryDetails?.city}
        </p>
      </div>

      {/* Ordered Items */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Ordered Items
        </h2>
        {order.cartItems.map((item: CartItem, index: number) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-md object-cover"
                />
                <div className="ml-4">
                  <p className="text-gray-800 dark:text-gray-100 font-medium">
                    {item.name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Qty: {item.quantity || 1}
                  </p>
                </div>
              </div>
              <div className="text-gray-800 dark:text-gray-100 flex items-center">
                <span>PKR {item.price}</span>
              </div>
            </div>
            <Separator className="my-4" />
          </div>
        ))}

        {/* Total */}
        <div className="text-right mt-6 text-lg text-gray-800 dark:text-gray-100 font-bold">
          Total: PKR {total}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
