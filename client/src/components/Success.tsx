import { Separator } from "./ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useOrderStore } from "@/store/useOrderStore";
import { useEffect } from "react";
import { CartItem } from "@/types/cartType";

const Success = () => {
  const { orders, getOrderDetails } = useOrderStore();
  const navigate = useNavigate();

  useEffect(() => {
    getOrderDetails();
  }, []);

  // Sort orders newest first by createdAt
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Format date/time display
  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  if (orders.length === 0)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="font-bold text-2xl text-gray-700 dark:text-gray-300">
          Order not found!
        </h1>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {sortedOrders.map((order: any) => (
            <div
              key={order._id}
              onClick={() => navigate(`/order-details/${order._id}`)}
              className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 cursor-pointer hover:shadow-lg transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-200">
                    Order ID:{" "}
                    <span className="text-sm text-gray-500">{order._id}</span>
                  </h2>
                  <span className="text-sm font-semibold text-[#FF5A5A]">
                    Status: {order.status?.toUpperCase() || "CONFIRMED"}
                  </span>
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {order.cartItems.map((item: CartItem, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 rounded-md object-cover"
                          />
                          <h3 className="ml-4 text-gray-900 dark:text-gray-200 font-medium">
                            {item.name}
                          </h3>
                        </div>
                        <div className="text-gray-900 dark:text-gray-200 flex items-center">
                          <span className="text-sm font-medium mr-1">PKR</span>
                          <span className="text-base font-medium">
                            {item.price}
                          </span>
                        </div>
                      </div>
                      {index !== order.cartItems.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Placed on: {formatDateTime(order.createdAt)}
              </div>
            </div>
          ))}
        </div>

        <Link to="/" className="block mt-8">
          <Button className="bg-[#ff5733] hover:bg-[#e14e2a] text-white w-full py-3 rounded-md shadow-lg transition-colors duration-200">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Success;
