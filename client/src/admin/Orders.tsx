import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { useEffect } from "react";

const Orders = () => {
  const { restaurantOrder, getRestaurantOrders, updateRestaurantOrder } =
    useRestaurantStore();

  useEffect(() => {
    getRestaurantOrders();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    await updateRestaurantOrder(id, status);
  };

  // Optional: for clean formatting
  const formatPKR = (amount: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-10">
        Orders Overview
      </h1>
      <div className="space-y-8">
        {[...restaurantOrder]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-6">
                {/* Left: Customer + Cart Info */}
                <div className="flex-1 space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {order.deliveryDetails?.name || "Unnamed Customer"}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-400">
                    <span className="font-medium">Address:</span>{" "}
                    {order.deliveryDetails?.address}
                  </p>
                  <p className="text-gray-700 dark:text-gray-400">
                    <span className="font-medium">Total:</span>{" "}
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      {formatPKR(
                        order.cartItems?.reduce(
                          (acc: number, item: any) =>
                            acc + (item.price || 0) * (item.quantity || 1),
                          0
                        )
                      )}
                    </span>
                  </p>

                  {/* Optional: List of items */}
                  <div className="mt-3 space-y-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-300">
                      Items:
                    </p>
                    {order.cartItems?.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400"
                      >
                        <span>{item.name}</span>
                        <span>
                          {item.quantity} × {formatPKR(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Status Control */}
                <div className="w-full sm:w-1/3 space-y-2">
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Order Status
                  </Label>
                  <Select
                    onValueChange={(newStatus) =>
                      handleStatusChange(order._id, newStatus)
                    }
                    defaultValue={order.status}
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {[
                          "Pending",
                          "Confirmed",
                          "Preparing",
                          "OutForDelivery",
                          "Delivered",
                        ].map((status, index) => (
                          <SelectItem key={index} value={status.toLowerCase()}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Order date/time at the bottom */}
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Placed on:{" "}
                {new Date(order.createdAt).toLocaleString("en-PK", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Orders;
