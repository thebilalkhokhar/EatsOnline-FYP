import Login from "./auth/Login";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Signup from "./auth/Signup";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import HereSection from "./components/HereSection";
import MainLayout from "./layout/MainLayout";
import Profile from "./components/Profile";
import SearchPage from "./components/SearchPage";
import RestaurantDetail from "./components/RestaurantDetail";
import Cart from "./components/Cart";
import Restaurant from "./admin/Restaurant";
import AddMenu from "./admin/AddMenu";
import Orders from "./admin/Orders";
import Success from "./components/Success";
import { useUserStore } from "./store/useUserStore";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import Loading from "./components/Loading";
import { useThemeStore } from "./store/useThemeStore";
import OrderDetails from "./components/OrderDetails";
import SalesReport from "./admin/SalesReport";

// ✅ Removed verify-email redirect
const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useUserStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AuthenticatedUser = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useUserStore();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useUserStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.admin) return <Navigate to="/" replace />;
  return children;
};

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <MainLayout />
      </ProtectedRoutes>
    ),
    children: [
      { path: "/", element: <HereSection /> },
      { path: "/profile", element: <Profile /> },
      { path: "/search/:text", element: <SearchPage /> },
      { path: "/restaurant/:id", element: <RestaurantDetail /> },
      { path: "/cart", element: <Cart /> },
      { path: "/order/status", element: <Success /> },
      { path: "/order-details/:orderId", element: <OrderDetails /> },
      { path: "/loadingss", element: <Loading /> },
      // Admin routes
      {
        path: "/admin/restaurant",
        element: (
          <AdminRoute>
            <Restaurant />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/menu",
        element: (
          <AdminRoute>
            <AddMenu />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/orders",
        element: (
          <AdminRoute>
            <Orders />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/sales-report",
        element: (
          <AdminRoute>
            <SalesReport />
          </AdminRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: (
      <AuthenticatedUser>
        <Login />
      </AuthenticatedUser>
    ),
  },
  {
    path: "/signup",
    element: (
      <AuthenticatedUser>
        <Signup />
      </AuthenticatedUser>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <AuthenticatedUser>
        <ForgotPassword />
      </AuthenticatedUser>
    ),
  },
  { path: "/reset-password", element: <ResetPassword /> },
  // ✅ Removed: { path: "/verify-email", element: <VerifyEmail /> },
]);

function App() {
  const initializeTheme = useThemeStore((state: any) => state.initializeTheme);
  const { checkAuthentication, isCheckingAuth } = useUserStore();

  useEffect(() => {
    checkAuthentication();
    initializeTheme();
  }, [checkAuthentication]);

  if (isCheckingAuth) return <Loading />;

  return (
    <main>
      <RouterProvider router={appRouter} />
    </main>
  );
}

export default App;
